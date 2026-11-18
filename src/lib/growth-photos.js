// Growth photos: kept ON THIS DEVICE ONLY (IndexedDB). Nothing here talks to a server.

/** EXIF DateTimeOriginal (or DateTime) of a JPEG as "YYYY-MM-DD", else null. Works on ArrayBuffer / Uint8Array. */
export function exifDate(buf) {
  try {
    const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    if (v.getUint16(0) !== 0xffd8) return null;
    let off = 2;
    while (off + 4 <= b.length) {
      if (b[off] !== 0xff) return null;
      const marker = b[off + 1], len = v.getUint16(off + 2);
      if (marker === 0xe1 && v.getUint32(off + 4) === 0x45786966) return readTiff(v, off + 10);
      if (marker === 0xda) return null;
      off += 2 + len;
    }
  } catch { /* not a readable JPEG */ }
  return null;
}
function readTiff(v, t) {
  const le = v.getUint16(t) === 0x4949;
  const u16 = (o) => v.getUint16(t + o, le), u32 = (o) => v.getUint32(t + o, le);
  const str = (o, n) => { let s = ""; for (let i = 0; i < n; i++) { const c = v.getUint8(t + o + i); if (!c) break; s += String.fromCharCode(c); } return s; };
  const ifd = (o) => { const n = u16(o), out = {}; for (let i = 0; i < n; i++) { const e = o + 2 + i * 12; out[u16(e)] = { type: u16(e + 2), count: u32(e + 4), val: u32(e + 8) }; } return out; };
  const ifd0 = ifd(u32(4));
  let date = null;
  if (ifd0[0x8769]) { const ex = ifd(ifd0[0x8769].val); if (ex[0x9003]) date = str(ex[0x9003].val, 19); }
  if (!date && ifd0[0x0132]) date = str(ifd0[0x0132].val, 19);
  const m = /^(\d{4}):(\d{2}):(\d{2})/.exec(date || "");
  return m && m[1] !== "0000" ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// ---------- ZIP (store, no compression: JPEGs are already compressed) ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
/** files: [{ name, data: Uint8Array }] → Uint8Array zip. Names are UTF-8 (flag bit 11). */
export function makeZip(files, date = new Date()) {
  const enc = new TextEncoder(), parts = [], central = [];
  const dosT = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const dosD = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  let off = 0;
  for (const f of files) {
    const name = enc.encode(f.name), data = f.data, crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, dosT, true); h.setUint16(12, dosD, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, dosT, true); c.setUint16(14, dosD, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((a, p) => a + p.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cdSize, true); e.setUint32(16, off, true);
  const all = [...parts, ...central, new Uint8Array(e.buffer)];
  const out = new Uint8Array(all.reduce((a, p) => a + p.length, 0));
  let p = 0; for (const x of all) { out.set(x, p); p += x.length; }
  return out;
}

// ---------- IndexedDB (browser only) ----------
const DB = "nb_growth", STORE = "photos";
function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), st = t.objectStore(STORE); let out;
    const r = fn(st); if (r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => { db.close(); res(out); }; t.onerror = () => { db.close(); rej(t.error); }; t.onabort = () => { db.close(); rej(t.error); };
  });
}
export const photoList = () => tx("readonly", (s) => s.getAll()).then((l) => (l || []).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.added - b.added)));
export const photoPut = (p) => tx("readwrite", (s) => s.put(p));
export const photoDelete = (id) => tx("readwrite", (s) => s.delete(id));

/** Resize to ≤ max px on the long side, JPEG. Returns { blob, w, h }. */
export async function resizeImage(file, max = 1600, quality = 0.85) {
  let src;
  try { src = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  const w0 = src.width, h0 = src.height, k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(src, 0, 0, w, h);
  if (src.close) src.close();
  const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
  return { blob, w, h };
}
