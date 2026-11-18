// Pure logic for the baby tracker (/tracker). No DOM. Shared by the page script and node tests.
// Entry shapes (times are epoch ms):
//   { id, type: "feed",   t, kind: "formula" | "breast", ml?: number, min?: number }
//   { id, type: "sleep",  t, end?: number|null }        (end null/undefined = sleeping now)
//   { id, type: "diaper", t, d: "pee" | "poop" | "both" }
export const STORAGE_KEY = "nb_tracker_v1";
export const MIN = 60000, HOUR = 3600000, DAY = 86400000;

/** Feed amounts: any positive number (decimals ok, kept to 2 places); only non-numbers, 0/negative and absurd values are dropped. */
export const ML_MAX = 9999;
export function cleanMl(v) { const n = typeof v === "string" ? Number(v.trim().replace(",", ".")) : Number(v); if (!Number.isFinite(n) || n <= 0 || n > ML_MAX) return undefined; return Math.round(n * 100) / 100; }
export function fmtMl(n) { return String(Math.round((Number(n) || 0) * 100) / 100); }
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function startOfDay(ms) { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); }

export function sortEntries(list) { return [...list].sort((a, b) => b.t - a.t || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)); }

/** Currently running sleep (no end), newest first. */
export function openSleep(entries) { return sortEntries(entries).find((e) => e.type === "sleep" && !e.end) || null; }

/** Minutes of sleep inside [from, to). Running sleep counts up to `now`. */
export function sleepMsIn(e, from, to, now) {
  const end = e.end || now;
  return Math.max(0, Math.min(end, to) - Math.max(e.t, from));
}

/** Total sleep inside [from, to) counting overlapping records once (e.g. a quick "fell asleep" logged over an edited one). */
export function sleepUnionMs(entries, from, to, now) {
  const iv = [];
  for (const e of entries) if (e.type === "sleep") { const a = Math.max(e.t, from), b = Math.min(e.end || now, to); if (b > a) iv.push([a, b]); }
  iv.sort((x, y) => x[0] - y[0]);
  let total = 0, ca = null, cb = null;
  for (const [a, b] of iv) { if (cb == null || a > cb) { if (cb != null) total += cb - ca; ca = a; cb = b; } else cb = Math.max(cb, b); }
  return cb == null ? total : total + cb - ca;
}

export function daySummary(entries, dayStart, now = Date.now()) {
  const dayEnd = dayStart + DAY;
  const s = { ml: 0, feeds: 0, formula: 0, breast: 0, breastMin: 0, sleepMs: sleepUnionMs(entries, dayStart, dayEnd, now), pee: 0, poop: 0, diapers: 0 };
  for (const e of entries) {
    if (e.type === "sleep") continue;
    if (e.t < dayStart || e.t >= dayEnd) continue;
    if (e.type === "feed") {
      s.feeds++; s.ml += Number(e.ml) || 0; s.breastMin += Number(e.min) || 0;
      if (e.kind === "breast") s.breast++; else s.formula++;
    } else if (e.type === "diaper") {
      s.diapers++;
      if (e.d === "pee" || e.d === "both") s.pee++;
      if (e.d === "poop" || e.d === "both") s.poop++;
    }
  }
  return s;
}

/** Entries that belong to the day (sleep overlapping the day included), newest first. */
export function dayEntries(entries, dayStart, now = Date.now()) {
  const dayEnd = dayStart + DAY;
  return sortEntries(entries.filter((e) => e.type === "sleep"
    ? e.t < dayEnd && (e.end || now) >= dayStart
    : e.t >= dayStart && e.t < dayEnd));
}

export function history(entries, days = 7, now = Date.now()) {
  const today = startOfDay(now), out = [];
  for (let i = 0; i < days; i++) {
    const ds = startOfDay(today - i * DAY + 2 * HOUR); // DST-safe step
    out.push({ dayStart: ds, ...daySummary(entries, ds, now) });
  }
  return out;
}

/** Last events for the "since" chips. */
export function lastInfo(entries, now = Date.now()) {
  const sorted = sortEntries(entries.filter((e) => e.t <= now));
  const feed = sorted.find((e) => e.type === "feed") || null;
  const diaper = sorted.find((e) => e.type === "diaper") || null;
  const sl = sorted.find((e) => e.type === "sleep") || null;
  return {
    feedAgo: feed ? now - feed.t : null, feed,
    diaperAgo: diaper ? now - diaper.t : null, diaper,
    sleeping: !!(sl && !sl.end), sleepFor: sl && !sl.end ? now - sl.t : null,
    awakeFor: sl && sl.end ? now - sl.end : null, sleep: sl,
  };
}

export function fmtDur(ms) {
  if (ms == null) return "-";
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 1) return "방금";
  const h = Math.floor(m / 60), r = m % 60;
  return h ? (r ? `${h}시간 ${r}분` : `${h}시간`) : `${r}분`;
}
export function fmtClock(ms) {
  const d = new Date(ms), h = d.getHours(), m = d.getMinutes();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
}
export const DIAPER_LABEL = { pee: "소변", poop: "대변", both: "대변+소변" };
export function describe(e, now = Date.now()) {
  if (e.type === "feed") {
    const k = e.kind === "breast" ? "모유" : "분유";
    const parts = [k]; if (e.ml) parts.push(`${e.ml}ml`); if (e.min) parts.push(`${e.min}분`);
    return parts.join(" ");
  }
  if (e.type === "sleep") return e.end ? `수면 ${fmtDur(e.end - e.t)}` : `수면 중 (${fmtDur(now - e.t)}째)`;
  if (e.type === "diaper") return `기저귀 ${DIAPER_LABEL[e.d] || ""}`;
  return "";
}

/** Validate/normalise an entry from import or the form. Returns null if invalid. */
export function cleanEntry(e) {
  const base = cleanEntryCore(e);
  if (!base) return null;
  // sync metadata (family sharing): last-write-wins timestamp + who added it
  const u = Number(e.updatedAt); if (Number.isFinite(u) && u > 0) base.updatedAt = u;
  if (typeof e.by === "string" && e.by.trim()) base.by = e.by.trim().slice(0, 20);
  if (typeof e.dev === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(e.dev)) base.dev = e.dev;
  if (typeof e.note === "string" && e.note.trim()) base.note = e.note.trim().slice(0, 200);
  return base;
}
function cleanEntryCore(e) {
  if (!e || typeof e !== "object") return null;
  const t = Number(e.t);
  if (!Number.isFinite(t) || t <= 0) return null;
  const id = typeof e.id === "string" && e.id ? e.id.slice(0, 40) : uid();
  if (e.type === "feed") {
    const out = { id, type: "feed", t, kind: e.kind === "breast" ? "breast" : "formula" };
    const ml = cleanMl(e.ml); if (ml !== undefined) out.ml = ml;
    const min = Math.round(Number(e.min)); if (min > 0 && min <= 300) out.min = min;
    return out;
  }
  if (e.type === "sleep") {
    const end = e.end == null ? null : Number(e.end);
    if (end != null && (!Number.isFinite(end) || end < t)) return null;
    return { id, type: "sleep", t, end };
  }
  if (e.type === "diaper") return ["pee", "poop", "both"].includes(e.d) ? { id, type: "diaper", t, d: e.d } : null;
  return null;
}

export function exportJson(entries) {
  return JSON.stringify({ app: "newbornkr-tracker", v: 1, exportedAt: new Date().toISOString(), entries: sortEntries(entries) }, null, 2);
}
/** Merge imported JSON into existing entries (by id). Returns { entries, added } or throws. */
export function importJson(text, existing = []) {
  let data; try { data = JSON.parse(text); } catch { throw Object.assign(new Error("JSON 형식이 아니에요"), { code: "not_json" }); }
  const list = Array.isArray(data) ? data : data && Array.isArray(data.entries) ? data.entries : null;
  if (!list) throw Object.assign(new Error("기록 파일이 아니에요"), { code: "not_log" });
  const map = new Map(existing.map((e) => [e.id, e])); let added = 0;
  for (const raw of list) { const e = cleanEntry(raw); if (!e) continue; if (!map.has(e.id)) added++; map.set(e.id, e); }
  return { entries: sortEntries([...map.values()]), added };
}

