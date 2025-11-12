import { buildApiUrl } from "../../config/apiConfig";
export const eliminarLikeComentario = async (comentarioId, usuarioId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(buildApiUrl(`/api/comentarios/${comentarioId}/like`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ usuario_id: usuarioId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error eliminando like:", error);
    return null;
  }
};
