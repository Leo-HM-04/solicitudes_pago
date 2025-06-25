import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SolicitudService from "../services/SolicitudService";
import "../styles/SolicitudesPage.css";

const SolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [formData, setFormData] = useState({
    departamento: "",
    monto: "",
    cuenta_destino: "",
    factura_url: "",
    concepto: "",
    fecha_limite_pago: "",
    soporte_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Solicitar un pago");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ estado: "", comentario: "" });
  const [isMenuMinimized, setIsMenuMinimized] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.rol === "admin_general";
  const isAprobador = user?.rol === "aprobador";
  const isSolicitante = user?.rol === "solicitante";

  // Stats for dashboard
  const solicitudesStats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    autorizadas: solicitudes.filter(s => s.estado === 'autorizada').length,
    rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
  };

  const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const fetchSolicitudes = async () => {
    try {
      setError("");
      const response = await SolicitudService.getSolicitudes();
      setSolicitudes(response.data);
    } catch (err) {
      setError("Error al obtener solicitudes");
    }
  };

  useEffect(() => {
    fetchSolicitudes();
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
    } else if (item.title === "Centro de administración") {
      navigate("/usuarios");
    } else if (item.title === "Solicitar un pago" || item.title === "Estado de solicitudes") {
      // Ya estamos en solicitudes, cerrar menú
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const openNewSolicitudModal = () => {
    setFormData({
      departamento: "",
      monto: "",
      cuenta_destino: "",
      factura_url: "",
      concepto: "",
      fecha_limite_pago: "",
      soporte_url: "",
    });
    setShowModal(true);
    setError("");
    setSuccess("");
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await SolicitudService.crearSolicitud(formData);
      setSuccess("Solicitud creada correctamente");
      setFormData({
        departamento: "",
        monto: "",
        cuenta_destino: "",
        factura_url: "",
        concepto: "",
        fecha_limite_pago: "",
        soporte_url: "",
      });
      setShowModal(false);
      fetchSolicitudes();
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al crear solicitud";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedSolicitud || !approvalData.estado) return;

    setLoading(true);
    try {
      await SolicitudService.actualizarEstado(
        selectedSolicitud.id_solicitud,
        approvalData.estado,
        approvalData.comentario
      );
      setSuccess(`Solicitud ${approvalData.estado} correctamente`);
      setShowApprovalModal(false);
      setSelectedSolicitud(null);
      setApprovalData({ estado: "", comentario: "" });
      fetchSolicitudes();
    } catch (err) {
      setError("Error al actualizar estado de solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta solicitud?")) return;

    try {
      setLoading(true);
      await SolicitudService.eliminarSolicitud(id);
      setSuccess("Solicitud eliminada correctamente");
      fetchSolicitudes();
    } catch (err) {
      setError("Error al eliminar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { color: "warning", text: "Pendiente", icon: "⏳" },
      autorizada: { color: "success", text: "Autorizada", icon: "✅" },
      rechazadas: { color: "danger", text: "Rechazada", icon: "❌" },
    };
    return estados[estado] || { color: "secondary", text: estado, icon: "❓" };
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
                <p className="user-name">{user?.nombre || 'Usuario'}</p>
                <span className="user-role">
                  {user?.rol === 'admin_general' ? 'Administrador' : 
                   user?.rol === 'solicitante' ? 'Solicitante' :
                   user?.rol === 'aprobador' ? 'Aprobador' :
                   user?.rol === 'pagador_banca' ? 'Pagador' : user?.rol}
                </span>
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
          className={`solicitudes-container ${screenSize <= 768 ? 'mobile-view' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          role="region"
          aria-label="Gestión de solicitudes"
        >
          {/* Header */}
          <div className="solicitudes-header">
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

            {isSolicitante && (
              <motion.button
                className="add-solicitud-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openNewSolicitudModal}
                aria-label="Nueva solicitud"
              >
                <span>+ Nueva Solicitud</span>
              </motion.button>
            )}
          </div>

          {/* Page Title */}
          <motion.div
            className="page-title-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ paddingTop: "0px" }}
          >
            <h1
              className="page-title"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#fff",
                fontWeight: 700,
                letterSpacing: "0.5px"
              }}
            >
              {isSolicitante ? "Mis Solicitudes" : "Gestión de Solicitudes"}
            </h1>
            <p className="page-subtitle">
              {isSolicitante 
                ? "Crea y gestiona tus solicitudes de pago" 
                : "Supervisa y procesa las solicitudes de pago del sistema"}
            </p>
          </motion.div>

          {/* Stats Dashboard */}
          <motion.div
            className="solicitudes-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <StatsWidget
              title="Total Solicitudes"
              value={solicitudesStats.total}
              icon="📋"
              color="blue"
            />
            <StatsWidget
              title="Pendientes"
              value={solicitudesStats.pendientes}
              icon="⏳"
              color="orange"
            />
            <StatsWidget
              title="Autorizadas"
              value={solicitudesStats.autorizadas}
              icon="✅"
              color="green"
            />
            <StatsWidget
              title="Rechazadas"
              value={solicitudesStats.rechazadas}
              icon="❌"
              color="red"
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

          {/* Solicitudes Table */}
          <motion.div
            className="solicitudes-table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="table-header">
              <h3>Lista de Solicitudes</h3>
              <div className="table-actions">
                <motion.button
                  className="refresh-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchSolicitudes}
                  disabled={loading}
                >
                  <span>🔄</span>
                  <span>Actualizar</span>
                </motion.button>
              </div>
            </div>
            
            <div className="table-wrapper">
              <table className="solicitudes-table">
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Monto</th>
                    <th>Concepto</th>
                    <th>Estado</th>
                    <th>Fecha Límite</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud, index) => {
                    const estadoInfo = getEstadoBadge(solicitud.estado);
                    return (
                      <motion.tr
                        key={solicitud.id_solicitud}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ backgroundColor: "#f8fafc" }}
                      >
                        <td>{solicitud.departamento}</td>
                        <td>${parseFloat(solicitud.monto).toLocaleString()}</td>
                        <td>{solicitud.concepto}</td>
                        <td>
                          <span className={`status-badge status-${estadoInfo.color}`}>
                            {estadoInfo.icon} {estadoInfo.text}
                          </span>
                        </td>
                        <td>{new Date(solicitud.fecha_limite_pago).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            {(isAprobador || isAdmin) && solicitud.estado === 'pendiente' && (
                              <motion.button
                                className="approve-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedSolicitud(solicitud);
                                  setShowApprovalModal(true);
                                }}
                                disabled={loading}
                              >
                                <span>⚖️</span>
                                <span>Evaluar</span>
                              </motion.button>
                            )}
                            {isAdmin && (
                              <motion.button
                                className="delete-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEliminar(solicitud.id_solicitud)}
                                disabled={loading}
                              >
                                <span>🗑️</span>
                                <span>Eliminar</span>
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {solicitudes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-content">
                          <span className="empty-icon">📋</span>
                          <p>No hay solicitudes registradas</p>
                          {isSolicitante && (
                            <motion.button
                              className="add-first-solicitud-btn"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={openNewSolicitudModal}
                            >
                              Crear primera solicitud
                            </motion.button>
                          )}
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

      {/* Modal for New Solicitud */}
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
              className="modal-content large-modal"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-section">
                  <h3>💰 Nueva Solicitud de Pago</h3>
                  <p>Complete todos los campos para crear su solicitud</p>
                </div>
                <motion.button
                  className="modal-close"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </motion.button>
              </div>
              
              <form onSubmit={handleSubmit} className="solicitud-form">
                {/* Información Básica */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📋</span>
                    <h4>Información Básica</h4>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="departamento">
                        <span className="label-icon">🏢</span>
                        Departamento
                        <span className="required">*</span>
                      </label>
                      <motion.input
                        type="text"
                        id="departamento"
                        name="departamento"
                        placeholder="Ej: Sistemas, Contabilidad, Marketing"
                        value={formData.departamento}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="monto">
                        <span className="label-icon">💵</span>
                        Monto
                        <span className="required">*</span>
                      </label>
                      <motion.input
                        type="number"
                        id="monto"
                        name="monto"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={formData.monto}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Pago */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">🏦</span>
                    <h4>Información de Pago</h4>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cuenta_destino">
                        <span className="label-icon">🔢</span>
                        Cuenta Destino
                        <span className="required">*</span>
                      </label>
                      <motion.input
                        type="text"
                        id="cuenta_destino"
                        name="cuenta_destino"
                        placeholder="Ej: 1234-5678-9012-3456"
                        value={formData.cuenta_destino}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fecha_limite_pago">
                        <span className="label-icon">📅</span>
                        Fecha Límite de Pago
                        <span className="required">*</span>
                      </label>
                      <motion.input
                        type="date"
                        id="fecha_limite_pago"
                        name="fecha_limite_pago"
                        value={formData.fecha_limite_pago}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📝</span>
                    <h4>Descripción del Pago</h4>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="concepto">
                      <span className="label-icon">💭</span>
                      Concepto
                      <span className="required">*</span>
                    </label>
                    <motion.textarea
                      id="concepto"
                      name="concepto"
                      placeholder="Describa detalladamente el concepto del pago, incluyendo servicios, productos o gastos a cubrir..."
                      value={formData.concepto}
                      onChange={handleChange}
                      disabled={loading}
                      rows="4"
                      required
                      whileFocus={{ scale: 1.01 }}
                      className="form-textarea"
                    />
                    <div className="textarea-counter">
                      {formData.concepto.length}/500 caracteres
                    </div>
                  </div>
                </div>

                {/* Documentos de Soporte */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📎</span>
                    <h4>Documentos de Soporte</h4>
                    <span className="section-subtitle">Opcional - Adjunte enlaces a documentos relevantes</span>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="factura_url">
                        <span className="label-icon">🧾</span>
                        URL de Factura
                      </label>
                      <motion.input
                        type="url"
                        id="factura_url"
                        name="factura_url"
                        placeholder="https://ejemplo.com/factura.pdf"
                        value={formData.factura_url}
                        onChange={handleChange}
                        disabled={loading}
                        whileFocus={{ scale: 1.02 }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="soporte_url">
                        <span className="label-icon">📄</span>
                        URL de Soporte
                      </label>
                      <motion.input
                        type="url"
                        id="soporte_url"
                        name="soporte_url"
                        placeholder="https://ejemplo.com/soporte.pdf"
                        value={formData.soporte_url}
                        onChange={handleChange}
                        disabled={loading}
                        whileFocus={{ scale: 1.02 }}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                {(formData.departamento || formData.monto || formData.concepto) && (
                  <motion.div 
                    className="form-section summary-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="section-title">
                      <span className="section-icon">📊</span>
                      <h4>Resumen de la Solicitud</h4>
                    </div>
                    <div className="summary-content">
                      {formData.departamento && (
                        <div className="summary-item">
                          <strong>Departamento:</strong> {formData.departamento}
                        </div>
                      )}
                      {formData.monto && (
                        <div className="summary-item">
                          <strong>Monto:</strong> ${parseFloat(formData.monto || 0).toLocaleString()}
                        </div>
                      )}
                      {formData.concepto && (
                        <div className="summary-item">
                          <strong>Concepto:</strong> {formData.concepto.substring(0, 100)}{formData.concepto.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="cancel-button"
                    whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    <span>❌</span>
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="submit-button"
                    whileHover={{ scale: 1.05, backgroundColor: "#059669" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || !formData.departamento || !formData.monto || !formData.concepto}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner">⏳</span>
                        Creando...
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        Crear Solicitud
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Approval */}
      <AnimatePresence>
        {showApprovalModal && selectedSolicitud && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Evaluar Solicitud</h3>
                <motion.button
                  className="modal-close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowApprovalModal(false)}
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="approval-form">
                <div className="solicitud-details">
                  <h4>Detalles de la Solicitud</h4>
                  <p><strong>Departamento:</strong> {selectedSolicitud.departamento}</p>
                  <p><strong>Monto:</strong> ${parseFloat(selectedSolicitud.monto).toLocaleString()}</p>
                  <p><strong>Concepto:</strong> {selectedSolicitud.concepto}</p>
                  <p><strong>Cuenta Destino:</strong> {selectedSolicitud.cuenta_destino}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="estado">Decisión</label>
                  <select
                    id="estado"
                    value={approvalData.estado}
                    onChange={(e) => setApprovalData({...approvalData, estado: e.target.value})}
                    required
                  >
                    <option value="">-- Selecciona una decisión --</option>
                    <option value="autorizada">Autorizar</option>
                    <option value="rechazada">Rechazar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comentario">Comentario</label>
                  <textarea
                    id="comentario"
                    placeholder="Comentarios sobre la decisión"
                    value={approvalData.comentario}
                    onChange={(e) => setApprovalData({...approvalData, comentario: e.target.value})}
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="cancel-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowApprovalModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="button"
                    className="submit-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApproval}
                    disabled={loading || !approvalData.estado}
                  >
                    {loading ? "Procesando..." : "Confirmar Decisión"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SolicitudesPage;