// ---------- Korean voice / text command parser ----------
const SINO = { 영: 0, 공: 0, 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5, 육: 6, 륙: 6, 칠: 7, 팔: 8, 구: 9 };
const NATIVE = [["스물", 20], ["열", 10], ["아홉", 9], ["여덟", 8], ["일곱", 7], ["여섯", 6], ["다섯", 5], ["네", 4], ["넷", 4], ["세", 3], ["셋", 3], ["두", 2], ["둘", 2], ["한", 1], ["하나", 1]];
/** "백이십" -> 120, "삼십" -> 30, "십오" -> 15 */
export function sinoToNum(s) {
  let total = 0, cur = 0, any = false;
  for (const ch of s) {
    if (ch in SINO) { cur = SINO[ch]; any = true; }
    else if (ch === "십" || ch === "백" || ch === "천") { const u = ch === "십" ? 10 : ch === "백" ? 100 : 1000; total += (cur || 1) * u; cur = 0; any = true; }
    else return null;
  }
  return any ? total + cur : null;
}
const SINO_RE = "[영공일이삼사오육륙칠팔구십백천]+";
const NATIVE_RE = "(?:스물|열|아홉|여덟|일곱|여섯|다섯|하나|한|두|둘|세|셋|네|넷)+";
function nativeToNum(s) {
  let n = 0, rest = s;
  while (rest) { const hit = NATIVE.find(([w]) => rest.startsWith(w)); if (!hit) return null; n += hit[1]; rest = rest.slice(hit[0].length); }
  return n;
}
/** Normalise Korean number words into digits so the rest of the parser only deals with digits. */
export function normalizeNumbers(text) {
  let s = " " + text.replace(/[,!?~]|\.(?!\d)|(?<!\d)\./g, " ").replace(/\s+/g, " ") + " ";
  s = s.replace(/(\d+(?:\.\d+)?)\s*(?:미리|밀리|ml|mL|ML|씨씨|cc|CC|㎖)/g, "$1ml");
  s = s.replace(/반\s*시간/g, "30분");
  // native numbers before 시간 / 시 (hours): "두 시간", "세시"
  s = s.replace(new RegExp(`(${NATIVE_RE})\\s*(시간|시(?!작))`, "g"), (m, w, u) => { const n = nativeToNum(w); return n == null ? m : `${n}${u}`; });
  // sino numbers before units: "백이십 미리", "삼십 분", "십오분"
  s = s.replace(new RegExp(`(${SINO_RE})\\s*(ml|미리|밀리|분(?!유)|시간|cc|씨씨)`, "g"), (m, w, u) => {
    const n = sinoToNum(w); if (n == null) return m;
    return `${n}${/미리|밀리|cc|씨씨/.test(u) ? "ml" : u}`;
  });
  // standalone sino number after a feed word: "분유 백이십"
  s = s.replace(new RegExp(`(분유|모유|우유|유축|젖병|맘마|쭈쭈)\\s*(${SINO_RE})(?=\\s|$|먹)`, "g"), (m, f, w) => { const n = sinoToNum(w); return n == null ? m : `${f} ${n}`; });
  s = s.replace(/(\d)\s+(ml|분(?!유)|시간)/g, "$1$2");
  s = s.replace(/(\d+)\s*시간\s*반/g, (_, h) => `${h}시간 30분`);

  return s;
}

const POOP = /대변|응가|응아|똥|변\s*봤|변\s*쌌/;
const PEE = /소변|쉬야|쉬\s*했|쉬\s*쌌|쉬했|쉬\s*하|오줌|(^|\s)쉬(\s|$)/;
const BOTH = /둘\s*다|대소변|대\s*소변|똥\s*오줌|소변\s*대변|대변\s*소변|응가.*쉬|쉬.*응가/;
const WAKE = /깼|깨어났|깨났|일어났|기상|잠\s*깸|눈\s*떴|잠에서\s*깨/;
const SLEEP_START = /잠들|잠\s*들|재웠|재움|잠\s*재|자기\s*시작|자러|수면\s*시작|낮잠\s*시작|밤잠\s*시작|자요|자는\s*중|잔다/;
const SLEPT = /잤|잠잤/;
const FEED = /분유|모유|우유|젖병|수유|유축|젖|직수|먹었|먹임|먹였|마셨|맘마|쭈쭈|(?:왼쪽|오른쪽|양쪽)\s*\d+분/;
const BREAST = /모유|직수|젖(?!병)|유축|왼쪽|오른쪽|양쪽|쭈쭈/;

/** Extracts "N분 전 / N시간 전 / 오후 3시 20분" and returns the event time. */
export function parseWhen(s, now) {
  let m = s.match(/(?:(\d+)시간\s*(?:(\d+)분)?|(\d+)분)\s*(?:정도\s*|쯤\s*)?전/);
  if (m) return { t: now - (Number(m[1] || 0) * HOUR + Number(m[2] || m[3] || 0) * MIN), rest: s.replace(m[0], " ") };
  if (/방금|지금|금방/.test(s)) return { t: now, rest: s };
  m = s.match(/(오전|오후|아침|낮|저녁|밤|새벽)?\s*(\d{1,2})시(?!간)\s*(?:(반)|(\d{1,2})분)?\s*(?:에|쯤|부터)?/);
  if (m) {
    let h = Number(m[2]); const mi = m[3] ? 30 : Number(m[4] || 0);
    if (h > 24 || mi > 59) return { t: now, rest: s };
    const ap = m[1];
    const cands = [];
    if (ap === "오후" || ap === "저녁" || ap === "밤" && h >= 6) cands.push(h % 12 + 12);
    else if (ap === "오전" || ap === "아침" || ap === "새벽" || ap === "밤" && h < 6) cands.push(h % 12);
    else if (ap === "낮") cands.push(h < 7 ? h + 12 : h % 24);
    else if (h >= 13) cands.push(h % 24); else cands.push(h % 12, h % 12 + 12);
    let best = null;
    for (const hh of cands) for (const back of [0, 1]) {
      const d = new Date(now); d.setHours(hh, mi, 0, 0); const t = d.getTime() - back * DAY;
      if (t <= now + 5 * MIN && (best == null || t > best)) best = t;
    }
    return { t: best ?? now, rest: s.replace(m[0], " ") };
  }
  return { t: now, rest: s };
}

/**
 * Parse a Korean phrase into an action.
 * Returns one of:
 *   { action: "feed", kind, ml?, min?, t }
 *   { action: "diaper", d, t }
 *   { action: "sleep_start", t }
 *   { action: "sleep_end", t }
 *   { action: "sleep", t, end }        ("2시간 잤어" = finished sleep)
 * or null when nothing was understood.
 */
export function parseCommand(text, now = Date.now()) {
  if (!text || !text.trim()) return null;
  const norm = normalizeNumbers(text.trim());
  const { t, rest } = parseWhen(norm, now);
  const s = rest;
  const hasDiaper = POOP.test(s) || PEE.test(s) || BOTH.test(s) || /기저귀/.test(s);
  if (hasDiaper && !/분유|모유|ml/.test(s)) {
    const both = BOTH.test(s) || (POOP.test(s) && PEE.test(s));
    const d = both ? "both" : POOP.test(s) ? "poop" : "pee";
    return { action: "diaper", d, t };
  }
  if (WAKE.test(s)) return { action: "sleep_end", t };
  if (SLEEP_START.test(s)) return { action: "sleep_start", t };
  const dur = s.match(/(?:(\d+)시간)?\s*(?:(\d+)분)?\s*(?:동안\s*)?(?:낮잠\s*|밤잠\s*)?(?:잤|잠잤|수면)/);
  if (SLEPT.test(s) || (dur && (dur[1] || dur[2]))) {
    if (dur && (dur[1] || dur[2])) {
      const ms = Number(dur[1] || 0) * HOUR + Number(dur[2] || 0) * MIN;
      return { action: "sleep", t: t - ms, end: t };
    }
    return SLEPT.test(s) ? { action: "sleep_end", t } : null;
  }
  if (/^\s*(낮잠|밤잠|잠|수면)\s*$/.test(s)) return { action: "sleep_start", t };
  if (FEED.test(s) || /\d+ml/.test(s)) {
    const kind = BREAST.test(s) ? "breast" : "formula";
    const out = { action: "feed", kind, t };
    const ml = s.match(/(\d+(?:\.\d+)?)ml/);
    if (ml) out.ml = Number(ml[1]);
    const mins = [...s.matchAll(/(\d+)분(?!유)/g)].map((x) => Number(x[1]));
    if (mins.length) out.min = mins.reduce((a, b) => a + b, 0);
    if (!out.ml && !out.min) { const n = s.match(/(?:분유|모유|우유|유축|젖병|수유|맘마|쭈쭈)\s*(\d{2,4}(?:\.\d+)?)(?![\d.]|시)/) || s.match(/(?:^|\s)(\d{2,4}(?:\.\d+)?)(?=\s*(?:먹|마셨|$))/); if (n) out.ml = Number(n[1]); }
    if (out.ml !== undefined) { const v = cleanMl(out.ml); if (v === undefined) delete out.ml; else out.ml = v; }
    if (out.min && out.min > 180) delete out.min;
    return out;
  }
  return null;
}

