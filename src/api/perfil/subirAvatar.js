import { buildApiUrl } from "../../config/apiConfig";

export async function subirAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(buildApiUrl("/api/usuarios/avatar"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error al tú avatar:", text);
      throw new Error("No se pudo subir el avatar");
    }

    const data = await res.json();
    console.log("Respuesta completa subirAvatar:", data);
    return data.path;
  } catch (error) {
    console.error("Error real al subir avatar:", error);
    throw error;
  }
}
