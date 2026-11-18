import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../src/lib/tracker-core.js";
const N = 1793300000000;
const f = (id, ml, u, extra = {}) => ({ id, type: "feed", t: N - 3600000, kind: "formula", ml, updatedAt: u, ...extra });

test("diffEntries: adds, edits, deletes; ignores pure updatedAt churn", () => {
  const a = [f("a", 100, 1), f("b", 90, 1)];
  const b = [f("a", 120, 1), f("c", 60, 2)];
  const d = T.diffEntries(a, b);
  assert.deepEqual(d.upserts.map((e) => e.id).sort(), ["a", "c"]); assert.deepEqual(d.deletes, ["b"]);
  assert.deepEqual(T.diffEntries(a, a.map((e) => ({ ...e, updatedAt: 5 }))).upserts.length, 0);
  // undo back to an older version counts as a change
  assert.equal(T.diffEntries([f("a", 120, 9)], [f("a", 100, 1)]).upserts.length, 1);
});
test("mergeRemote: newer remote wins, older loses, ties keep local", () => {
  const local = [f("a", 100, 10)];
  assert.equal(T.mergeRemote(local, {}, [f("a", 150, 11)]).entries[0].ml, 150);
  assert.equal(T.mergeRemote(local, {}, [f("a", 150, 9)]).entries[0].ml, 100);
  const tie = T.mergeRemote(local, {}, [f("a", 150, 10)]); assert.equal(tie.entries[0].ml, 100); assert.equal(tie.changed, false);
  assert.equal(T.mergeRemote(local, {}, [f("b", 60, 1)]).entries.length, 2, "new remote entry added");
});
test("mergeRemote: tombstones", () => {
  const local = [f("a", 100, 10), f("b", 90, 10)];
  const m = T.mergeRemote(local, {}, [{ id: "a", deleted: true, updatedAt: 11 }]);
  assert.deepEqual(m.entries.map((e) => e.id), ["b"]); assert.equal(m.tombs.a, 11); assert.equal(m.changed, true);
  assert.equal(T.mergeRemote(local, {}, [{ id: "a", deleted: true, updatedAt: 9 }]).entries.length, 2, "older delete loses to newer edit");
  assert.equal(T.mergeRemote([], { z: 20 }, [f("z", 60, 15)]).entries.length, 0, "older remote can't resurrect a newer local delete");
  const back = T.mergeRemote([], { z: 20 }, [f("z", 60, 25)]); assert.equal(back.entries.length, 1); assert.equal(back.tombs.z, undefined, "newer re-add revives");
  assert.equal(T.mergeRemote([], {}, [{ id: "q", deleted: true, updatedAt: 5 }]).tombs.q, 5, "unknown delete remembered");
});
test("mergeRemote: idempotent, validates, keeps by/dev", () => {
  const remote = [f("a", 100, 10, { by: "아빠", dev: "devB" }), { id: "bad", type: "rocket", t: 1, updatedAt: 3 }, null, { id: 5 }];
  const once = T.mergeRemote([], {}, remote), twice = T.mergeRemote(once.entries, once.tombs, remote);
  assert.equal(once.entries.length, 1); assert.equal(once.entries[0].by, "아빠"); assert.equal(once.entries[0].dev, "devB");
  assert.equal(twice.changed, false); assert.deepEqual(twice.entries, once.entries);
});
test("two devices converge regardless of order", () => {
  const A = [f("x", 100, 10)], ch = [f("x", 120, 12), { id: "x", deleted: true, updatedAt: 11 }, f("y", 60, 3)];
  const r1 = T.mergeRemote(A, {}, ch), r2 = T.mergeRemote(A, {}, [...ch].reverse());
  assert.deepEqual(r1.entries, r2.entries); assert.equal(r1.entries.find((e) => e.id === "x").ml, 120);
});
test("outbox add/ack", () => {
  let ob = T.addToOutbox({}, [f("a", 100, 10)], ["b"], 11);
  assert.deepEqual(Object.keys(ob).sort(), ["a", "b"]); assert.equal(ob.b.deleted, true);
  const sent = Object.values(ob);
  ob = T.addToOutbox(ob, [f("a", 130, 12)], [], 12); // edited again while in flight
  ob = T.ackOutbox(ob, sent);
  assert.deepEqual(Object.keys(ob), ["a"]); assert.equal(ob.a.ml, 130);
});
test("family code helpers", () => {
  const code = "ZPFR714EMXFGVXNVZHVWW9HXA8";
  assert.equal(T.fmtFamilyCode(code), "ZPFR-714E-MXFG-VXNV-ZHVW-W9HX-A8");
  assert.equal(T.normFamilyCode("zpfr-714e mxfg-vxnv-zhvw-w9hx-a8"), code);
  assert.equal(T.codeFromInput(`https://newbornkr.online/tracker?join=${code}`), code);
  assert.equal(T.codeFromInput("hello"), null);
  assert.equal(T.normFamilyCode("ZPFR714EMXFGVXNVZHVWW9HXAU"), null, "U not in alphabet");
});
test("cleanEntry keeps sync metadata", () => {
  const e = T.cleanEntry({ id: "a", type: "diaper", t: N, d: "pee", updatedAt: 7, by: "  엄마  ", dev: "devA", note: "x", name: "Kim" });
  assert.deepEqual(e, { id: "a", type: "diaper", t: N, d: "pee", updatedAt: 7, by: "엄마", dev: "devA", note: "x" });
});

test("move codes and what the join box accepts", () => {
  assert.equal(T.normMoveCode("k7qm-3xpa"), "K7QM3XPA");
  assert.equal(T.normMoveCode("K7QM 3XPO"), "K7QM3XP0", "O -> 0");
  assert.equal(T.normMoveCode("K7QM3XP"), null); assert.equal(T.normMoveCode("K7QM3XPU"), null, "U is not Crockford");
  assert.equal(T.fmtMoveCode("k7qm3xpa"), "K7QM-3XPA");
  assert.deepEqual(T.joinInput("https://newbornkr.online/tracker#move=K7QM-3XPA"), { move: "K7QM3XPA" });
  assert.deepEqual(T.joinInput("https://newbornkr.online/tracker?move=k7qm3xpa"), { move: "K7QM3XPA" });
  assert.deepEqual(T.joinInput("k7qm-3xpa"), { move: "K7QM3XPA" });
  const code = "0123456789ABCDEFGHJKMNPQRS";
  assert.deepEqual(T.joinInput(`https://newbornkr.online/tracker#join=${code}`), { code });
  assert.deepEqual(T.joinInput(`https://newbornkr.online/tracker?join=${code}`), { code });
  assert.deepEqual(T.joinInput(code.toLowerCase()), { code });
  assert.equal(T.joinInput("hello"), null);
  assert.equal(T.moveUrl("https://x.y", "/tracker", "k7qm-3xpa"), "https://x.y/tracker#move=K7QM3XPA");
});
