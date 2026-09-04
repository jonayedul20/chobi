// Downloads a whole album as a single ZIP file.
//
// Why this exists: the old "download all" fired one <a download> click per
// photo, 400ms apart. Chrome blocks that after about ten and Safari after the
// first, so on a real album the button silently did almost nothing.
//
// Photos are already-compressed JPEG/WebP, so entries are STORED uncompressed
// (method 0). Deflating them again would cost CPU and save nothing, and it
// keeps this dependency-free — no zip library to install or audit.
//
// This writes standard ZIP, not ZIP64, so the guards below cap total size and
// file count. Real albums are nowhere near either limit.

const MAX_TOTAL_BYTES = 3.9 * 1024 * 1024 * 1024; // ZIP32 offset ceiling
const MAX_FILES = 65535; // ZIP32 central directory ceiling
const MAX_IN_MEMORY_BYTES = 1.2 * 1024 * 1024 * 1024; // browsers without streaming

// ---------------------------------------------------------------- CRC32

let crcTable = null;

function getCrcTable() {
  if (crcTable) return crcTable;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  crcTable = table;
  return table;
}

export function crc32(bytes) {
  const table = getCrcTable();
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = (table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)) >>> 0;
  return (c ^ 0xffffffff) >>> 0;
}

// ------------------------------------------------------------- encoding

const textEncoder = new TextEncoder();

function dosDateTime(date) {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() / 2) & 0x1f);
  const day =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { time: time & 0xffff, date: day & 0xffff };
}

// Keeps names safe inside an archive: no directory traversal, no separators.
export function safeEntryName(name, index) {
  const cleaned = String(name || "")
    .replace(/[\\/]+/g, "-")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^[.\-\s]+/, "")
    .trim();
  return cleaned || `photo-${index + 1}`;
}

// ZIP has no rule against duplicate names, but unzip tools handle them badly.
export function uniqueNames(names) {
  const seen = new Map();
  return names.map(name => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count === 0) return name;
    const dot = name.lastIndexOf(".");
    return dot > 0
      ? `${name.slice(0, dot)} (${count})${name.slice(dot)}`
      : `${name} (${count})`;
  });
}

function localHeader(nameBytes, crc, size, time, date) {
  const buf = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(buf.buffer);
  view.setUint32(0, 0x04034b50, true); // signature
  view.setUint16(4, 20, true); // version needed
  view.setUint16(6, 0x0800, true); // flags: UTF-8 names
  view.setUint16(8, 0, true); // method: stored
  view.setUint16(10, time, true);
  view.setUint16(12, date, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true); // compressed size
  view.setUint32(22, size, true); // uncompressed size
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true); // extra field length
  buf.set(nameBytes, 30);
  return buf;
}

function centralHeader(entry) {
  const buf = new Uint8Array(46 + entry.nameBytes.length);
  const view = new DataView(buf.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true); // version made by
  view.setUint16(6, 20, true); // version needed
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, entry.time, true);
  view.setUint16(14, entry.date, true);
  view.setUint32(16, entry.crc, true);
  view.setUint32(20, entry.size, true);
  view.setUint32(24, entry.size, true);
  view.setUint16(28, entry.nameBytes.length, true);
  view.setUint16(30, 0, true); // extra
  view.setUint16(32, 0, true); // comment
  view.setUint16(34, 0, true); // disk number
  view.setUint16(36, 0, true); // internal attrs
  view.setUint32(38, 0, true); // external attrs
  view.setUint32(42, entry.offset, true);
  buf.set(entry.nameBytes, 46);
  return buf;
}

function endOfCentralDirectory(count, size, offset) {
  const buf = new Uint8Array(22);
  const view = new DataView(buf.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true); // disk
  view.setUint16(6, 0, true); // start disk
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, size, true);
  view.setUint32(16, offset, true);
  view.setUint16(20, 0, true); // comment length
  return buf;
}

// ----------------------------------------------------------- zip builder

