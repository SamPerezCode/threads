import { buildApiUrl } from "../../config/apiConfig";
export const seguirUsuario = async (seguidorId, seguidoId, token, setSiguiendo) => {
  if (seguidorId === seguidoId) {
    alert(" No puedes seguirte a ti mismo.");
    return;
  }

  try {
    const response = await fetch(buildApiUrl("/api/usuarios/seguir"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        seguidor_id: seguidorId,
        seguido_id: seguidoId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Ahora sigues al usuario:", data, seguidoId);
      setSiguiendo(true);
    } else {
      console.error(" Error al seguir al usuario:", data.message);
    }
  } catch (error) {
    console.error("Error en la petición de seguir:", error);
  }
};
