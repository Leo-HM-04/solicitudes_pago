import axios from "./axiosConfig";

const API_URL = "/solicitudes";

const getSolicitudes = () => axios.get(API_URL);
const getSolicitud = (id) => axios.get(`${API_URL}/${id}`);
const crearSolicitud = (solicitud) => axios.post(API_URL, solicitud);
const actualizarEstado = (id, estado, comentario_aprobador) => 
  axios.put(`${API_URL}/${id}/estado`, { estado, comentario_aprobador });
const eliminarSolicitud = (id) => axios.delete(`${API_URL}/${id}`);

export default {
  getSolicitudes,
  getSolicitud,
  crearSolicitud,
  actualizarEstado,
  eliminarSolicitud,
};