/** Korean confirmation text for a parsed command. */
export function describeCommand(c, now = Date.now()) {
  if (!c) return "";
  const when = Math.abs(now - c.t) < 2 * MIN ? "지금" : fmtClock(c.t);
  if (c.action === "feed") {
    const parts = [c.kind === "breast" ? "모유" : "분유"]; if (c.ml) parts.push(`${c.ml}ml`); if (c.min) parts.push(`${c.min}분`);
    return `🍼 ${parts.join(" ")} · ${when}`;
  }
  if (c.action === "diaper") return `${c.d === "poop" ? "💩" : c.d === "both" ? "💩💧" : "💧"} ${DIAPER_LABEL[c.d]} · ${when}`;
  if (c.action === "sleep_start") return `😴 잠들었어요 · ${when}`;
  if (c.action === "sleep_end") return `🌤️ 깼어요 · ${when}`;
  if (c.action === "sleep") return `😴 수면 ${fmtDur(c.end - c.t)} (${fmtClock(c.t)}~${fmtClock(c.end)})`;
  return "";
}

/** Apply a parsed command to the entry list. Returns { entries, entry, note } (note = message for the user). */
export function applyCommand(entries, c) {
  if (!c) return { entries, entry: null, note: "이해하지 못했어요", code: "unparsed" };
  if (c.action === "feed") { const e = cleanEntry({ type: "feed", t: c.t, kind: c.kind, ml: c.ml, min: c.min }); return { entries: [e, ...entries], entry: e }; }
  if (c.action === "diaper") { const e = { id: uid(), type: "diaper", t: c.t, d: c.d }; return { entries: [e, ...entries], entry: e }; }
  if (c.action === "sleep") { const e = { id: uid(), type: "sleep", t: c.t, end: c.end }; return { entries: [e, ...entries], entry: e }; }
  if (c.action === "sleep_start") {
    const open = openSleep(entries);
    if (open) return { entries, entry: null, note: "이미 수면 중으로 기록돼 있어요", code: "already_sleeping" };
    const e = { id: uid(), type: "sleep", t: c.t, end: null }; return { entries: [e, ...entries], entry: e };
  }
  if (c.action === "sleep_end") {
    const open = openSleep(entries);
    if (!open) return { entries, entry: null, note: "진행 중인 수면 기록이 없어요. ‘잠들었어’를 먼저 기록해 주세요", code: "no_open_sleep" };
    const end = Math.max(c.t, open.t);
    const e = { ...open, end };
    return { entries: entries.map((x) => (x.id === open.id ? e : x)), entry: e, prev: open };
  }
  return { entries, entry: null, note: "이해하지 못했어요", code: "unparsed" };
}

