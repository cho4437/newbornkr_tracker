// node --test tests/growth.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { addMonths, addDays, ageOn, bandFor, bandRange, itemWindow, scheduleFor, upcoming, photoAge, parseYMD, monthCells, monthView, dayTags, eventsOn, milestoneId, allMilestones, milestoneStatus, inNowWindow, milestonesFor, mergeMarks, pendingMarks, cleanCustomText, newCustomId, cleanCustom, customList, customEventsOn, mergeCustoms, pendingCustoms, CUSTOM_TEXT_MAX } from "../src/lib/growth-core.js";
import { BANDS, ITEMS, MILESTONES, SOURCES } from "../src/lib/growth-data.js";
import { exifDate, makeZip, crc32 } from "../src/lib/growth-photos.js";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const B = "2026-08-09"; // synthetic birth date, 3 months before 2026-11-09

test("date helpers: month math clamps, leap years, invalid dates", () => {
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2028-01-31", 1), "2028-02-29");
  assert.equal(addMonths("2026-08-09", 12), "2027-08-09");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(parseYMD("2026-02-30"), null);
  assert.equal(parseYMD("nope"), null);
});

test("age: D+ counts birth day as 1, months are calendar months", () => {
  assert.deepEqual(ageOn(B, B), { days: 0, dplus: 1, months: 0, restDays: 0, years: 0 });
  const a = ageOn(B, "2026-11-09");
  assert.equal(a.days, 92); assert.equal(a.dplus, 93); assert.equal(a.months, 3); assert.equal(a.restDays, 0);
  const b = ageOn(B, "2026-11-08");
  assert.equal(b.months, 2); assert.equal(b.restDays, 30);
  assert.equal(ageOn(B, "2026-08-01"), null); // before birth
  assert.equal(ageOn("2026-01-31", "2026-02-28").months, 1);
});

test("current band", () => {
  assert.equal(bandFor(0).id, "b0");
  assert.equal(bandFor(1).id, "b0");
  assert.equal(bandFor(2).id, "b2");
  assert.equal(bandFor(3).id, "b2");
  assert.equal(bandFor(11).id, "b9");
  assert.equal(bandFor(12).id, "b12");
  assert.equal(bandFor(35).id, "b30");
  assert.equal(bandFor(36).id, "after");
  assert.deepEqual(bandRange(B, BANDS[1]), { start: "2026-10-09", end: "2026-12-08" });
});

test("schedule windows computed from the birth date", () => {
  const w = (id) => itemWindow(B, ITEMS.find((x) => x.id === id));
  assert.deepEqual(w("hepb1"), { start: B, end: B });
  assert.deepEqual(w("bcg"), { start: B, end: "2026-09-06" });              // within 4 weeks
  assert.deepEqual(w("m2"), { start: "2026-10-09", end: "2026-11-08" });     // "2개월" = during month 2
  assert.deepEqual(w("chk1"), { start: "2026-08-23", end: "2026-09-13" });   // day 14–35
  assert.deepEqual(w("chk2"), { start: "2026-12-09", end: "2027-03-08" });   // 4–6 months (through the day before 7 months)
  assert.deepEqual(w("m12"), { start: "2027-08-09", end: "2027-12-08" });    // 12–15 months
  assert.deepEqual(w("pay60"), { start: B, end: "2026-10-08" });             // 60 days
  assert.deepEqual(w("voucher"), { start: "2028-08-09", end: "2028-08-09" }); // 2 years
  assert.deepEqual(w("d100"), { start: "2026-11-16", end: "2026-11-16" });   // 백일 = D+100
});

test("status + upcoming list at 3 months (2026-11-09)", () => {
  const s = scheduleFor(B, "2026-11-09");
  const by = (id) => s.find((x) => x.id === id);
  assert.equal(by("hepb1").status, "past");
  assert.equal(by("m2").status, "past");
  assert.equal(by("m4").status, "upcoming");
  assert.equal(by("m4").start, "2026-12-09");
  assert.equal(by("m4").daysUntil, 30);
  assert.equal(by("d100").daysUntil, 7);
  assert.equal(by("m2").band, "b2");
  assert.equal(by("hepb2").band, "b0");
  const up = upcoming(s, 6).map((x) => x.id);
  assert.deepEqual(up.slice(0, 3), ["d100", "m4", "chk2"]);
  assert.ok(!up.includes("m2") && !up.includes("bcg"));
  // an open window sorts first
  const s2 = scheduleFor(B, "2026-12-20");
  assert.equal(upcoming(s2)[0].status, "now");
  assert.ok(["m4", "chk2"].includes(upcoming(s2)[0].id));
});

test("photos land on the right age band", () => {
  assert.equal(photoAge(B, "2026-08-20").band, "b0");
  assert.equal(photoAge(B, "2026-08-20").dplus, 12);
  assert.equal(photoAge(B, "2026-11-01").band, "b2");
  assert.equal(photoAge(B, "2029-09-01").band, "after");
  assert.deepEqual(photoAge(B, "2026-07-01"), { before: true, band: "before" });
  assert.equal(photoAge(B, "bad"), null);
});

