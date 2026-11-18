// Feed amounts accept any positive number (incl. decimals) in the form, voice/typed parsing (KO + EN).
import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const ml = (v) => T.cleanEntry({ type: "feed", t: Date.now(), kind: "formula", ml: v })?.ml;
test("cleanEntry keeps odd amounts", () => {
  for (const [v, want] of [["95", 95], ["137", 137], ["12.5", 12.5], [0.5, 0.5], ["1200", 1200], ["12,5", 12.5], [33.333, 33.33]]) assert.equal(ml(v), want, String(v));
});
test("cleanEntry drops non-numbers / zero / negative / absurd", () => {
  for (const v of ["abc", "", "0", "-5", -1, "10000", undefined, null]) assert.equal(ml(v), undefined, String(v));
});
test("KO parsing", () => {
  assert.equal(T.parseCommand("분유 95ml").ml, 95);
  assert.equal(T.parseCommand("분유 12.5 미리").ml, 12.5);
  assert.equal(T.parseCommand("분유 700ml").ml, 700);
  assert.equal(T.parseCommand("분유 백삼십칠 미리").ml, 137);
});
test("EN parsing", () => {
  assert.equal(T.parseCommandEn("formula 95 ml").ml, 95);
  assert.equal(T.parseCommandEn("bottle 12.5ml").ml, 12.5);
  assert.equal(T.parseCommandEn("formula 700 ml").ml, 700);
});
test("fmtMl", () => { assert.equal(T.fmtMl(0.1 + 0.2), "0.3"); assert.equal(T.fmtMl(247.5), "247.5"); });
