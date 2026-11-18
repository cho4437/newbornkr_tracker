// Family sharing API for the baby log (/api/family/*). ES module imported by worker/index.js.
import { wpPhotoPayload, wpPickTargets, wpRecordPayload, wpSend, wpShouldThrottle, wpSummarizeRecords, wpValidSub } from "./web-push.js";
// Storage: Cloudflare D1 binding `DB`. Only log entries + optional per-device nicknames are stored, keyed by
// SHA-256(family code) so the raw code never sits in the database.
const FAM_SCHEMA = [
  "CREATE TABLE IF NOT EXISTS families (id TEXT PRIMARY KEY, seq INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS entries (family_id TEXT NOT NULL, id TEXT NOT NULL, data TEXT, deleted INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, seq INTEGER NOT NULL, PRIMARY KEY (family_id, id))",
  "CREATE INDEX IF NOT EXISTS entries_seq ON entries (family_id, seq)",
  "CREATE TABLE IF NOT EXISTS members (family_id TEXT NOT NULL, dev TEXT NOT NULL, nick TEXT, last_seen INTEGER NOT NULL, PRIMARY KEY (family_id, dev))",
  // one-time "move to another browser / app" codes: id = SHA-256 of the code; the family code is stored only encrypted
  // with a key derived from the move code, so it can be recovered only by whoever holds that short-lived code
  "CREATE TABLE IF NOT EXISTS handoffs (id TEXT PRIMARY KEY, family_id TEXT NOT NULL, box TEXT NOT NULL, expires INTEGER NOT NULL)",
  // per-family baby profile (birth date for the growth calendar), last-write-wins on updated_at
  "CREATE TABLE IF NOT EXISTS profiles (family_id TEXT PRIMARY KEY, birth TEXT, updated_at INTEGER NOT NULL)",
  // additive: CDC milestone achievements shared by family code (never alters profiles/entries)
  "CREATE TABLE IF NOT EXISTS milestone_marks (family_id TEXT NOT NULL, id TEXT NOT NULL, achieved_at TEXT, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (family_id, id))",
  "CREATE INDEX IF NOT EXISTS milestone_marks_fam ON milestone_marks (family_id)",
  // additive: parent-typed custom milestones shared by family code
  "CREATE TABLE IF NOT EXISTS custom_milestones (family_id TEXT NOT NULL, id TEXT NOT NULL, text TEXT NOT NULL, event_at TEXT, achieved INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (family_id, id))",
  "CREATE INDEX IF NOT EXISTS custom_milestones_fam ON custom_milestones (family_id)",
  // additive: growth photos (bytes in R2 binding PHOTOS when bound, else photo_blobs)
  "CREATE TABLE IF NOT EXISTS photos (family_id TEXT NOT NULL, id TEXT NOT NULL, key TEXT, date TEXT, note TEXT, by TEXT, dev TEXT, size INTEGER NOT NULL DEFAULT 0, deleted INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (family_id, id))",
  "CREATE INDEX IF NOT EXISTS photos_fam ON photos (family_id)",
  "CREATE TABLE IF NOT EXISTS photo_blobs (key TEXT PRIMARY KEY, data BLOB NOT NULL)",
  // additive: web push subscriptions (one per device in a family) and send throttle
  "CREATE TABLE IF NOT EXISTS push_subs (family_id TEXT NOT NULL, dev TEXT NOT NULL, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, records INTEGER NOT NULL DEFAULT 1, photos INTEGER NOT NULL DEFAULT 1, lang TEXT NOT NULL DEFAULT 'ko', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (family_id, dev))",
  "CREATE INDEX IF NOT EXISTS push_subs_fam ON push_subs (family_id)",
  "CREATE TABLE IF NOT EXISTS push_throttle (family_id TEXT NOT NULL, kind TEXT NOT NULL, last_sent INTEGER NOT NULL, PRIMARY KEY (family_id, kind))",
  // additive (2026-11 view-only share links): id = SHA-256 of a view code derived from the family code. Holders of a view
  // code can read the family log / growth data and get notifications, but every write is refused (403 read_only).
  "CREATE TABLE IF NOT EXISTS view_codes (id TEXT PRIMARY KEY, family_id TEXT NOT NULL, created_at INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS view_codes_fam ON view_codes (family_id)",
  // additive: which member devices joined through a view code (shown as "view only" in the member list)
  "CREATE TABLE IF NOT EXISTS view_members (family_id TEXT NOT NULL, dev TEXT NOT NULL, PRIMARY KEY (family_id, dev))",
];
let famSchemaReady = false;
async function famEnsure(db) {
  if (famSchemaReady) return;
  await db.batch(FAM_SCHEMA.map((s) => db.prepare(s)));
  famSchemaReady = true;
}
const FAM_LIMITS = { bodyBytes: 300000, changes: 500, page: 1000, nick: 20, note: 200 };
const FAM_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32 (no I L O U)
function famNewCode() {
  const b = crypto.getRandomValues(new Uint8Array(17)); // 136 bits -> 26 chars of 5 bits = 130 bits used
  let bits = 0, val = 0, out = "";
  for (const x of b) { val = (val << 8) | x; bits += 8; while (bits >= 5 && out.length < 26) { out += FAM_ALPHABET[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  return out;
}
function famNormCode(c) {
  if (typeof c !== "string") return null;
  const s = c.toUpperCase().replace(/[\s-]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0");
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(s) ? s : null;
}
async function famHash(code) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("nbfam:" + code));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
// --- basic in-memory rate limiting (per isolate, per IP) ---
const famHits = new Map();
function famLimited(ip, bucket, max, windowMs) {
  const k = bucket + ":" + ip, now = Date.now();
  let h = famHits.get(k);
  if (!h || now - h.t > windowMs) { h = { t: now, n: 0 }; famHits.set(k, h); }
  h.n++;
  if (famHits.size > 5000) for (const [kk, v] of famHits) if (now - v.t > 3600000) famHits.delete(kk);
  return h.n > max;
}
const FAM_RATES = { create: [5, 3600000], join: [30, 600000], sync: [40, 60000], regen: [5, 3600000], leave: [20, 600000], move: [20, 600000], claim: [20, 600000],
  profile: [60, 600000], milestones: [60, 600000], "custom-milestones": [60, 600000],
  "photo-list": [120, 600000], "photo-put": [60, 600000], "photo-get": [1500, 600000], "photo-del": [60, 600000],
  "push-key": [60, 600000], "push-sub": [30, 600000], "push-unsub": [30, 600000], "push-prefs": [30, 600000], "view-code": [60, 600000], peek: [60, 600000] };
// photo limits: one JPEG ≤ ~1.9 MB (the app resizes to ≤1600px so real photos are ~0.2–0.8 MB),
// ≤ 500 live photos and ≤ 300 MB per family
const PHOTO_LIMITS = { bytes: 1900000, body: 2700000, count: 500, total: 300 * 1000 * 1000, note: 200 };
async function phStorePut(env, key, bytes) {
  if (env.PHOTOS) await env.PHOTOS.put(key, bytes, { httpMetadata: { contentType: "image/jpeg" } });
  else await env.DB.prepare("INSERT OR REPLACE INTO photo_blobs (key, data) VALUES (?, ?)").bind(key, bytes).run();
}
async function phStoreGet(env, key) {
  if (env.PHOTOS) { const o = await env.PHOTOS.get(key); return o ? new Uint8Array(await o.arrayBuffer()) : null; }
  const r = await env.DB.prepare("SELECT data FROM photo_blobs WHERE key = ?").bind(key).first();
  return r && r.data ? new Uint8Array(r.data) : null;
}
async function phStoreDel(env, keys) {
  keys = keys.filter(Boolean); if (!keys.length) return;
  if (env.PHOTOS) { for (let i = 0; i < keys.length; i += 1000) await env.PHOTOS.delete(keys.slice(i, i + 1000)); }
  else for (let i = 0; i < keys.length; i += 50) await env.DB.batch(keys.slice(i, i + 50).map((k) => env.DB.prepare("DELETE FROM photo_blobs WHERE key = ?").bind(k)));
}
const phKey = () => "p/" + [...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(16).padStart(2, "0")).join("");
const phMeta = (r, dev) => r.deleted ? { id: r.id, deleted: true, updatedAt: r.updated_at } : { id: r.id, date: r.date, note: r.note || "", by: r.by || "", mine: !!dev && r.dev === dev, size: r.size, updatedAt: r.updated_at, createdAt: r.created_at };
const famDate = (v) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof v === "string" ? v : ""); if (!m) return ""; const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] && +m[1] >= 2000 ? v : ""; };
const FAM_MOVE_TTL = 30 * 60000; // a move code works once, for 30 minutes (long enough to install the app first)
function famNewMove() { // 8 chars of Crockford base32 = 40 bits; single use, short-lived, rate-limited
  const b = crypto.getRandomValues(new Uint8Array(8)); let out = "";
  for (const x of b) out += FAM_ALPHABET[x & 31];
  return out;
}
function famNormMove(c) {
  if (typeof c !== "string") return null;
  const s = c.toUpperCase().replace(/[\s-]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0");
  return /^[0-9A-HJKMNP-TV-Z]{8}$/.test(s) ? s : null;
}
const famB64 = (u8) => btoa(String.fromCharCode(...u8));
const famUnB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function famMoveKey(move) {
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("nbmovekey:" + move));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function famSeal(move, code) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await famMoveKey(move), new TextEncoder().encode(code)));
  return famB64(iv) + "." + famB64(ct);
}
async function famOpen(move, box) {
  const [iv, ct] = String(box).split(".");
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: famUnB64(iv) }, await famMoveKey(move), famUnB64(ct)));
}
function famJson(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex" } });
}
const famStr = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const famNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : Number.NaN);
/** Validate one change from a client. Returns { id, updatedAt, deleted, data } or null. */
function famCleanChange(c, now) {
  if (!c || typeof c !== "object") return null;
  const id = famStr(c.id, 40); if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return null;
  let updatedAt = famNum(c.updatedAt); if (!(updatedAt > 0)) return null;
  if (updatedAt > now + 5 * 60000) updatedAt = now; // clamp clocks far in the future
  if (c.deleted === true) return { id, updatedAt, deleted: 1, data: null };
  const t = famNum(c.t); if (!(t > 946684800000 && t < now + 86400000)) return null;
  const e = { id, type: c.type, t, updatedAt };
  if (c.type === "feed") {
    e.kind = c.kind === "breast" ? "breast" : "formula";
    const ml = famNum(c.ml); if (ml > 0 && ml <= 9999) e.ml = Math.round(ml * 100) / 100; // any positive amount, decimals kept
    const min = Math.round(famNum(c.min)); if (min > 0 && min <= 300) e.min = min;
  } else if (c.type === "sleep") {
    if (c.end == null) e.end = null; else { const end = famNum(c.end); if (!(end >= t && end < now + 86400000)) return null; e.end = end; }
  } else if (c.type === "diaper") {
    if (!["pee", "poop", "both"].includes(c.d)) return null; e.d = c.d;
  } else return null;
  const by = famStr(c.by, FAM_LIMITS.nick); if (by) e.by = by;
  const dev = famStr(c.dev, 40); if (/^[A-Za-z0-9_-]{1,40}$/.test(dev)) e.dev = dev;
  const note = famStr(c.note, FAM_LIMITS.note); if (note) e.note = note;
  return { id, updatedAt, deleted: 0, data: JSON.stringify(e) };
}
async function famMembers(db, fid) {
  const r = await db.prepare("SELECT m.dev, m.nick, m.last_seen, (v.dev IS NOT NULL) AS viewer FROM members m LEFT JOIN view_members v ON v.family_id = m.family_id AND v.dev = m.dev WHERE m.family_id = ? ORDER BY m.last_seen DESC LIMIT 20").bind(fid).all();
  return r.results.map((m) => ({ dev: m.dev.slice(-4), nick: m.nick || "", lastSeen: m.last_seen, ...(m.viewer ? { view: true } : {}) }));
}
/** View-only code for a family code: 26 Crockford chars from SHA-256("nbview:" + code). Deterministic, so it never has
 *  to be stored in clear; a new family code (regen) gives a new view code and the old view links stop working. */
