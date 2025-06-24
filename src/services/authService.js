import axios from "axios";

const API_URL = "http://localhost:4000/api/auth";

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    const { token, user } = response.data;

    // Guardamos el token y el usuario
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  } catch (error) {
    // Capturamos el mensaje personalizado del backend si existe
    const message =
      error.response?.data?.message || "Error al iniciar sesión";
      
    // Lanzamos ese mensaje como un nuevo error para que el frontend lo maneje
    throw new Error(message);
  }
};

export default { login };
