// End-to-end check of the Queues push fan-out against a running `wrangler dev` (local D1/R2/Queues, synthetic data only).
// Run: npm run dev   (in another terminal)   then   BASE=http://localhost:8787 node tests/queue-push.e2e.mjs
import http from "node:http";
import assert from "node:assert/strict";
import { wpB64urlEnc } from "../worker/web-push.js";

const BASE = process.env.BASE || "http://localhost:8787";
const received = [];
const sink = http.createServer((req, res) => { received.push({ url: req.url, headers: req.headers }); res.writeHead(201); res.end(); });
await new Promise((r) => sink.listen(0, "127.0.0.1", r));
const port = sink.address().port;

let ip = 0;
async function api(action, body) {
  const r = await fetch(`${BASE}/api/family/${action}`, { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": `10.9.0.${++ip}` }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}
async function fakeSubKeys() {
  const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  return { p256dh: wpB64urlEnc(new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey))), auth: wpB64urlEnc(crypto.getRandomValues(new Uint8Array(16))) };
}

const sfx = Date.now().toString(36);
const A = "qa" + sfx + "A01", B = "qa" + sfx + "B01";
const { data: { code } } = await api("create", { dev: A, nick: "엄마" });
await api("join", { code, dev: B, nick: "아빠" });
await api("push-sub", { code, dev: A, endpoint: `http://127.0.0.1:${port}/sub-a`, ...(await fakeSubKeys()), lang: "ko" });
await api("push-sub", { code, dev: B, endpoint: `http://127.0.0.1:${port}/sub-b`, ...(await fakeSubKeys()), lang: "ko" });
const now = Date.now();
const sync = await api("sync", { code, dev: A, nick: "엄마", since: 0, changes: [{ id: "q" + sfx, type: "feed", t: now - 60000, kind: "formula", ml: 120, updatedAt: now, by: "엄마" }] });
assert.equal(sync.data.accepted, 1);
const t0 = Date.now();
while (!received.length && Date.now() - t0 < 15000) await new Promise((r) => setTimeout(r, 100));
assert.equal(received.length, 1, "one push via the queue consumer");
assert.equal(received[0].url, "/sub-b");
assert.equal(received[0].headers["content-encoding"], "aes128gcm");
console.log(`ok: queue consumer delivered 1 encrypted push to device B in ${Date.now() - t0} ms`);
sink.close();
