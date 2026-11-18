// 성장 캘린더 logic: pure date math on "YYYY-MM-DD" strings (no time zones involved), so it tests the same in Node and the browser.
import { BANDS, ITEMS, MILESTONES } from "./growth-data.js";

const DAY = 86400000;
export function parseYMD(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const t = Date.UTC(y, mo - 1, d), dt = new Date(t);
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d ? { y, m: mo, d } : null;
}
const pad = (n) => String(n).padStart(2, "0");
export const fmtYMD = ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`;
const toDays = (s) => { const p = parseYMD(s); return p ? Date.UTC(p.y, p.m - 1, p.d) / DAY : NaN; };
const fromDays = (n) => { const dt = new Date(n * DAY); return fmtYMD({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }); };
export const addDays = (s, n) => fromDays(toDays(s) + n);
export const diffDays = (a, b) => toDays(b) - toDays(a); // b - a
/** Calendar months; day clamped to the month's last day (1/31 + 1 month = 2/28 or 2/29). */
export function addMonths(s, n) {
  const p = parseYMD(s);
  const total = p.y * 12 + (p.m - 1) + n, y = Math.floor(total / 12), m = total % 12 + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return fmtYMD({ y, m, d: Math.min(p.d, last) });
}
/** Local "today" as YYYY-MM-DD. */
export function todayYMD(now = new Date()) { return fmtYMD({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }); }

/** Age on `date`: days since birth (birth = 0), Korean D+ count (birth = D+1), full months + leftover days. */
export function ageOn(birth, date) {
  const days = diffDays(birth, date);
  if (!Number.isFinite(days) || days < 0) return null;
  let months = 0;
  while (diffDays(addMonths(birth, months + 1), date) >= 0) months++;
  const rest = diffDays(addMonths(birth, months), date);
  return { days, dplus: days + 1, months, restDays: rest, years: Math.floor(months / 12) };
}

/** Band for an age in months (36+ → "after"). */
export function bandFor(months) {
  if (months == null || months < 0) return null;
  return BANDS.find((b) => months >= b.from && months < b.to) || { id: "after", from: 36, to: null };
}

/** Where a photo dated `date` sits: age + band ("before" for dates before birth). */
export function photoAge(birth, date) {
  if (!parseYMD(date)) return null;
  const a = ageOn(birth, date);
  if (!a) return { before: true, band: "before" };
  return { ...a, band: bandFor(a.months).id };
}
export function bandRange(birth, band) {
  return { start: addMonths(birth, band.from), end: band.to == null ? null : addDays(addMonths(birth, band.to), -1) };
}

function pointStart(birth, at) { return at.d != null ? addDays(birth, at.d) : addMonths(birth, at.m); }
/** Calendar window for a schedule item. Month ranges are inclusive of the last month ("12~15개월" = until the day before 16 months). */
export function itemWindow(birth, it) {
  const start = pointStart(birth, it.at);
  let end;
  if (it.until) end = it.until.d != null ? addDays(birth, it.until.d) : addDays(addMonths(birth, it.until.m + 1), -1);
  else if (it.kind === "vax" && it.at.m != null) end = addDays(addMonths(birth, it.at.m + 1), -1); // "N개월" = during that month
  else end = start;
  return { start, end };
}
export function statusOf(win, today) {
  if (diffDays(win.end, today) > 0) return "past";
  if (diffDays(win.start, today) >= 0) return "now";
  return "upcoming";
}

/** Every schedule item with dates + status, sorted by start date. */
export function scheduleFor(birth, today, items = ITEMS) {
  return items.map((it) => {
    const w = itemWindow(birth, it);
    const startAge = ageOn(birth, w.start);
    const band = bandFor(startAge ? startAge.months : 0);
    return { ...it, ...w, status: statusOf(w, today), daysUntil: diffDays(today, w.start), daysLeft: diffDays(today, w.end), band: band.id };
  }).sort((a, b) => diffDays(b.start, a.start) || (a.kind === "vax" ? -1 : 1));
}
/** Next things to do: open windows first, then upcoming ones; `limit` items. */
export function upcoming(schedule, limit = 6) {
  return schedule.filter((x) => x.status !== "past").sort((a, b) => (a.status === "now" ? 0 : 1) - (b.status === "now" ? 0 : 1) || a.daysUntil - b.daysUntil).slice(0, limit);
}

// ---------- birth-date picker helpers ----------
export const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
// selectable years: this year and the 3 before (plus an older saved year so a synced date still shows)
export function yearsFor(today, extra) {
  const y = parseYMD(today).y, ys = [y, y - 1, y - 2, y - 3];
  const e = extra && parseYMD(extra); if (e && !ys.includes(e.y) && e.y < y) ys.push(e.y);
  return ys;
}
// "생후 N일째(D+N) / N주 / N개월" -> birth date. D+1 is the birth day itself.
export function birthFromAge(today, n, unit) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n) || n < (unit === "dplus" ? 1 : 0)) return null;
  if (unit === "dplus") return n > 1500 ? null : addDays(today, -(n - 1));
  if (unit === "weeks") return n > 210 ? null : addDays(today, -7 * n);
  if (unit === "months") return n > 48 ? null : addMonths(today, -n);
  return null;
}
// earliest tracker record (feed/sleep/diaper) as a hint for the birth date; never saved automatically
export function earliestRecord(entries, today) {
  let min = Infinity;
  for (const e of entries || []) if (e && !e.deleted && Number.isFinite(e.t) && e.t > 0 && e.t < min) min = e.t;
  if (!Number.isFinite(min)) return null;
  const d = todayYMD(new Date(min));
  return diffDays(today, d) > 0 || diffDays(d, today) > 4 * 366 ? null : d;
}

// ---------- month grid calendar ----------
/** Days of a calendar month (Sun=0 … Sat=6). Pads with nulls so the grid is 7-wide. */
export function monthCells(y, m) {
  const first = new Date(Date.UTC(y, m - 1, 1));
  const startDow = first.getUTCDay(); // 0=Sun
  const n = daysInMonth(y, m);
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(fmtYMD({ y, m, d }));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** Special day tags for a YMD relative to birth (today / 백일 / 돌 / birth). */
export function dayTags(birth, date, today) {
  const tags = [];
  if (date === today) tags.push("today");
  if (birth && date === birth) tags.push("birth");
  if (birth) {
    const a = ageOn(birth, date);
    if (a && a.dplus === 100) tags.push("d100");
    if (a && a.months === 12 && a.restDays === 0) tags.push("dol");
  }
  return tags;
}

/**
 * Events for one day from the schedule (+ optional milestone windows as soft events).
 * An item appears on a day if the day falls inside [start, end].
 */
export function eventsOn(schedule, date) {
  return schedule.filter((x) => diffDays(x.start, date) >= 0 && diffDays(date, x.end) >= 0);
}

/** Build a month view: { y, m, cells: [{ date|null, tags, events }] }. */
export function monthView(birth, today, y, m, items = ITEMS) {
  const sch = scheduleFor(birth, today, items);
  return {
    y, m,
    cells: monthCells(y, m).map((date) => date ? {
      date,
      tags: dayTags(birth, date, today),
      events: eventsOn(sch, date),
    } : null),
  };
}

// ---------- milestone states + marks ----------
/** Stable id for one CDC milestone line: "b2.social.0". */
export function milestoneId(bandId, cat, idx) { return `${bandId}.${cat}.${idx}`; }

/** Flat list of every CDC milestone with band + category + index. */
export function allMilestones(milestones = MILESTONES) {
  const src = milestones || MILESTONES;
  const out = [];
  for (const b of BANDS) {
    const ms = src[b.id]; if (!ms) continue;
    for (const cat of ["social", "language", "cognitive", "movement"]) {
      (ms[cat] || []).forEach((pair, idx) => {
        out.push({ id: milestoneId(b.id, cat, idx), bandId: b.id, cat, idx, ko: pair[0], en: pair[1], pt: pair[2] || pair[1], band: b });
      });
    }
  }
  return out;
}

/**
 * Status of a milestone relative to baby's age:
 *  - past: band already finished (months >= band.to)
 *  - now: current band
 *  - upcoming: future band
 * Achieved marks override visual "done" but keep the age status.
 */
export function milestoneStatus(band, ageMonths) {
  if (!band || ageMonths == null) return "upcoming";
  if (band.to != null && ageMonths >= band.to) return "past";
  if (ageMonths >= band.from && (band.to == null || ageMonths < band.to)) return "now";
  return "upcoming";
}

/** True when today falls in the first 7 days of the current band (fresh "this week / now" window). */
export function inNowWindow(birth, today, band) {
  if (!band) return false;
  const start = addMonths(birth, band.from);
  const days = diffDays(start, today);
  return days >= 0 && days < 7;
}

/**
 * Annotate every milestone with age status + optional mark.
 * marks: { [id]: { at: "YYYY-MM-DD"|null, updatedAt: number, deleted?: bool } }
 */
export function milestonesFor(birth, today, marks = {}, milestones = MILESTONES) {
  const age = ageOn(birth, today);
  const list = allMilestones(milestones);
  return list.map((m) => {
    const status = milestoneStatus(m.band, age ? age.months : 0);
    const mark = marks[m.id] && !marks[m.id].deleted ? marks[m.id] : null;
    return {
      ...m,
      status,
      achieved: !!mark,
      achievedAt: mark && mark.at ? mark.at : null,
      highlight: status === "now" && inNowWindow(birth, today, m.band),
    };
  });
}

/** Merge remote mark list into local marks map (last-write-wins on updatedAt). Returns { marks, changed }. */
export function mergeMarks(local, remote) {
  const out = { ...(local || {}) };
  let changed = false;
  for (const r of remote || []) {
    if (!r || typeof r.id !== "string" || !/^[a-z0-9]+\.(social|language|cognitive|movement)\.\d+$/.test(r.id)) continue;
    const cur = out[r.id];
    const u = Number(r.updatedAt) || 0;
    if (cur && (cur.updatedAt || 0) >= u) continue;
    if (r.deleted) {
      if (cur && !cur.deleted) { out[r.id] = { at: null, updatedAt: u, deleted: true }; changed = true; }
      else if (!cur) { out[r.id] = { at: null, updatedAt: u, deleted: true }; changed = true; }
    } else {
      const at = r.at && parseYMD(r.at) ? r.at : null;
      out[r.id] = { at, updatedAt: u, deleted: false };
      changed = true;
    }
  }
  return { marks: out, changed };
}

/** Marks that still need pushing (updatedAt > syncedAt). */
export function pendingMarks(marks, syncedAt = 0) {
  return Object.entries(marks || {})
    .filter(([, v]) => (v.updatedAt || 0) > syncedAt)
    .map(([id, v]) => ({ id, at: v.deleted ? null : (v.at || null), deleted: !!v.deleted, updatedAt: v.updatedAt }));
}

// ---------- custom milestones (parent-typed notes in "지금 시기") ----------
export const CUSTOM_TEXT_MAX = 80;
export const CUSTOM_ID_RE = /^c_[A-Za-z0-9_-]{6,40}$/;

/** Trim + drop control chars; return null if empty or over max after trim. */
export function cleanCustomText(raw, max = CUSTOM_TEXT_MAX) {
  if (typeof raw !== "string") return null;
  const t = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!t || t.length > max) return null;
  return t;
}

/** New client-side id: c_ + 12 hex chars. */
export function newCustomId(rand = Math.random) {
  let h = "";
  for (let i = 0; i < 12; i++) h += Math.floor(rand() * 16).toString(16);
  return "c_" + h;
}

/**
 * Normalize one custom milestone for local state / wire format.
 * { id, text, at, achieved, updatedAt, deleted? }
 */
export function cleanCustom(c) {
  if (!c || typeof c !== "object") return null;
  if (!CUSTOM_ID_RE.test(c.id || "")) return null;
  const text = cleanCustomText(c.text);
  if (!text && !c.deleted) return null;
  let u = Number(c.updatedAt); if (!(u > 0)) return null;
  const deleted = c.deleted === true;
  const at = !deleted && c.at && parseYMD(c.at) ? c.at : null;
  const achieved = !deleted && c.achieved === true;
  return { id: c.id, text: text || "", at, achieved, updatedAt: u, deleted };
}

/** Active (non-deleted) customs as a list, newest first (each item includes id). */
export function customList(customs = {}) {
  return Object.entries(customs || {})
    .filter(([, c]) => c && !c.deleted && c.text)
    .map(([id, c]) => ({ id, text: c.text, at: c.at || null, achieved: !!c.achieved, updatedAt: c.updatedAt }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/** Soft calendar events for customs that have a date (kind = "custom"). */
export function customEventsOn(customs, date) {
  return customList(customs)
    .filter((c) => c.at === date)
    .map((c) => ({ id: c.id, kind: "custom", start: c.at, end: c.at, ko: c.text, en: c.text, pt: c.text, status: "now", custom: true, achieved: !!c.achieved }));
}

/** Merge remote custom list into local map (last-write-wins on updatedAt). */
export function mergeCustoms(local, remote) {
  const out = { ...(local || {}) };
  let changed = false;
  for (const r of remote || []) {
    const clean = cleanCustom(r);
    if (!clean) continue;
    const cur = out[clean.id];
    if (cur && (cur.updatedAt || 0) >= clean.updatedAt) continue;
    out[clean.id] = clean;
    changed = true;
  }
  return { customs: out, changed };
}

/** Customs that still need pushing (updatedAt > syncedAt). */
export function pendingCustoms(customs, syncedAt = 0) {
  return Object.entries(customs || {})
    .filter(([, c]) => c && (c.updatedAt || 0) > syncedAt)
    .map(([id, c]) => ({
      id,
      text: c.deleted ? "" : (c.text || ""),
      at: c.deleted ? null : (c.at || null),
      achieved: !c.deleted && !!c.achieved,
      deleted: !!c.deleted,
      updatedAt: c.updatedAt,
    }));
}
