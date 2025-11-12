import { buildApiUrl } from "../../config/apiConfig";

export const eliminarComentario = async (usuario_id, comentario_id) => {
  try {
    const token = localStorage.getItem("token");

    const payload = { usuario_id, comentario_id };
    console.log("📦 Enviando DELETE con body:", JSON.stringify(payload));

    const response = await fetch(buildApiUrl("/api/comentarios"), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);
    return data;
  } catch (error) {
    console.error("Error eliminando el comentario:", error);
    return null;
  }
};
