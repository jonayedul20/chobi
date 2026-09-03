export function getRemaining(expiresAt) {
  if (!expiresAt) return { expired: false, label: "", ms: null };
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { expired: true, label: "00H 00M", ms: 0 };
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { expired: false, label: `${h}H ${m}M ${s}S`, ms };
}

export function isAlbumExpired(album) {
  if (!album) return true;
  if (album.status === "expired") return true;
  return !!(album.expires_at && new Date(album.expires_at).getTime() <= Date.now());
}

export function albumShareUrl(slug) {
  return `${window.location.origin}/a/${slug}`;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export const EXPIRY_OPTIONS = [
  { value: "never", label: "NO EXPIRY" },
  { value: "24h", label: "24 HOURS" },
  { value: "48h", label: "48 HOURS" },
  { value: "7d", label: "7 DAYS" },
  { value: "30d", label: "30 DAYS" },
  { value: "custom", label: "CUSTOM DATE" }
];

export const EXPIRY_HOURS = { "24h": 24, "48h": 48, "7d": 168, "30d": 720 };

export function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}