async function famViewCode(code) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("nbview:" + code)));
  let bits = 0, val = 0, out = "";
  for (const x of d) { val = ((val << 8) | x) & 0xffff; bits += 8; while (bits >= 5 && out.length < 26) { out += FAM_ALPHABET[(val >>> (bits - 5)) & 31]; bits -= 5; } if (out.length >= 26) break; }
  return out;
}
async function famTouch(db, fid, dev, nick, now, force, insert = true) {
  if (!dev) return;
  const cur = await db.prepare("SELECT nick, last_seen FROM members WHERE family_id = ? AND dev = ?").bind(fid, dev).first();
  if (!force && cur && (cur.nick || "") === nick && now - cur.last_seen < 5 * 60000) return; // save D1 writes
  // a sync only refreshes an existing member: a sync that was still in flight when the device left must not re-add it
  // (that ghost member kept the family alive after everyone had left)
  if (!insert) { if (cur) await db.prepare("UPDATE members SET nick = ?, last_seen = ? WHERE family_id = ? AND dev = ?").bind(nick, now, fid, dev).run(); return; }
  // only while the family still exists, so a request racing a regen/last-leave cannot leave an orphan member row
  await db.prepare("INSERT INTO members (family_id, dev, nick, last_seen) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM families WHERE id = ?) ON CONFLICT(family_id, dev) DO UPDATE SET nick = excluded.nick, last_seen = excluded.last_seen").bind(fid, dev, nick, now, fid).run();
}