// ---------- English formatting + parser (used by /en/tracker; Korean functions above are unchanged) ----------
export function fmtDurEn(ms) {
  if (ms == null) return "-";
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 1) return "just now";
  const h = Math.floor(m / 60), r = m % 60;
  return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${r}m`;
}
export function fmtClockEn(ms) {
  const d = new Date(ms), h = d.getHours(), m = d.getMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
export const DIAPER_LABEL_EN = { pee: "wet", poop: "poop", both: "wet + poop" };
export function describeEn(e, now = Date.now()) {
  if (e.type === "feed") {
    const parts = [e.kind === "breast" ? "Breast milk" : "Formula"]; if (e.ml) parts.push(`${e.ml} ml`); if (e.min) parts.push(`${e.min} min`);
    return parts.join(" ");
  }
  if (e.type === "sleep") return e.end ? `Sleep ${fmtDurEn(e.end - e.t)}` : `Sleeping (${fmtDurEn(now - e.t)} so far)`;
  if (e.type === "diaper") return `Diaper: ${DIAPER_LABEL_EN[e.d] || ""}`;
  return "";
}
export function describeCommandEn(c, now = Date.now()) {
  if (!c) return "";
  const when = Math.abs(now - c.t) < 2 * MIN ? "now" : fmtClockEn(c.t);
  if (c.action === "feed") {
    const parts = [c.kind === "breast" ? "Breast milk" : "Formula"]; if (c.ml) parts.push(`${c.ml} ml`); if (c.min) parts.push(`${c.min} min`);
    return `🍼 ${parts.join(" ")} · ${when}`;
  }
  if (c.action === "diaper") return `${c.d === "poop" ? "💩" : c.d === "both" ? "💩💧" : "💧"} Diaper: ${DIAPER_LABEL_EN[c.d]} · ${when}`;
  if (c.action === "sleep_start") return `😴 Fell asleep · ${when}`;
  if (c.action === "sleep_end") return `🌤️ Woke up · ${when}`;
  if (c.action === "sleep") return `😴 Sleep ${fmtDurEn(c.end - c.t)} (${fmtClockEn(c.t)}–${fmtClockEn(c.end)})`;
  return "";
}

const EN_UNITS = { zero: 0, a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const EN_TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
/** "a hundred and twenty" -> 120, "forty five" -> 45 (only number-word runs are converted). */
export function normalizeEn(text) {
  let s = " " + String(text).toLowerCase().replace(/[,!?]/g, " ").replace(/(\d)\.(?!\d)/g, "$1").replace(/-/g, " ").replace(/\s+/g, " ") + " ";
  s = s.replace(/half an hour/g, "30 minutes").replace(/an hour and a half|one and a half hours?|1 and a half hours?/g, "90 minutes").replace(/\ban? hour\b/g, "1 hour").replace(/\ba minute\b/g, "1 minute");
  s = s.replace(/(\d+) and a half hours?/g, (_, h) => `${h * 60 + 30} minutes`).replace(/(\d+(?:\.\d+)?) hours?/g, (m, h) => (h.includes(".") ? `${Math.round(Number(h) * 60)} minutes` : m));
  const word = "(?:zero|an?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|and)";
  s = s.replace(new RegExp(`(?<=\\s)${word}(?:\\s${word})*(?=\\s)`, "g"), (run, off, all) => {
    const toks = run.split(" ");
    if (toks.every((t) => t === "a" || t === "an" || t === "and")) return run;
    // spoken amounts like "one twenty" / "one fifty five" = 120 / 155 (unit then tens, no "hundred")
    const w = toks.filter((t) => t !== "and");
    if (w.length >= 2 && !w.includes("hundred") && w[0] in EN_UNITS && EN_UNITS[w[0]] >= 1 && EN_UNITS[w[0]] <= 9 && w[0] !== "a" && w[0] !== "an" && (w[1] in EN_TENS || (EN_UNITS[w[1]] >= 10))) {
      const rest = w.slice(1).reduce((a, t) => a + (EN_TENS[t] || EN_UNITS[t] || 0), 0);
      if (/\bat\s$/.test(all.slice(0, off)) && rest < 60) return `${EN_UNITS[w[0]]}:${String(rest).padStart(2, "0")}`; // "at two twenty" = 2:20
      return String(EN_UNITS[w[0]] * 100 + rest);
    }
    let total = 0, cur = 0, any = false;
    for (const t of toks) {
      if (t === "and") continue;
      if (t in EN_UNITS) { cur += EN_UNITS[t]; any = true; }
      else if (t in EN_TENS) { cur += EN_TENS[t]; any = true; }
      else if (t === "hundred") { cur = (cur || 1) * 100; any = true; }
    }
    total += cur;
    return any ? String(total) : run;
  });
  s = s.replace(/(\d+(?:\.\d+)?)\s*(?:mls?|milliliters?|millilitres?|cc)\b/g, "$1ml");
  s = s.replace(/(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\b/g, (_, n) => `${Math.round(Number(n) * 30)}ml`);
  s = s.replace(/(\d+)\s*(?:mins?|minutes?)\b/g, "$1min").replace(/(\d+)\s*(?:hrs?|hours?)\b/g, "$1hr");
  return s;
}
export function parseWhenEn(s, now) {
  let m = s.match(/(?:(\d+)hr\s*(?:(?:and\s*)?(\d+)min)?|(\d+)min)\s*ago/);
  if (m) return { t: now - (Number(m[1] || 0) * HOUR + Number(m[2] || m[3] || 0) * MIN), rest: s.replace(m[0], " ") };
  if (/just now|right now/.test(s)) return { t: now, rest: s.replace(/just now|right now/, " ") };
  m = s.match(/\bat\s*(\d{1,2})(?::(\d{2})|\s(\d{2})(?=\s*(?:am|pm|a m|p m)))?\s*(am|pm|a m|p m)?/);
  if (m) {
    let h = Number(m[1]); const mi = Number(m[2] || m[3] || 0); const ap = m[4] ? m[4].replace(" ", "") : null;
    if (h > 24 || mi > 59) return { t: now, rest: s };
    const cands = ap === "pm" ? [h % 12 + 12] : ap === "am" ? [h % 12] : h >= 13 ? [h % 24] : [h % 12, h % 12 + 12];
    let best = null;
    for (const hh of cands) for (const back of [0, 1]) {
      const d = new Date(now); d.setHours(hh, mi, 0, 0); const t = d.getTime() - back * DAY;
      if (t <= now + 5 * MIN && (best == null || t > best)) best = t;
    }
    return { t: best ?? now, rest: s.replace(m[0], " ") };
  }
  return { t: now, rest: s };
}
const EN_BOTH = /\bboth\b|wet and (?:dirty|poop|poopy)|(?:pee|peed|wet) and (?:poop|pooped|poo)|(?:poop|pooped|poo|dirty) and (?:pee|peed|wet)/;
const EN_POOP = /\bpoo+p?(?:ed|y|ie|s)?\b|\bdirty\b|\bbm\b|bowel movement|\bstool\b/;
const EN_PEE = /\bpee+d?\b|\bwet\b|\bwee+\b|\burin(?:e|ated)\b|\bpeeing\b/;
const EN_WAKE = /\bwoke\b|\bwoken\b|\bawake\b|\bwake[sd]? up\b|\bwaking\b|\bgot up\b|\bup from (?:her |his |the )?nap\b|\bnap (?:is )?(?:over|ended|done)\b|\bstopped sleeping\b/;
const EN_SLEEP = /fell asleep|\basleep\b|went to sleep|going to sleep|went down|put (?:her|him|them|baby|the baby) down|down for (?:a |her |his )?nap|start(?:ed|ing)? (?:a |her |his )?(?:nap|sleep)|nap (?:started|time)|\bbedtime\b|is sleeping|\bsleeping\b|^\s*(?:nap|sleep)\s*$/;
const EN_SLEPT = /\bslept\b|\bnapped\b|(\d+)(?:hr|min) nap\b/;
const EN_FEED = /both sides|left side|right side|formula|bottle|\bfed\b|\bfeed(?:ing)?\b|\bate\b|\bdrank\b|\bmilk\b|breast|nurs(?:ed|ing|e)|pumped|\bate\b|\bmeal\b|\bml\b|\d+ml/;
const EN_BREAST = /breast|nurs(?:ed|ing|e)|pumped|left side|right side|\bboth sides\b|\bleft\b|\bright\b/;

/** English counterpart of parseCommand. Same return shape. */
export function parseCommandEn(text, now = Date.now()) {
  if (!text || !String(text).trim()) return null;
  const norm = normalizeEn(text);
  const { t, rest } = parseWhenEn(norm, now);
  const s = rest;
  const feedish = /formula|bottle|breast|nurs|pumped|\d+ml|both sides/.test(s);
  const isBoth = EN_BOTH.test(s) && !/both sides|both breasts/.test(s);
  if ((isBoth || EN_POOP.test(s) || EN_PEE.test(s) || /\bdiaper\b|\bnappy\b/.test(s)) && !feedish) {
    const d = isBoth || (EN_POOP.test(s) && EN_PEE.test(s)) ? "both" : EN_POOP.test(s) ? "poop" : "pee";
    return { action: "diaper", d, t };
  }
  if (EN_WAKE.test(s)) return { action: "sleep_end", t };
  const dur = s.match(/(?:slept|napped)\s*(?:for\s*)?(?:(\d+)hr)?\s*(?:(?:and\s*)?(\d+)min)?/) || s.match(/(?:(\d+)hr)?\s*(?:(\d+)min)?\s*nap\b/);
  if (dur && (dur[1] || dur[2])) {
    const ms = Number(dur[1] || 0) * HOUR + Number(dur[2] || 0) * MIN;
    return { action: "sleep", t: t - ms, end: t };
  }
  if (EN_SLEPT.test(s)) return { action: "sleep_end", t };
  if (EN_SLEEP.test(s)) return { action: "sleep_start", t };
  if (EN_FEED.test(s)) {
    const kind = EN_BREAST.test(s) && !/formula|bottle of formula/.test(s) ? "breast" : "formula";
    const out = { action: "feed", kind, t };
    const ml = s.match(/(\d+(?:\.\d+)?)ml/); if (ml) out.ml = Number(ml[1]);
    const mins = [...s.matchAll(/(\d+)min/g)].map((x) => Number(x[1]));
    if (mins.length) out.min = mins.reduce((a, b) => a + b, 0);
    if (!out.ml && !out.min) { const n = s.match(/(?:formula|bottle|milk|fed|ate|drank|feed)\D{0,6}?(\d{2,4})(?!\d|min|hr)/) || s.match(/(?:^|\s)(\d{2,4})(?=\s*(?:of\s*)?(?:formula|milk|bottle))/); if (n) out.ml = Number(n[1]); }
    if (out.ml !== undefined) { const v = cleanMl(out.ml); if (v === undefined) delete out.ml; else out.ml = v; }
    if (out.min && out.min > 180) delete out.min;
    return out;
  }
  return null;
}

// ---------- family sharing: diff + last-write-wins merge (pure) ----------
const contentKey = (e) => { const { updatedAt, ...rest } = e; return JSON.stringify(rest, Object.keys(rest).sort()); };
/** What changed locally between two entry lists (ignores updatedAt). */
export function diffEntries(prev, next) {
  const pm = new Map(prev.map((e) => [e.id, e])), nm = new Map(next.map((e) => [e.id, e]));
  const upserts = [], deletes = [];
  for (const e of next) { const p = pm.get(e.id); if (!p || contentKey(p) !== contentKey(e) || (e.updatedAt || 0) < (p.updatedAt || 0)) upserts.push(e); }
  for (const e of prev) if (!nm.has(e.id)) deletes.push(e.id);
  return { upserts, deletes };
}
/**
 * Merge remote changes into local state. Last write wins by updatedAt; deletes are tombstones ({id, deleted, updatedAt}).
 * tombs: { [id]: updatedAt } of locally known deletions. Returns { entries, tombs, changed }.
 */
export function mergeRemote(entries, tombs, remote) {
  const map = new Map(entries.map((e) => [e.id, e])), tb = { ...tombs }; let changed = false;
  for (const r of remote || []) {
    if (!r || typeof r.id !== "string") continue;
    const ru = Number(r.updatedAt) || 0, local = map.get(r.id);
    const cur = Math.max(local ? local.updatedAt || 0 : 0, tb[r.id] || 0);
    if (ru <= cur && (local || tb[r.id])) continue;
    if (r.deleted) { if (local) { map.delete(r.id); changed = true; } tb[r.id] = Math.max(ru, tb[r.id] || 0); continue; }
    const e = cleanEntry(r); if (!e) continue;
    if (!local || contentKey(local) !== contentKey(e) || local.updatedAt !== e.updatedAt) { map.set(e.id, e); changed = true; }
    delete tb[r.id];
  }
  return { entries: sortEntries([...map.values()]), tombs: tb, changed };
}
/** Add local upserts/deletes to the outbox ({ [id]: change }); a newer change for the same id replaces the older one. */
export function addToOutbox(outbox, upserts, deletes, now) {
  const ob = { ...outbox };
  for (const e of upserts) ob[e.id] = { ...e };
  for (const id of deletes) ob[id] = { id, deleted: true, updatedAt: now };
  return ob;
}
/** Remove acknowledged changes (only if not modified again since they were sent). */
export function ackOutbox(outbox, sent) {
  const ob = { ...outbox };
  for (const c of sent) if (ob[c.id] && ob[c.id].updatedAt === c.updatedAt) delete ob[c.id];
  return ob;
}
/** "ABCD EFGH ..." grouping for display; accepts any case/spacing. */
export function fmtFamilyCode(code) { return String(code || "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/(.{4})(?=.)/g, "$1-"); }
export function normFamilyCode(c) {
  const s = String(c || "").toUpperCase().replace(/[\s-]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0");
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(s) ? s : null;
}
/** Pull a join code out of a pasted invite link or a raw code. */
export function codeFromInput(v) {
  const s = String(v || "").trim();
  const m = s.match(/[?&#]join=([0-9A-Za-z-]+)/); return normFamilyCode(m ? m[1] : s);
}

/** Move code (one-time, short-lived) for carrying the family to another browser / the installed app: 8 Crockford chars. */
export function normMoveCode(c) {
  const s = String(c || "").toUpperCase().replace(/[\s-]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0");
  return /^[0-9A-HJKMNP-TV-Z]{8}$/.test(s) ? s : null;
}
export function fmtMoveCode(c) { const s = normMoveCode(c) || ""; return s ? s.slice(0, 4) + "-" + s.slice(4) : ""; }
/** What the user pasted / typed into "join": a move link or code -> {move}, a family code or invite link -> {code}. */
export function joinInput(v) {
  const s = String(v || "").trim();
  const mm = s.match(/[?&#]move=([0-9A-Za-z-]+)/);
  if (mm) { const m = normMoveCode(mm[1]); return m ? { move: m } : null; }
  const code = codeFromInput(s); if (code) return { code };
  const m = normMoveCode(s); return m ? { move: m } : null;
}
export function moveUrl(origin, path, move) { return `${origin}${path}#move=${normMoveCode(move)}`; }

