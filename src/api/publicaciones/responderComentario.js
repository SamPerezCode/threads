import { buildApiUrl } from "../../config/apiConfig";
export const responderComentario = async ({
  usuario_id,
  comentario_padre_id,
  contenido,
  token,
}) => {
  const res = await fetch(buildApiUrl("/api/comentarios/responder"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      usuario_id,
      comentario_padre_id,
      contenido,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.mensaje || "Error al responder comentario");
  return data.data;
};
