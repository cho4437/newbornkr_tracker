// TZ=Asia/Seoul node --test tests/tracker-predict.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
import { babyForecast, forecastConfidence, forecastMedian } from "../src/lib/tracker-forecast.js";

const NOW = new Date(2026, 10, 9, 15, 30, 0).getTime(); // 2026-11-09 15:30
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const at = (h, m = 0, dayOff = 0) => new Date(2026, 10, 9 + dayOff, h, m, 0).getTime();

function feedsEvery(intervalMin, lastAt, daysBack = 7, mlFor) {
  const out = [];
  let t = lastAt, i = 0;
  const start = NOW - daysBack * DAY;
  while (t >= start) {
    const ml = typeof mlFor === "function" ? mlFor(t, i) : (mlFor ?? 110);
    out.push({ id: "f" + i, type: "feed", t, kind: "formula", ml });
    t -= intervalMin * MIN;
    i++;
  }
  return out;
}

test("median and confidence helpers", () => {
  assert.equal(forecastMedian([]), null);
  assert.equal(forecastMedian([10]), 10);
  assert.equal(forecastMedian([1, 3, 2]), 2);
  assert.equal(forecastMedian([2, 4]), 3);
  assert.equal(forecastConfidence(0), "none");
  assert.equal(forecastConfidence(1), "low");
  assert.equal(forecastConfidence(3), "medium");
  assert.equal(forecastConfidence(8), "high");
});

test("empty log: no data, no invented predictions", () => {
  const f = babyForecast([], NOW);
  assert.equal(f.hasData, false);
  assert.equal(f.nextHour.feed.kind, "none");
  assert.equal(f.nextHour.sleep.kind, "none");
  assert.equal(f.nextHour.diaper.kind, "none");
  assert.equal(f.status.feed, null);
});

test("single feed: status only, next feed waits for more records", () => {
  const E = [{ id: "a", type: "feed", t: NOW - 60 * MIN, kind: "formula", ml: 100 }];
  const f = babyForecast(E, NOW);
  assert.equal(f.hasData, true);
  assert.equal(f.status.feed.agoMs, 60 * MIN);
  assert.equal(f.status.feed.entry.ml, 100);
  assert.equal(f.nextHour.feed.kind, "none");
  assert.equal(f.nextHour.feed.reason, "no_gaps");
  assert.equal(f.status.interval.trend, null);
});

test("regular 2h50m feeds: next feed in ~20 min with slot ml", () => {
  const last = at(13, 0); // 2h30m before 15:30
  const E = feedsEvery(170, last, 7, (t) => {
    const h = new Date(t).getHours();
    return h >= 15 && h < 18 ? 120 : 100;
  });
  const f = babyForecast(E, NOW);
  assert.equal(f.nextHour.feed.kind, "soon");
  assert.equal(f.nextHour.feed.at, last + 170 * MIN); // 15:50
  assert.equal(f.nextHour.feed.at - NOW, 20 * MIN);
  assert.equal(f.nextHour.feed.ml, 120); // 15–18 slot average
  assert.equal(f.nextHour.feed.amountSource, "slot");
  assert.equal(f.nextHour.feed.basisGapMs, 170 * MIN);
  assert.equal(f.nextHour.feed.confidence, "high");
  assert.ok(f.nextHour.feed.n >= 8);
  assert.equal(f.status.feed.agoMs, 150 * MIN);
});

test("overdue feed when last gap already exceeded the average", () => {
  const last = NOW - 200 * MIN;
  const E = feedsEvery(170, last, 7, 110);
  const f = babyForecast(E, NOW);
  assert.equal(f.nextHour.feed.kind, "overdue");
  assert.equal(f.nextHour.feed.lateMs, 30 * MIN);
  assert.equal(f.nextHour.feed.inHour, true);
  assert.equal(f.nextHour.feed.ml, 110);
});

test("feed later than one hour is marked later, not soon", () => {
  const last = NOW - 30 * MIN;
  const E = feedsEvery(170, last, 7, 110);
  const f = babyForecast(E, NOW);
  assert.equal(f.nextHour.feed.kind, "later");
  assert.equal(f.nextHour.feed.at, last + 170 * MIN);
  assert.equal(f.nextHour.feed.inHour, false);
});