// ---------- 24h clock analytics (read-only, pure) ----------
/** Position of a time on the 24h clock: 0 = midnight (top), 0.5 = noon (bottom), clockwise. */
export function clockFrac(t, dayStart) { return Math.min(1, Math.max(0, (t - dayStart) / DAY)); }
/**
 * Everything the 24h clock needs for one day.
 * sleeps: [{ a, b, live, id }] as clock fractions clipped to the day (running sleep ends at `now`)
 * feeds / diapers: [{ f, e }] point events. stats: totals + intervals.
 */
export function clockDay(entries, dayStart, now = Date.now()) {
  const dayEnd = dayStart + DAY, sleeps = [], feeds = [], diapers = [];
  let longest = 0;
  for (const e of entries) {
    if (e.type === "sleep") {
      const end = e.end || now;
      if (e.t >= dayEnd || end <= dayStart || e.t > now) continue;
      const a = Math.max(e.t, dayStart), b = Math.min(end, dayEnd, Math.max(now, e.t));
      if (b > a) sleeps.push({ a: clockFrac(a, dayStart), b: clockFrac(b, dayStart), live: !e.end, id: e.id, from: e.t, to: e.end || null });
      longest = Math.max(longest, Math.max(0, Math.min(end, now) - e.t));
    } else if (e.t >= dayStart && e.t < dayEnd) {
      (e.type === "feed" ? feeds : diapers).push({ f: clockFrac(e.t, dayStart), e });
    }
  }
  feeds.sort((x, y) => x.e.t - y.e.t); diapers.sort((x, y) => x.e.t - y.e.t); sleeps.sort((x, y) => x.a - y.a);
  const s = daySummary(entries, dayStart, now);
  const gaps = []; for (let i = 1; i < feeds.length; i++) gaps.push(feeds[i].e.t - feeds[i - 1].e.t);
  const stats = {
    ...s,
    avgFeedGapMs: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
    longestSleepMs: longest || null,
    sleepCount: sleeps.length,
    lastFeedAt: feeds.length ? feeds[feeds.length - 1].e.t : null,
    firstFeedAt: feeds.length ? feeds[0].e.t : null,
  };
  return { dayStart, sleeps, feeds, diapers, stats, isToday: now >= dayStart && now < dayEnd, nowFrac: now >= dayStart && now < dayEnd ? clockFrac(now, dayStart) : null };
}
/** Day start `n` calendar days before/after `dayStart` (DST-safe). */
export function addDays(dayStart, n) { return startOfDay(dayStart + n * DAY + 2 * HOUR); }
/**
 * Last day of the "7일" window for a viewed day: the newest window ends today (today is drawn, even if still in
 * progress). A past viewed day stays that day. Week-step ‹ › moves this end by 7 days.
 */
export function weekEndDay(viewDay, now = Date.now()) { return Math.min(startOfDay(viewDay), startOfDay(now)); }
/**
 * How much of a calendar day has elapsed at `now`. Full days (already over) are 1; a future day is 0;
 * today is the elapsed fraction of 24h (at least one minute, so a tiny elapsed window cannot explode an average).
 */
export function dayWeight(dayStart, now = Date.now()) {
  const start = startOfDay(dayStart);
  if (now >= start + DAY) return 1;
  if (now <= start) return 0;
  return Math.max(1 / 1440, (now - start) / DAY);
}
/** Aggregate a run of days (oldest..newest given as list of clockDay results): per-day averages over days with any entry. */
function aggDays(list, now, { weightPartial = false } = {}) {
  const used = list.filter((d) => d.sleeps.length || d.feeds.length || d.diapers.length);
  const w = (d) => (weightPartial ? dayWeight(d.dayStart, now) : 1);
  const n = used.reduce((a, d) => a + w(d), 0) || 1, sum = (k) => used.reduce((a, d) => a + (d.stats[k] || 0), 0);
  // feed interval: every gap between consecutive feeds inside the window (also across midnight), so one busy day doesn't weigh like a quiet one
  let gapSum = 0, gapN = 0;
  if (used.length) {
    const from = Math.min(...list.map((d) => d.dayStart)), to = Math.max(...list.map((d) => d.dayStart)) + DAY;
    const ts = [];
    for (const d of list) for (const { e } of d.feeds) if (e.t >= from && e.t < to && e.t <= now) ts.push(e.t);
    ts.sort((a, b) => a - b);
    for (let i = 1; i < ts.length; i++) { const g = ts[i] - ts[i - 1]; if (g <= 12 * HOUR) { gapSum += g; gapN++; } }
  }
  let longestDay = null, longest = 0;
  for (const d of used) if ((d.stats.longestSleepMs || 0) > longest) { longest = d.stats.longestSleepMs; longestDay = d.dayStart; }
  return {
    daysWithData: used.length,
    weightSum: n,
    avg: {
      ml: sum("ml") / n, feeds: sum("feeds") / n, formula: sum("formula") / n, breast: sum("breast") / n,
      sleepMs: sum("sleepMs") / n, pee: sum("pee") / n, poop: sum("poop") / n, diapers: sum("diapers") / n,
      avgFeedGapMs: gapN ? gapSum / gapN : null,
      longestSleepMs: longest || null, longestDay,
    },
  };
}
/**
 * `days` days ending at `endDay` (newest first = outer ring) + per-day averages over the days that have any entry.
 * from/to = first/last day start of the window, so labels can show the exact dates the numbers are based on.
 * Today (still in progress) is drawn on the outer ring. Its totals go into the average with weight = elapsed
 * fraction of the day, so a partial morning is not treated as a whole day (and is not dropped either).
 */
