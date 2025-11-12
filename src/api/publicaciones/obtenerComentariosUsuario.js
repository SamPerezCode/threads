import { buildApiUrl } from "../../config/apiConfig";

export const obtenerComentarioUsuario = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(buildApiUrl(`/api/usuarios/${id}/comentarios`), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener comentarios del usuario: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en obtenerComentarioUsuario.js:", error);
    return { data: [] };
  }
};
