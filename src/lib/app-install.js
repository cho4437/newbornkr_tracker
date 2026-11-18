// "아기기록" app install helpers (client side): which browser am I in, is the app already installed / running as an app,
// and the one-tap install prompt (beforeinstallprompt is captured early by PwaHead and kept on window.__bip).
export const INSTALLED_KEY = "nb_tracker_v1_installed";
export const PROMO_KEY = "nb_app_promo_x";
export const PROMO_SNOOZE_MS = 30 * 864e5; // a dismissed banner stays away for 30 days

/** ios-safari | ios-other | samsung | chrome | android-other | inapp-android | inapp-ios | desktop */
export function detectPlatform(ua = "", maxTouchPoints = 0) {
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const inApp = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|BAND\/|everytimeApp|; wv\)/i.test(ua);
  if (inApp && (ios || android)) return ios ? "inapp-ios" : "inapp-android";
  if (ios) return /CriOS|FxiOS|EdgiOS|Whale/.test(ua) ? "ios-other" : "ios-safari";
  if (android) return /SamsungBrowser/.test(ua) ? "samsung" : /Chrome\//.test(ua) && !/Firefox|OPR\/|EdgA|Whale/.test(ua) ? "chrome" : "android-other";
  return "desktop";
}
export const isStandalone = () =>
  (typeof matchMedia === "function" && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: minimal-ui)").matches)) || navigator.standalone === true;
export const wasInstalled = () => { try { return localStorage.getItem(INSTALLED_KEY) === "1"; } catch { return false; } };
export const canPrompt = () => !!window.__bip;
/** Show the browser's own install window. Resolves "accepted" | "dismissed" | "unavailable". */
export async function promptInstall() {
  const e = window.__bip;
  if (!e) return "unavailable";
  window.__bip = null;
  try { await e.prompt(); const { outcome } = await e.userChoice; if (outcome === "accepted") { try { localStorage.setItem(INSTALLED_KEY, "1"); } catch {} } return outcome; }
  catch { return "unavailable"; }
}
/** Android in-app browsers (KakaoTalk, Naver, Instagram…) can't install: hand the page to Chrome (or the default browser). */
export function externalOpenUrl(url) {
  const u = new URL(url);
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}
export function promoDismissed(now = Date.now()) {
  try { const t = Number(localStorage.getItem(PROMO_KEY)); return !!t && now - t < PROMO_SNOOZE_MS; } catch { return false; }
}
export function dismissPromo(now = Date.now()) { try { localStorage.setItem(PROMO_KEY, String(now)); } catch {} }

// One "app + notifications" button on the tracker. Pure so it can be unit-tested.
// s = { platform, standalone, installed, canPrompt, pushOn, joined }
const IOS = new Set(["ios-safari", "ios-other", "inapp-ios"]);
/** Label: "on" (notifications on) | "install" (install the app first, then notifications) | "push" (just notifications). */
export function appPushMode(s) {
  if (s.pushOn) return "on";
  if (s.standalone) return "push";
  if (IOS.has(s.platform) || s.platform === "inapp-android") return "install";
  if (s.canPrompt && !s.installed) return "install";
  return "push";
}
/** First step of a tap: "off" (confirm + unsubscribe) | "ios-hint" (Add to Home Screen guide) | "open-chrome" (in-app browser)
 *  | "prompt" (browser install window, then notifications) | "need-family" | "subscribe". */
export function appPushAction(s) {
  if (s.pushOn) return "off";
  if (!s.standalone) {
    if (IOS.has(s.platform)) return "ios-hint";
    if (s.platform === "inapp-android") return "open-chrome";
    if (s.canPrompt && !s.installed) return "prompt";
  }
  return s.joined ? "subscribe" : "need-family";
}