export function clockWeek(entries, endDay, days = 7, now = Date.now()) {
  const list = [];
  for (let i = 0; i < days; i++) list.push(clockDay(entries, addDays(startOfDay(endDay), -i), now));
  for (const d of list) d.partial = d.dayStart + DAY > now;
  const a = aggDays(list, now, { weightPartial: true });
  return { days: list, from: list[list.length - 1].dayStart, to: list[0].dayStart, daysWithData: a.daysWithData, weightSum: a.weightSum, avg: a.avg };
}
/**
 * One column of the 비교 (compare) view: a day, or a range of `len` days starting at `fromDay`.
 * len 1 -> that day's totals (today counts "so far", not projected); len > 1 -> per-day averages over logged
 * days, with today weighted by the elapsed fraction of the day.
 */
export function compareItem(entries, fromDay, len = 1, now = Date.now()) {
  const start = startOfDay(fromDay), list = [];
  for (let i = 0; i < len; i++) list.push(clockDay(entries, addDays(start, i), now));
  for (const d of list) d.partial = d.dayStart + DAY > now;
  const future = list.filter((d) => d.dayStart > now).length;
  const a = aggDays(list, now, { weightPartial: len > 1 });
  return { from: start, to: list[list.length - 1].dayStart, len, days: list, partial: list.some((d) => d.isToday), future: future === len, daysWithData: a.daysWithData, weightSum: a.weightSum, s: a.avg };
}
/** Differences of `item` vs `base` (both compareItem results). null where either side has no value. */
export function compareDiff(base, item) {
  const out = {};
  for (const k of ["ml", "feeds", "avgFeedGapMs", "sleepMs", "longestSleepMs", "pee", "poop", "diapers"]) {
    const a = base.s[k], b = item.s[k];
    out[k] = a == null || b == null || !base.daysWithData || !item.daysWithData ? null : b - a;
  }
  return out;
}

/**
 * Make edited times sensible when only the clock time was changed in the date-time picker:
 *  - a start time in the future (by less than a day) means "last night" -> moved back one day
 *  - a sleep end before its start (by less than a day) means "the next morning" -> moved forward one day
 *  - a sleep end in the future (by less than a day, and still after the start) -> moved back one day
 * Returns { t, end, rolled } or { error: "future" | "end_before_start" | "end_future" }.
 */
export function fixEditTimes(t, end, now = Date.now(), slack = 5 * MIN) {
  let rolled = false;
  if (t > now + slack) { if (t - DAY <= now + slack) { t -= DAY; rolled = true; } else return { error: "future" }; }
  if (end != null) {
    if (end < t) { if (end + DAY >= t && end + DAY <= now + slack) { end += DAY; rolled = true; } else return { error: "end_before_start" }; }
    if (end > now + slack) { if (end - DAY >= t) { end -= DAY; rolled = true; } else return { error: "end_future" }; }
  }
  return { t, end, rolled };
}
/** Sync/attribution fields that an edit must keep (otherwise the edit can lose last-write-wins and the "by" tag). */
export function keepMeta(prev) {
  if (!prev) return {};
  const m = {}; for (const k of ["updatedAt", "by", "dev", "note"]) if (prev[k] != null) m[k] = prev[k];
  return m;
}

// ---------- voice: several things in one sentence ("분유 90 먹고 잠들었어", "fed 120 then fell asleep") ----------
const SPLIT_KO = /\s*(?:,|그리고|그\s*다음에?|다음에|하고\s*나서|고\s*나서)\s*|(?<=먹|마시|먹이|싸|하|갈|재우)고\s+|(?<=었|았|였)다가\s*/;
const SPLIT_EN = /\s*(?:,|\band then\b|\bthen\b|\band (?=(?:she |he |baby |they )?(?:fell|went|woke|had|pooped|peed|ate|drank|took|slept|nursed|fed)\b))\s*/i;
/** Parse one utterance into a list of commands (usually one). Returns [] when nothing was understood. */
export function parseCommands(text, now = Date.now(), lang = "ko") {
  if (lang === "pt") return parseCommands(ptToEn(text), now, "en"); // Portuguese -> the English parser
  const parse = lang === "en" ? parseCommandEn : parseCommand;
  const whole = parse(text, now);
  if (whole && whole.action === "diaper") return [whole];        // "쉬하고 응가했어" = one diaper (both)
  const parts = String(text || "").split(lang === "en" ? SPLIT_EN : SPLIT_KO).map((x) => x && x.trim()).filter(Boolean);
  if (parts.length > 1) {
    const cmds = parts.map((p) => parse(p, now));
    if (cmds.every(Boolean)) {
      const out = [];
      for (const c of cmds) {
        const prev = out[out.length - 1];
        // "3시에 잠들었다가 5시에 깼어" -> one finished sleep 3:00~5:00
        if (prev && prev.action === "sleep_start" && c.action === "sleep_end" && c.t > prev.t) { out[out.length - 1] = { action: "sleep", t: prev.t, end: c.t }; continue; }
        out.push(c);
      }
      return out;
    }
  }
  return whole ? [whole] : [];
}
/** Feed with neither amount nor minutes: ask for the amount instead of saving a blank feed. */
export function needsDetail(c) { return !!c && c.action === "feed" && !c.ml && !c.min; }
/** Speech confidence below this (when the engine reports one) asks before saving. 0 = engine gave none. */
export const LOW_CONFIDENCE = 0.45;
export function isLowConfidence(conf) { return typeof conf === "number" && conf > 0 && conf < LOW_CONFIDENCE; }
/** Comparable form of a phrase (duplicate guard in hands-free mode). */
export function phraseKey(text) { return String(text || "").toLowerCase().normalize("NFC").replace(/[\s.,!?~]+/g, ""); }

// ---------- URL commands (/tracker?say=분유%20100, /tracker?shortcut=voice) for Bixby routines / home-screen widgets ----------
// The URL carries only the action. Which baby/family it goes to comes from this browser's own localStorage session.
export const SAY_KEY = STORAGE_KEY + "_say";
export const SAY_DUP_MS = 60000;
export const sayKey = phraseKey;
/** Clean the raw ?say= value (trim, collapse spaces, cap length). Returns "" when empty. */
export function cleanSay(text) { return String(text || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80); }
/** true when the same text was logged through a URL command less than SAY_DUP_MS ago (double open, reload, routine fired twice). */
export function isRecentSay(last, text, now = Date.now()) {
  return !!(last && last.k === sayKey(text) && now - Number(last.at) >= 0 && now - Number(last.at) < SAY_DUP_MS);
}
export const sayNeedsDetail = needsDetail;
/** Short label for the confirmation banner (no emoji, no time). */
export function sayLabel(c) {
  if (!c) return "";
  if (c.action === "feed") { const p = [c.kind === "breast" ? "모유" : "분유"]; if (c.ml) p.push(`${c.ml}ml`); if (c.min) p.push(`${c.min}분`); return p.join(" "); }
  if (c.action === "diaper") return `기저귀 ${DIAPER_LABEL[c.d]}`;
  if (c.action === "sleep_start") return "잠듦";
  if (c.action === "sleep_end") return "깸";
  if (c.action === "sleep") return `수면 ${fmtDur(c.end - c.t)}`;
  return "";
}
export function sayLabelEn(c) {
  if (!c) return "";
  if (c.action === "feed") { const p = [c.kind === "breast" ? "breast milk" : "formula"]; if (c.ml) p.push(`${c.ml} ml`); if (c.min) p.push(`${c.min} min`); return p.join(" "); }
  if (c.action === "diaper") return `diaper (${DIAPER_LABEL_EN[c.d]})`;
  if (c.action === "sleep_start") return "fell asleep";
  if (c.action === "sleep_end") return "woke up";
  if (c.action === "sleep") return `sleep ${fmtDurEn(c.end - c.t)}`;
  return "";
}
/** Build a say URL (setup page / tests). */
const LANG_PREFIX = { en: "/en", pt: "/pt-br" };
export function sayUrl(origin, text, lang = "ko") { return `${origin}${LANG_PREFIX[lang] || ""}/tracker?say=${encodeURIComponent(text)}`; }
export function voiceUrl(origin, lang = "ko") { return `${origin}${LANG_PREFIX[lang] || ""}/tracker?shortcut=voice`; }
/** Fixed one-shot commands offered on the Bixby setup page (routine name -> phrase). */
export const BIXBY_COMMANDS = {
  ko: [["분유 100", "분유 100"], ["분유 120", "분유 120"], ["분유 150", "분유 150"], ["모유 15분", "모유 15분"], ["잠들었어", "잠들었어"], ["깼어", "깼어"], ["기저귀 소변", "기저귀 소변"], ["기저귀 대변", "기저귀 대변"], ["기저귀 둘 다", "기저귀 둘 다"]],
  pt: [["Fórmula 100", "fórmula 100"], ["Fórmula 120", "fórmula 120"], ["Fórmula 150", "fórmula 150"], ["Peito 15 min", "peito 15 minutos"], ["Bebê dormiu", "dormiu"], ["Bebê acordou", "acordou"], ["Fralda xixi", "fralda xixi"], ["Fralda cocô", "fralda cocô"], ["Xixi e cocô", "xixi e cocô"]],
  en: [["Formula 100", "formula 100"], ["Formula 120", "formula 120"], ["Formula 150", "formula 150"], ["Breastfed 15 min", "breastfed 15 minutes"], ["Baby asleep", "fell asleep"], ["Baby awake", "woke up"], ["Wet diaper", "wet diaper"], ["Dirty diaper", "dirty diaper"], ["Wet and dirty", "poop and pee"]],
};

