import { buildApiUrl } from "../../config/apiConfig";
const obtenerComentarios = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(buildApiUrl(`/api/usuarios/${userId}/comentarios`), {
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

export default obtenerComentarios;
