export const API_BASE_URL = "https://dockerapps.pulzo.com/threads";

const mockEnvValue = import.meta.env.VITE_USE_MOCK_API;
const mockDefault = mockEnvValue == null ? import.meta.env.DEV : mockEnvValue === "true";

export const USE_MOCK_API = mockDefault;

export const API_BASE_PATH = (() => {
  try {
    const { pathname } = new URL(API_BASE_URL);
    return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  } catch {
    return "/";
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
