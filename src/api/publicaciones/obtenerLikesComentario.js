import { buildApiUrl } from "../../config/apiConfig";
export const obtenerLikesComentario = async (comentarioId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(buildApiUrl(`/api/comentarios/${comentarioId}/likes`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // console.log("Respuesta de likes para comentario", comentarioId, "=>", data);

    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Error al obtener los likes del comentario:", error);
    return [];
  }
};