test("double-tap feeds (2 min apart) do not create a 2-minute interval", () => {
  const E = [
    { id: "a", type: "feed", t: NOW - 180 * MIN, kind: "formula", ml: 100 },
    { id: "b", type: "feed", t: NOW - 178 * MIN, kind: "formula", ml: 100 },
    { id: "c", type: "feed", t: NOW - 10 * MIN, kind: "formula", ml: 100 },
  ];
  const f = babyForecast(E, NOW);
  // only one valid gap (~170 min between a and c; b-a is 2 min and dropped)
  assert.equal(f.nextHour.feed.n, 1);
  assert.equal(f.nextHour.feed.confidence, "low");
  assert.ok(Math.abs(f.nextHour.feed.basisGapMs - 170 * MIN) < 2 * MIN);
});

test("sleeping now: wake predicted from recent nap lengths", () => {
  const naps = [];
  for (let d = -6; d <= -1; d++) {
    naps.push({ id: "n" + d, type: "sleep", t: at(10, 0, d), end: at(10, 50, d) });
  }
  naps.push({ id: "now", type: "sleep", t: NOW - 30 * MIN, end: null });
  const f = babyForecast(naps, NOW);
  assert.equal(f.status.sleep.sleeping, true);
  assert.equal(f.status.sleep.forMs, 30 * MIN);
  assert.equal(f.nextHour.sleep.kind, "soon");
  assert.equal(f.nextHour.sleep.sleeping, true);
  assert.equal(f.nextHour.sleep.basisMs, 50 * MIN);
  assert.equal(f.nextHour.sleep.at, NOW + 20 * MIN);
  assert.equal(f.nextHour.sleep.pool, "nap");
  assert.equal(f.nextHour.sleep.confidence, "medium");
});

test("sleeping longer than usual: wake marked overdue", () => {
  const naps = [];
  for (let d = -6; d <= -1; d++) naps.push({ id: "n" + d, type: "sleep", t: at(10, 0, d), end: at(10, 50, d) });
  naps.push({ id: "now", type: "sleep", t: NOW - 70 * MIN, end: null });
  const f = babyForecast(naps, NOW);
  assert.equal(f.nextHour.sleep.kind, "overdue");
  assert.equal(f.nextHour.sleep.lateMs, 20 * MIN);
});

test("awake now: next sleep from typical awake stretches", () => {
  const E = [];
  for (let d = -5; d <= -1; d++) {
    E.push({ id: "s" + d, type: "sleep", t: at(9, 0, d), end: at(9, 50, d) });
    E.push({ id: "s2" + d, type: "sleep", t: at(11, 0, d), end: at(11, 40, d) }); // 70 min awake between 9:50 and 11:00
  }
  E.push({ id: "last", type: "sleep", t: NOW - 90 * MIN, end: NOW - 40 * MIN }); // woke 40 min ago
  const f = babyForecast(E, NOW);
  assert.equal(f.status.sleep.sleeping, false);
  assert.equal(f.status.sleep.forMs, 40 * MIN);
  assert.equal(f.nextHour.sleep.kind, "soon");
  assert.equal(f.nextHour.sleep.sleeping, false);
  assert.equal(f.nextHour.sleep.basisMs, 70 * MIN);
  assert.equal(f.nextHour.sleep.at, NOW + 30 * MIN);
});

test("diaper every ~2h10m: change due in about 30 min", () => {
  const E = [];
  let t = NOW - 100 * MIN, i = 0;
  while (t >= NOW - 7 * DAY) {
    E.push({ id: "d" + i, type: "diaper", t, d: i % 5 === 0 ? "poop" : "pee" });
    t -= 130 * MIN;
    i++;
  }
  const f = babyForecast(E, NOW);
  assert.equal(f.nextHour.diaper.kind, "soon");
  assert.equal(f.nextHour.diaper.basisGapMs, 130 * MIN);
  assert.equal(f.nextHour.diaper.at - NOW, 30 * MIN);
  assert.equal(f.nextHour.diaper.confidence, "high");
});

