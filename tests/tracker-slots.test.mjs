import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const H = T.HOUR, D = new Date(2026, 10, 5).getTime(), now = D + 10.5 * H; // 10:30 today
const E = [
  { id: "a", type: "feed", t: D + 1 * H, kind: "formula", ml: 100 },           // today 1am
  { id: "a2", type: "feed", t: D + 4 * H, kind: "formula", ml: 80 },            // today 4am
  { id: "a3", type: "feed", t: D + 7 * H, kind: "formula", ml: 120 },           // today 7am
  { id: "b", type: "feed", t: D - T.DAY + 1.5 * H, kind: "formula", ml: 80 },   // yesterday 1:30
  { id: "c", type: "feed", t: D - T.DAY + 7 * H, kind: "formula" },             // yesterday 7am no ml
  { id: "g", type: "feed", t: D - 3 * T.DAY + 2 * H, kind: "formula", ml: 120 },// 3 days ago
  { id: "g2", type: "feed", t: D - 3 * T.DAY + 5 * H, kind: "formula", ml: 60 },
  { id: "d", type: "feed", t: D - 2 * T.DAY + 22 * H, kind: "breast", min: 10 },
  { id: "e", type: "feed", t: D - 9 * T.DAY, kind: "formula", ml: 999 },
  { id: "f", type: "feed", t: D + 21 * H, kind: "formula", ml: 50 },            // future tonight
];
const r = T.todayVsAverage(E, now);
assert.equal(r.hasAvg, true); assert.equal(r.days, 2);
assert.equal(r.today.ml, 300); assert.equal(r.today.feeds, 3); // 100+80+120; slots after 10:30 are future
assert.ok(r.today.cum[0].slotMl === 100 && r.today.cum[1].slotMl === 80 && r.today.cum[2].slotMl === 120);
assert.equal(r.today.cum[2].ml, 300);
assert.ok(r.today.cum[3].future === false); // 9-12 has started (now 10:30)
assert.ok(r.today.cum[4].future === true);  // 12-15 not yet
assert.equal(r.today.cum[4].ml, null);
// avg: yesterday (80 + 0ml feed) + 3 days ago (120+60) / 2 days
assert.equal(r.avg.cum[0].slotMl, 100); // (80+120)/2
assert.equal(r.avg.cum[1].slotMl, 30);  // (0+60)/2
assert.equal(r.avg.cum[2].slotFeeds, 0.5); // one no-ml feed on one of two days
assert.equal(r.avg.cum[0].ml, 100);
assert.equal(r.avg.cum[1].ml, 130);
assert.ok(r.avg.cum.every((c) => !c.future));
// no prior data → hasAvg false
const only = T.todayVsAverage([E[0]], now);
assert.equal(only.hasAvg, false); assert.equal(only.days, 0); assert.equal(only.today.ml, 100);
assert.ok(only.avg.cum.every((c) => c.ml == null));
assert.equal(T.slotAverages(E, now).days, 2);
assert.equal(T.cumulativeAverages(E, now).cum[7].ml, T.slotAverages(E, now).ml);
console.log("tracker-slots + todayVsAverage: ok");
