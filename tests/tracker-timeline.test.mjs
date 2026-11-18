import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const D = new Date(2026, 10, 1).getTime(), H = T.HOUR;
const E = [
  { id: "s0", type: "sleep", t: D - 2 * H, end: D + 5 * H },
  { id: "f1", type: "feed", t: D + 5.5 * H, kind: "formula", ml: 120 },
  { id: "f2", type: "feed", t: D + 8.5 * H, kind: "formula" },
  { id: "f3", type: "feed", t: D + 11.5 * H, kind: "breast", min: 12 },
  { id: "s1", type: "sleep", t: D + 13 * H, end: D + 14.5 * H },
  { id: "s2", type: "sleep", t: D + 21 * H, end: D + 26 * H },
];
const c = T.timelineDay(E, D, D + 30 * H);
assert.equal(c.sleeps.length, 3);
assert.ok(c.sleeps[0].fromPrev && c.sleeps[0].h0 === 0 && Math.abs(c.sleeps[0].h1 - 5) < 1e-9 && c.sleeps[0].ms === 7 * H);
assert.ok(c.sleeps[2].toNext && Math.abs(c.sleeps[2].h1 - 24) < 1e-9);
assert.equal(c.feeds[0].ml, 120); assert.equal(c.feeds[1].ml, null); assert.equal(c.noMl, 1);
assert.equal(c.stats.ml, 120); assert.equal(c.stats.feeds, 3);
assert.equal(c.stats.sleepMs, 5 * H + 1.5 * H + 3 * H);
assert.equal(c.stats.longestSleepMs, 7 * H);
const live = T.timelineDay([{ id: "a", type: "sleep", t: D + 20 * H }], D, D + 22 * H);
assert.ok(live.sleeps[0].live && Math.abs(live.sleeps[0].h1 - 22) < 1e-9 && live.nowH === 22);
const next = T.timelineDay(E, D + T.DAY, D + 30 * H);
assert.ok(next.sleeps[0].fromPrev && Math.abs(next.sleeps[0].h1 - 2) < 1e-9);
console.log("tracker-timeline: all assertions passed");
