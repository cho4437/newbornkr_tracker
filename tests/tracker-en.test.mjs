// TZ=Asia/Seoul node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const NOW = new Date(2026, 9, 29, 14, 0, 0).getTime();
const at = (h, m = 0, dayOff = 0) => new Date(2026, 9, 29 + dayOff, h, m, 0).getTime();
const MIN = 60000;
const P = (s) => T.parseCommandEn(s, NOW);
const cases = [
  ["formula 120 ml", { action: "feed", kind: "formula", ml: 120, t: NOW }],
  ["Formula 120ml", { action: "feed", kind: "formula", ml: 120 }],
  ["bottle 90 milliliters", { action: "feed", kind: "formula", ml: 90 }],
  ["she drank 150 mls of formula", { action: "feed", kind: "formula", ml: 150 }],
  ["fed 4 oz", { action: "feed", kind: "formula", ml: 120 }],
  ["drank 90", { action: "feed", kind: "formula", ml: 90 }],
  ["a hundred and twenty ml formula", { action: "feed", kind: "formula", ml: 120 }],
  ["formula one hundred fifty", { action: "feed", kind: "formula", ml: 150 }],
  ["breastfed 15 minutes", { action: "feed", kind: "breast", min: 15 }],
  ["breastfed for fifteen minutes", { action: "feed", kind: "breast", min: 15 }],
  ["nursed 20 mins", { action: "feed", kind: "breast", min: 20 }],
  ["nursed left side 10 minutes right side 5 minutes", { action: "feed", kind: "breast", min: 15 }],
  ["both sides 15 minutes", { action: "feed", kind: "breast", min: 15 }],
  ["pumped milk 80 ml", { action: "feed", kind: "breast", ml: 80 }],
  ["breast milk bottle 60 ml", { action: "feed", kind: "breast", ml: 60 }],
  ["10 minutes ago formula 90", { action: "feed", kind: "formula", ml: 90, t: NOW - 10 * MIN }],
  ["formula 100 ml an hour ago", { action: "feed", kind: "formula", ml: 100, t: NOW - 60 * MIN }],
  ["half an hour ago breastfed 10 minutes", { action: "feed", kind: "breast", min: 10, t: NOW - 30 * MIN }],
  ["2 hours ago bottle 120", { action: "feed", kind: "formula", ml: 120, t: NOW - 120 * MIN }],
  ["at 1:30 pm formula 120 ml", { action: "feed", kind: "formula", ml: 120, t: at(13, 30) }],
  ["at 9 am bottle 80 ml", { action: "feed", kind: "formula", ml: 80, t: at(9) }],
  ["at 11 pm formula 160 ml", { action: "feed", kind: "formula", ml: 160, t: at(23, 0, -1) }],
  ["fed the baby", { action: "feed", kind: "formula" }],
  ["baby fell asleep", { action: "sleep_start", t: NOW }],
  ["fell asleep 20 minutes ago", { action: "sleep_start", t: NOW - 20 * MIN }],
  ["she's asleep", { action: "sleep_start" }],
  ["put him down for a nap", { action: "sleep_start" }],
  ["nap", { action: "sleep_start" }],
  ["went to sleep", { action: "sleep_start" }],
  ["woke up", { action: "sleep_end", t: NOW }],
  ["baby woke up 5 minutes ago", { action: "sleep_end", t: NOW - 5 * MIN }],
  ["he is awake", { action: "sleep_end" }],
  ["up from nap", { action: "sleep_end" }],
  ["slept for 2 hours", { action: "sleep", t: NOW - 120 * MIN, end: NOW }],
  ["slept an hour and a half", { action: "sleep", t: NOW - 90 * MIN, end: NOW }],
  ["napped 40 minutes", { action: "sleep", t: NOW - 40 * MIN, end: NOW }],
  ["45 minute nap", { action: "sleep", t: NOW - 45 * MIN, end: NOW }],
  ["wet diaper", { action: "diaper", d: "pee", t: NOW }],
  ["pee", { action: "diaper", d: "pee" }],
  ["he peed", { action: "diaper", d: "pee" }],
  ["diaper change", { action: "diaper", d: "pee" }],
  ["poop", { action: "diaper", d: "poop" }],
  ["she pooped", { action: "diaper", d: "poop" }],
  ["dirty diaper", { action: "diaper", d: "poop" }],
  ["poopy diaper", { action: "diaper", d: "poop" }],
  ["both", { action: "diaper", d: "both" }],
  ["diaper both", { action: "diaper", d: "both" }],
  ["wet and dirty diaper", { action: "diaper", d: "both" }],
  ["pee and poop", { action: "diaper", d: "both" }],
  ["an hour ago she pooped", { action: "diaper", d: "poop", t: NOW - 60 * MIN }],
];
for (const [phrase, exp] of cases) test(`en parse: ${phrase}`, () => {
  const r = P(phrase); assert.ok(r, `parsed "${phrase}"`);
  for (const [k, v] of Object.entries(exp)) assert.equal(r[k], v, `${k} for "${phrase}" got ${JSON.stringify(r)}`);
  if (r.action === "feed" && !("ml" in exp)) assert.equal(r.ml, undefined, JSON.stringify(r));
  if (r.action === "feed" && !("min" in exp)) assert.equal(r.min, undefined, JSON.stringify(r));
});
for (const junk of ["", "  ", "hello there", "what's the weather", "thank you"]) test(`en unparsed: "${junk}"`, () => assert.equal(P(junk), null));

