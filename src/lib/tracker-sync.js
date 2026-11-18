// Browser-side family sync for the baby log. localStorage stays the source of truth (offline-first);
// when a family code is set, local changes are queued in an outbox and pushed/pulled via /api/family/sync.
import * as T from "./tracker-core.js";

const K = { fam: T.STORAGE_KEY + "_family", outbox: T.STORAGE_KEY + "_outbox", tombs: T.STORAGE_KEY + "_tombs", dev: T.STORAGE_KEY + "_dev", viewBak: T.STORAGE_KEY + "_viewbak", viewGone: T.STORAGE_KEY + "_viewgone", cut: T.STORAGE_KEY + "_cut" };
const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export function createSync({ getEntries, setEntries, onState, api = "/api/family/" }) {
  let fam = read(K.fam, null);          // { code, cursor, nick, role?: "view" } (no role = full edit access, as before)
  let outbox = read(K.outbox, {});
  let tombs = read(K.tombs, {});
  let dev = read(K.dev, null);
  if (!dev) { dev = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => (b % 36).toString(36)).join(""); write(K.dev, dev); }
  let members = [], status = fam ? "idle" : "off", lastSync = 0, busy = null, again = false, debounce = 0, nickLocal = read(K.fam + "_nick", "");
  const isView = () => !!(fam && fam.role === "view");
  // a view-only device whose link stopped working (새 코드 / sharing ended) stays read-only instead of quietly becoming an editable, unshared log
  let viewGone = !fam && !!read(K.viewGone, false);
  const setViewGone = (v) => { viewGone = !!v; write(K.viewGone, viewGone || null); };
  // an EDITING device whose family code changed (새 코드 elsewhere): remembered across reloads so the page can explain how to reconnect
  let cut = !fam && !!read(K.cut, null);
  const setCut = (v) => { cut = !!v; write(K.cut, v ? Date.now() : null); };
  const emit = () => onState && onState({ cut, joined: !!fam, code: fam && fam.code, nick: nick(), status, lastSync, members, pending: Object.keys(outbox).length, dev, view: isView(), viewGone });
  const nick = () => (fam && fam.nick) || nickLocal || "";
  const saveFam = () => write(K.fam, fam);
  async function call(action, body) {
    const r = await fetch(api + action, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, dev, nick: nick() }), credentials: "same-origin", cache: "no-store" });
    let data = null; try { data = await r.json(); } catch {}
    if (!r.ok) { const e = new Error((data && data.error) || "http_" + r.status); e.status = r.status; e.code = data && data.error; throw e; }
    return data;
  }
  function queueAll() { // every local entry + known tombstone goes into the outbox (used on create/join)
    const now = Date.now();
    const me = nick();
    const list = getEntries().map((e) => {
      const own = !e.dev || e.dev === dev; // records made on this device before sharing was turned on
      if (e.updatedAt && (!own || e.by || !me) && e.dev) return e;
      return { ...e, updatedAt: e.updatedAt || now, ...(own && !e.by && me ? { by: me } : {}), dev: e.dev || dev };
    });
    if (list.some((e, i) => e !== getEntries()[i])) setEntries(list, { remote: true });
    outbox = T.addToOutbox(outbox, list, [], now);
    for (const [id, u] of Object.entries(tombs)) if (!outbox[id]) outbox[id] = { id, deleted: true, updatedAt: u };
    write(K.outbox, outbox);
  }
  async function runSync() {
    if (!fam) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { status = "offline"; emit(); return; }
    status = "syncing"; emit();
    try {
      for (let i = 0; i < 30; i++) {
        const sent = isView() ? [] : Object.values(outbox).slice(0, 500); // a view-only device never sends records
        const res = await call("sync", { code: fam.code, since: fam.cursor || 0, changes: sent });
        outbox = T.ackOutbox(outbox, sent); write(K.outbox, outbox);
        if (res.changes.length) {
          const m = T.mergeRemote(getEntries(), tombs, res.changes);
          tombs = m.tombs; write(K.tombs, tombs);
          if (m.changed) setEntries(m.entries, { remote: true });
        }
        fam.cursor = res.cursor; if (res.role === "view" && fam.role !== "view") fam.role = "view"; saveFam(); members = res.members || members;
        if (!res.more && (isView() || !Object.keys(outbox).length)) break;
      }
      status = "synced"; lastSync = Date.now();
    } catch (e) {
      if (e.status === 404 && e.code === "unknown_code") { if (isView()) setViewGone(true); else setCut(true); status = "revoked"; fam = null; saveFam(); }
      else status = e.status ? "error" : "offline";
    }
    emit();
  }
  function sync() { // serialise runs; coalesce requests that arrive while one is in flight
    if (busy) { again = true; return busy; }
    busy = runSync().finally(() => { busy = null; if (again) { again = false; sync(); } });
    return busy;
  }
  /** After joining: a view-only device shows only the family log. Its own entries are parked (not shared) and come back on leave. */
  function afterJoin(role) {
    if (role === "view") {
      fam.role = "view"; saveFam();
      const own = getEntries();
      if (own.length && !read(K.viewBak, null)) write(K.viewBak, own);
      outbox = {}; write(K.outbox, outbox); tombs = {}; write(K.tombs, tombs);
      setEntries([], { remote: true });
    } else queueAll();
  }
  return {
    dev, nick, get joined() { return !!fam; }, get code() { return fam && fam.code; }, get view() { return isView(); },
    /** true when this device must not record: joined view-only, or a view-only link that stopped working */
    get cut() { return cut; },
    get locked() { return isView() || viewGone; }, get viewGone() { return viewGone; },
    /** Is this a full family code or a view-only code? (no joining, no data) */
    async peek(code) { const c = T.normFamilyCode(code); if (!c) { const e = new Error("bad_code"); e.code = "bad_code"; throw e; } return call("peek", { code: c }); },
    /** After a view-only link stopped working: go back to this device's own log (the entries it had before joining). */
    unlockLocal() { if (fam || !viewGone) return; const bak = read(K.viewBak, []); write(K.viewBak, null); tombs = {}; write(K.tombs, tombs); setViewGone(false); setEntries(Array.isArray(bak) ? bak : [], { remote: true }); emit(); },
    state: emit,
    /** Called by the page after every local save with what changed. */
    recordLocal(upserts, deletes, now) {
      for (const id of deletes) tombs[id] = now; for (const e of upserts) delete tombs[e.id];
      write(K.tombs, tombs);
      if (!fam || isView()) return;
      outbox = T.addToOutbox(outbox, upserts, deletes, now); write(K.outbox, outbox);
      clearTimeout(debounce); debounce = setTimeout(sync, 800); emit();
    },
    setNick(n) { n = String(n || "").trim().slice(0, 20); nickLocal = n; write(K.fam + "_nick", n); if (fam) { fam.nick = n; saveFam(); sync(); } emit(); },
    async create() { const r = await call("create", {}); setViewGone(false); setCut(false); fam = { code: r.code, cursor: 0, nick: nickLocal }; saveFam(); members = r.members; queueAll(); await sync(); return r.code; },
    async join(code) { const c = T.normFamilyCode(code); if (!c) { const e = new Error("bad_code"); e.code = "bad_code"; throw e; }
      const r = await call("join", { code: c }); const wasGone = viewGone; setViewGone(false); setCut(false); fam = { code: c, cursor: 0, nick: nickLocal }; saveFam(); members = r.members;
      if (wasGone && r.role === "view") { fam.role = "view"; saveFam(); outbox = {}; write(K.outbox, outbox); tombs = {}; write(K.tombs, tombs); setEntries([], { remote: true }); } // still parked from before
      else if (wasGone) { const bak = read(K.viewBak, []); write(K.viewBak, null); setEntries(Array.isArray(bak) ? bak : [], { remote: true }); afterJoin(r.role); }
      else afterJoin(r.role); await sync(); return c; },
    async leave() {
      const f = fam; fam = null; saveFam(); setCut(false); outbox = {}; write(K.outbox, outbox); status = "off"; members = [];
      if (f && f.role === "view") { const bak = read(K.viewBak, []); write(K.viewBak, null); tombs = {}; write(K.tombs, tombs); setEntries(Array.isArray(bak) ? bak : [], { remote: true }); }
      emit(); if (f) { try { await call("leave", { code: f.code }); } catch {} } },
    /** View-only share link code (editors get the family's view code; a viewer gets its own). Cached on the family record. */
    async viewCode() {
      if (!fam) { const e = new Error("not_joined"); e.code = "not_joined"; throw e; }
      if (isView()) return fam.code;
      if (fam.view && fam.viewFor === fam.code) return fam.view;
      const r = await call("view-code", { code: fam.code }); fam.view = r.view; fam.viewFor = fam.code; saveFam(); return r.view;
    },
    /** One-time code that lets another browser / the installed app become a device of this family.
     *  Pushes this device's unsynced records first, so nothing is left behind here. */
    async moveCode() {
      if (isView()) { const e = new Error("read_only"); e.code = "read_only"; throw e; }
      if (!fam) { const e = new Error("not_joined"); e.code = "not_joined"; throw e; }
      await sync();
      if (Object.keys(outbox).length) { const e = new Error("pending"); e.code = "pending"; throw e; }
      return call("move", { code: fam.code }); // { move, expires }
    },
    /** Take over a move code: join that family and merge this device's own records into it (none are dropped). */
    async claim(move) { const m = T.normMoveCode(move); if (!m) { const e = new Error("bad_move"); e.code = "bad_move"; throw e; }
      const r = await call("claim", { move: m }); if (viewGone) { const bak = read(K.viewBak, []); write(K.viewBak, null); setEntries(Array.isArray(bak) ? bak : [], { remote: true }); } setViewGone(false); setCut(false); fam = { code: r.code, cursor: 0, nick: nickLocal }; saveFam(); members = r.members; queueAll(); await sync(); return r.code; },
    /** Move this device from its current family to the one behind a move code (claim first, so a bad/expired code changes nothing;
     *  then leave the old family). Every record on this device goes along (a viewer's family copy is dropped, its own records come back). */
    async switchClaim(move) { const m = T.normMoveCode(move); if (!m) { const e = new Error("bad_move"); e.code = "bad_move"; throw e; }
      const old = fam; if (!old) return this.claim(m);
      if (!isView()) { try { await sync(); } catch {} } // push what this device still has for the old family first
      const r = await call("claim", { move: m });
      if (old.role === "view") { const bak = read(K.viewBak, []); write(K.viewBak, null); tombs = {}; write(K.tombs, tombs); setEntries(Array.isArray(bak) ? bak : [], { remote: true }); }
      fam = { code: r.code, cursor: 0, nick: old.nick || nickLocal }; saveFam(); setCut(false); setViewGone(false); members = r.members; outbox = {}; write(K.outbox, outbox); queueAll();
      try { await call("leave", { code: old.code, unless: r.code }); } catch {} // (the server skips this if both codes are the same family)
      await sync(); return r.code; },
    /** Look at a move code without using it: { same } = it is for the family this device is already in. */
    async checkMove(move) { const m = T.normMoveCode(move); if (!m) { const e = new Error("bad_move"); e.code = "bad_move"; throw e; } return call("claim", { move: m, check: true, from: fam ? fam.code : "" }); },
    get memberCount() { return (members || []).length; },
    async regen() { if (!fam || isView()) return; await sync(); const r = await call("regen", { code: fam.code }); fam = { ...fam, code: r.code }; saveFam(); members = r.members; await sync(); return r.code; },
    sync,
  };
}