/**
 * Undo a set of local changes record by record (not by restoring an old snapshot of the whole list, which would also
 * delete anything a family member added in the meantime). changes: [{ id, prev }] (prev null = the record was new).
 */
export function revertChanges(entries, changes) {
  let list = entries;
  for (const { id, prev } of [...changes].reverse()) {
    if (!prev) list = list.filter((x) => x.id !== id);
    else list = list.some((x) => x.id === id) ? list.map((x) => (x.id === id ? prev : x)) : [prev, ...list];
  }
  return sortEntries(list);
}

// ---------- daily time-of-day timeline (read-only, pure) ----------
/**
 * One day laid out on a 0–24h axis. Sleep spans are clipped to the day; `fromPrev` / `toNext` flag
 * sleep that started the day before / runs past midnight. A sleep with no end counts up to `now` (live).
 * feeds: [{ t, h, ml, kind, min, e }] where h = hour of day (0–24, fractional). Missing ml → ml: null.
 */
export function timelineDay(entries, dayStart, now = Date.now()) {
  const c = clockDay(entries, dayStart, now), dayEnd = dayStart + DAY;
  const sleeps = c.sleeps.map((s) => ({
    h0: s.a * 24, h1: s.b * 24, from: s.from, to: s.to, live: s.live, id: s.id,
    fromPrev: s.from < dayStart, toNext: !!s.to && s.to > dayEnd,
    ms: Math.max(0, Math.min(s.to || now, now) - s.from),
  }));
  const feeds = c.feeds.map(({ f, e }) => ({ t: e.t, h: f * 24, ml: cleanMl(e.ml) ?? null, kind: e.kind || "formula", min: Number(e.min) || 0, e }));
  const diapers = c.diapers.map(({ f, e }) => ({ t: e.t, h: f * 24, d: e.d, e }));
  return { ...c, sleeps, feeds, diapers, noMl: feeds.filter((x) => x.kind !== "breast" && x.ml == null).length, nowH: c.nowFrac == null ? null : c.nowFrac * 24 };
}

/**
 * Per-slot + cumulative formula for TODAY (actual) and for the last `days` FULL days (average).
 * Average never falls back to today — if no prior days have formula, days=0 and avg slots are empty.
 * Today: slots after the current hour are marked future=true (not yet). Breast excluded; no-ml feeds count as feeds with 0 ml.
 * Returns {
 *   days, hasAvg,
 *   today: { ml, feeds, nowH, cum: [{from,until,ml,feeds,slotMl,slotFeeds,future,any}] },
 *   avg:   { ml, feeds, cum: [...] }  // empty cum when !hasAvg
 * }
 */
export function todayVsAverage(entries, now = Date.now(), days = 7) {
  const today = startOfDay(now), nowH = Math.min(24, Math.max(0, (now - today) / HOUR));
  const pack = (from, to, { clipToNow = false } = {}) => {
    const used = new Set(), sums = Array.from({ length: 8 }, () => ({ ml: 0, feeds: 0 }));
    for (const e of entries) {
      if (e.type !== "feed" || e.kind === "breast" || e.t < from || e.t >= to || e.t > now) continue;
      used.add(startOfDay(e.t));
      const k = Math.min(7, Math.floor(new Date(e.t).getHours() / 3));
      sums[k].feeds++; sums[k].ml += cleanMl(e.ml) || 0;
    }
    const n = used.size, div = n || 1;
    let ml = 0, feeds = 0;
    const cum = sums.map((s, i) => {
      const fromH = i * 3, until = fromH + 3;
      const future = clipToNow && fromH >= nowH;
      const any = s.feeds > 0;
      if (!future) { ml += s.ml / div; feeds += s.feeds / div; }
      return { from: fromH, until, ml: future ? null : ml, feeds: future ? null : feeds,
        slotMl: future ? null : s.ml / div, slotFeeds: future ? null : s.feeds / div, future, any: future ? false : any };
    });
    // for future rows, keep last known cumulative for "so far" comparison against avg at current time
    return { days: n, ml: sums.reduce((a, s) => a + s.ml, 0) / (n || 1), feeds: sums.reduce((a, s) => a + s.feeds, 0) / (n || 1), cum };
  };
  const avgRaw = pack(startOfDay(today - days * DAY + 2 * HOUR), today);
  const todayRaw = pack(today, today + DAY, { clipToNow: true });
  // recompute today's totals from non-future only
  const lastDone = [...todayRaw.cum].reverse().find((c) => !c.future);
  return {
    days: avgRaw.days, hasAvg: avgRaw.days > 0,
    today: { ml: lastDone ? lastDone.ml : 0, feeds: lastDone ? lastDone.feeds : 0, nowH, cum: todayRaw.cum },
    avg: { ml: avgRaw.days ? avgRaw.ml : 0, feeds: avgRaw.days ? avgRaw.feeds : 0, cum: avgRaw.days ? avgRaw.cum : todayRaw.cum.map((c) => ({ ...c, ml: null, feeds: null, slotMl: null, slotFeeds: null, any: false, future: false })) },
  };
}
/** @deprecated keep for older tests; average over last `days` full days, no today fallback. */
export function slotAverages(entries, now = Date.now(), days = 7) {
  const r = todayVsAverage(entries, now, days);
  if (!r.hasAvg) return { days: 0, today: false, slots: Array.from({ length: 8 }, (_, i) => ({ from: i * 3, to: i * 3 + 3, ml: 0, feeds: 0, any: false })), ml: 0, feeds: 0 };
  return { days: r.days, today: false, slots: r.avg.cum.map((c) => ({ from: c.from, to: c.until, ml: c.slotMl, feeds: c.slotFeeds, any: c.any })), ml: r.avg.ml, feeds: r.avg.feeds };
}
export function cumulativeAverages(entries, now = Date.now(), days = 7) {
  const r = todayVsAverage(entries, now, days);
  if (!r.hasAvg) return { days: 0, today: false, slots: [], cum: [], ml: 0, feeds: 0 };
  return { days: r.days, today: false, slots: r.avg.cum.map((c) => ({ from: c.from, to: c.until, ml: c.slotMl, feeds: c.slotFeeds, any: c.any })), cum: r.avg.cum, ml: r.avg.ml, feeds: r.avg.feeds };
}


