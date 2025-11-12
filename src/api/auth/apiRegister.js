import { buildApiUrl } from "../../config/apiConfig";

const API_URL = buildApiUrl("/register");

export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al registrar usuario.");
    }
    console.log(data.message);

    return data;
  } catch (error) {
    console.error("Error en apiRegister:", error);
    throw error;
  }
}
