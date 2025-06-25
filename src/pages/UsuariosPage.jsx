import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../services/axiosConfig";
import "../styles/UsuariosPage.css";

const API_URL = "/usuarios";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Centro de administración");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));

  // Dashboard stats for users
  const [userStats] = useState({
    totalUsers: usuarios.length,
    adminUsers: usuarios.filter(u => u.rol === 'admin_general').length,
    activeUsers: usuarios.length, // Assuming all users are active
    recentlyAdded: usuarios.filter(u => {
      // Mock recent users logic
      return true;
    }).length
  });

  // Hook para detectar el tamaño de pantalla
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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

  const menuItems = [
    { title: "Pagina de inicio", icon: "🏠" },
    { title: "Solicitar un pago", icon: "💸" },
    { title: "Estado de solicitudes", icon: "📊" },
    { title: "Reportes de actividad", icon: "📝" },
    { title: "Centro de administración", icon: "⚙️" },
    { title: "Cerrar sesión", icon: "🚪" },
  ];

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.title);
    if (item.title === "Cerrar sesión") {
      setIsLoggingOut(true);
      setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
      }, 500);
    } else if (item.title === "Pagina de inicio") {
      navigate("/home");
    } else if (item.title === "Solicitar un pago") {
      navigate("/solicitudes");
    } else {
      setIsMenuOpen(false);
    }
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

  // Dashboard widget component
  const StatsWidget = ({ title, value, icon, color = "blue" }) => (
    <motion.div
      className={`stats-widget widget-${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="widget-header">
        <span className="widget-icon">{icon}</span>
        <span className="widget-title">{title}</span>
      </div>
      <div className="widget-value">{value}</div>
    </motion.div>
  );

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
      }      setFormData({ nombre: "", email: "", password: "", rol: "" });
      setEditandoId(null);
      setShowModal(false);
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
    <div className="app-container" role="main">
      {/* Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`sidebar ${isMenuOpen ? 'open' : ''}`}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%", opacity: isLoggingOut ? 0 : 1 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 150,
              duration: isLoggingOut ? 0.5 : 0,
            }}
            aria-label="Menu lateral"
            ref={sidebarRef}
          >
            <div className="user-profile">
              <img src="/b.png" alt="Avatar del usuario" className="user-avatar" />
              <div className="user-details">
                <p className="user-name">{user?.name || 'Administrador'}</p>
                <span className="user-role">Administrador</span>
                <div className="user-time">
                  <small>{formatTime(currentTime)}</small>
                </div>
              </div>
            </div>
            <nav className="menu" role="navigation">
              <ul>
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMenuItemClick(item)}
                    className={activeMenuItem === item.title ? "active" : ""}
                    aria-label={item.title}
                  >
                    <span className="menu-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.title}
                    {["Reportes de actividad", "Centro de administración"].includes(item.title) && (
                      <span className="sub-item-indicator" aria-hidden="true"></span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.button
              className="close-btn"
              onClick={() => setIsMenuOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Cerrar menú"
            >
              ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        className="main-content"
        animate={{ 
          marginLeft: screenSize > 768 && isMenuOpen ? "280px" : "0" 
        }}
        transition={{ type: "spring", damping: 20 }}
      >
        <motion.div
          className={`users-container ${screenSize <= 768 ? 'mobile-view' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          role="region"
          aria-label="Gestión de usuarios"
        >
          {/* Header */}
          <div className="users-header">
            <motion.button
              className="menu-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú"
            >
              <span>☰</span>
              <span>Menú</span>
            </motion.button>
            
            <div className="header-info">
              <div className="date-time">
                <h3>{formatDate(currentTime)}</h3>
                <p>{formatTime(currentTime)}</p>
              </div>
            </div>

            <motion.button
              className="add-user-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openNewUserModal}
              aria-label="Agregar nuevo usuario"
            >
              <span>+ Agregar Usuario</span>
            </motion.button>
          </div>

          {/* Page Title */}
          <motion.div
            className="page-title-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="page-title">Gestión de Usuarios</h1>
            <p className="page-subtitle">Administra todos los usuarios del sistema desde este panel</p>
          </motion.div>

          {/* Stats Dashboard */}
          <motion.div
            className="users-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <StatsWidget
              title="Total Usuarios"
              value={usuarios.length}
              icon="👥"
              color="blue"
            />
            <StatsWidget
              title="Administradores"
              value={usuarios.filter(u => u.rol === 'admin_general').length}
              icon="⚙️"
              color="purple"
            />
            <StatsWidget
              title="Roles Diversos"
              value={new Set(usuarios.map(u => u.rol)).size}
              icon="📈"
              color="orange"
            />
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="alert alert-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <span className="alert-icon">❌</span>
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                className="alert alert-success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <span className="alert-icon">✅</span>
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users Table */}
          <motion.div
            className="users-table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="table-header">
              <h3>Lista de Usuarios</h3>
              <div className="table-actions">
                <motion.button
                  className="refresh-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchUsuarios}
                  disabled={loading}
                >
                  <span>🔄</span>
                  <span>Actualizar</span>
                </motion.button>
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
                  {usuarios.map((usuario, index) => (
                    <motion.tr
                      key={usuario.id_usuario}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                    >
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
                          <motion.button
                            className="edit-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditar(usuario)}
                            disabled={loading}
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </motion.button>
                          <motion.button
                            className="delete-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEliminar(usuario.id_usuario)}
                            disabled={loading}
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <div className="empty-content">
                          <span className="empty-icon">👥</span>
                          <p>No hay usuarios registrados</p>
                          <motion.button
                            className="add-first-user-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openNewUserModal}
                          >
                            Agregar primer usuario
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal for Add/Edit User */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editandoId ? "Editar Usuario" : "Nuevo Usuario"}</h3>
                <motion.button
                  className="modal-close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </motion.button>
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
                  <motion.button
                    type="button"
                    className="cancel-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="submit-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                  >
                    {loading ? (editandoId ? "Actualizando..." : "Creando...") : (editandoId ? "Actualizar" : "Crear Usuario")}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsuariosPage;