// ---------- Brazilian Portuguese (pt-BR, /pt-br/tracker) ----------
export function fmtDurPt(ms) {
  if (ms == null) return "-";
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 1) return "agora";
  const h = Math.floor(m / 60), r = m % 60;
  return h ? (r ? `${h}h ${r}min` : `${h}h`) : `${r}min`;
}
export function fmtClockPt(ms) { const d = new Date(ms); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
export const DIAPER_LABEL_PT = { pee: "xixi", poop: "cocô", both: "xixi + cocô" };
export function describePt(e, now = Date.now()) {
  if (e.type === "feed") {
    const parts = [e.kind === "breast" ? "Leite materno" : "Fórmula"]; if (e.ml) parts.push(`${e.ml} ml`); if (e.min) parts.push(`${e.min} min`);
    return parts.join(" ");
  }
  if (e.type === "sleep") return e.end ? `Sono ${fmtDurPt(e.end - e.t)}` : `Dormindo (há ${fmtDurPt(now - e.t)})`;
  if (e.type === "diaper") return `Fralda: ${DIAPER_LABEL_PT[e.d] || ""}`;
  return "";
}
export function describeCommandPt(c, now = Date.now()) {
  if (!c) return "";
  const when = Math.abs(now - c.t) < 2 * MIN ? "agora" : fmtClockPt(c.t);
  if (c.action === "feed") {
    const parts = [c.kind === "breast" ? "Leite materno" : "Fórmula"]; if (c.ml) parts.push(`${c.ml} ml`); if (c.min) parts.push(`${c.min} min`);
    return `🍼 ${parts.join(" ")} · ${when}`;
  }
  if (c.action === "diaper") return `${c.d === "poop" ? "💩" : c.d === "both" ? "💩💧" : "💧"} Fralda: ${DIAPER_LABEL_PT[c.d]} · ${when}`;
  if (c.action === "sleep_start") return `😴 Dormiu · ${when}`;
  if (c.action === "sleep_end") return `🌤️ Acordou · ${when}`;
  if (c.action === "sleep") return `😴 Sono ${fmtDurPt(c.end - c.t)} (${fmtClockPt(c.t)}–${fmtClockPt(c.end)})`;
  return "";
}
export function sayLabelPt(c) {
  if (!c) return "";
  if (c.action === "feed") { const p = [c.kind === "breast" ? "leite materno" : "fórmula"]; if (c.ml) p.push(`${c.ml} ml`); if (c.min) p.push(`${c.min} min`); return p.join(" "); }
  if (c.action === "diaper") return `fralda (${DIAPER_LABEL_PT[c.d]})`;
  if (c.action === "sleep_start") return "dormiu";
  if (c.action === "sleep_end") return "acordou";
  if (c.action === "sleep") return `sono ${fmtDurPt(c.end - c.t)}`;
  return "";
}
const PT_UNITS = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300, quatrocentos: 400 };
const PT_NUM_RE = new RegExp(`\\b(?:${Object.keys(PT_UNITS).join("|")})(?:\\s+e\\s+(?:${Object.keys(PT_UNITS).join("|")}))*\\b`, "g");
/** Translate a spoken / typed Brazilian Portuguese log phrase into the English phrase parseCommandEn understands. */
export function ptToEn(text) {
  let s = " " + String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[!?]/g, " ").replace(/\s+/g, " ") + " ";
  s = s.replace(/\s+e\s+(?=(?:acordou|dormiu|adormeceu|mamou|tomou|bebeu|fez|depois|trocou)\b)/g, " , ");
  s = s.replace(/\bmeia hora\b/g, "30 minutos").replace(/\buma hora e meia\b/g, "90 minutos").replace(/\b(\d+) horas? e meia\b/g, (_, h) => `${h * 60 + 30} minutos`);
  s = s.replace(PT_NUM_RE, (run) => { // "cento e vinte" -> 120, "uma" -> 1
    const n = run.split(/\s+e\s+/).reduce((a, w) => a + (PT_UNITS[w] ?? 0), 0);
    return String(n);
  });
  s = s.replace(/\b1 hora\b/g, "1 hour");
  s = s.replace(/\b(\d+)\s*(ml\s+)?de\s+(formula|mamadeira|leite artificial|leite materno|leite)\b/g, "$3 $1 $2"); // "120 (ml) de fórmula" -> "formula 120"
  const rules = [
    [/\b(?:ha|faz)\s+(\d+)\s*(?:min(?:uto)?s?)\b/g, "$1 minutes ago"], [/\b(?:ha|faz)\s+(\d+)\s*(?:horas?|h)\b/g, "$1 hours ago"],
    [/\b(\d+)\s*(?:min(?:uto)?s?)\s+atras\b/g, "$1 minutes ago"], [/\b(\d+)\s*(?:horas?|h)\s+atras\b/g, "$1 hours ago"],
    [/\b(?:as|a)\s+(\d{1,2})(?:h|:)?(\d{2})?\s*(?:horas?\s*)?da (?:tarde|noite)\b/g, (_, h, m) => ` at ${h}${m ? ":" + m : ""} pm `],
    [/\b(?:as|a)\s+(\d{1,2})(?:h|:)?(\d{2})?\s*(?:horas?\s*)?da (?:manha|madrugada)\b/g, (_, h, m) => ` at ${h}${m ? ":" + m : ""} am `],
    [/\bas\s+(\d{1,2})(?:h|:)(\d{2})\b/g, " at $1:$2 "], [/\bas\s+(\d{1,2})h?\b/g, " at $1 "],
    [/\bagora\b|\bagorinha\b/g, " just now "],
    [/\b(?:e )?(?:depois|e entao|entao)\b/g, " then "],
    [/\b(?:xixi e coco|coco e xixi|os dois|ambos)\b/g, " poop and pee "],
    [/\bxixi\b|\bmolhada\b|\burina\b/g, " wet "], [/\bcoco\b|\bsuja\b|\bevacuou\b|\bfez coco\b/g, " poop "], [/\bfraldas?\b/g, " diaper "],
    [/\b(?:dormiu|tirou uma soneca de|cochilou)\s+(?:por\s+)?(\d+)\s*(?:horas?|h)\b(?!\s*ago)\s*(?:e\s*)?(?:(\d+)\s*min(?:uto)?s?\b)?/g, (_, h, m) => ` slept ${h} hours ${m ? m + " minutes" : ""} `],
    [/\b(?:dormiu|tirou uma soneca de|cochilou)\s+(?:por\s+)?(\d+)\s*min(?:uto)?s?\b(?!\s*ago)/g, " slept $1 minutes "], // "dormiu há 20 min" (= 20 minutes ago) is not a duration
    [/\bacordou\b|\bacordado\b|\bacordada\b|\bdespertou\b|\blevantou\b/g, " woke up "],
    [/\bdormiu\b|\badormeceu\b|\bpegou no sono\b|\bfoi dormir\b|\bcomecou a dormir\b|\bdormindo\b|\bsoneca\b|\bcochilando\b|\bcochilou\b/g, " fell asleep "],
    [/\bambos os lados\b|\bos dois lados\b/g, " both sides "], [/\blado esquerdo\b|\bpeito esquerdo\b|\bseio esquerdo\b/g, " left side "], [/\blado direito\b|\bpeito direito\b|\bseio direito\b/g, " right side "],
    [/\bleite materno\b|\bpeito\b|\bseio\b|\bamamentei\b|\bamamentou\b|\bamamentacao\b|\bmamou no peito\b/g, " breastfed "],
    [/\bformula\b|\bmamadeira\b|\bleite artificial\b/g, " formula "],
    [/\bmamou\b|\btomou\b|\bbebeu\b|\bmamada\b|\bcomeu\b|\bmamar\b/g, " fed "], [/\bleite\b/g, " milk "],
    [/\b(\d+)\s*(?:ml|mls|mililitros?)\b/g, " $1 ml "], [/\b(\d+)\s*min(?:uto)?s?\b/g, " $1 minutes "], [/\b(\d+)\s*(?:horas?|h)\b/g, " $1 hours "],
  ];
  for (const [re, to] of rules) s = s.replace(re, to);
  return s.replace(/\s+/g, " ").trim();
}
export function parseCommandPt(text, now = Date.now()) { return parseCommandEn(ptToEn(text), now); }
