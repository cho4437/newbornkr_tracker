// TZ=Asia/Seoul node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const NOW = new Date(2026, 9, 29, 14, 0, 0).getTime(); // 2026-10-29 14:00 local
const at = (h, m = 0, dayOff = 0) => new Date(2026, 9, 29 + dayOff, h, m, 0).getTime();
const P = (s) => T.parseCommand(s, NOW);
const MIN = 60000;

const cases = [
  // feeds
  ["분유 120 먹었어", { action: "feed", kind: "formula", ml: 120, t: NOW }],
  ["분유 120ml", { action: "feed", kind: "formula", ml: 120 }],
  ["분유 120미리 먹었어요", { action: "feed", kind: "formula", ml: 120 }],
  ["분유 백이십 미리", { action: "feed", kind: "formula", ml: 120 }],
  ["분유 백이십", { action: "feed", kind: "formula", ml: 120 }],
  ["분유 90 cc", { action: "feed", kind: "formula", ml: 90 }],
  ["젖병으로 150 먹였어", { action: "feed", kind: "formula", ml: 150 }],
  ["120 먹었어", { action: "feed", kind: "formula", ml: 120 }],
  ["모유 15분", { action: "feed", kind: "breast", min: 15 }],
  ["모유 십오분 먹였어", { action: "feed", kind: "breast", min: 15 }],
  ["직수 20분", { action: "feed", kind: "breast", min: 20 }],
  ["왼쪽 10분 오른쪽 5분 수유", { action: "feed", kind: "breast", min: 15 }],
  ["유축한 모유 80ml 먹였어", { action: "feed", kind: "breast", ml: 80 }],
  ["모유 먹였어", { action: "feed", kind: "breast" }],
  ["10분 전에 분유 90", { action: "feed", kind: "formula", ml: 90, t: NOW - 10 * MIN }],
  ["삼십분 전에 분유 백오십", { action: "feed", kind: "formula", ml: 150, t: NOW - 30 * MIN }],
  ["1시간 전에 분유 100 먹었어", { action: "feed", kind: "formula", ml: 100, t: NOW - 60 * MIN }],
  ["한 시간 반 전에 모유 10분", { action: "feed", kind: "breast", min: 10, t: NOW - 90 * MIN }],
  ["두시간 전 분유 120", { action: "feed", kind: "formula", ml: 120, t: NOW - 120 * MIN }],
  ["오후 1시 30분에 분유 120", { action: "feed", kind: "formula", ml: 120, t: at(13, 30) }],
  ["1시 반에 분유 100", { action: "feed", kind: "formula", ml: 100, t: at(13, 30) }],
  ["오전 9시에 분유 80", { action: "feed", kind: "formula", ml: 80, t: at(9) }],
  ["밤 11시에 분유 160", { action: "feed", kind: "formula", ml: 160, t: at(23, 0, -1) }],
  ["새벽 3시에 모유 20분", { action: "feed", kind: "breast", min: 20, t: at(3) }],
  ["맘마 먹었어", { action: "feed", kind: "formula" }],
  // sleep
  ["잠들었어", { action: "sleep_start", t: NOW }],
  ["재웠어", { action: "sleep_start" }],
  ["방금 잠들었어요", { action: "sleep_start", t: NOW }],
  ["20분 전에 잠들었어", { action: "sleep_start", t: NOW - 20 * MIN }],
  ["낮잠 시작", { action: "sleep_start" }],
  ["낮잠", { action: "sleep_start" }],
  ["깼어", { action: "sleep_end", t: NOW }],
  ["일어났어", { action: "sleep_end" }],
  ["아기 깼어요", { action: "sleep_end" }],
  ["5분 전에 깼어", { action: "sleep_end", t: NOW - 5 * MIN }],
  ["잠에서 깼어", { action: "sleep_end" }],
  ["2시간 잤어", { action: "sleep", t: NOW - 120 * MIN, end: NOW }],
  ["한시간 반 잤어", { action: "sleep", t: NOW - 90 * MIN, end: NOW }],
  ["40분 낮잠 잤어", { action: "sleep", t: NOW - 40 * MIN, end: NOW }],
  // diapers
  ["소변", { action: "diaper", d: "pee", t: NOW }],
  ["쉬했어", { action: "diaper", d: "pee" }],
  ["쉬 했어요", { action: "diaper", d: "pee" }],
  ["쉬야 했어", { action: "diaper", d: "pee" }],
  ["오줌 쌌어", { action: "diaper", d: "pee" }],
  ["대변", { action: "diaper", d: "poop" }],
  ["응가했어", { action: "diaper", d: "poop" }],
  ["응가 했어요", { action: "diaper", d: "poop" }],
  ["똥 쌌어", { action: "diaper", d: "poop" }],
  ["기저귀 둘 다", { action: "diaper", d: "both" }],
  ["기저귀 둘다", { action: "diaper", d: "both" }],
  ["대소변 다 했어", { action: "diaper", d: "both" }],
  ["응가랑 쉬 했어", { action: "diaper", d: "both" }],
  ["기저귀 갈았어", { action: "diaper", d: "pee" }],
  ["10분 전에 응가했어", { action: "diaper", d: "poop", t: NOW - 10 * MIN }],
];
for (const [phrase, exp] of cases) test(`parse: ${phrase}`, () => {
  const r = P(phrase); assert.ok(r, "parsed");
  for (const [k, v] of Object.entries(exp)) assert.equal(r[k], v, `${k} for "${phrase}" got ${JSON.stringify(r)}`);
  if (r.action === "feed" && !("ml" in exp)) assert.equal(r.ml, undefined, JSON.stringify(r));
  if (r.action === "feed" && !("min" in exp)) assert.equal(r.min, undefined, JSON.stringify(r));
});
for (const junk of ["", "   ", "안녕하세요", "오늘 날씨 어때", "이거 뭐야"]) test(`unparsed: "${junk}"`, () => assert.equal(P(junk), null));

