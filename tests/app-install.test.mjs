// node tests/app-install.test.mjs
import assert from "node:assert/strict";
import { detectPlatform, externalOpenUrl, appPushMode, appPushAction } from "../src/lib/app-install.js";
const UA = {
  samsung: "Mozilla/5.0 (Linux; Android 15; SAMSUNG SM-S931N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
  chrome: "Mozilla/5.0 (Linux; Android 15; SM-S931N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
  iosSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iosChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0 Mobile/15E148 Safari/604.1",
  kakaoAndroid: "Mozilla/5.0 (Linux; Android 15; SM-S931N; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0 Mobile Safari/537.36 KAKAOTALK 10.8.0",
  kakaoIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.0",
  naverAndroid: "Mozilla/5.0 (Linux; Android 15; SM-S931N; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.9.1)",
  firefoxAndroid: "Mozilla/5.0 (Android 15; Mobile; rv:144.0) Gecko/144.0 Firefox/144.0",
  ipadDesktopUa: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};
assert.equal(detectPlatform(UA.samsung), "samsung");
assert.equal(detectPlatform(UA.chrome), "chrome");
assert.equal(detectPlatform(UA.iosSafari), "ios-safari");
assert.equal(detectPlatform(UA.iosChrome), "ios-other");
assert.equal(detectPlatform(UA.kakaoAndroid), "inapp-android");
assert.equal(detectPlatform(UA.kakaoIos), "inapp-ios");
assert.equal(detectPlatform(UA.naverAndroid), "inapp-android");
assert.equal(detectPlatform(UA.firefoxAndroid), "android-other");
assert.equal(detectPlatform(UA.ipadDesktopUa, 5), "ios-safari");
assert.equal(detectPlatform(UA.ipadDesktopUa, 0), "desktop");
assert.equal(detectPlatform(UA.desktop), "desktop");
assert.equal(externalOpenUrl("https://newbornkr.online/tracker/app?x=1"), "intent://newbornkr.online/tracker/app?x=1#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fnewbornkr.online%2Ftracker%2Fapp%3Fx%3D1;end");
// merged "app + notifications" button
const st = (o) => ({ platform: "chrome", standalone: false, installed: false, canPrompt: false, pushOn: false, joined: true, ...o });
assert.equal(appPushMode(st({ canPrompt: true })), "install");
assert.equal(appPushAction(st({ canPrompt: true })), "prompt");
assert.equal(appPushAction(st({ canPrompt: true, joined: false })), "prompt", "install still works without a family code");
assert.equal(appPushMode(st({ canPrompt: true, installed: true })), "push");
assert.equal(appPushAction(st({ canPrompt: true, installed: true })), "subscribe");
assert.equal(appPushMode(st({})), "push", "Chrome without an install window: just notifications");
assert.equal(appPushAction(st({ joined: false })), "need-family");
for (const platform of ["ios-safari", "ios-other", "inapp-ios"]) {
  assert.equal(appPushMode(st({ platform })), "install");
  assert.equal(appPushAction(st({ platform })), "ios-hint");
  assert.equal(appPushMode(st({ platform, standalone: true })), "push");
  assert.equal(appPushAction(st({ platform, standalone: true })), "subscribe");
  assert.equal(appPushAction(st({ platform, standalone: true, joined: false })), "need-family");
}
assert.equal(appPushAction(st({ platform: "inapp-android" })), "open-chrome");
assert.equal(appPushMode(st({ platform: "desktop" })), "push");
assert.equal(appPushAction(st({ platform: "desktop" })), "subscribe");
assert.equal(appPushMode(st({ standalone: true, canPrompt: true })), "push");
assert.equal(appPushMode(st({ pushOn: true, platform: "ios-safari" })), "on");
assert.equal(appPushAction(st({ pushOn: true })), "off");
console.log("app-install tests passed");
