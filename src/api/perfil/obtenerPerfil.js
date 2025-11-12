import { buildApiUrl } from "../../config/apiConfig";

export const obtenerPerfil = async (id) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token no encontrado. Por favor, iniciá sesión.");
    }

    const response = await fetch(buildApiUrl(`/api/usuarios/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "No se pudo obtener el perfil");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error en obtenerPerfil:", error);
    throw error;
  }
};
