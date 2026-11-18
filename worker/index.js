// 우리 아기 기록 (newborn tracker) — Cloudflare Worker entry.
//  fetch:     /api/family/* → family sharing API (D1 + R2 + Web Push). Everything else → Workers Static Assets (ASSETS).
//  queue:     push fan-out consumer (Cloudflare Queues) — sends one encrypted Web Push per message, retries on 429/5xx.
//  scheduled: daily Cron Trigger housekeeping (expired move codes, stale push throttle rows).
import { handleFamily, famDeliverPush, famCleanup } from "./family-api.js";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/family/")) {
      try { return await handleFamily(request, env, url, ctx); }
      catch { return json({ error: "server_error" }, 500); }
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },

  async queue(batch, env) {
    for (const m of batch.messages) {
      try {
        const r = await famDeliverPush(env, m.body);
        if (r === "retry") m.retry({ delaySeconds: 30 }); else m.ack();
      } catch { m.retry({ delaySeconds: 30 }); }
    }
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(famCleanup(env).then((r) => console.log("cleanup", JSON.stringify(r))));
  },
};
