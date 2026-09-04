// Builds downscaled copies of an image in the browser at upload time.
//
// Galleries must never load full-resolution originals — a 200-photo album of
// 8MB files is 1.6GB on a guest's phone. The admin's machine does the resizing
// once, on upload, so every visitor after that downloads kilobytes.
//
// Anything here can fail (HEIC from an iPhone has no browser decoder, for
// example). Every function returns null on failure and the caller falls back
// to uploading the original alone.

export const THUMB_MAX = 800; // gallery grid
export const WEB_MAX = 1600; // lightbox viewer

async function decode(file) {
  if (typeof createImageBitmap !== "function") return null;
  try {
    // from-image applies the EXIF rotation, so portrait phone shots don't
    // come out sideways the way a raw canvas draw would leave them.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      return null;
    }
  }
}

function toBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

async function encode(bitmap, maxEdge, quality, baseName, suffix) {
  const longest = Math.max(bitmap.width, bitmap.height);
  const ratio = Math.min(1, maxEdge / longest);
  const w = Math.max(1, Math.round(bitmap.width * ratio));
  const h = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);

  // WebP is roughly 30% smaller than JPEG at the same quality; older browsers
  // hand back null for an unsupported type, so fall through to JPEG.
  let blob = await toBlob(canvas, "image/webp", quality);
  let ext = "webp";
  if (!blob) {
    blob = await toBlob(canvas, "image/jpeg", quality);
    ext = "jpg";
  }
  if (!blob) return null;

  return new File([blob], `${baseName}-${suffix}.${ext}`, { type: blob.type });
}

/**
 * Returns { thumb, web, width, height } for an image file.
 * Any field may be null — callers must fall back to the original.
 */
export async function buildDerivatives(file) {
  const bitmap = await decode(file);
  if (!bitmap) return { thumb: null, web: null, width: null, height: null };

  const width = bitmap.width;
  const height = bitmap.height;
  const baseName = (file.name || "photo").replace(/\.[a-z0-9]+$/i, "") || "photo";

  try {
    const thumb = await encode(bitmap, THUMB_MAX, 0.78, baseName, "thumb");
    // An image already smaller than the viewer size gains nothing from a
    // second copy — the grid thumbnail plus the original is enough.
    const web =
      Math.max(width, height) > WEB_MAX
        ? await encode(bitmap, WEB_MAX, 0.85, baseName, "web")
        : null;
    return { thumb, web, width, height };
  } finally {
    bitmap.close?.();
  }
}
