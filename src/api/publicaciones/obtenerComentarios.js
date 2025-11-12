import { buildApiUrl } from "../../config/apiConfig";
export const obtenerComentarios = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(buildApiUrl("/api/comentarios"), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener comentarios: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en obtenerComentarios.js:", error);
    return { data: [] };
  }
};
