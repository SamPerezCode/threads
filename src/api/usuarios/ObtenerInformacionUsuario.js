import { buildApiUrl } from "../../config/apiConfig";
const obtenerUsuario = async (userId, token) => {
  try {
    const response = await fetch(buildApiUrl(`/api/usuarios/${userId}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return null;
  }
};

export default obtenerUsuario;