test("sinoToNum", () => {
  assert.equal(T.sinoToNum("백이십"), 120); assert.equal(T.sinoToNum("구십"), 90); assert.equal(T.sinoToNum("십오"), 15);
  assert.equal(T.sinoToNum("이백"), 200); assert.equal(T.sinoToNum("삼십"), 30);
});

test("applyCommand sleep start/end and guards", () => {
  let { entries, entry } = T.applyCommand([], P("30분 전에 잠들었어"));
  assert.equal(entries.length, 1); assert.equal(entry.end, null);
  assert.ok(T.applyCommand(entries, P("잠들었어")).note); // already sleeping
  const r = T.applyCommand(entries, P("깼어")); assert.equal(r.entries[0].end, NOW); assert.equal(r.entries.length, 1);
  assert.ok(T.applyCommand([], P("깼어")).note); // nothing open
});

test("daySummary / history / lastInfo", () => {
  const E = [
    { id: "a", type: "feed", t: at(8), kind: "formula", ml: 120 },
    { id: "b", type: "feed", t: at(11), kind: "breast", min: 15 },
    { id: "c", type: "feed", t: at(12), kind: "formula", ml: 90 },
    { id: "d", type: "diaper", t: at(9), d: "pee" },
    { id: "e", type: "diaper", t: at(12, 30), d: "both" },
    { id: "f", type: "sleep", t: at(22, 0, -1), end: at(2) }, // crosses midnight: 2h today
    { id: "g", type: "sleep", t: at(13), end: null },           // running: 1h so far
    { id: "h", type: "feed", t: at(10, 0, -1), kind: "formula", ml: 100 },
  ];
  const s = T.daySummary(E, T.startOfDay(NOW), NOW);
  assert.deepEqual([s.ml, s.feeds, s.formula, s.breast, s.pee, s.poop, s.diapers], [210, 3, 2, 1, 2, 1, 2]);
  assert.equal(s.sleepMs, 3 * 3600000);
  const h = T.history(E, 7, NOW);
  assert.equal(h.length, 7); assert.equal(h[1].ml, 100); assert.equal(h[1].sleepMs, 2 * 3600000);
  const li = T.lastInfo(E, NOW);
  assert.equal(li.feedAgo, 2 * 3600000); assert.equal(li.diaperAgo, 90 * MIN); assert.equal(li.sleeping, true); assert.equal(li.sleepFor, 3600000);
  assert.equal(T.dayEntries(E, T.startOfDay(NOW), NOW).length, 7);
});

test("export / import roundtrip, merge and validation", () => {
  const E = [{ id: "a", type: "feed", t: at(8), kind: "formula", ml: 120 }, { id: "b", type: "diaper", t: at(9), d: "poop" }];
  const json = T.exportJson(E);
  const r = T.importJson(json, [E[0]]); assert.equal(r.added, 1); assert.equal(r.entries.length, 2);
  const bad = T.importJson(JSON.stringify({ entries: [{ type: "diaper", t: 1, d: "x" }, { type: "feed", t: "x" }, { type: "sleep", t: 100, end: 50 }] }));
  assert.equal(bad.entries.length, 0);
  assert.throws(() => T.importJson("not json")); assert.throws(() => T.importJson('{"a":1}'));
});

test("formatting", () => {
  assert.equal(T.fmtDur(90 * MIN), "1시간 30분"); assert.equal(T.fmtDur(20 * MIN), "20분"); assert.equal(T.fmtDur(10), "방금");
  assert.equal(T.fmtClock(at(13, 5)), "오후 1:05"); assert.equal(T.fmtClock(at(0, 0)), "오전 12:00");
  assert.match(T.describeCommand(P("분유 120 먹었어"), NOW), /분유 120ml · 지금/);
});
