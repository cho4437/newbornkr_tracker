// Client-side status analysis + next-hour outlook for /tracker.
// Uses only the family's own logged feeds, sleeps and diapers (no external API).
import { MIN, HOUR, DAY, lastInfo, daySummary, startOfDay, todayVsAverage, cleanMl } from "./tracker-core.js";

export const FORECAST_LOOKBACK_DAYS = 7;
export const FORECAST_WINDOW_MS = HOUR;
const FEED_GAP_MIN = 20 * MIN, FEED_GAP_MAX = 8 * HOUR;
const DIAPER_GAP_MIN = 20 * MIN, DIAPER_GAP_MAX = 10 * HOUR;
const SLEEP_MIN = 15 * MIN, SLEEP_MAX = 8 * HOUR;
const AWAKE_MIN = 20 * MIN, AWAKE_MAX = 8 * HOUR;
const INTAKE_SIMILAR_ML = 25;

export function forecastMedian(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function forecastConfidence(n) {
  if (!n || n < 1) return "none";
  if (n >= 8) return "high";
  if (n >= 3) return "medium";
  return "low";
}

function isNightHour(ms) {
  const h = new Date(ms).getHours();
  return h >= 20 || h < 8;
}
function slotOf(ms) { return Math.min(7, Math.floor(new Date(ms).getHours() / 3)); }

/** Events closer than minMs (top-up feed, double tap, quick re-change) are one session, timed from its start. */
export function sessionStarts(times, minMs) {
  const s = [...times].filter((t) => Number.isFinite(t)).sort((a, b) => a - b);
  const out = [];
  for (const t of s) if (!out.length || t - out[out.length - 1] >= minMs) out.push(t);
  return out;
}
function gapsFromTimes(times, minMs, maxMs) {
  const s = sessionStarts(times, minMs);
  const gaps = [];
  for (let i = 1; i < s.length; i++) {
    const g = s[i] - s[i - 1];
    if (g <= maxMs) gaps.push(g);
  }
  return gaps;
}

function windowOf(entries, now, days = FORECAST_LOOKBACK_DAYS) {
  const from = now - days * DAY;
  return { from, list: entries.filter((e) => e && e.t <= now && (e.type === "sleep" ? (e.end || now) >= from : e.t >= from)) };
}

function classifyWhen(at, now) {
  if (at == null) return "none";
  const dt = at - now;
  if (dt < 0) return "overdue";
  if (dt <= FORECAST_WINDOW_MS) return "soon";
  return "later";
}

// ---------- blending: recent (last 24h) signal + 7-day pattern ----------
export const RECENT_MS = 24 * HOUR;      // "current" data = the last 24 hours
export const RECENT_MAX = 4;             // at most the latest 4 recent samples
export const CLOCK_WINDOW_H = 2;         // same time of day = within ±2h on the clock
const BLEND_K = 2;                       // recent weight = nRecent / (nRecent + K) → 1:33%, 2:50%, 3:60%, 4:67%
const TREND_FAST = 0.88, TREND_SLOW = 1.12; // recent/usual ratio thresholds for "shorter"/"longer"
const DISAGREE = 0.2;                    // |recent/usual − 1| above this lowers confidence

const hourOf = (ms) => { const d = new Date(ms); return d.getHours() + d.getMinutes() / 60; };
function clockDist(a, b) { const d = Math.abs(hourOf(a) - hourOf(b)) % 24; return Math.min(d, 24 - d); }
const CONF_ORDER = ["none", "low", "medium", "high"];
const downgrade = (c) => CONF_ORDER[Math.max(1, CONF_ORDER.indexOf(c) - 1)];
const capConf = (c, max) => CONF_ORDER[Math.min(CONF_ORDER.indexOf(c), CONF_ORDER.indexOf(max))];

/**
 * samples: [{ v, t, end }] — v = value (ms or ml), t = when the sample started (for time-of-day),
 * end = when it finished (decides recent vs history). anchor = time-of-day the prediction starts from.
 * Returns the blended value plus everything the UI needs to explain it.
 */
export function blendSamples(samples, now, anchor) {
  const recentFrom = now - RECENT_MS;
  const recentAll = samples.filter((s) => s.end > recentFrom).sort((a, b) => a.end - b.end);
  const recent = recentAll.slice(-RECENT_MAX);
  const hist = samples.filter((s) => s.end <= recentFrom);
  const recentV = recent.length ? forecastMedian(recent.map((s) => s.v)) : null;
  let histPool = hist, histSource = "all";
  if (anchor != null) {
    const near = hist.filter((s) => clockDist(s.t, anchor) <= CLOCK_WINDOW_H);
    if (near.length >= 3) { histPool = near; histSource = "clock"; }
  }
  const histV = histPool.length ? forecastMedian(histPool.map((s) => s.v)) : null;
  const nR = recent.length, nH = histPool.length;
  let w, value, mode;
  if (nR && nH) { w = nR / (nR + BLEND_K); value = w * recentV + (1 - w) * histV; mode = "blend"; }
  else if (nR) { w = 1; value = recentV; mode = "recent"; }
  else if (nH) { w = 0; value = histV; mode = "history"; }
  else return { mode: "none", value: null, n: 0, nRecent: 0, nHist: 0, confidence: "none", trend: null };
  const ratio = nR && nH && histV ? recentV / histV : null;
  const trend = ratio == null ? null : ratio < TREND_FAST ? "shorter" : ratio > TREND_SLOW ? "longer" : "same";
  let confidence = forecastConfidence(nR + nH);
  if (mode !== "blend") confidence = capConf(confidence, "medium");     // one source only
  if (ratio != null && Math.abs(ratio - 1) > DISAGREE) confidence = downgrade(confidence); // recent and usual disagree
  return { mode, value, w, recentV, histV, histSource, nRecent: nR, nHist: nH, n: nR + nH, ratio, trend, confidence };
}

function gapSamples(times, minMs, maxMs) {
  const s = sessionStarts(times, minMs);
  const out = [];
  for (let i = 1; i < s.length; i++) {
    const g = s[i] - s[i - 1];
    if (g <= maxMs) out.push({ v: g, t: s[i - 1], end: s[i] });
  }
  return out;
}
const blendInfo = (b) => ({ mode: b.mode, w: b.w, recentMs: b.recentV, usualMs: b.histV, usualSource: b.histSource, nRecent: b.nRecent, nHist: b.nHist, trend: b.trend, ratio: b.ratio });

/** Historical (older than 24h) median ml for the 3h slot of `t`, falling back to all older feeds. */
function histSlotMl(feedsWithMl, t, recentFrom) {
  const older = feedsWithMl.filter((e) => e.t <= recentFrom);
  const slot = older.filter((e) => slotOf(e.t) === slotOf(t)).map((e) => e.ml);
  if (slot.length >= 2) return forecastMedian(slot);
  return older.length ? forecastMedian(older.map((e) => e.ml)) : null;
}

function typicalFeedAmount(entries, at, now, from) {
  const slot = slotOf(at);
  const feeds = entries.filter((e) => e.type === "feed" && e.t >= from && e.t <= now);
  const inSlot = (e) => slotOf(e.t) === slot;
  const mls = (list) => list.map((e) => cleanMl(e.ml)).filter((x) => x != null);
  const slotMls = mls(feeds.filter(inSlot));
  let base = null;
  if (slotMls.length >= 2) base = { ml: forecastMedian(slotMls), n: slotMls.length, source: "slot", slot };
  else {
    const allMls = mls(feeds);
    if (allMls.length >= 1) base = { ml: forecastMedian(allMls), n: allMls.length, source: "overall", slot };
  }
  if (base) {
    // Recent appetite: how the latest feeds compared with what was usual for their own time of day.
    const recentFrom = now - RECENT_MS;
    const withMl = feeds.map((e) => ({ t: e.t, ml: cleanMl(e.ml) })).filter((e) => e.ml != null);
    const recent = withMl.filter((e) => e.t > recentFrom).slice(-RECENT_MAX);
    const ratios = recent.map((e) => { const u = histSlotMl(withMl, e.t, recentFrom); return u ? e.ml / u : null; }).filter((x) => x != null);
    let factor = 1, appetite = null, w = 0;
    if (ratios.length) {
      const r = forecastMedian(ratios);
      w = ratios.length / (ratios.length + BLEND_K);
      factor = Math.min(1.5, Math.max(0.6, 1 + w * (r - 1)));
      appetite = { ratio: r, n: ratios.length, w, trend: r < 0.9 ? "less" : r > 1.1 ? "more" : "same" };
      if (base.source === "overall" && !withMl.some((e) => e.t <= recentFrom)) { factor = 1; appetite = null; } // nothing older to compare with
    }
    return { ml: Math.round(base.ml * factor), usualMl: Math.round(base.ml), n: base.n, source: base.source, slot, appetite };
  }
  const minsOf = (list) => list.filter((e) => e.kind === "breast" && Number(e.min) > 0).map((e) => Number(e.min));
  const slotMins = minsOf(feeds.filter(inSlot));
  if (slotMins.length >= 2) return { min: Math.round(forecastMedian(slotMins)), n: slotMins.length, source: "slot", slot };
  const allMins = minsOf(feeds);
  if (allMins.length >= 1) return { min: Math.round(forecastMedian(allMins)), n: allMins.length, source: "overall", slot };
  return null;
}

function feedPrediction(entries, now, from) {
  const feedEntries = entries.filter((e) => e.type === "feed" && e.t >= from && e.t <= now).sort((a, b) => a.t - b.t);
  const times = feedEntries.map((e) => e.t);
  const starts = sessionStarts(times, FEED_GAP_MIN);
  const last = starts.length ? starts[starts.length - 1] : null;
  if (last == null) return { kind: "none", reason: "no_last", n: 0, confidence: "none" };
  const samples = gapSamples(times, FEED_GAP_MIN, FEED_GAP_MAX);
  if (!samples.length) return { kind: "none", reason: "no_gaps", n: 0, confidence: "none", last };
  const b = blendSamples(samples, now, last);
  let gapMs = b.value;
  // Current state: a last feed much smaller / bigger than usual for that time of day → next one a bit sooner / later.
  let lastFeed = null;
  const session = feedEntries.filter((e) => e.t >= last);
  const sessionMl = session.reduce((a, e) => a + (cleanMl(e.ml) || 0), 0);
  if (sessionMl > 0) {
    const withMl = feedEntries.map((e) => ({ t: e.t, ml: cleanMl(e.ml) })).filter((e) => e.ml != null && e.t < last);
    const slot = withMl.filter((e) => slotOf(e.t) === slotOf(last)).map((e) => e.ml);
    const usual = slot.length >= 2 ? forecastMedian(slot) : withMl.length >= 3 ? forecastMedian(withMl.map((e) => e.ml)) : null;
    if (usual) {
      const r = sessionMl / usual;
      if (r < 0.75) { gapMs *= 0.9; lastFeed = { size: "small", ml: sessionMl, usualMl: Math.round(usual) }; }
      else if (r > 1.25) { gapMs *= 1.1; lastFeed = { size: "big", ml: sessionMl, usualMl: Math.round(usual) }; }
    }
  }
  gapMs = Math.round(gapMs / MIN) * MIN;
  const at = last + gapMs;
  const amt = typicalFeedAmount(entries, at, now, from);
  const kind = classifyWhen(at, now);
  return {
    kind, at, last, lateMs: kind === "overdue" ? now - at : null, inHour: kind === "soon" || kind === "overdue",
    ml: amt && amt.ml != null ? amt.ml : null, min: amt && amt.min != null ? amt.min : null,
    usualMl: amt && amt.usualMl != null ? amt.usualMl : null, appetite: amt ? amt.appetite || null : null,
    amountSource: amt ? amt.source : null, slot: amt ? amt.slot : slotOf(at),
    basisGapMs: gapMs, blend: blendInfo(b), lastFeed, n: b.n, confidence: b.confidence,
  };
}

function sleepPrediction(entries, now, from, li) {
  const completed = entries.filter((e) => e.type === "sleep" && e.end != null && e.end <= now && e.end >= from && e.t <= now);
  const naps = [], nights = [], all = [];
  for (const e of completed) {
    const ms = e.end - e.t;
    if (ms < SLEEP_MIN || ms > SLEEP_MAX) continue;
    const s = { v: ms, t: e.t, end: e.end };
    all.push(s);
    (isNightHour(e.t) ? nights : naps).push(s);
  }
  const sleeps = entries.filter((e) => e.type === "sleep" && e.t <= now).sort((a, b) => a.t - b.t);
  const awakes = [];
  for (let i = 0; i < sleeps.length - 1; i++) {
    const end = sleeps[i].end;
    if (end == null || end > now || end < from) continue;
    const g = sleeps[i + 1].t - end;
    if (g >= AWAKE_MIN && g <= AWAKE_MAX) awakes.push({ v: g, t: end, end: sleeps[i + 1].t });
  }

  if (li.sleeping && li.sleep) {
    const started = li.sleep.t;
    const preferNight = isNightHour(started) || (now - started >= 2.5 * HOUR);
    let pool = preferNight ? nights : naps, poolName = preferNight ? "night" : "nap";
    if (pool.length < 2) { pool = all; poolName = "all"; }
    if (!pool.length) return { kind: "none", reason: "no_sleeps", n: 0, confidence: "none", sleeping: true };
    const b = blendSamples(pool, now, started);
    const basisMs = Math.round(b.value / MIN) * MIN;
    const at = started + basisMs;
    const kind = classifyWhen(at, now);
    return {
      kind, at, sleeping: true, lateMs: kind === "overdue" ? now - at : null, inHour: kind === "soon" || kind === "overdue",
      basisMs, pool: poolName, blend: blendInfo(b), n: b.n, confidence: b.confidence,
    };
  }

  if (li.sleep && li.sleep.end && awakes.length) {
    const b = blendSamples(awakes, now, li.sleep.end);
    const basisMs = Math.round(b.value / MIN) * MIN;
    const at = li.sleep.end + basisMs;
    const kind = classifyWhen(at, now);
    return {
      kind, at, sleeping: false, lateMs: kind === "overdue" ? now - at : null, inHour: kind === "soon" || kind === "overdue",
      basisMs, pool: "awake", awakeForMs: now - li.sleep.end, blend: blendInfo(b), n: b.n, confidence: b.confidence,
    };
  }
  return { kind: "none", reason: li.sleeping ? "no_sleeps" : "no_awakes", n: 0, confidence: "none", sleeping: !!li.sleeping };
}

function diaperPrediction(entries, now, from) {
  const times = entries.filter((e) => e.type === "diaper" && e.t >= from && e.t <= now).map((e) => e.t).sort((a, b) => a - b);
  const starts = sessionStarts(times, DIAPER_GAP_MIN);
  const last = starts.length ? starts[starts.length - 1] : null;
  if (last == null) return { kind: "none", reason: "no_last", n: 0, confidence: "none" };
  const samples = gapSamples(times, DIAPER_GAP_MIN, DIAPER_GAP_MAX);
  if (!samples.length) return { kind: "none", reason: "no_gaps", n: 0, confidence: "none", last };
  const b = blendSamples(samples, now, last);
  const basisGapMs = Math.round(b.value / MIN) * MIN;
  const at = last + basisGapMs;
  const kind = classifyWhen(at, now);
  return {
    kind, at, last, lateMs: kind === "overdue" ? now - at : null, inHour: kind === "soon" || kind === "overdue",
    basisGapMs, blend: blendInfo(b), n: b.n, confidence: b.confidence,
  };
}

function intakeStatus(entries, now) {
  const today = startOfDay(now);
  const s = daySummary(entries, today, now);
  const tva = todayVsAverage(entries, now, FORECAST_LOOKBACK_DAYS);
  let avgByNowMl = null, avgByNowFeeds = null;
  if (tva.hasAvg) {
    const done = tva.avg.cum.filter((c) => c.until <= tva.today.nowH);
    avgByNowMl = done.length ? done[done.length - 1].ml : 0;
    avgByNowFeeds = done.length ? done[done.length - 1].feeds : 0;
  }
  const todayMl = tva.today.ml;
  const diffMl = avgByNowMl != null ? todayMl - avgByNowMl : null;
  let vs = null;
  if (diffMl != null && avgByNowMl >= 50) {
    vs = Math.abs(diffMl) < INTAKE_SIMILAR_ML ? "same" : (diffMl > 0 ? "more" : "less");
  }
  return {
    todayMl, todayFeeds: s.feeds, todayFormulaFeeds: tva.today.feeds, todayBreastMin: s.breastMin,
    hasAvg: tva.hasAvg, days: tva.days,
    avgByNowMl, avgByNowFeeds, avgDayMl: tva.hasAvg ? tva.avg.ml : null, avgDayFeeds: tva.hasAvg ? tva.avg.feeds : null,
    diffMl, vs,
  };
}

function intervalStatus(entries, now, from) {
  const times = entries.filter((e) => e.type === "feed" && e.t >= from && e.t <= now).map((e) => e.t).sort((a, b) => a - b);
  const gaps = gapsFromTimes(times, FEED_GAP_MIN, FEED_GAP_MAX);
  if (gaps.length < 2) return { n: gaps.length, weekMs: gaps.length ? forecastMedian(gaps) : null, recentMs: null, trend: null };
  const recent = gaps.slice(-Math.min(3, gaps.length));
  const weekMs = forecastMedian(gaps);
  const recentMs = forecastMedian(recent);
  const ratio = recentMs / weekMs;
  const trend = ratio < 0.85 ? "shorter" : ratio > 1.15 ? "longer" : "same";
  return { n: gaps.length, weekMs, recentMs, trend };
}

/**
 * Status + next-hour outlook from the family's own log.
 * All times are epoch ms. Copy is left to the UI (ko/en).
 */
export function babyForecast(entries, now = Date.now()) {
  const list = Array.isArray(entries) ? entries : [];
  const past = list.filter((e) => e && e.t <= now && (e.type === "feed" || e.type === "sleep" || e.type === "diaper"));
  if (!past.length) {
    return {
      hasData: false,
      status: { feed: null, sleep: null, diaper: null, intake: intakeStatus(list, now), interval: { n: 0, weekMs: null, recentMs: null, trend: null } },
      nextHour: { feed: { kind: "none", reason: "no_data", n: 0, confidence: "none" }, sleep: { kind: "none", reason: "no_data", n: 0, confidence: "none" }, diaper: { kind: "none", reason: "no_data", n: 0, confidence: "none" } },
    };
  }
  const { from } = windowOf(list, now);
  const li = lastInfo(list, now);
  const status = {
    feed: li.feed ? { agoMs: li.feedAgo, entry: li.feed } : null,
    sleep: li.sleep ? { sleeping: li.sleeping, forMs: li.sleeping ? li.sleepFor : li.awakeFor, entry: li.sleep } : null,
    diaper: li.diaper ? { agoMs: li.diaperAgo, entry: li.diaper } : null,
    intake: intakeStatus(list, now),
    interval: intervalStatus(list, now, from),
  };
  return {
    hasData: true,
    status,
    nextHour: {
      feed: feedPrediction(list, now, from),
      sleep: sleepPrediction(list, now, from, li),
      diaper: diaperPrediction(list, now, from),
    },
  };
}
