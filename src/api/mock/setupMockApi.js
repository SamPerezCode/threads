import { API_BASE_URL, API_BASE_PATH, USE_MOCK_API } from "../../config/apiConfig";
import {
  handleLogin,
  handleRegister,
  handleGetUser,
  handleUpdateProfile,
  handleUploadAvatar,
  handleGetComments,
  handleCreateComment,
  handleDeleteComment,
  handleToggleLike,
  handleGetCommentLikes,
  handleGetUserComments,
  handleReplyComment,
  handleGetConversation,
  handleGetFollowers,
  handleFollowUser,
  handleUnfollowUser,
} from "./handlers";

const routes = [
  { method: "POST", pattern: /^\/login$/, handler: handleLogin },
  { method: "POST", pattern: /^\/register$/, handler: handleRegister },
  { method: "GET", pattern: /^\/api\/usuarios\/(\d+)$/, handler: handleGetUser },
  { method: "PUT", pattern: /^\/api\/usuarios\/perfil$/, handler: handleUpdateProfile },
  { method: "POST", pattern: /^\/api\/usuarios\/avatar$/, handler: handleUploadAvatar },
  { method: "GET", pattern: /^\/api\/comentarios$/, handler: handleGetComments },
  { method: "POST", pattern: /^\/api\/comentarios$/, handler: handleCreateComment },
  { method: "DELETE", pattern: /^\/api\/comentarios$/, handler: handleDeleteComment },
  { method: "POST", pattern: /^\/api\/comentarios\/(\d+)\/like$/, handler: handleToggleLike },
  { method: "DELETE", pattern: /^\/api\/comentarios\/(\d+)\/like$/, handler: handleToggleLike },
  { method: "GET", pattern: /^\/api\/comentarios\/(\d+)\/likes$/, handler: handleGetCommentLikes },
  { method: "POST", pattern: /^\/api\/comentarios\/responder$/, handler: handleReplyComment },
  {
    method: "GET",
    pattern: /^\/api\/comentarios\/(\d+)\/conversacion$/,
    handler: handleGetConversation,
  },
  {
    method: "GET",
    pattern: /^\/api\/usuarios\/(\d+)\/comentarios$/,
    handler: handleGetUserComments,
  },
  { method: "GET", pattern: /^\/api\/usuarios\/(\d+)\/seguidores$/, handler: handleGetFollowers },
  { method: "POST", pattern: /^\/api\/usuarios\/seguir$/, handler: handleFollowUser },
  { method: "POST", pattern: /^\/api\/usuarios\/dejar-de-seguir$/, handler: handleUnfollowUser },
];

let initialized = false;

export function setupMockApi() {
  if (!USE_MOCK_API || typeof window === "undefined" || initialized) {
    return;
  }

  const originalFetch = window.fetch.bind(window);
  initialized = true;

  window.fetch = async (input, init = {}) => {
    const request = new Request(input, init);
    const url = new URL(request.url);

    if (!url.href.startsWith(API_BASE_URL)) {
      return originalFetch(input, init);
    }

    const relativePath =
      API_BASE_PATH && API_BASE_PATH !== "/" && url.pathname.startsWith(API_BASE_PATH)
        ? url.pathname.slice(API_BASE_PATH.length) || "/"
        : url.pathname;

    const route = matchRoute(request.method, relativePath);
    if (!route) {
      console.warn(`[MockAPI] Ruta no implementada: ${request.method} ${relativePath}`);
      return new Response(JSON.stringify({ error: "Ruta no disponible en el modo mock" }), {
        status: 501,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await parseBody(request);
      const headers = new Headers(request.headers);
      const authorization = headers.get("Authorization") || headers.get("authorization");
      const token = authorization?.replace(/Bearer\s+/i, "") ?? null;

      const params = buildParams(route.pattern, relativePath);
      const response = await route.handler({
        params,
        body,
        token,
        method: request.method.toUpperCase(),
      });
      return response;
    } catch (error) {
      console.error(`[MockAPI] Error manejando ${request.method} ${relativePath}:`, error);
      return new Response(JSON.stringify({ error: "Error interno en el mock" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

function matchRoute(method, pathname) {
  return routes.find(
    (route) => route.method === method.toUpperCase() && route.pattern.test(pathname)
  );
}

function buildParams(pattern, pathname) {
  const match = pathname.match(pattern);
  if (!match) return {};

  const groups = match.slice(1);
  if (groups.length === 0) return {};

  const params = {};
  groups.forEach((value, index) => {
    if (index === 0) {
      params.id = value;
    } else {
      params[`param${index}`] = value;
    }
  });

  return params;
}

async function parseBody(request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return null;
  }

  const contentType = request.headers.get("Content-Type") || "";
  const clone = request.clone();

  if (contentType.includes("application/json")) {
    try {
      return await clone.json();
    } catch (error) {
      console.warn("[MockAPI] No se pudo parsear JSON:", error);
      return null;
    }
  }

  if (contentType.includes("multipart/form-data") || !contentType) {
    try {
      const formData = await clone.formData();
      const fields = {};
      for (const [key, value] of formData.entries()) {
        fields[key] = value;
      }
      return { fields };
    } catch {
      // No es form-data, continuar
    }
  }

  try {
    const text = await clone.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  } catch (error) {
    console.warn("[MockAPI] No se pudo leer el cuerpo:", error);
    return null;
  }
}
