// Family sharing for the growth page: birth date + milestone marks + photos through the same family code as the tracker.
// Without a family code nothing here runs; birth date, marks and photos stay on this device only.
// Photo record (IndexedDB) extra fields: shared: undefined (this device only) | "pending" (queued) | "yes" (in the family)
// | "err"; remote: true when downloaded from the family; by / mine; updatedAt (last local edit), syncedAt (server version we have).
import { mergeMarks, pendingMarks, mergeCustoms, pendingCustoms } from "./growth-core.js";

export const FAM_KEY = "nb_tracker_v1_family", DEV_KEY = "nb_tracker_v1_dev";

export function famInfo(ls) {
  try {
    const f = JSON.parse(ls.getItem(FAM_KEY) || "null"), dev = ls.getItem(DEV_KEY) || "";
    if (!f || typeof f.code !== "string" || !f.code) return null;
    return { code: f.code, nick: typeof f.nick === "string" ? f.nick : (ls.getItem(FAM_KEY + "_nick") || ""), dev, view: f.role === "view" };
  } catch { return null; }
}

export function makeApi(fetchFn, base = "") {
  return async (action, body) => {
    const r = await fetchFn(`${base}/api/family/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" });
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("json") ? await r.json().catch(() => null) : await r.blob();
    return { status: r.status, data };
  };
}

export async function blobToB64(blob) {
  const u8 = new Uint8Array(await blob.arrayBuffer()); let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}

// Birth date: last write wins between this device (st.birth / st.birthAt) and the family profile.
export async function syncBirth(api, fam, st) {
  const push = !fam.view && st.birth && (st.birthAt || 0) > (st.birthSynced || 0); // view-only devices never send
  const r = await api("profile", push ? { code: fam.code, dev: fam.dev, birth: st.birth, updatedAt: st.birthAt } : { code: fam.code, dev: fam.dev });
  if (r.status !== 200 || !r.data) return { status: r.status, changed: false };
  let changed = false;
  if (r.data.birth && (fam.view || r.data.updatedAt > (st.birthAt || 0)) && r.data.birth !== st.birth) { st.birth = r.data.birth; changed = true; }
  if (r.data.birth) { if (r.data.birth === st.birth) { st.birthAt = Math.max(st.birthAt || 0, r.data.updatedAt); st.birthSynced = st.birthAt; } }
  else if (push) st.birthSynced = st.birthAt; // server ignored it (e.g. invalid) - do not retry forever
  return { status: 200, changed };
}

// Milestone achievement marks: additive table milestone_marks, last-write-wins on updatedAt.
// st.marks = { [id]: { at, updatedAt, deleted? } }; st.marksSynced = number
export async function syncMarks(api, fam, st) {
  if (!st.marks || typeof st.marks !== "object") st.marks = {};
  const push = fam.view ? [] : pendingMarks(st.marks, st.marksSynced || 0);
  const r = await api("milestones", { code: fam.code, dev: fam.dev, changes: push });
  if (r.status !== 200 || !r.data) return { status: r.status, changed: false };
  const merged = mergeMarks(fam.view ? {} : st.marks, r.data.marks || []); // view-only: the family's marks only
  const marks = merged.marks, changed = fam.view ? JSON.stringify(marks) !== JSON.stringify(st.marks) : merged.changed;
  st.marks = marks;
  let max = st.marksSynced || 0;
  for (const c of push) if ((c.updatedAt || 0) > max) max = c.updatedAt;
  for (const m of r.data.marks || []) if ((m.updatedAt || 0) > max) max = m.updatedAt;
  st.marksSynced = max;
  return { status: 200, changed };
}

// Custom parent-typed milestones: additive table custom_milestones, last-write-wins on updatedAt.
// st.custom = { [id]: { text, at, achieved, updatedAt, deleted? } }; st.customSynced = number
export async function syncCustoms(api, fam, st) {
  if (!st.custom || typeof st.custom !== "object") st.custom = {};
  const push = fam.view ? [] : pendingCustoms(st.custom, st.customSynced || 0);
  const r = await api("custom-milestones", { code: fam.code, dev: fam.dev, changes: push });
  if (r.status !== 200 || !r.data) return { status: r.status, changed: false };
  const merged = mergeCustoms(fam.view ? {} : st.custom, r.data.customs || []); // view-only: the family's notes only
  const customs = merged.customs, changed = fam.view ? JSON.stringify(customs) !== JSON.stringify(st.custom) : merged.changed;
  st.custom = customs;
  let max = st.customSynced || 0;
  for (const c of push) if ((c.updatedAt || 0) > max) max = c.updatedAt;
  for (const m of r.data.customs || []) if ((m.updatedAt || 0) > max) max = m.updatedAt;
  st.customSynced = max;
  return { status: 200, changed };
}

// One photo sync round. deps: { api, list, put, del, thumb(blob) -> {blob,w,h}, delq: string[] (mutated), max: downloads per round }
export async function syncPhotos(fam, deps) {
  const { api, list, put, del, thumb, delq } = deps, max = deps.max ?? 60;
  const out = { up: 0, down: 0, removed: 0, edited: 0, errors: [], gone: false };
  const base = { code: fam.code, dev: fam.dev, nick: fam.nick };
  // 1. deletes made on this device (a view-only device skips 1 + 2: it never uploads, edits or deletes)
  for (const id of fam.view ? [] : [...delq]) {
    const r = await api("photo-del", { ...base, id });
    if (r.status === 404 && r.data && r.data.error === "unknown_code") { out.gone = true; return out; }
    if (r.status === 200 || r.status === 400) delq.splice(delq.indexOf(id), 1);
    else return out; // offline / rate limited: retry next round
  }
  // 2. uploads + edits
  for (const p of fam.view ? [] : await list()) {
    if (p.shared === "pending") {
      const r = await api("photo-put", { ...base, id: p.id, date: p.date, note: p.note || "", updatedAt: p.updatedAt || p.added || Date.now(), data: await blobToB64(p.blob) });
      if (r.status === 200) { await put({ ...p, shared: "yes", mine: true, by: fam.nick || "", syncedAt: r.data.photo.updatedAt }); out.up++; }
      else if (r.status === 410) { await del(p.id); out.removed++; }
      else if (r.status === 404 && r.data && r.data.error === "unknown_code") { out.gone = true; return out; }
      else if (r.status === 413 || r.status === 415) { await put({ ...p, shared: "err", shareErr: (r.data && r.data.error) || "too_large" }); out.errors.push(r.data && r.data.error); }
      else return out;
    } else if (p.shared === "yes" && (p.updatedAt || 0) > (p.syncedAt || 0)) {
      const r = await api("photo-put", { ...base, id: p.id, date: p.date, note: p.note || "", updatedAt: p.updatedAt });
      if (r.status === 200) { await put({ ...p, syncedAt: Math.max(p.updatedAt, r.data.photo.updatedAt), date: r.data.photo.date, note: r.data.photo.note }); out.edited++; }
      else if (r.status === 410) { await del(p.id); out.removed++; }
      else if (r.status !== 400) return out;
    }
  }
  // 3. pull: new photos, edits and deletes from other family devices
  const ls = await api("photo-list", { code: fam.code, dev: fam.dev });
  if (ls.status === 404 && ls.data && ls.data.error === "unknown_code") { out.gone = true; return out; }
  if (ls.status !== 200 || !ls.data) return out;
  const local = new Map((await list()).map((p) => [p.id, p]));
  let budget = max;
  for (const rp of ls.data.photos) {
    const lp = local.get(rp.id);
    if (rp.deleted) { if (lp && (lp.shared === "yes" || lp.remote)) { await del(rp.id); out.removed++; } continue; }
    if (!lp) {
      if (budget-- <= 0) continue;
      const g = await api("photo-get", { code: fam.code, dev: fam.dev, id: rp.id });
      if (g.status !== 200 || !g.data || typeof g.data.arrayBuffer !== "function") continue;
      const blob = g.data.type === "image/jpeg" ? g.data : new Blob([await g.data.arrayBuffer()], { type: "image/jpeg" });
      let th = null; try { th = await thumb(blob); } catch {}
      await put({ id: rp.id, date: rp.date, dateSource: "family", note: rp.note || "", blob, thumb: th ? th.blob : null, w: th ? th.w : 0, h: th ? th.h : 0,
        added: rp.createdAt || Date.now(), shared: "yes", remote: true, by: rp.by || "", mine: !!rp.mine, updatedAt: rp.updatedAt, syncedAt: rp.updatedAt });
      out.down++;
    } else if (rp.updatedAt > (lp.syncedAt || 0) && !((lp.updatedAt || 0) > (lp.syncedAt || 0))) {
      await put({ ...lp, date: rp.date, note: rp.note || "", by: rp.by || lp.by, shared: "yes", syncedAt: rp.updatedAt, updatedAt: rp.updatedAt }); out.edited++;
    } else if (lp.shared === undefined && lp.remote) await put({ ...lp, shared: "yes" });
  }
  out.more = budget < 0;
  return out;
}
