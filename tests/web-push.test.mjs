// Unit tests for VAPID JWT + aes128gcm encryption and notification copy.
import test from "node:test";
import assert from "node:assert/strict";

const WP = await import("../worker/web-push.js");

test("record notification copy ko/en includes type and time, not amounts", () => {
  const t = Date.parse("2026-11-11T14:05:00+09:00");
  const ko = WP.wpRecordPayload({ nick: "도우미", type: "feed", t, lang: "ko" });
  assert.equal(ko.title, "뉴본 · 아기기록");
  assert.equal(ko.body, "도우미가 수유 기록을 추가했어요 (14:05)");
  assert.equal(ko.url, "/tracker");
  assert.equal(ko.tag, "nb-records");
  assert.ok(!ko.body.includes("ml") && !ko.body.includes("120"));

  const en = WP.wpRecordPayload({ nick: "Helper", type: "diaper", t, lang: "en" });
  assert.equal(en.title, "Newborn · Baby log");
  assert.equal(en.body, "Helper added a diaper record (14:05)");
  assert.equal(en.url, "/en/tracker");

  const mixed = WP.wpRecordPayload({ nick: "엄마", type: "record", t, lang: "ko", types: ["feed", "diaper"] });
  assert.equal(mixed.body, "엄마가 기록을 추가했어요 (14:05)");
});

test("photo notification copy points at the date on /growth", () => {
  const ko = WP.wpPhotoPayload({ date: "2026-11-11", lang: "ko" });
  assert.equal(ko.title, "뉴본 · 성장");
  assert.equal(ko.body, "성장 캘린더에 새 사진이 올라왔어요 (11/11)");
  assert.equal(ko.url, "/growth?date=2026-11-11");
  const en = WP.wpPhotoPayload({ date: "2026-11-11", lang: "en" });
  assert.equal(en.body, "A new photo was added to the growth calendar (11/11)");
  assert.equal(en.url, "/en/growth?date=2026-11-11");
});

test("pick targets excludes the sender and honors prefs", () => {
  const subs = [
    { dev: "AAAA1111", endpoint: "https://push.example/a", records: 1, photos: 1 },
    { dev: "BBBB2222", endpoint: "https://push.example/b", records: 1, photos: 0 },
    { dev: "CCCC3333", endpoint: "https://push.example/c", records: 0, photos: 1 },
  ];
  assert.deepEqual(WP.wpPickTargets(subs, "AAAA1111", "records").map((s) => s.dev), ["BBBB2222"]);
  assert.deepEqual(WP.wpPickTargets(subs, "AAAA1111", "photos").map((s) => s.dev), ["CCCC3333"]);
  assert.deepEqual(WP.wpPickTargets(subs, "ZZZZ9999", "records").map((s) => s.dev), ["AAAA1111", "BBBB2222"]);
});

test("throttle window is ~2 minutes", () => {
  const now = 1_000_000;
  assert.equal(WP.wpShouldThrottle(0, now), false);
  assert.equal(WP.wpShouldThrottle(now - 30_000, now), true);
  assert.equal(WP.wpShouldThrottle(now - 119_000, now), true);
  assert.equal(WP.wpShouldThrottle(now - 120_000, now), false);
});

test("summarize coalesces a burst into one payload description", () => {
  const t1 = 1000, t2 = 2000;
  const s = WP.wpSummarizeRecords([
    { type: "feed", t: t1, by: "엄마" },
    { type: "feed", t: t2, by: "엄마" },
    { type: "diaper", t: 1500, by: "엄마" },
  ]);
  assert.equal(s.count, 3);
  assert.deepEqual(s.types.sort(), ["diaper", "feed"]);
  assert.equal(s.t, t2);
  assert.equal(s.nick, "엄마");
  assert.equal(s.type, "record");
});

test("valid subscription rejects http except localhost", () => {
  const p = WP.wpB64urlEnc(Uint8Array.from([4, ...Array(64).fill(1)]));
  const a = WP.wpB64urlEnc(crypto.getRandomValues(new Uint8Array(16)));
  assert.equal(WP.wpValidSub("https://fcm.googleapis.com/fcm/send/abc", p, a), true);
  assert.equal(WP.wpValidSub("http://127.0.0.1:9/x", p, a), true);
  assert.equal(WP.wpValidSub("http://evil.example/x", p, a), false);
  assert.equal(WP.wpValidSub("https://fcm.googleapis.com/fcm/send/abc", "nope", a), false);
});

test("aes128gcm roundtrip decrypts the plaintext", async () => {
  const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const uaPub = new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  const msg = JSON.stringify({ title: "뉴본 · 아기기록", body: "도우미가 수유 기록을 추가했어요 (14:05)" });
  const enc = await WP.wpEncrypt(msg, WP.wpB64urlEnc(uaPub), WP.wpB64urlEnc(auth));
  assert.ok(enc.length > 16 + 4 + 1 + 65 + msg.length);
  const dec = await WP.wpDecrypt(enc, ua.privateKey, uaPub, auth);
  assert.equal(new TextDecoder().decode(dec), msg);
});

test("VAPID JWT is ES256, verifiable, and has aud/exp/sub", async () => {
  const keys = await WP.wpGenerateVapidKeys();
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const jwt = await WP.wpVapidJwt("https://fcm.googleapis.com", "mailto:test@newbornkr.online", keys.publicKey, keys.privateKey, exp);
  const [h, p, sig] = jwt.split(".");
  const header = JSON.parse(new TextDecoder().decode(WP.wpB64urlDec(h)));
  const payload = JSON.parse(new TextDecoder().decode(WP.wpB64urlDec(p)));
  assert.equal(header.alg, "ES256");
  assert.equal(payload.aud, "https://fcm.googleapis.com");
  assert.equal(payload.sub, "mailto:test@newbornkr.online");
  assert.equal(payload.exp, exp);
  const pub = WP.wpB64urlDec(keys.publicKey);
  const jwk = { kty: "EC", crv: "P-256", x: WP.wpB64urlEnc(pub.slice(1, 33)), y: WP.wpB64urlEnc(pub.slice(33, 65)) };
  const verifyKey = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, verifyKey, WP.wpB64urlDec(sig), new TextEncoder().encode(h + "." + p));
  assert.equal(ok, true);
});
