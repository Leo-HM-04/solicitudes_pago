import axios from "./axiosConfig";

const API_URL = "/usuarios";

const getUsuarios = () => axios.get(API_URL);
const getUsuario = (id) => axios.get(`${API_URL}/${id}`);
const crearUsuario = (usuario) => axios.post(API_URL, usuario);
const actualizarUsuario = (id, usuario) => axios.put(`${API_URL}/${id}`, usuario);
const eliminarUsuario = (id) => axios.delete(`${API_URL}/${id}`);

export default {
  getUsuarios,
  getUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
