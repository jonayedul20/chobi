// Shared album security helpers used by all album backend functions.
const encoder = new TextEncoder();

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function makeSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password, salt) {
  return sha256Hex(`${salt}:${password}`);
}

export function isExpired(album) {
  if (!album) return true;
  if (album.status === "expired") return true;
  if (album.expires_at && new Date(album.expires_at).getTime() <= Date.now()) return true;
  return false;
}