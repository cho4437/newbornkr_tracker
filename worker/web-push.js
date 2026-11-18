// Web Push helpers (RFC 8291 aes128gcm + RFC 8292 VAPID). Workers / Node WebCrypto.
// ES module (Workers runtime / Node WebCrypto). Imported by worker/family-api.js and worker/index.js.
const WP_THROTTLE_MS = 120000;

function wpB64urlEnc(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function wpB64urlDec(s) {
  const n = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = n + "=".repeat((4 - (n.length % 4)) % 4);
  const bin = atob(pad);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}
function wpConcat(...parts) {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
async function wpHkdf(ikm, salt, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8));
}
function wpFormatTime(ms, timeZone = "Asia/Seoul") {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(ms));
  const hh = (parts.find((p) => p.type === "hour") || {}).value || "00";
  const mm = (parts.find((p) => p.type === "minute") || {}).value || "00";
  return hh + ":" + mm;
}
function wpFormatDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  return m ? (+m[2]) + "/" + (+m[3]) : (ymd || "");
}
function wpTypeLabel(type, lang) {
  const ko = { feed: "수유", sleep: "수면", diaper: "기저귀", record: "기록" };
  const en = { feed: "feeding", sleep: "sleep", diaper: "diaper", record: "record" };
  const pt = { feed: "mamada", sleep: "sono", diaper: "fralda", record: "registro" };
  const m = lang === "en" ? en : lang === "pt" ? pt : ko;
  return m[type] || m.record;
}
function wpNick(nick, lang) {
  const n = String(nick || "").trim();
  return n || (lang === "en" ? "A family member" : lang === "pt" ? "Alguém da família" : "가족이");
}
function wpRecordPayload({ nick, type, t, lang, types }) {
  const locale = lang === "en" || lang === "pt" ? lang : "ko";
  const time = wpFormatTime(t);
  const who = wpNick(nick, locale);
  const mixed = Array.isArray(types) && types.length > 1;
  const body = locale === "pt"
    ? (mixed ? who + " adicionou novos registros (" + time + ")" : who + " adicionou um registro de " + wpTypeLabel(type, "pt") + " (" + time + ")")
    : locale === "en"
    ? (mixed ? who + " added new records (" + time + ")" : who + " added a " + wpTypeLabel(type, "en") + " record (" + time + ")")
    : (mixed ? who + "가 기록을 추가했어요 (" + time + ")" : who + "가 " + wpTypeLabel(type, "ko") + " 기록을 추가했어요 (" + time + ")");
  return {
    title: locale === "en" ? "Newborn · Baby log" : locale === "pt" ? "Newborn · Diário do bebê" : "뉴본 · 아기기록",
    body,
    url: locale === "en" ? "/en/tracker" : locale === "pt" ? "/pt-br/tracker" : "/tracker",
    tag: "nb-records",
    lang: locale,
  };
}
function wpPhotoPayload({ date, lang }) {
  const locale = lang === "en" || lang === "pt" ? lang : "ko";
  const d = wpFormatDate(date);
  return {
    title: locale === "en" ? "Newborn · Growth" : locale === "pt" ? "Newborn · Crescimento" : "뉴본 · 성장",
    body: locale === "en" ? "A new photo was added to the growth calendar (" + d + ")" : locale === "pt" ? "Uma nova foto foi adicionada ao calendário de crescimento (" + d + ")" : "성장 캘린더에 새 사진이 올라왔어요 (" + d + ")",
    url: (locale === "en" ? "/en/growth" : locale === "pt" ? "/pt-br/growth" : "/growth") + (date ? "?date=" + date : ""),
    tag: "nb-photos",
    lang: locale,
  };
}
function wpPickTargets(subs, senderDev, prefKey) {
  return (subs || []).filter((s) => s && s.endpoint && s.dev !== senderDev && !!s[prefKey]);
}
function wpShouldThrottle(lastSent, now, windowMs = WP_THROTTLE_MS) {
  return lastSent > 0 && now - lastSent < windowMs;
}
function wpSummarizeRecords(added) {
  if (!added || !added.length) return null;
  const types = [...new Set(added.map((a) => a.type).filter(Boolean))];
  const latest = added.reduce((a, b) => ((b.t || 0) > (a.t || 0) ? b : a));
  const nick = (added.map((a) => a.by).find(Boolean)) || "";
  return { type: types.length === 1 ? types[0] : "record", types, t: latest.t, nick, count: added.length };
}
function wpValidSub(endpoint, p256dh, auth) {
  try {
    const u = new URL(endpoint);
    const local = u.hostname === "127.0.0.1" || u.hostname === "localhost";
    if (u.protocol === "https:") { /* ok */ }
    else if (u.protocol === "http:" && local) { /* test sink */ }
    else return false;
    if (endpoint.length < 16 || endpoint.length > 2048) return false;
    const p = wpB64urlDec(p256dh), a = wpB64urlDec(auth);
    return p.length === 65 && p[0] === 0x04 && a.length === 16;
  } catch { return false; }
}
async function wpEncrypt(plaintext, p256dhB64, authB64) {
  const uaPublic = wpB64urlDec(p256dhB64);
  const auth = wpB64urlDec(authB64);
  if (uaPublic.length !== 65 || uaPublic[0] !== 0x04) throw new Error("bad_p256dh");
  if (auth.length !== 16) throw new Error("bad_auth");
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const encoder = new TextEncoder();
  const authInfo = wpConcat(encoder.encode("WebPush: info"), new Uint8Array([0]), uaPublic, asPublic);
  const ikm = await wpHkdf(secret, auth, authInfo, 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await wpHkdf(ikm, salt, wpConcat(encoder.encode("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
  const nonce = await wpHkdf(ikm, salt, wpConcat(encoder.encode("Content-Encoding: nonce"), new Uint8Array([0])), 12);
  const pt = typeof plaintext === "string" ? encoder.encode(plaintext) : plaintext;
  const padded = wpConcat(pt, new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded));
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  return wpConcat(salt, rs, new Uint8Array([65]), asPublic, ct);
}
async function wpDecrypt(body, uaPrivateKey, uaPublicRaw, authSecret) {
  const buf = body instanceof Uint8Array ? body : new Uint8Array(body);
  const salt = buf.slice(0, 16);
  const idlen = buf[20];
  const asPublic = buf.slice(21, 21 + idlen);
  const ct = buf.slice(21 + idlen);
  const asKey = await crypto.subtle.importKey("raw", asPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: asKey }, uaPrivateKey, 256));
  const encoder = new TextEncoder();
  const authInfo = wpConcat(encoder.encode("WebPush: info"), new Uint8Array([0]), uaPublicRaw, asPublic);
  const ikm = await wpHkdf(secret, authSecret, authInfo, 32);
  const cek = await wpHkdf(ikm, salt, wpConcat(encoder.encode("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
  const nonce = await wpHkdf(ikm, salt, wpConcat(encoder.encode("Content-Encoding: nonce"), new Uint8Array([0])), 12);
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]);
  const padded = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, aesKey, ct));
  let end = padded.length - 1;
  while (end >= 0 && padded[end] === 0) end--;
  if (end < 0 || (padded[end] !== 1 && padded[end] !== 2)) throw new Error("bad_padding");
  return padded.slice(0, end);
}
async function wpGenerateVapidKeys() {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const rawPub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  return { publicKey: wpB64urlEnc(rawPub), privateKey: jwk.d };
}
async function wpVapidJwt(audience, subject, publicKeyB64, privateKeyB64, exp) {
  const header = wpB64urlEnc(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = wpB64urlEnc(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: exp || Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  })));
  const pub = wpB64urlDec(publicKeyB64);
  const d = wpB64urlDec(privateKeyB64);
  const jwk = {
    kty: "EC", crv: "P-256",
    d: wpB64urlEnc(d),
    x: wpB64urlEnc(pub.slice(1, 33)),
    y: wpB64urlEnc(pub.slice(33, 65)),
  };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(header + "." + payload)));
  return header + "." + payload + "." + wpB64urlEnc(sig);
}
function wpEndpointAudience(endpoint) {
  return new URL(endpoint).origin;
}
async function wpSend(sub, payloadObj, env) {
  const pub = env && env.VAPID_PUBLIC_KEY, priv = env && env.VAPID_PRIVATE_KEY;
  const subj = (env && env.VAPID_SUBJECT) || "mailto:hello@newbornkr.online";
  if (!pub || !priv) return { ok: false, status: 0, skip: "no_vapid" };
  const body = await wpEncrypt(JSON.stringify(payloadObj), sub.p256dh, sub.auth);
  const jwt = await wpVapidJwt(wpEndpointAudience(sub.endpoint), subj, pub, priv);
  const headers = {
    Authorization: "vapid t=" + jwt + ", k=" + pub,
    "Content-Encoding": "aes128gcm",
    "Content-Type": "application/octet-stream",
    TTL: "86400",
    Urgency: "normal",
    Topic: String(payloadObj.tag || "nb").slice(0, 32),
  };
  const res = await fetch(sub.endpoint, { method: "POST", headers, body });
  return { ok: res.ok || res.status === 201, status: res.status };
}

export {
  WP_THROTTLE_MS, wpB64urlEnc, wpB64urlDec, wpFormatTime, wpFormatDate,
  wpRecordPayload, wpPhotoPayload, wpPickTargets, wpShouldThrottle, wpSummarizeRecords, wpValidSub,
  wpEncrypt, wpDecrypt, wpGenerateVapidKeys, wpVapidJwt, wpSend,
};
