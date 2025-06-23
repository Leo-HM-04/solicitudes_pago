import { useEffect, useState } from "react";
import axios from "../services/axiosConfig";


const API_URL = "/usuarios";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


//QUITAMOS ESTA VALIDACION POR QUE AHORA LA MANEJAMOS DESDE EL ARCHIVO ProtectedRoute.JSX
  // const user = JSON.parse(localStorage.getItem("user"));

  // // Restringir acceso a admin_general
  // if (!user || user.rol !== "admin_general") {
  //   return <h2>Acceso denegado</h2>;
  // }

  const fetchUsuarios = async () => {
    try {
      setError("");
      const response = await axios.get(API_URL);
      setUsuarios(response.data);
    } catch (err) {
      setError("Error al obtener usuarios");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.rol.trim()) {
      setError("Por favor completa todos los campos requeridos");
      return false;
    }
    if (!editandoId && !formData.password) {
      setError("La contraseña es requerida para nuevo usuario");
      return false;
    }
    if (
      formData.rol === "admin_general" &&
      (!editandoId || usuarios.some((u) => u.rol === "admin_general" && u.id_usuario !== editandoId))
    ) {
      setError("Ya existe un Administrador General. No se puede crear otro.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validarFormulario()) return;

    setLoading(true);

    try {
      if (editandoId) {
        // Si se está editando, se puede enviar password o no
        await axios.put(`${API_URL}/${editandoId}`, {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          password: formData.password // se puede enviar vacío si no se desea cambiar
        });
        setSuccess("Usuario actualizado correctamente");
      } else {
        await axios.post(API_URL, formData);
        setSuccess("Usuario creado correctamente");
      }

      setFormData({ nombre: "", email: "", password: "", rol: "" });
      setEditandoId(null);
      fetchUsuarios();
    } catch (err) {
      const mensaje = err.response?.data?.message || "Error al guardar";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
    });
    setEditandoId(usuario.id_usuario);
    setError("");
    setSuccess("");
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      setSuccess("Usuario eliminado correctamente");
      fetchUsuarios();
    } catch (err) {
      setError("Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };


  const handleCerrarSesion = () => {
  localStorage.removeItem("user");
  window.location.href = "/"; // o "/login" si tienes ruta específica
  };



  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestión de Usuarios</h1>
        <button onClick={handleCerrarSesion} style={{ padding: "0.5rem 1rem", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "5px" }}>
        Cerrar sesión
        </button>
      </div>

     

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <h2>{editandoId ? "Editar Usuario" : "Nuevo Usuario"}</h2>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <input
          type="password"
          name="password"
          placeholder={editandoId ? "Nueva contraseña (opcional)" : "Contraseña"}
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required={!editandoId}
        />

        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          disabled={loading}
          required
        >
          <option value="">-- Selecciona un rol --</option>
          <option value="solicitante">Solicitante</option>
          <option value="aprobador">Aprobador</option>
          <option value="pagador_banca">Pagador a Banca</option>
          <option value="admin_general">Administrador General</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? (editandoId ? "Actualizando..." : "Creando...") : editandoId ? "Actualizar" : "Crear"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={() => {
              setEditandoId(null);
              setFormData({ nombre: "", email: "", password: "", rol: "" });
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            style={{ marginLeft: "1rem" }}
          >
            Cancelar
          </button>
        )}
      </form>

      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
              <td>
                <button onClick={() => handleEditar(usuario)} disabled={loading}>
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(usuario.id_usuario)}
                  disabled={loading}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosPage;
