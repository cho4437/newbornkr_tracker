// Browser helper: subscribe this device to family web-push and keep prefs in sync.
export function createPush({ api = "/api/family/", getCode, getDev, lang = "ko" }) {
  const urlB64ToUint8 = (s) => {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const b = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(b, (c) => c.charCodeAt(0));
  };
  async function call(action, body) {
    const r = await fetch(api + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, code: getCode(), dev: getDev() }),
      credentials: "same-origin",
      cache: "no-store",
    });
    let data = null; try { data = await r.json(); } catch {}
    if (!r.ok) { const e = new Error((data && data.error) || "http_" + r.status); e.status = r.status; e.code = data && data.error; throw e; }
    return data;
  }
  async function status() {
    try { return await call("push-prefs", {}); }
    catch { return { subscribed: false, records: false, photos: false }; }
  }
  async function enable(prefs = { records: true, photos: true }) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
      const e = new Error("unsupported"); e.code = "unsupported"; throw e;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { const e = new Error("denied"); e.code = "denied"; throw e; }
    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await call("push-key", {});
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(publicKey) });
    }
    const json = sub.toJSON();
    return call("push-sub", {
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      records: prefs.records !== false,
      photos: prefs.photos !== false,
      lang,
    });
  }
  async function disable() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      await call("push-unsub", sub ? { endpoint: sub.endpoint } : {});
      if (sub) await sub.unsubscribe().catch(() => {});
    } catch {
      try { await call("push-unsub", {}); } catch {}
    }
  }
  async function setPrefs(prefs) { return call("push-prefs", prefs); }
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
  return { status, enable, disable, setPrefs, supported };
}