async function famNotify(env, db, { fid, senderDev, kind, payloadFactory }) {
  if (!env || !env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  const now = Date.now();
  const th = await db.prepare("SELECT last_sent FROM push_throttle WHERE family_id = ? AND kind = ?").bind(fid, kind).first();
  if (th && wpShouldThrottle(th.last_sent, now)) return;
  const pref = kind === "photos" ? "photos" : "records";
  const rows = (await db.prepare("SELECT dev, endpoint, p256dh, auth, records, photos, lang FROM push_subs WHERE family_id = ?").bind(fid).all()).results || [];
  const targets = wpPickTargets(rows, senderDev, pref);
  if (!targets.length) return;
  await db.prepare("INSERT INTO push_throttle (family_id, kind, last_sent) VALUES (?, ?, ?) ON CONFLICT(family_id, kind) DO UPDATE SET last_sent = excluded.last_sent").bind(fid, kind, now).run();
  // Cloudflare Queues fan-out: one message per target device, delivered by the queue() consumer in worker/index.js
  // (retries on push-service errors, keeps the API response fast). Without the PUSH_QUEUE binding, send inline.
  if (env.PUSH_QUEUE) {
    await env.PUSH_QUEUE.sendBatch(targets.map((sub) => ({ body: {
      fid, sub: { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      payload: payloadFactory(sub.lang === "en" || sub.lang === "pt" ? sub.lang : "ko"),
    } })));
    return;
  }
  for (const sub of targets) {
    try {
      const payload = payloadFactory(sub.lang === "en" || sub.lang === "pt" ? sub.lang : "ko");
      const r = await wpSend(sub, payload, env);
      if (r.status === 404 || r.status === 410) {
        await db.prepare("DELETE FROM push_subs WHERE family_id = ? AND endpoint = ?").bind(fid, sub.endpoint).run();
      }
    } catch {}
  }
}
function famKick(ctx, p) {
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p.catch(() => {}));
  else p.catch(() => {});
}

async function handleFamily(request, env, url, ctx) {
  const action = url.pathname.slice("/api/family/".length);
  if (!FAM_RATES[action]) return famJson({ error: "not_found" }, 404);
  if (request.method !== "POST") return famJson({ error: "method_not_allowed" }, 405);
  if (!env || !env.DB) return famJson({ error: "sharing_unavailable" }, 503);
  // Same-origin writes only: no CORS headers are ever sent, and a foreign Origin is rejected outright.
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return famJson({ error: "forbidden_origin" }, 403);
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) return famJson({ error: "json_required" }, 415);
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const [max, win] = FAM_RATES[action];
  if (famLimited(ip, action, max, win)) return famJson({ error: "rate_limited" }, 429);
  const raw = await request.text();
  if (raw.length > (action === "photo-put" ? PHOTO_LIMITS.body : FAM_LIMITS.bodyBytes)) return famJson({ error: "too_large" }, 413);
  let body; try { body = JSON.parse(raw); } catch { return famJson({ error: "bad_json" }, 400); }
  if (!body || typeof body !== "object") return famJson({ error: "bad_request" }, 400);
  const db = env.DB; await famEnsure(db);
  const now = Date.now();
  const dev = /^[A-Za-z0-9_-]{8,40}$/.test(body.dev || "") ? body.dev : "";
  const nick = famStr(body.nick, FAM_LIMITS.nick);
  if (action === "create") {
    if (!dev) return famJson({ error: "bad_device" }, 400);
    const code = famNewCode(), fid = await famHash(code);
    await db.prepare("INSERT INTO families (id, seq, created_at) VALUES (?, 0, ?)").bind(fid, now).run();
    await famTouch(db, fid, dev, nick, now, true);
    return famJson({ code, members: await famMembers(db, fid) });
  }
  if (action === "claim") { // a new browser / the installed app takes over a move code -> becomes a device of that family
    if (!dev) return famJson({ error: "bad_device" }, 400);
    const move = famNormMove(body.move);
    if (!move) return famJson({ error: "bad_move" }, 400);
    if (body.check) { // look only (nothing consumed): is the code valid, and is it for the family this device is already in?
      const h = await db.prepare("SELECT family_id, expires FROM handoffs WHERE id = ?").bind(await famHash("move:" + move)).first();
      if (!h || h.expires < now) return famJson({ error: "expired_move" }, 404);
      let same = false;
      const fc = typeof body.from === "string" && famNormCode(body.from);
      if (fc) { const fh = await famHash(fc); same = fh === h.family_id || !!(await db.prepare("SELECT 1 AS x FROM view_codes WHERE id = ? AND family_id = ?").bind(fh, h.family_id).first()); }
      return famJson({ ok: true, same });
    }
    const row = await db.prepare("DELETE FROM handoffs WHERE id = ? RETURNING family_id, box, expires").bind(await famHash("move:" + move)).first(); // single use
    if (!row || row.expires < now) return famJson({ error: "expired_move" }, 404);
    const fam = await db.prepare("SELECT id FROM families WHERE id = ?").bind(row.family_id).first();
    if (!fam) return famJson({ error: "expired_move" }, 404);
    let famCode; try { famCode = await famOpen(move, row.box); } catch { return famJson({ error: "expired_move" }, 404); }
    if (famNormCode(famCode) !== famCode || (await famHash(famCode)) !== row.family_id) return famJson({ error: "expired_move" }, 404);
    await famTouch(db, row.family_id, dev, nick, now, true);
    return famJson({ code: famCode, members: await famMembers(db, row.family_id) });
  }
  if (action === "push-key") {
    if (!env.VAPID_PUBLIC_KEY) return famJson({ error: "push_unavailable" }, 503);
    return famJson({ publicKey: env.VAPID_PUBLIC_KEY });
  }
  const code = famNormCode(body.code);
  if (!code) return famJson({ error: "bad_code" }, 400);
  let fid = await famHash(code), role = "edit";
  let fam = await db.prepare("SELECT id, seq FROM families WHERE id = ?").bind(fid).first();
  if (!fam) { // not a family code: maybe a view-only code
    const v = await db.prepare("SELECT family_id FROM view_codes WHERE id = ?").bind(fid).first();
    if (v) { fid = v.family_id; role = "view"; fam = await db.prepare("SELECT id, seq FROM families WHERE id = ?").bind(fid).first(); }
  }
  if (!fam) return famJson({ error: "unknown_code" }, 404);
  const view = role === "view";
  const readOnly = () => famJson({ error: "read_only", role }, 403);
  if (view && (action === "regen" || action === "move" || action === "photo-put" || action === "photo-del")) return readOnly();
  if (view && (action === "sync" || action === "milestones" || action === "custom-milestones") && Array.isArray(body.changes) && body.changes.length) return readOnly();
  if (view && action === "profile" && body.birth != null) return readOnly();
  if (action === "peek") return famJson({ ok: true, role }); // what kind of code is this (edit / view)? no membership, no data
  if (action === "join") {
    if (!dev) return famJson({ error: "bad_device" }, 400);
    await famTouch(db, fid, dev, nick, now, true);
    if (view) await db.prepare("INSERT OR IGNORE INTO view_members (family_id, dev) VALUES (?, ?)").bind(fid, dev).run();
    else await db.prepare("DELETE FROM view_members WHERE family_id = ? AND dev = ?").bind(fid, dev).run(); // the full code upgrades a device
    return famJson({ ok: true, role, members: await famMembers(db, fid) });
  }
  if (action === "view-code") { // the view-only share link; a viewer just gets its own code back
    if (view) return famJson({ view: code, role });
    const vc = await famViewCode(code);
    await db.prepare("INSERT OR IGNORE INTO view_codes (id, family_id, created_at) VALUES (?, ?, ?)").bind(await famHash(vc), fid, now).run();
    return famJson({ view: vc, role });
  }
  if (action === "push-sub") {
    if (!dev) return famJson({ error: "bad_device" }, 400);
    const endpoint = famStr(body.endpoint, 2048);
    const p256dh = famStr(body.p256dh, 200);
    const auth = famStr(body.auth, 50);
    if (!wpValidSub(endpoint, p256dh, auth)) return famJson({ error: "bad_subscription" }, 400);
    const records = body.records === false ? 0 : 1;
    const photos = body.photos === false ? 0 : 1;
    const lang = body.lang === "en" || body.lang === "pt" ? body.lang : "ko";
    await db.prepare("INSERT INTO push_subs (family_id, dev, endpoint, p256dh, auth, records, photos, lang, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(family_id, dev) DO UPDATE SET endpoint = excluded.endpoint, p256dh = excluded.p256dh, auth = excluded.auth, records = excluded.records, photos = excluded.photos, lang = excluded.lang, updated_at = excluded.updated_at").bind(fid, dev, endpoint, p256dh, auth, records, photos, lang, now, now).run();
    return famJson({ ok: true, subscribed: true, records: !!records, photos: !!photos, lang });
  }
  if (action === "push-unsub") {
    if (dev) await db.prepare("DELETE FROM push_subs WHERE family_id = ? AND dev = ?").bind(fid, dev).run();
    const endpoint = famStr(body.endpoint, 2048);
    if (endpoint) await db.prepare("DELETE FROM push_subs WHERE family_id = ? AND endpoint = ?").bind(fid, endpoint).run();
    return famJson({ ok: true, subscribed: false });
  }
  if (action === "push-prefs") {
    if (!dev) return famJson({ error: "bad_device" }, 400);
    const row = await db.prepare("SELECT records, photos, lang FROM push_subs WHERE family_id = ? AND dev = ?").bind(fid, dev).first();
    if (!row) return famJson({ subscribed: false, records: false, photos: false });
    let records = row.records, photos = row.photos;
    if (typeof body.records === "boolean") records = body.records ? 1 : 0;
    if (typeof body.photos === "boolean") photos = body.photos ? 1 : 0;
    if (records !== row.records || photos !== row.photos) {
      await db.prepare("UPDATE push_subs SET records = ?, photos = ?, updated_at = ? WHERE family_id = ? AND dev = ?").bind(records, photos, now, fid, dev).run();
    }
    return famJson({ subscribed: true, records: !!records, photos: !!photos, lang: row.lang === "en" || row.lang === "pt" ? row.lang : "ko" });
  }
  if (action === "move") { // only a current device of the family can mint a move code
    const me = dev && await db.prepare("SELECT 1 AS x FROM members WHERE family_id = ? AND dev = ?").bind(fid, dev).first();
    if (!me) return famJson({ error: "not_member" }, 403);
    const move = famNewMove();
    await db.batch([
      db.prepare("DELETE FROM handoffs WHERE expires < ?").bind(now),
      db.prepare("INSERT INTO handoffs (id, family_id, box, expires) VALUES (?, ?, ?, ?)").bind(await famHash("move:" + move), fid, await famSeal(move, code), now + FAM_MOVE_TTL),
    ]);
    return famJson({ move, expires: now + FAM_MOVE_TTL });
  }
  if (action === "leave") {
    // switching families with a move code: don't leave if the "old" code is the same family as the new one
    if (typeof body.unless === "string" && famNormCode(body.unless) && (await famHash(famNormCode(body.unless))) === fid) return famJson({ ok: true, same: true });
    if (dev) {
      await db.prepare("DELETE FROM members WHERE family_id = ? AND dev = ?").bind(fid, dev).run();
      await db.prepare("DELETE FROM push_subs WHERE family_id = ? AND dev = ?").bind(fid, dev).run();
      await db.prepare("DELETE FROM view_members WHERE family_id = ? AND dev = ?").bind(fid, dev).run();
    }
    const left = await db.prepare("SELECT COUNT(*) AS n FROM members WHERE family_id = ?").bind(fid).first();
    if (!left || !left.n) { // last one out removes the shared copy, photos included
      const keys = (await db.prepare("SELECT key FROM photos WHERE family_id = ? AND key IS NOT NULL").bind(fid).all()).results.map((r) => r.key);
      await phStoreDel(env, keys);
      await db.batch([db.prepare("DELETE FROM entries WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM handoffs WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM photos WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM profiles WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM milestone_marks WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM custom_milestones WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM push_subs WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM push_throttle WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM view_codes WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM view_members WHERE family_id = ?").bind(fid), db.prepare("DELETE FROM families WHERE id = ?").bind(fid)]);
    }
    return famJson({ ok: true });
  }
  if (action === "regen") {
    const nc = famNewCode(), nfid = await famHash(nc);
    await db.batch([
      // view-only devices hold the old view code, which stops working: drop them so they cannot keep the family alive
      db.prepare("DELETE FROM members WHERE family_id = ? AND dev IN (SELECT dev FROM view_members WHERE family_id = ?)").bind(fid, fid),
      db.prepare("DELETE FROM push_subs WHERE family_id = ? AND dev IN (SELECT dev FROM view_members WHERE family_id = ?)").bind(fid, fid),
      db.prepare("DELETE FROM view_members WHERE family_id = ?").bind(fid),
      db.prepare("INSERT INTO families (id, seq, created_at) SELECT ?, seq, ? FROM families WHERE id = ?").bind(nfid, now, fid),
      db.prepare("UPDATE entries SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE members SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE profiles SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE milestone_marks SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE custom_milestones SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE photos SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE push_subs SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("UPDATE push_throttle SET family_id = ? WHERE family_id = ?").bind(nfid, fid),
      db.prepare("DELETE FROM view_codes WHERE family_id = ?").bind(fid), // old view links stop working too
      db.prepare("DELETE FROM families WHERE id = ?").bind(fid),
      db.prepare("DELETE FROM handoffs WHERE family_id = ?").bind(fid), // move codes carry the old family code: void them
    ]);
    if (dev) await famTouch(db, nfid, dev, nick, now, true);
    return famJson({ code: nc, members: await famMembers(db, nfid) });
  }
  if (action === "profile") { // baby birth date shared by the family (last write wins)
    const birth = famDate(body.birth), u = famNum(body.updatedAt);
    if (birth && u > 0 && birth <= new Date(now + 86400000).toISOString().slice(0, 10)) {
      await db.prepare("INSERT INTO profiles (family_id, birth, updated_at) VALUES (?, ?, ?) ON CONFLICT(family_id) DO UPDATE SET birth = excluded.birth, updated_at = excluded.updated_at WHERE excluded.updated_at > profiles.updated_at").bind(fid, birth, Math.min(u, now + 5 * 60000)).run();
    }
    const r = await db.prepare("SELECT birth, updated_at FROM profiles WHERE family_id = ?").bind(fid).first();
    return famJson({ birth: r ? r.birth : null, updatedAt: r ? r.updated_at : 0 });
  }
  if (action === "photo-list") {
    const rows = (await db.prepare("SELECT id, date, note, by, dev, size, deleted, updated_at, created_at FROM photos WHERE family_id = ? ORDER BY date, created_at LIMIT 2000").bind(fid).all()).results;
    return famJson({ photos: rows.map((r) => phMeta(r, dev)), limits: { bytes: PHOTO_LIMITS.bytes, count: PHOTO_LIMITS.count }, storage: env.PHOTOS ? "r2" : "d1" });
  }
  if (action === "photo-put" || action === "photo-get" || action === "photo-del") {
    const id = famStr(body.id, 40); if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return famJson({ error: "bad_id" }, 400);
    const cur = await db.prepare("SELECT * FROM photos WHERE family_id = ? AND id = ?").bind(fid, id).first();
    if (action === "photo-get") {
      if (!cur || cur.deleted || !cur.key) return famJson({ error: "not_found" }, 404);
      const bytes = await phStoreGet(env, cur.key);
      if (!bytes) return famJson({ error: "not_found" }, 404);
      return new Response(bytes, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex", "Content-Disposition": "inline" } });
    }
    if (action === "photo-del") {
      if (cur && cur.key) await phStoreDel(env, [cur.key]);
      await db.prepare("INSERT INTO photos (family_id, id, key, date, note, by, dev, size, deleted, updated_at, created_at) VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, 0, 1, ?, ?) ON CONFLICT(family_id, id) DO UPDATE SET key = NULL, date = NULL, note = NULL, by = NULL, size = 0, deleted = 1, updated_at = excluded.updated_at").bind(fid, id, now, now).run();
      return famJson({ ok: true });
    }
    // photo-put: new photo (needs data) or a metadata edit (date / note) of an existing one
    const date = famDate(body.date); if (!date) return famJson({ error: "bad_date" }, 400);
    const note = famStr(body.note, PHOTO_LIMITS.note);
    let u = famNum(body.updatedAt); if (!(u > 0)) u = now; if (u > now + 5 * 60000) u = now;
    if (cur && cur.deleted) return famJson({ error: "deleted" }, 410); // a delete wins over a late re-upload
    if (cur) {
      if (u > cur.updated_at) await db.prepare("UPDATE photos SET date = ?, note = ?, updated_at = ? WHERE family_id = ? AND id = ?").bind(date, note, u, fid, id).run();
      const r = await db.prepare("SELECT * FROM photos WHERE family_id = ? AND id = ?").bind(fid, id).first();
      return famJson({ ok: true, photo: phMeta(r, dev) });
    }
    if (typeof body.data !== "string" || !body.data) return famJson({ error: "data_required" }, 400);
    let bytes; try { bytes = famUnB64(body.data); } catch { return famJson({ error: "bad_data" }, 400); }
    if (bytes.length > PHOTO_LIMITS.bytes) return famJson({ error: "photo_too_large", max: PHOTO_LIMITS.bytes }, 413);
    if (bytes.length < 100 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return famJson({ error: "jpeg_required" }, 415);
    const tot = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS b FROM photos WHERE family_id = ? AND deleted = 0").bind(fid).first();
    if (tot.n >= PHOTO_LIMITS.count) return famJson({ error: "too_many_photos", max: PHOTO_LIMITS.count }, 413);
    if (tot.b + bytes.length > PHOTO_LIMITS.total) return famJson({ error: "family_storage_full" }, 413);
    const key = phKey();
    await phStorePut(env, key, bytes);
    await db.prepare("INSERT INTO photos (family_id, id, key, date, note, by, dev, size, deleted, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)").bind(fid, id, key, date, note, nick, dev, bytes.length, u, now).run();
    const r = await db.prepare("SELECT * FROM photos WHERE family_id = ? AND id = ?").bind(fid, id).first();
    famKick(ctx, famNotify(env, db, { fid, senderDev: dev, kind: "photos", payloadFactory: (lang) => wpPhotoPayload({ date, lang }) }));
    return famJson({ ok: true, photo: phMeta(r, dev) });
  }
  if (action === "milestones") { // CDC milestone achievements (additive table; last-write-wins)
    const midOk = (id) => typeof id === "string" && /^[a-z0-9]+\.(social|language|cognitive|movement)\.\d{1,2}$/.test(id);
    const list = Array.isArray(body.changes) ? body.changes.slice(0, 200) : [];
    const st = [];
    for (const c of list) {
      if (!c || !midOk(c.id)) continue;
      let u = famNum(c.updatedAt); if (!(u > 0)) continue;
      if (u > now + 5 * 60000) u = now;
      const del = c.deleted === true ? 1 : 0;
      const at = del ? null : famDate(c.at); // optional achieved date; null = achieved without a date
      st.push(db.prepare("INSERT INTO milestone_marks (family_id, id, achieved_at, updated_at, deleted) VALUES (?, ?, ?, ?, ?) ON CONFLICT(family_id, id) DO UPDATE SET achieved_at = excluded.achieved_at, updated_at = excluded.updated_at, deleted = excluded.deleted WHERE excluded.updated_at > milestone_marks.updated_at").bind(fid, c.id, at, u, del));
    }
    if (st.length) await db.batch(st);
    const rows = (await db.prepare("SELECT id, achieved_at, updated_at, deleted FROM milestone_marks WHERE family_id = ?").bind(fid).all()).results;
    return famJson({ marks: rows.map((r) => ({ id: r.id, at: r.achieved_at, updatedAt: r.updated_at, deleted: !!r.deleted })) });
  }
  if (action === "custom-milestones") { // parent-typed milestones (additive; last-write-wins; text max 80)
    const cidOk = (id) => typeof id === "string" && /^c_[A-Za-z0-9_-]{6,40}$/.test(id);
    const cleanText = (v) => {
      if (typeof v !== "string") return null;
      const t = v.replace(/[\u0000-\u001F\u007F]/g, "").trim();
      return t && t.length <= 80 ? t : null;
    };
    const list = Array.isArray(body.changes) ? body.changes.slice(0, 200) : [];
    const st = [];
    for (const c of list) {
      if (!c || !cidOk(c.id)) continue;
      let u = famNum(c.updatedAt); if (!(u > 0)) continue;
      if (u > now + 5 * 60000) u = now;
      const del = c.deleted === true ? 1 : 0;
      const text = del ? "" : cleanText(c.text);
      if (!del && !text) continue;
      const at = del ? null : famDate(c.at);
      const ach = del ? 0 : (c.achieved === true ? 1 : 0);
      st.push(db.prepare("INSERT INTO custom_milestones (family_id, id, text, event_at, achieved, updated_at, deleted) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(family_id, id) DO UPDATE SET text = excluded.text, event_at = excluded.event_at, achieved = excluded.achieved, updated_at = excluded.updated_at, deleted = excluded.deleted WHERE excluded.updated_at > custom_milestones.updated_at").bind(fid, c.id, text || "", at, ach, u, del));
    }
    if (st.length) await db.batch(st);
    const rows = (await db.prepare("SELECT id, text, event_at, achieved, updated_at, deleted FROM custom_milestones WHERE family_id = ?").bind(fid).all()).results;
    return famJson({ customs: rows.map((r) => ({ id: r.id, text: r.text, at: r.event_at, achieved: !!r.achieved, updatedAt: r.updated_at, deleted: !!r.deleted })) });
  }
  // sync: push changes (last-write-wins on updatedAt, tombstones for deletes) then pull everything after `since`
  const list = Array.isArray(body.changes) ? body.changes : [];
  if (list.length > FAM_LIMITS.changes) return famJson({ error: "too_many_changes", max: FAM_LIMITS.changes }, 413);
  const clean = []; let rejected = 0;
  for (const c of list) { const x = famCleanChange(c, now); if (x) clean.push(x); else rejected++; }
  let added = [];
  if (clean.length) {
    const live = clean.filter((c) => !c.deleted);
    const existed = new Set();
    for (let i = 0; i < live.length; i += 80) {
      const chunk = live.slice(i, i + 80);
      const q = "SELECT id FROM entries WHERE family_id = ? AND id IN (" + chunk.map(() => "?").join(",") + ") AND deleted = 0";
      const found = (await db.prepare(q).bind(fid, ...chunk.map((c) => c.id)).all()).results || [];
      for (const r of found) existed.add(r.id);
    }
    added = live.filter((c) => !existed.has(c.id)).map((c) => { try { return JSON.parse(c.data); } catch { return null; } }).filter(Boolean);
    const st = [];
    for (const c of clean) {
      st.push(db.prepare("UPDATE families SET seq = seq + 1 WHERE id = ?").bind(fid));
      st.push(db.prepare("INSERT INTO entries (family_id, id, data, deleted, updated_at, seq) VALUES (?, ?, ?, ?, ?, (SELECT seq FROM families WHERE id = ?)) ON CONFLICT(family_id, id) DO UPDATE SET data = excluded.data, deleted = excluded.deleted, updated_at = excluded.updated_at, seq = excluded.seq WHERE excluded.updated_at > entries.updated_at").bind(fid, c.id, c.data, c.deleted, c.updatedAt, fid));
    }
    await db.batch(st); // one transaction: seq numbers are unique and increasing
  }
  const since = Math.max(0, Math.floor(famNum(body.since)) || 0);
  const rows = (await db.prepare("SELECT id, data, deleted, updated_at, seq FROM entries WHERE family_id = ? AND seq > ? ORDER BY seq LIMIT ?").bind(fid, since, FAM_LIMITS.page + 1).all()).results;
  const more = rows.length > FAM_LIMITS.page; if (more) rows.pop();
  const changes = rows.map((r) => (r.deleted ? { id: r.id, deleted: true, updatedAt: r.updated_at } : { ...JSON.parse(r.data), updatedAt: r.updated_at }));
  const cursor = rows.length ? rows[rows.length - 1].seq : since;
  await famTouch(db, fid, dev, nick, now, false, false);
  const summary = wpSummarizeRecords(added);
  if (summary) famKick(ctx, famNotify(env, db, { fid, senderDev: dev, kind: "records", payloadFactory: (lang) => wpRecordPayload({ ...summary, lang }) }));
  return famJson({ changes, cursor, more, accepted: clean.length, rejected, role, members: await famMembers(db, fid), serverTime: now });
}

// Queue consumer body for one push message. Returns "ok" | "gone" (subscription removed) | "retry".
async function famDeliverPush(env, msg) {
  const { fid, sub, payload } = msg || {};
  if (!fid || !sub || !wpValidSub(sub.endpoint, sub.p256dh, sub.auth)) return "ok"; // malformed: drop
  const r = await wpSend(sub, payload, env);
  if (r.status === 404 || r.status === 410) {
    if (env.DB) await env.DB.prepare("DELETE FROM push_subs WHERE family_id = ? AND endpoint = ?").bind(fid, sub.endpoint).run();
    return "gone";
  }
  if (r.ok || r.skip) return "ok";
  return r.status === 429 || r.status >= 500 ? "retry" : "ok";
}

// Cron Trigger housekeeping: expired one-time move codes and stale push throttle rows.
async function famCleanup(env, now = Date.now()) {
  if (!env || !env.DB) return { skipped: true };
  await famEnsure(env.DB);
  const [a, b] = await env.DB.batch([
    env.DB.prepare("DELETE FROM handoffs WHERE expires < ?").bind(now),
    env.DB.prepare("DELETE FROM push_throttle WHERE last_sent < ?").bind(now - 7 * 86400000),
  ]);
  return { handoffs: a.meta.changes, throttle: b.meta.changes };
}

export { handleFamily, famDeliverPush, famCleanup };