test("today vs 7-day same-slot intake comparison", () => {
  const E = [];
  // prior days: 100@1, 80@4, 120@7, 90@10 each day
  for (let d = -5; d <= -1; d++) {
    [[1, 100], [4, 80], [7, 120], [10, 90]].forEach(([h, ml], i) => {
      E.push({ id: `p${d}-${i}`, type: "feed", t: at(h, 0, d), kind: "formula", ml });
    });
  }
  // today (15:30): same first three + extra 110 at 13:00
  ;[[1, 100], [4, 80], [7, 120], [10, 110], [13, 100]].forEach(([h, ml], i) => {
    E.push({ id: "t" + i, type: "feed", t: at(h), kind: "formula", ml });
  });
  const f = babyForecast(E, NOW);
  const tva = T.todayVsAverage(E, NOW);
  assert.equal(f.status.intake.hasAvg, true);
  assert.equal(f.status.intake.todayMl, tva.today.ml);
  assert.equal(f.status.intake.todayMl, 510);
  // avgByNow = last completed 3h boundary (15:00) = 100+80+120+90 = 390
  assert.equal(f.status.intake.avgByNowMl, 390);
  assert.equal(f.status.intake.diffMl, 120);
  assert.equal(f.status.intake.vs, "more");
});

test("interval trend: recent gaps shorter than the 7-day median", () => {
  // older gaps 170 min, last three gaps 120 min
  const times = [];
  let t = NOW - 40 * MIN;
  for (let i = 0; i < 3; i++) { times.push(t); t -= 120 * MIN; }
  times.push(t); // the start of the first short gap
  t -= 170 * MIN;
  while (t >= NOW - 7 * DAY) { times.push(t); t -= 170 * MIN; }
  const E = times.map((x, i) => ({ id: "g" + i, type: "feed", t: x, kind: "formula", ml: 100 }));
  const f = babyForecast(E, NOW);
  assert.equal(f.status.interval.trend, "shorter");
  assert.equal(f.status.interval.recentMs, 120 * MIN);
  assert.equal(f.status.interval.weekMs, 170 * MIN);
});

test("breast-only log estimates minutes, not ml", () => {
  const last = at(13, 0);
  const E = [];
  let t = last, i = 0;
  while (t >= NOW - 7 * DAY) {
    E.push({ id: "b" + i, type: "feed", t, kind: "breast", min: 15 });
    t -= 170 * MIN;
    i++;
  }
  const f = babyForecast(E, NOW);
  assert.equal(f.nextHour.feed.kind, "soon");
  assert.equal(f.nextHour.feed.ml, null);
  assert.equal(f.nextHour.feed.min, 15);
  assert.equal(f.status.intake.hasAvg, false); // todayVsAverage ignores breast
});

test("sleeping with no completed sleeps: no invented wake time", () => {
  const f = babyForecast([{ id: "s", type: "sleep", t: NOW - 20 * MIN, end: null }], NOW);
  assert.equal(f.hasData, true);
  assert.equal(f.status.sleep.sleeping, true);
  assert.equal(f.nextHour.sleep.kind, "none");
  assert.equal(f.nextHour.sleep.reason, "no_sleeps");
});

// ---------- blending: last 24h + 7-day pattern ----------
/** Feeds every `oldMin` until 24h ago, then every `recentMin` for the last day; last feed at `lastAt`. */
function twoPhase(oldMin, recentMin, lastAt, ml = 110, recentMl = ml) {
  const out = []; let t = lastAt, i = 0;
  while (t > NOW - 24 * HOUR) { out.push({ id: "r" + i++, type: "feed", t, kind: "formula", ml: recentMl }); t -= recentMin * MIN; }
  while (t >= NOW - 7 * DAY) { out.push({ id: "o" + i++, type: "feed", t, kind: "formula", ml }); t -= oldMin * MIN; }
  return out;
}

test("blend: today faster than usual pulls the next feed earlier", () => {
  const last = NOW - 60 * MIN;
  const E = twoPhase(160, 130, last);
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.blend.mode, "blend");
  assert.equal(f.blend.recentMs, 130 * MIN);
  assert.equal(f.blend.usualMs, 160 * MIN);
  assert.equal(f.blend.nRecent, 4);
  assert.equal(f.blend.trend, "shorter");
  assert.ok(f.basisGapMs > 130 * MIN && f.basisGapMs < 160 * MIN, "between recent and usual");
  assert.equal(f.basisGapMs, 140 * MIN); // 4/6 * 130 + 2/6 * 160
  assert.equal(f.at, last + 140 * MIN);
});

