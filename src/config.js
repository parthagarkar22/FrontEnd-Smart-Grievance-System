const rawApi = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").trim();

/** Axios base URL — always ends with a single trailing slash */
export const API_BASE_URL = rawApi.replace(/\/+$/, "") + "/";

/** Backend origin for media files (strips trailing /api) */
export const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") ||
  rawApi.replace(/\/api\/?$/, "");

/** Build absolute media URL from a relative or absolute path */
export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_ORIGIN}${normalized}`;
}