test("Korean parser unchanged by English additions", () => {
  assert.equal(T.parseCommand("formula 120 ml", NOW)?.action === "feed" ? "feed" : null, "feed"); // ml-only phrase is a feed in ko too
  assert.equal(T.parseCommand("분유 120 먹었어", NOW).ml, 120);
  assert.equal(T.parseCommand("hello there", NOW), null);
});
test("English formatting", () => {
  assert.equal(T.fmtDurEn(90 * MIN), "1h 30m"); assert.equal(T.fmtDurEn(20 * MIN), "20m"); assert.equal(T.fmtDurEn(10), "just now");
  assert.equal(T.fmtClockEn(at(13, 5)), "1:05 PM"); assert.equal(T.fmtClockEn(at(0, 0)), "12:00 AM");
  assert.equal(T.describeEn({ type: "feed", kind: "formula", ml: 120, t: NOW }), "Formula 120 ml");
  assert.equal(T.describeEn({ type: "diaper", d: "both", t: NOW }), "Diaper: wet + poop");
  assert.match(T.describeCommandEn(P("formula 120 ml"), NOW), /Formula 120 ml · now/);
});
test("applyCommand gives note codes", () => {
  assert.equal(T.applyCommand([], P("woke up")).code, "no_open_sleep");
  const { entries } = T.applyCommand([], P("fell asleep"));
  assert.equal(T.applyCommand(entries, P("fell asleep")).code, "already_sleeping");
  assert.throws(() => T.importJson("x"), (e) => e.code === "not_json");
});

test("English counts use singular for 1", async () => {
  const { STR } = await import("../src/lib/tracker-i18n.js");
  const L = STR.en;
  assert.equal(L.sumFeedsN(1), " feed"); assert.equal(L.sumFeedsN(0), " feeds"); assert.equal(L.sumFeedsN(3), " feeds");
  assert.equal(L.exported(1), "Exported 1 entry to a file"); assert.equal(L.exported(2), "Exported 2 entries to a file");
  assert.equal(L.imported(1), "Imported 1 entry"); assert.equal(L.imported(5), "Imported 5 entries");
  assert.ok(L.confirmClear(1).startsWith("Delete the 1 entry?")); assert.ok(L.confirmClear(4).startsWith("Delete all 4 entries?"));
});
