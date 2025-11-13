// src/config/apiConfig.js

// 1) Lee flags desde Vite
const USE_MOCK_FLAG =
  (import.meta.env.VITE_USE_MOCK_API ?? (import.meta.env.DEV ? "true" : "false")) === "true";

const ENV_API_URL = import.meta.env.VITE_API_URL; // opcional

// 2) Decide la base según el flag
export const USE_MOCK_API = USE_MOCK_FLAG;

// si es mock: pega a tus rutas mock (MSW/handlers). Ajusta "/api/mock" a tu prefijo real.
// si NO es mock: usa VITE_API_URL o el fallback remoto.
export const API_BASE_URL = USE_MOCK_API
  ? "/api/mock"
  : ENV_API_URL || "https://dockerapps.pulzo.com/threads";

// 3) Helpers
export const API_BASE_PATH = (() => {
  try {
    const { pathname } = new URL(
      API_BASE_URL.startsWith("http") ? API_BASE_URL : "http://x" + API_BASE_URL
    );
    return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  } catch {
    return "/";
  }
})();

export const buildApiUrl = (path = "") => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
