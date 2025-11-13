import { API_BASE_URL, USE_MOCK_API } from "../../config/apiConfig";

const API_URL = `${API_BASE_URL}/login`;
const DEFAULT_ERROR = "Error al iniciar sesión.";

// 🔹 Login real contra la API
async function requestRealLogin(credentials) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw buildError(data);
  }

  return data;
}

// 🔹 Login usando mock (para desarrollo o modo offline)
async function requestMockLogin(credentials) {
  const { handleLogin } = await import("../mock/handlers");
  const response = await handleLogin({ body: credentials });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw buildError(data);
  }

  return data;
}

async function parseResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    console.warn("No se pudo parsear la respuesta de login:", error);
    return null;
  }
}

function buildError(data) {
  if (data && typeof data === "object") {
    return new Error(data.error || data.message || DEFAULT_ERROR);
  }
  if (typeof data === "string" && data.trim()) {
    return new Error(data);
  }
  return new Error(DEFAULT_ERROR);
}

export async function loginUser(credentials) {
  if (USE_MOCK_API && typeof window !== "undefined") {
    try {
      return await requestMockLogin(credentials);
    } catch (error) {
      if (error instanceof Error && error.message !== DEFAULT_ERROR) {
        throw error;
      }

      console.error("Error usando el mock del login, intentando petición real:", error);

      try {
        return await requestRealLogin(credentials);
      } catch (realError) {
        if (realError instanceof Error) {
          throw realError;
        }
        throw new Error(DEFAULT_ERROR);
      }
    }
  }

  try {
    return await requestRealLogin(credentials);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(DEFAULT_ERROR);
  }
}
