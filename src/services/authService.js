import axios from "axios";

const API_URL = "http://localhost:4000/api/auth";

const login = async (email, password) => {
  try {
    console.log("Sending login request with:", { email, password }); // Debug log
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    const { token, user } = response.data;
    console.log("Login success response:", response.data); // Debug log

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error("Login error details:", error.response?.data || error.message); // Debug log
    const message = error.response?.data?.message || "Error al iniciar sesión";
    throw new Error(message);
  }
};

export default login; 