test("blend: today slower than usual pushes the next feed later", () => {
  const last = NOW - 60 * MIN;
  const E = twoPhase(150, 210, last);
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.blend.mode, "blend");
  assert.equal(f.blend.trend, "longer");
  assert.ok(f.basisGapMs > 150 * MIN && f.basisGapMs < 210 * MIN);
  assert.equal(f.blend.recentMs, 210 * MIN);
  assert.equal(f.basisGapMs, 190 * MIN); // 4/6*210 + 2/6*150
  // recent and usual disagree by 40% → confidence lowered from high
  assert.equal(f.confidence, "medium");
});

test("blend: no data in the last 24h falls back to the 7-day pattern", () => {
  const last = NOW - 26 * HOUR;
  const E = [];
  for (let t = last, i = 0; t >= NOW - 7 * DAY; t -= 170 * MIN, i++) E.push({ id: "h" + i, type: "feed", t, kind: "formula", ml: 110 });
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.blend.mode, "history");
  assert.equal(f.blend.nRecent, 0);
  assert.equal(f.basisGapMs, 170 * MIN);
  assert.equal(f.kind, "overdue");
  assert.equal(f.confidence, "medium"); // capped: one source only
});

test("blend: only today's data (new user) predicts from the last 24h", () => {
  const E = [0, 140, 280, 410].map((m, i) => ({ id: "n" + i, type: "feed", t: NOW - 30 * MIN - m * MIN, kind: "formula", ml: 90 }));
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.blend.mode, "recent");
  assert.equal(f.blend.nHist, 0);
  assert.equal(f.basisGapMs, 140 * MIN); // median of 140,140,130
  assert.equal(f.confidence, "medium");
  assert.equal(f.appetite, null); // nothing older to compare amounts with
  assert.equal(f.ml, 90);
});

test("blend: agreement + plenty of data keeps high confidence", () => {
  const E = twoPhase(170, 170, NOW - 60 * MIN);
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.blend.trend, "same");
  assert.equal(f.confidence, "high");
  assert.equal(f.basisGapMs, 170 * MIN);
});

test("blend: time-of-day aware usual interval (same clock window)", () => {
  // older days: gaps starting around 13–15h are 120 min, all other gaps 180 min
  const E = []; let i = 0;
  for (let d = -6; d <= -2; d++) {
    for (const [h, m] of [[1, 0], [4, 0], [7, 0], [10, 0], [13, 0], [15, 0], [17, 0], [20, 0], [23, 0]]) E.push({ id: "c" + i++, type: "feed", t: at(h, m, d), kind: "formula", ml: 100 });
  }
  E.push({ id: "last", type: "feed", t: at(14, 0), kind: "formula", ml: 100 });
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.blend.mode, "history");
  assert.equal(f.blend.usualSource, "clock");
  assert.equal(f.basisGapMs, 120 * MIN);
});

test("current state: a much smaller last feed brings the next one sooner", () => {
  const last = NOW - 60 * MIN;
  const E = twoPhase(170, 170, last, 110);
  E[0].ml = 50; // last feed only 50 ml vs usual 110
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.lastFeed.size, "small");
  assert.equal(f.lastFeed.usualMl, 110);
  assert.equal(f.basisGapMs, 153 * MIN); // 170 * 0.9
});

test("recent appetite: drinking more lately raises the predicted amount", () => {
  const E = twoPhase(170, 170, NOW - 60 * MIN, 100, 130);
  const f = babyForecast(E, NOW).nextHour.feed;
  assert.equal(f.appetite.trend, "more");
  assert.equal(f.usualMl, 100);
  assert.ok(f.ml > 100 && f.ml <= 130, "between usual and recent: " + f.ml);
  assert.equal(f.ml, 120); // 1 + 4/6 * 0.3
});

test("sleep blend: recent naps longer than usual move the wake time later", () => {
  const E = [];
  for (let d = -6; d <= -2; d++) E.push({ id: "o" + d, type: "sleep", t: at(10, 0, d), end: at(10, 40, d) });
  E.push({ id: "r1", type: "sleep", t: at(18, 0, -1), end: at(19, 20, -1) });
  E.push({ id: "r2", type: "sleep", t: at(10, 0), end: at(11, 20) });
  E.push({ id: "now", type: "sleep", t: NOW - 30 * MIN, end: null });
  const s = babyForecast(E, NOW).nextHour.sleep;
  assert.equal(s.pool, "nap");
  assert.equal(s.blend.mode, "blend");
  assert.equal(s.blend.trend, "longer");
  assert.equal(s.basisMs, 60 * MIN); // 2/4*80 + 2/4*40
});
