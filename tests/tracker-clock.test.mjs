import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const D = new Date(2026, 10, 1).getTime(), H = T.HOUR;
const E = [
  { id: "s0", type: "sleep", t: D - 2 * H, end: D + 5 * H },          // crosses midnight: 7h total, 5h in day
  { id: "f1", type: "feed", t: D + 5.5 * H, kind: "formula", ml: 120 },
  { id: "f2", type: "feed", t: D + 8.5 * H, kind: "breast", min: 15 },
  { id: "f3", type: "feed", t: D + 11.5 * H, kind: "formula", ml: 90.5 },
  { id: "d1", type: "diaper", t: D + 6 * H, d: "pee" },
  { id: "d2", type: "diaper", t: D + 9 * H, d: "both" },
  { id: "s1", type: "sleep", t: D + 13 * H, end: D + 14.5 * H },
  { id: "s2", type: "sleep", t: D + 22 * H, end: null },               // running
  { id: "x", type: "feed", t: D - 3 * H, kind: "formula", ml: 60 },     // previous day
];
const now = D + 23 * H;
const c = T.clockDay(E, D, now);
assert.equal(c.feeds.length, 3); assert.equal(c.diapers.length, 2); assert.equal(c.sleeps.length, 3);
assert.equal(c.sleeps[0].a, 0); assert.ok(Math.abs(c.sleeps[0].b - 5 / 24) < 1e-9);
assert.ok(c.sleeps.find((s) => s.live) && Math.abs(c.sleeps.find((s) => s.live).b - 23 / 24) < 1e-9, "running sleep ends at now");
assert.equal(c.stats.ml, 210.5); assert.equal(c.stats.feeds, 3);
assert.equal(c.stats.avgFeedGapMs, 3 * H);
assert.equal(c.stats.longestSleepMs, 7 * H);
assert.equal(c.stats.sleepMs, 5 * H + 1.5 * H + 1 * H);
assert.equal(c.stats.pee, 2); assert.equal(c.stats.poop, 1);
assert.equal(c.isToday, true); assert.ok(Math.abs(c.nowFrac - 23 / 24) < 1e-9);
assert.equal(T.clockDay(E, D, D + 30 * H).isToday, false);
const w = T.clockWeek(E, D, 7, now);
assert.equal(w.days.length, 7); assert.equal(w.days[0].partial, true); assert.equal(w.from, T.addDays(D, -6)); assert.equal(w.to, D);
assert.equal(w.daysWithData, 2, "today (in progress) and yesterday both have data and both count");
const frac0 = T.dayWeight(D, now); assert.ok(Math.abs(frac0 - 23 / 24) < 1e-9);
assert.ok(Math.abs(w.avg.ml - (60 + 210.5) / (1 + frac0)) < 1e-9, "today's totals enter with elapsed-fraction weight");
assert.equal(T.clockWeek(E, D, 7, D + 30 * H).daysWithData, 2, "once the day is over both full days still count");
assert.equal(T.clockDay([], D, now).stats.avgFeedGapMs, null);
// ---- 7일 window = last 7 days ending today; today is drawn and weighted by elapsed fraction ----
{
  const today = new Date(2026, 10, 13).getTime(), now = today + 14 * H + 46 * T.MIN; // Fri 11/13 14:46
  const end = T.weekEndDay(today, now);
  assert.equal(end, today, "viewing today -> window ends today 11/13");
  assert.equal(T.weekEndDay(new Date(2026, 10, 9).getTime(), now), new Date(2026, 10, 9).getTime(), "past day stays");
  const frac = T.dayWeight(today, now); assert.ok(Math.abs(frac - (14 * H + 46 * T.MIN) / T.DAY) < 1e-9);
  // synthetic: every full day 8 feeds x 100ml, one 4h sleep; today only 2 feeds so far
  const E2 = [];
  for (let i = 1; i <= 10; i++) { const d = T.addDays(today, -i);
    for (let k = 0; k < 8; k++) E2.push({ id: `f${i}-${k}`, type: "feed", kind: "formula", ml: 100, t: d + (1 + k * 3) * H });
    E2.push({ id: `s${i}`, type: "sleep", t: d + 13 * H, end: d + 17 * H }); }
  E2.push({ id: "t1", type: "feed", kind: "formula", ml: 100, t: today + 1 * H }, { id: "t2", type: "feed", kind: "formula", ml: 100, t: today + 4 * H });
  const w2 = T.clockWeek(E2, end, 7, now);
  assert.equal(w2.from, new Date(2026, 10, 7).getTime()); assert.equal(w2.to, today);
  assert.equal(w2.days.length, 7); assert.equal(w2.days[0].dayStart, w2.to, "outer ring = today");
  assert.equal(w2.days[0].partial, true);
  assert.equal(w2.daysWithData, 7); // 6 full days + today
  const expMl = (6 * 800 + 200) / (6 + frac), expFeeds = (6 * 8 + 2) / (6 + frac);
  assert.ok(Math.abs(w2.avg.ml - expMl) < 1e-9, "today weighted by elapsed fraction, not treated as a whole day");
  assert.ok(Math.abs(w2.avg.feeds - expFeeds) < 1e-9);
  // 6 full days of 4h sleep + today 0, divided by 6+frac (today has feeds so it is in the used set)
  assert.ok(Math.abs(w2.avg.sleepMs - (6 * 4 * H) / (6 + frac)) < 1e-9);
  assert.equal(w2.avg.longestSleepMs, 4 * H);
  assert.equal(w2.avg.avgFeedGapMs, 3 * H, "gaps across midnight count, all weighted equally (today's 3h gap included)");
  // a past 7-day window (ending yesterday) is 7 full days, average 800
  const past = T.clockWeek(E2, T.addDays(today, -1), 7, now);
  assert.equal(past.daysWithData, 7); assert.equal(past.avg.ml, 800); assert.equal(past.days.some((d) => d.partial), false);
  // ---- compare ----
  const a = T.compareItem(E2, T.addDays(today, -1), 1, now), b = T.compareItem(E2, today, 1, now);
  assert.equal(a.s.ml, 800); assert.equal(b.s.ml, 200); assert.equal(b.partial, true); assert.equal(a.partial, false);
  const df = T.compareDiff(a, b); assert.equal(df.ml, -600); assert.equal(df.feeds, -6); assert.equal(df.sleepMs, -4 * H);
  const r = T.compareItem(E2, T.addDays(today, -7), 7, now); assert.equal(r.len, 7); assert.equal(r.to, T.addDays(today, -1)); assert.equal(r.s.ml, 800);
  // 7-day range that includes today: same fractional average as clockWeek
  const rToday = T.compareItem(E2, T.addDays(today, -6), 7, now);
  assert.equal(rToday.to, today); assert.ok(Math.abs(rToday.s.ml - expMl) < 1e-9, "compare 7일 including today uses elapsed-fraction weight");
  const empty = T.compareItem(E2, T.addDays(today, -30), 1, now); assert.equal(empty.daysWithData, 0); assert.equal(T.compareDiff(a, empty).ml, null);
  assert.equal(T.compareItem(E2, T.addDays(today, 2), 1, now).future, true);
}
console.log("tracker-clock tests passed");
// edit-time normalisation
{
  const now = D + 8 * H; // 08:00
  assert.deepEqual(T.fixEditTimes(D + 2 * H, D + 4 * H, now), { t: D + 2 * H, end: D + 4 * H, rolled: false });
  assert.deepEqual(T.fixEditTimes(D + 23 * H, null, now), { t: D - H, end: null, rolled: true }, "23:00 today (future) = last night");
  assert.deepEqual(T.fixEditTimes(D - H, D - 21 * H, now), { t: D - H, end: D + 3 * H, rolled: true }, "end 03:00 left on yesterday's date = next morning");
  assert.deepEqual(T.fixEditTimes(D + 23 * H, D + 6 * H, now), { t: D - H, end: D + 6 * H, rolled: true }, "both entered on today's date across midnight");
  assert.deepEqual(T.fixEditTimes(D + 2 * H, D + 2 * H + 30 * T.MIN - T.DAY + T.DAY, now).end, D + 2.5 * H);
  assert.equal(T.fixEditTimes(D + 5 * H, D + 10 * H, now).error, "end_future");
  assert.equal(T.fixEditTimes(D + 5 * H, D + 3 * H, now).error, "end_before_start", "end 2h before start same morning, next day would be future");
  assert.equal(T.fixEditTimes(D + 3 * T.DAY, null, now).error, "future");
  assert.deepEqual(T.keepMeta({ id: "a", updatedAt: 5, by: "엄마", dev: "x1", t: 1 }), { updatedAt: 5, by: "엄마", dev: "x1" });
  assert.deepEqual(T.keepMeta(null), {});
}
console.log("edit-time tests passed");
