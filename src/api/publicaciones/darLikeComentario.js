import { buildApiUrl } from "../../config/apiConfig";
export const darLikeComentario = async (comentarioId, userId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(buildApiUrl(`/api/comentarios/${comentarioId}/like`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ usuario_id: userId }),
    });

    if (!response.ok) {
      throw new Error("Error al enviar like");
    }

    const data = await response.json();
    console.log("Respuesta del servidor:", data);
    return data;
  } catch (error) {
    console.error("Error en darLikeComentario:", error);
    throw error;
  }
};
