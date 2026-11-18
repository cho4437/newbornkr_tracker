// URL commands (/tracker?say=...) used by Bixby routines. TZ=Asia/Seoul node tests/tracker-say.test.mjs
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const NOW = new Date(2026, 9, 31, 7, 6, 0).getTime();
const strip = (c) => c && Object.fromEntries(Object.entries(c).filter(([k]) => k !== "t"));
const cases = [
  ["분유 100", { action: "feed", kind: "formula", ml: 100 }], ["분유100", { action: "feed", kind: "formula", ml: 100 }], ["분유 100ml", { action: "feed", kind: "formula", ml: 100 }],
  ["분유 백", { action: "feed", kind: "formula", ml: 100 }], ["분유 백이십", { action: "feed", kind: "formula", ml: 120 }], ["맘마 120", { action: "feed", kind: "formula", ml: 120 }],
  ["쭈쭈 100", { action: "feed", kind: "breast", ml: 100 }], ["쭈쭈 10분", { action: "feed", kind: "breast", min: 10 }], ["모유 15분", { action: "feed", kind: "breast", min: 15 }],
  ["응가", { action: "diaper", d: "poop" }], ["쉬야", { action: "diaper", d: "pee" }], ["쉬", { action: "diaper", d: "pee" }], ["잠들었어", { action: "sleep_start" }], ["깼어", { action: "sleep_end" }],
];
for (const [s, want] of cases) assert.deepEqual(strip(T.parseCommand(s, NOW)), want, s);
assert.equal(T.parseCommand("쫑쫑 100", NOW), null, "unknown word -> never a guess");
assert.equal(T.parseCommand("100", NOW), null);
// every fixed Bixby command parses (both languages)
for (const [, phrase] of T.BIXBY_COMMANDS.ko) { const c = T.parseCommands(phrase, NOW, "ko"); assert.equal(c.length, 1, phrase); assert.equal(T.needsDetail(c[0]), false, phrase); }
for (const [, phrase] of T.BIXBY_COMMANDS.en) { const c = T.parseCommands(phrase, NOW, "en"); assert.equal(c.length, 1, phrase); assert.equal(T.needsDetail(c[0]), false, phrase); }
// cleanSay / sayKey / isRecentSay
assert.equal(T.cleanSay("  분유\n 100  "), "분유 100"); assert.equal(T.cleanSay(null), ""); assert.equal(T.cleanSay("x".repeat(200)).length, 80);
assert.equal(T.sayKey("분유 100"), T.sayKey("분유100")); assert.equal(T.sayKey("Formula 100!"), "formula100"); assert.notEqual(T.sayKey("분유 100"), T.sayKey("분유 120"));
const last = { k: T.sayKey("분유 100"), at: NOW - 30000 };
assert.equal(T.isRecentSay(last, "분유 100", NOW), true); assert.equal(T.isRecentSay(last, "분유100", NOW), true); assert.equal(T.isRecentSay(last, "분유 120", NOW), false);
assert.equal(T.isRecentSay({ ...last, at: NOW - 60000 }, "분유 100", NOW), false); assert.equal(T.isRecentSay({ ...last, at: NOW + 5000 }, "분유 100", NOW), false); assert.equal(T.isRecentSay(null, "분유 100", NOW), false);
// labels
assert.equal(T.sayLabel(T.parseCommand("분유 100", NOW)), "분유 100ml"); assert.equal(T.sayLabel(T.parseCommand("응가", NOW)), "기저귀 대변");
assert.equal(T.sayLabel(T.parseCommand("잠들었어", NOW)), "잠듦"); assert.equal(T.sayLabel(T.parseCommand("깼어", NOW)), "깸"); assert.equal(T.sayLabel(T.parseCommand("1시간 잤어", NOW)), "수면 1시간");
assert.equal(T.sayLabelEn(T.parseCommandEn("formula 100", NOW)), "formula 100 ml"); assert.equal(T.sayLabelEn(T.parseCommandEn("wet diaper", NOW)), "diaper (wet)"); assert.equal(T.sayLabel(null), "");
// urls
assert.equal(T.sayUrl("https://newbornkr.online", "분유 100"), "https://newbornkr.online/tracker?say=%EB%B6%84%EC%9C%A0%20100");
assert.equal(T.sayUrl("https://newbornkr.online", "formula 100", "en"), "https://newbornkr.online/en/tracker?say=formula%20100");
assert.equal(T.voiceUrl("https://x"), "https://x/tracker?shortcut=voice"); assert.equal(T.voiceUrl("https://x", "en"), "https://x/en/tracker?shortcut=voice");
assert.ok(!/join|code|fam/i.test(T.sayUrl("https://x", "분유 100")), "URL carries only the action");
// per-record undo keeps what others added meanwhile
{
  const a = { id: "a", type: "feed", t: 1, kind: "formula", ml: 100 }, mine = { id: "m", type: "diaper", t: 2, d: "pee" }, theirs = { id: "z", type: "feed", t: 3, kind: "formula", ml: 80 };
  const after = [theirs, mine, a];
  assert.deepEqual(T.revertChanges(after, [{ id: "m", prev: null }]).map((e) => e.id), ["z", "a"], "undo add keeps a family member's new record");
  const open = { id: "s", type: "sleep", t: 5, end: null }, ended = { ...open, end: 9 };
  assert.deepEqual(T.revertChanges([ended, theirs], [{ id: "s", prev: open }]).find((e) => e.id === "s").end, null, "undo sleep_end restores the running sleep");
  assert.deepEqual(T.revertChanges([theirs], [{ id: "m", prev: mine }]).map((e) => e.id).sort(), ["m", "z"], "undo delete re-inserts");
}
// applyCommand: same path as manual entries
{ const r = T.applyCommand([], T.parseCommand("분유 100", NOW)); assert.equal(r.entries.length, 1); assert.equal(r.entry.ml, 100); assert.equal(r.entry.t, NOW); }
console.log("say/url command tests passed");
