import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../services/axiosConfig";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";
import "../styles/UsuariosPage.css";

const API_URL = "/usuarios";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({ 
    nombre: "", 
    email: "", 
    password: "", 
    rol: "" 
  });
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  // Use custom sidebar hook
  const {
    isMenuOpen,
    activeMenuItem,
    isLoggingOut,
    setActiveMenuItem,
    setIsLoggingOut,
    toggleMenu,
    closeMenu
  } = useSidebar("Centro de administración");
  
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setUsuarios(response.data);
    } catch (err) {
      setError("Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const openNewUserModal = () => {
    setFormData({ nombre: "", email: "", password: "", rol: "" });
    setEditandoId(null);
    setShowModal(true);
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
      usuarios.some(u => u.rol === "admin_general" && u.id_usuario !== editandoId)
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
        await axios.put(`${API_URL}/${editandoId}`, {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          ...(formData.password && { password: formData.password })
        });
        setSuccess("Usuario actualizado correctamente");
      } else {
        await axios.post(API_URL, formData);
        setSuccess("Usuario creado correctamente");
      }
      setFormData({ nombre: "", email: "", password: "", rol: "" });
      setEditandoId(null);
      setShowModal(false);
      await fetchUsuarios();
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
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      setSuccess("Usuario eliminado correctamente");
      await fetchUsuarios();
    } catch (err) {
      setError("Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page">
      <div className="app-container" role="main">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        isLoggingOut={isLoggingOut}
        setIsLoggingOut={setIsLoggingOut}
      />
      
      {/* Main Content */}
      <motion.div 
        className="main-content"
        animate={{ marginLeft: isMenuOpen ? "280px" : "0" }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="users-container">
          <div className="users-header">
            <button
              className="menu-button"
              onClick={toggleMenu}
              aria-label="Abrir menú"
            >
              <span>☰</span>
              <span>Menú</span>
            </button>
            <div className="header-info">
              <div className="date-time">
                <h3>{formatDate(currentTime)}</h3>
                <p>{formatTime(currentTime)}</p>
              </div>
            </div>
            <button
              className="add-user-button"
              onClick={openNewUserModal}
              aria-label="Agregar nuevo usuario"
              disabled={loading}
            >
              <span>+ Agregar Usuario</span>
            </button>
          </div>
          <div className="page-title-section">
            <h1 className="page-title">Gestión de Usuarios</h1>
            <p className="page-subtitle">Administra todos los usuarios del sistema desde este panel</p>
          </div>
          <div className="users-stats">
            <div className="stats-widget widget-blue">
              <div className="widget-header">
                <span className="widget-icon">👥</span>
                <span className="widget-title">Total Usuarios</span>
              </div>
              <div className="widget-value">{usuarios.length}</div>
            </div>
            <div className="stats-widget widget-purple">
              <div className="widget-header">
                <span className="widget-icon">⚙️</span>
                <span className="widget-title">Administradores</span>
              </div>
              <div className="widget-value">{usuarios.filter(u => u.rol === 'admin_general').length}</div>
            </div>
            <div className="stats-widget widget-orange">
              <div className="widget-header">
                <span className="widget-icon">📈</span>
                <span className="widget-title">Roles Diversos</span>
              </div>
              <div className="widget-value">{new Set(usuarios.map(u => u.rol)).size}</div>
            </div>
          </div>
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">❌</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}
          <div className="users-table-container">
            <div className="table-header">
              <h3>Lista de Usuarios</h3>
              <div className="table-actions">
                <button
                  className="refresh-button"
                  onClick={fetchUsuarios}
                  disabled={loading}
                >
                  <span>🔄</span>
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length > 0 ? (
                    usuarios.map((usuario) => (
                      <tr key={usuario.id_usuario}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar-small">
                              <span>{usuario.nombre.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="user-name-cell">{usuario.nombre}</span>
                          </div>
                        </td>
                        <td>{usuario.email}</td>
                        <td>
                          <span className={`role-badge role-${usuario.rol.replace('_', '-')}`}>
                            {usuario.rol === 'admin_general' ? 'Administrador' : 
                             usuario.rol === 'solicitante' ? 'Solicitante' :
                             usuario.rol === 'aprobador' ? 'Aprobador' :
                             usuario.rol === 'pagador_banca' ? 'Pagador' : usuario.rol}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEditar(usuario)}
                              disabled={loading}
                            >
                              <span>✏️</span>
                              <span>Editar</span>
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleEliminar(usuario.id_usuario)}
                              disabled={loading || (usuario.rol === 'admin_general' && user.id_usuario === usuario.id_usuario)}
                            >
                              <span>🗑️</span>
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <div className="empty-content">
                          <span className="empty-icon">👥</span>
                          <p>No hay usuarios registrados</p>
                          <button
                            className="add-first-user-btn"
                            onClick={openNewUserModal}
                            disabled={loading}
                          >
                            Agregar primer usuario
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay" 
            onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>{editandoId ? "Editar Usuario" : "Nuevo Usuario"}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingresa el nombre completo"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">
                    Contraseña {editandoId && "(dejar vacío para mantener la actual)"}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder={editandoId ? "Nueva contraseña (opcional)" : "Contraseña"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required={!editandoId}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rol">Rol</label>
                  <select
                    id="rol"
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
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (editandoId ? "Actualizando..." : "Creando...") : (editandoId ? "Actualizar" : "Crear Usuario")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default UsuariosPage;