/** Minimal JPEG with an EXIF APP1 holding DateTimeOriginal. */
function jpegWithExif(dt, le = true) {
  const ascii = new TextEncoder().encode(dt + "\0"); // 20 bytes
  const tiff = new DataView(new ArrayBuffer(8 + 18 + 18 + 20));
  const u16 = (o, v) => tiff.setUint16(o, v, le), u32 = (o, v) => tiff.setUint32(o, v, le);
  tiff.setUint16(0, le ? 0x4949 : 0x4d4d); u16(2, 42); u32(4, 8);
  u16(8, 1); u16(10, 0x8769); u16(12, 4); u32(14, 1); u32(18, 26); u32(22, 0); // IFD0: ExifIFD pointer → 26
  u16(26, 1); u16(28, 0x9003); u16(30, 2); u32(32, 20); u32(36, 44); u32(40, 0); // Exif IFD: DateTimeOriginal at 44
  new Uint8Array(tiff.buffer).set(ascii, 44);
  const app1 = new Uint8Array(2 + 2 + 6 + tiff.byteLength);
  const v = new DataView(app1.buffer);
  v.setUint16(0, 0xffe1); v.setUint16(2, 2 + 6 + tiff.byteLength); app1.set([0x45, 0x78, 0x69, 0x66, 0, 0], 4); app1.set(new Uint8Array(tiff.buffer), 10);
  return new Uint8Array([0xff, 0xd8, ...app1, 0xff, 0xda, 0, 2, 0xff, 0xd9]);
}
test("EXIF DateTimeOriginal is read (both byte orders); non-JPEG → null", () => {
  assert.equal(exifDate(jpegWithExif("2026:09:15 10:20:30")), "2026-09-15");
  assert.equal(exifDate(jpegWithExif("2026:10:01 08:00:00", false)), "2026-10-01");
  assert.equal(exifDate(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), null);
  assert.equal(exifDate(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2])), null);
});

test("ZIP export is a valid archive (checked with unzip)", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const files = [{ name: "photos/growth_2026-08-20_D+12_a.jpg", data: jpegWithExif("2026:08:20 09:00:00") }, { name: "photos.json", data: new TextEncoder().encode('{"note":"첫 미소"}') }];
  const dir = mkdtempSync(path.join(tmpdir(), "gz-")), f = path.join(dir, "t.zip");
  writeFileSync(f, makeZip(files));
  const out = execFileSync("unzip", ["-t", f]).toString();
  assert.match(out, /No errors detected/);
  assert.equal(execFileSync("unzip", ["-p", f, "photos.json"]).toString(), '{"note":"첫 미소"}');
});

