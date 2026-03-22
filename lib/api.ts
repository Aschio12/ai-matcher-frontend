import axios from "axios";
import Cookies from "js-cookie";

/**
 * Browser: same-origin `/api/v1` → Next.js route proxies to BACKEND_URL (see app/api/v1/[...path]/route.ts).
 * That avoids baking a public URL at build time (fixes production still calling localhost).
 *
 * Optional override: NEXT_PUBLIC_API_URL — only if you intentionally call the API directly (CORS must allow your domain).
 */
function isLocalhostApiUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function resolveBaseURL(): string {
  if (typeof window !== "undefined") {
    const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    // Ignore localhost baked in at build — use same-origin proxy instead
    if (direct && !isLocalhostApiUrl(direct)) return `${direct}/api/v1`;
    return "/api/v1";
  }
  return `${(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "")}/api/v1`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config: any) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
