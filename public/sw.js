// Service worker for the installed tracker app ("아기기록"). Scope: /.
// Pages + manifests: network first (always fresh), last copy kept for offline.
// Hashed /_astro/ assets and /pwa/ icons: cache first. Never touches /api/.
// v3: bump so already-installed phones install this worker (skipWaiting + clients.claim) and drop the v2 cache.
const CACHE = "nb-tracker-v3";
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("nb-tracker-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  const netFirst = r.mode === "navigate" || /\.webmanifest$/.test(u.pathname);
  if (netFirst) {
    const key = u.pathname;
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(key, c)); } return res; })
      .catch(() => caches.match(key).then((m) => m || caches.match(u.pathname.startsWith("/en/") ? "/en/tracker" : u.pathname.startsWith("/pt-br/") ? "/pt-br/tracker" : "/tracker")).then((m) => m || Response.error())));
  } else if (u.pathname.startsWith("/_astro/") || u.pathname.startsWith("/pwa/")) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); } return res; })));
  }
});

self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {
    try { data = { body: e.data && e.data.text() }; } catch { data = {}; }
  }
  const title = data.title || "뉴본";
  const opts = {
    body: data.body || "",
    icon: "/pwa/app-192.png",
    badge: "/pwa/app-192.png",
    tag: data.tag || "nb",
    data: { url: data.url || "/tracker" },
    lang: data.lang,
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const raw = (e.notification.data && e.notification.data.url) || "/tracker";
  const dest = new URL(raw, self.location.origin).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      try {
        if (c.url === dest && "focus" in c) return c.focus();
      } catch {}
    }
    if (self.clients.openWindow) return self.clients.openWindow(dest);
  })());
});
