// Brazilian Portuguese voice/text parsing (Portuguese -> the English parser) and pt labels.
import test from "node:test";
import assert from "node:assert/strict";
import { parseCommands, sayLabelPt, ptToEn, fmtClockPt } from "../src/lib/tracker-core.js";

const now = new Date("2026-11-12T10:00:00+09:00").getTime();
const one = (s) => { const c = parseCommands(s, now, "pt"); assert.equal(c.length, 1, `${s} -> ${JSON.stringify(c)}`); return c[0]; };

test("pt: feeds", () => {
  assert.deepEqual([one("fórmula 120").kind, one("fórmula 120").ml], ["formula", 120]);
  assert.equal(one("mamadeira de 90 ml").ml, 90);
  assert.equal(one("cento e vinte de fórmula").ml, 120);
  const b = one("peito 15 minutos"); assert.equal(b.kind, "breast"); assert.equal(b.min, 15);
  assert.equal(one("leite materno 60").ml, 60);
});
test("pt: sleep and diapers", () => {
  assert.equal(one("dormiu").action, "sleep_start");
  assert.equal(one("acordou").action, "sleep_end");
  const ago = one("dormiu há 20 minutos"); assert.equal(ago.action, "sleep_start"); assert.equal(ago.t, now - 20 * 60000);
  assert.equal(one("fralda xixi").action, "diaper");
  assert.equal(one("xixi e cocô").action, "diaper");
});
test("pt: times and several things in one sentence", () => {
  assert.equal(one("tomou 100 ml às 8h").t, new Date("2026-11-12T08:00:00+09:00").getTime());
  const two = parseCommands("fórmula 120 e dormiu", now, "pt");
  assert.deepEqual(two.map((c) => c.action), ["feed", "sleep_start"]);
  assert.match(ptToEn("meia hora"), /30 minutes/);
});
test("pt: labels", () => {
  assert.equal(sayLabelPt(one("fórmula 120")), "fórmula 120 ml");
  assert.equal(sayLabelPt(one("fralda cocô")), "fralda (cocô)");
  assert.equal(parseCommands("bom dia", now, "pt").length, 0);
});
