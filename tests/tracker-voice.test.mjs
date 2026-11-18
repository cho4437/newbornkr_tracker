// Voice phrase parser (shared by the mic button, typed box and the bixby-say URL commands). TZ=Asia/Seoul node tests/tracker-voice.test.mjs
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const NOW = new Date(2026, 9, 31, 14, 0, 0).getTime(); // Sat 14:00 local
const H = T.HOUR, M = T.MIN, at = (h, m = 0, dayOff = 0) => new Date(2026, 9, 31 + dayOff, h, m).getTime();
const strip = (c) => c && Object.fromEntries(Object.entries(c).filter(([k]) => k !== "t" && k !== "end"));
let n = 0;
const ko = (s, want, t) => { const c = T.parseCommand(s, NOW); assert.deepEqual(strip(c), want, s); if (t != null) assert.equal(c.t, t, s + " (time)"); n++; };
const en = (s, want, t) => { const c = T.parseCommandEn(s, NOW); assert.deepEqual(strip(c), want, s); if (t != null) assert.equal(c.t, t, s + " (time)"); n++; };
const F = (ml, kind = "formula") => ({ action: "feed", kind, ml }), B = (min, ml) => ({ action: "feed", kind: "breast", ...(ml ? { ml } : {}), min });
// --- Korean: feeds (digits + Korean number words) ---
ko("분유 120", F(120)); ko("분유120", F(120)); ko("분유 120ml", F(120)); ko("분유 120미리 먹였어", F(120)); ko("분유 120 먹었어요", F(120));
ko("분유 백", F(100)); ko("분유 백이십", F(120)); ko("분유 백이십 미리", F(120)); ko("분유 구십", F(90)); ko("분유 백오십 먹었어", F(150)); ko("분유 이백", F(200));
ko("분유 95.5", F(95.5)); ko("분유 137 먹었어", F(137));
ko("맘마 120", F(120)); ko("맘마 육십", F(60)); ko("젖병 80", F(80));
ko("모유 15분", B(15)); ko("모유 십오분", B(15)); ko("모유 이십 분", B(20)); ko("쭈쭈 10분", B(10)); ko("쭈쭈 100", { action: "feed", kind: "breast", ml: 100 });
ko("왼쪽 10분 오른쪽 5분", B(15)); ko("직수 20분", B(20)); ko("유축 모유 80", { action: "feed", kind: "breast", ml: 80 });
ko("분유", { action: "feed", kind: "formula" });
// --- Korean: sleep ---
ko("잠들었어", { action: "sleep_start" }); ko("아기 잠들었어요", { action: "sleep_start" }); ko("재웠어", { action: "sleep_start" }); ko("낮잠 시작", { action: "sleep_start" });
ko("깼어", { action: "sleep_end" }); ko("방금 깼어요", { action: "sleep_end" }); ko("일어났어", { action: "sleep_end" });
ko("두 시간 잤어", { action: "sleep" }); ko("1시간 반 잤어", { action: "sleep" }); ko("삼십분 잤어", { action: "sleep" });
// --- Korean: diapers ---
ko("기저귀 소변", { action: "diaper", d: "pee" }); ko("기저귀 대변", { action: "diaper", d: "poop" }); ko("기저귀 둘 다", { action: "diaper", d: "both" });
ko("소변", { action: "diaper", d: "pee" }); ko("대변", { action: "diaper", d: "poop" }); ko("쉬했어", { action: "diaper", d: "pee" }); ko("쉬야", { action: "diaper", d: "pee" });
ko("응가했어", { action: "diaper", d: "poop" }); ko("똥 쌌어", { action: "diaper", d: "poop" }); ko("대소변 다 봤어", { action: "diaper", d: "both" });
// --- Korean: times ---
ko("30분 전 분유 100", F(100), NOW - 30 * M); ko("삼십분 전에 분유 백", F(100), NOW - 30 * M); ko("10분 전에 모유 15분", B(15), NOW - 10 * M);
ko("한 시간 전에 잠들었어", { action: "sleep_start" }, NOW - H); ko("두 시간 전에 응가했어", { action: "diaper", d: "poop" }, NOW - 2 * H);
ko("새벽 3시에 잠들었어", { action: "sleep_start" }, at(3)); ko("오전 11시 반에 깼어", { action: "sleep_end" }, at(11, 30));
ko("밤 11시에 잠들었어", { action: "sleep_start" }, at(23, 0, -1)); ko("1시 20분에 분유 90", F(90), at(13, 20));
{ const c = T.parseCommand("두 시간 잤어", NOW); assert.equal(c.end - c.t, 2 * H); assert.equal(c.end, NOW); }
// --- Korean: not understood (never guess) ---
for (const s of ["네", "안녕하세요", "오늘 날씨 좋다", "쫑쫑 100", "100", ""]) { assert.equal(T.parseCommand(s, NOW), null, s); n++; }
// --- English ---
en("formula 120", F(120)); en("formula120", F(120)); en("formula 120 ml", F(120)); en("bottle 4 oz", F(120)); en("a hundred and twenty ml of formula", F(120));
en("formula one twenty", F(120)); en("one fifty five ml formula", F(155)); en("formula ninety", F(90)); en("fed 95.5 ml formula", F(95.5));
en("breastfed 15 minutes", B(15)); en("nursed for twenty minutes", B(20)); en("left side 10 minutes right side 5 minutes", B(15));
en("fell asleep", { action: "sleep_start" }); en("baby is sleeping", { action: "sleep_start" }); en("down for a nap", { action: "sleep_start" });
en("woke up", { action: "sleep_end" }); en("she's awake", { action: "sleep_end" });
en("slept for an hour and a half", { action: "sleep" }); en("napped 45 minutes", { action: "sleep" });
en("wet diaper", { action: "diaper", d: "pee" }); en("dirty diaper", { action: "diaper", d: "poop" }); en("poop and pee", { action: "diaper", d: "both" }); en("poop", { action: "diaper", d: "poop" });
en("30 minutes ago formula 100", F(100), NOW - 30 * M); en("fell asleep at 3 am", { action: "sleep_start" }, at(3)); en("fell asleep at two twenty", { action: "sleep_start" }, at(2, 20));
en("woke up at one fifteen pm", { action: "sleep_end" }, at(13, 15)); en("an hour ago poop", { action: "diaper", d: "poop" }, NOW - H);
for (const s of ["hello there", "what's the weather", "thank you"]) { assert.equal(T.parseCommandEn(s, NOW), null, s); n++; }
// --- several things in one sentence ---
const multi = (s, lang, want) => { assert.deepEqual(T.parseCommands(s, NOW, lang).map(strip), want, s); n++; };
multi("분유 90 먹고 잠들었어", "ko", [F(90), { action: "sleep_start" }]);
multi("분유 120, 기저귀 소변", "ko", [F(120), { action: "diaper", d: "pee" }]);
multi("쉬하고 응가했어", "ko", [{ action: "diaper", d: "both" }]);
multi("분유 120", "ko", [F(120)]);
multi("오늘 날씨 좋다", "ko", []);
multi("fed 120 then fell asleep", "en", [F(120), { action: "sleep_start" }]);
multi("poop and pee", "en", [{ action: "diaper", d: "both" }]);
{ const [c] = T.parseCommands("새벽 3시에 잠들었다가 5시에 깼어", NOW, "ko"); assert.deepEqual(c, { action: "sleep", t: at(3), end: at(5) }); n++; }
// --- helpers ---
assert.equal(T.needsDetail(T.parseCommand("분유", NOW)), true); assert.equal(T.needsDetail(T.parseCommand("분유 100", NOW)), false); assert.equal(T.needsDetail(T.parseCommand("응가", NOW)), false);
assert.equal(T.isLowConfidence(0.3), true); assert.equal(T.isLowConfidence(0.9), false); assert.equal(T.isLowConfidence(0), false, "0 = engine gave no confidence"); assert.equal(T.isLowConfidence(undefined), false);
assert.equal(T.phraseKey("분유 100!"), T.phraseKey("분유100"));
// applyCommand: same path as manual entries
{ const r = T.applyCommand([], T.parseCommand("분유 100", NOW)); assert.equal(r.entries.length, 1); assert.equal(r.entry.ml, 100); assert.equal(r.entry.t, NOW); }
console.log(`voice parser tests passed (${n} phrases)`);