/**
 * Streams a ZIP into `sink`, which must expose write(Uint8Array) and close().
 * `items` are { name, fetchBytes() } — fetchBytes resolves to a Uint8Array.
 * Returns the number of entries actually written; unreachable files are
 * skipped rather than failing the whole archive.
 */
export async function writeZip(items, sink, { onProgress, signal } = {}) {
  const entries = [];
  let offset = 0;
  let written = 0;
  const skipped = [];

  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const item = items[i];
    onProgress?.({ index: i, total: items.length, name: item.name });

    let bytes;
    try {
      bytes = await item.fetchBytes();
    } catch {
      skipped.push(item.name);
      continue;
    }
    if (!bytes) {
      skipped.push(item.name);
      continue;
    }

    const nameBytes = textEncoder.encode(item.name);
    const { time, date } = dosDateTime(new Date());
    const crc = crc32(bytes);

    const header = localHeader(nameBytes, crc, bytes.length, time, date);
    await sink.write(header);
    await sink.write(bytes);

    entries.push({ nameBytes, crc, size: bytes.length, offset, time, date });
    offset += header.length + bytes.length;
    written++;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const entry of entries) {
    const record = centralHeader(entry);
    await sink.write(record);
    centralSize += record.length;
  }
  await sink.write(endOfCentralDirectory(entries.length, centralSize, centralStart));
  await sink.close();

  return { written, skipped };
}

// --------------------------------------------------------- browser glue

function memorySink() {
  const chunks = [];
  return {
    chunks,
    async write(bytes) {
      chunks.push(bytes);
    },
    async close() {}
  };
}

async function pickFileSink(zipName) {
  // Chrome and Edge on desktop can stream straight to disk, so memory stays
  // flat no matter how large the album is. Everyone else buffers.
  if (typeof window === "undefined" || typeof window.showSaveFilePicker !== "function") {
    return null;
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: zipName,
      types: [{ description: "ZIP archive", accept: { "application/zip": [".zip"] } }]
    });
    const stream = await handle.createWritable();
    return {
      async write(bytes) {
        await stream.write(bytes);
      },
      async close() {
        await stream.close();
      }
    };
  } catch (err) {
    // A user who cancels the save dialog means it — don't silently fall back
    // to a 1GB in-memory download they didn't ask for.
    if (err?.name === "AbortError") throw err;
    return null;
  }
}

function triggerBlobDownload(chunks, zipName) {
  const blob = new Blob(chunks, { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function zipFileName(title) {
  const base = String(title || "album")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return `${base || "album"}.zip`;
}

/**
 * Packs `photos` into one ZIP and hands it to the browser.
 * Each photo needs { signed_url, file_name, size_bytes }.
 * Throws an Error with a readable message the caller can put in a toast.
 */
export async function downloadPhotosAsZip(photos, { zipName = "album.zip", onProgress } = {}) {
  const list = photos ?? [];
  if (list.length === 0) throw new Error("There are no photos to download.");
  if (list.length > MAX_FILES) {
    throw new Error(`This album has more than ${MAX_FILES} photos — too many for one ZIP file.`);
  }

  const totalBytes = list.reduce((sum, p) => sum + (p.size_bytes || 0), 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("This album is too large to package as a single ZIP file.");
  }

  const names = uniqueNames(list.map((p, i) => safeEntryName(p.file_name, i)));

  let sink = await pickFileSink(zipName);
  const streaming = !!sink;

  if (!streaming) {
    if (totalBytes > MAX_IN_MEMORY_BYTES) {
      throw new Error(
        "This album is too large for your browser to zip. Chrome or Edge on a computer can handle it, or download photos individually."
      );
    }
    sink = memorySink();
  }

  const items = list.map((photo, i) => ({
    name: names[i],
    fetchBytes: async () => {
      const res = await fetch(photo.signed_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    }
  }));

  const result = await writeZip(items, sink, { onProgress });

  if (result.written === 0) {
    throw new Error("None of the photos could be downloaded. The album link may have expired.");
  }
  if (!streaming) triggerBlobDownload(sink.chunks, zipName);

  return result;
}
