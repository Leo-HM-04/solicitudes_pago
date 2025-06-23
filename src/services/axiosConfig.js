import axios from "axios";

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Interceptor para agregar token en cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