test("data integrity: every band has 4 milestone groups + tips, every item has ko/en, sources are official", () => {
  for (const b of BANDS) {
    const m = MILESTONES[b.id];
    for (const k of ["social", "language", "cognitive", "movement", "play"]) {
      assert.ok(m[k].length >= 1, `${b.id}.${k}`);
      for (const [ko, en] of m[k]) { assert.match(ko, /[가-힣]/); assert.doesNotMatch(en, /[가-힣]/); }
    }
  }
  for (const it of ITEMS) { assert.match(it.ko, /[가-힣]/); assert.doesNotMatch(it.en + (it.noteEn || ""), /[가-힣]/); }
  for (const s of SOURCES) assert.match(s.url, /^https:\/\/(nip\.kdca\.go\.kr|www\.nhis\.or\.kr|www\.cdc\.gov|www\.bokjiro\.go\.kr)\//);
});



test("month grid: pads to full weeks, tags today/d100/dol, events land on window days", () => {
  // Nov 2026 starts on Sunday
  const cells = monthCells(2026, 11);
  assert.equal(cells.length % 7, 0);
  assert.equal(cells[0], "2026-11-01");
  assert.equal(cells[29], "2026-11-30");
  assert.equal(cells.filter(Boolean).length, 30);
  const tags = dayTags(B, "2026-11-09", "2026-11-09");
  assert.deepEqual(tags, ["today"]);
  assert.ok(dayTags(B, "2026-11-16", "2026-11-09").includes("d100"));
  assert.ok(dayTags(B, "2027-08-09", "2026-11-09").includes("dol"));
  assert.ok(dayTags(B, B, "2026-11-09").includes("birth"));
  const sch = scheduleFor(B, "2026-11-09");
  const d100ev = eventsOn(sch, "2026-11-16");
  assert.ok(d100ev.some((x) => x.id === "d100"));
  const mv = monthView(B, "2026-11-09", 2026, 11);
  const day16 = mv.cells.find((c) => c && c.date === "2026-11-16");
  assert.ok(day16.tags.includes("d100"));
  assert.ok(day16.events.some((x) => x.id === "d100"));
  const todayCell = mv.cells.find((c) => c && c.date === "2026-11-09");
  assert.ok(todayCell.tags.includes("today"));
});

test("milestone states move with age; this-week highlight; marks merge last-write-wins", () => {
  assert.equal(milestoneId("b2", "social", 0), "b2.social.0");
  const all = allMilestones(MILESTONES);
  assert.ok(all.length > 40);
  assert.equal(new Set(all.map((m) => m.id)).size, all.length, "ids unique");
  assert.equal(milestoneStatus(BANDS[1], 3), "now"); // b2 = 2–4
  assert.equal(milestoneStatus(BANDS[0], 3), "past");
  assert.equal(milestoneStatus(BANDS[2], 3), "upcoming");
  // first week of b2 starts 2026-10-09 → on 2026-10-12 highlight is on
  assert.equal(inNowWindow(B, "2026-10-12", BANDS[1]), true);
  assert.equal(inNowWindow(B, "2026-10-20", BANDS[1]), false);
  const list = milestonesFor(B, "2026-11-09", {}, MILESTONES);
  const now = list.filter((m) => m.status === "now");
  assert.ok(now.length >= 4 && now.every((m) => m.bandId === "b2"));
  assert.ok(list.filter((m) => m.status === "past").every((m) => m.bandId === "b0"));
  const marked = milestonesFor(B, "2026-11-09", { "b2.social.0": { at: "2026-10-15", updatedAt: 10 } }, MILESTONES);
  const one = marked.find((m) => m.id === "b2.social.0");
  assert.equal(one.achieved, true); assert.equal(one.achievedAt, "2026-10-15");
  const { marks, changed } = mergeMarks({ "b2.social.0": { at: "2026-10-01", updatedAt: 5 } }, [
    { id: "b2.social.0", at: "2026-10-20", updatedAt: 20 },
    { id: "b2.language.0", at: null, updatedAt: 21 },
    { id: "nope", at: null, updatedAt: 99 },
  ]);
  assert.equal(changed, true);
  assert.equal(marks["b2.social.0"].at, "2026-10-20");
  assert.equal(marks["b2.language.0"].at, null);
  assert.equal(marks.nope, undefined);
  const older = mergeMarks(marks, [{ id: "b2.social.0", at: "2026-01-01", updatedAt: 1 }]);
  assert.equal(older.changed, false);
  assert.equal(older.marks["b2.social.0"].at, "2026-10-20");
  const pend = pendingMarks({ a: { updatedAt: 5 }, b: { updatedAt: 15, deleted: true } }, 10);
  assert.deepEqual(pend.map((x) => x.id), ["b"]);
  assert.equal(pend[0].deleted, true);
});


test("custom milestones: text clean, ids, merge LWW, calendar events", () => {
  assert.equal(cleanCustomText("  처음 뒤집기 시도했어요  "), "처음 뒤집기 시도했어요");
  assert.equal(cleanCustomText("a".repeat(81)), null);
  assert.equal(cleanCustomText("   "), null);
  assert.equal(cleanCustomText("hi\u0000there"), "hithere");
  assert.equal(CUSTOM_TEXT_MAX, 80);
  const id = newCustomId(() => 0.1);
  assert.match(id, /^c_[0-9a-f]{12}$/);
  assert.equal(cleanCustom({ id: "bad", text: "x", updatedAt: 1 }), null);
  assert.equal(cleanCustom({ id, text: "x", updatedAt: 0 }), null);
  const ok = cleanCustom({ id, text: "  뒤집기  ", at: "2026-11-05", achieved: true, updatedAt: 10 });
  assert.deepEqual(ok, { id, text: "뒤집기", at: "2026-11-05", achieved: true, updatedAt: 10, deleted: false });
  const map = { [id]: ok };
  assert.equal(customList(map).length, 1);
  assert.equal(customEventsOn(map, "2026-11-05")[0].ko, "뒤집기");
  assert.equal(customEventsOn(map, "2026-11-06").length, 0);
  const { customs, changed } = mergeCustoms(map, [
    { id, text: "뒤집기 성공", at: "2026-11-06", achieved: true, updatedAt: 20 },
    { id: "c_zzzzzzzzzzzz", text: "옹알이", updatedAt: 21 },
    { id: "nope", text: "x", updatedAt: 99 },
  ]);
  assert.equal(changed, true);
  assert.equal(customs[id].text, "뒤집기 성공");
  assert.equal(customs[id].at, "2026-11-06");
  assert.equal(customs["c_zzzzzzzzzzzz"].text, "옹알이");
  assert.equal(customs.nope, undefined);
  const older = mergeCustoms(customs, [{ id, text: "old", updatedAt: 1 }]);
  assert.equal(older.changed, false);
  assert.equal(older.customs[id].text, "뒤집기 성공");
  const pend = pendingCustoms({ "c_aaaaaaaaaaaa": { text: "a", updatedAt: 5 }, "c_bbbbbbbbbbbb": { text: "b", updatedAt: 15, deleted: true } }, 10);
  assert.deepEqual(pend.map((x) => x.id), ["c_bbbbbbbbbbbb"]);
  assert.equal(pend[0].deleted, true);
});
