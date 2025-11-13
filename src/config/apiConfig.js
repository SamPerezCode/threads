const DEFAULT_API_BASE_URL = "https://dockerapps.pulzo.com/threads";
const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).trim();

export const API_BASE_URL = (() => {
  if (/^https?:\/\//i.test(rawApiBaseUrl)) {
    return rawApiBaseUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const url = new URL(rawApiBaseUrl, window.location.origin);
    return url.toString().replace(/\/$/, "");
  }

  return rawApiBaseUrl.replace(/\/$/, "");
})();

const mockEnvValue = import.meta.env.VITE_USE_MOCK_API;
export const USE_MOCK_API = mockEnvValue == null ? true : mockEnvValue === "true";

export const API_BASE_PATH = (() => {
  try {
    const { pathname } = new URL(API_BASE_URL);
    if (!pathname) {
      return "/";
    }
    return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  } catch {
    return rawApiBaseUrl.startsWith("/") ? rawApiBaseUrl : "/";
  }
})();

export const buildApiUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
