import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SolicitudService from "../services/SolicitudService";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";
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
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [approvalData, setApprovalData] = useState({ estado: "", comentario_aprobador: "" });
  const [filterStatus, setFilterStatus] = useState("todas");
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
  } = useSidebar("Estado de solicitudes");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    setEditandoId(null);
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

    if (!formData.departamento.trim() || !formData.monto || !formData.concepto.trim()) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

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
      const mensaje = err.response?.data?.error || "Error al guardar";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setApprovalData({ estado: "", comentario_aprobador: "" });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!approvalData.estado) {
      setError("Por favor selecciona un estado");
      return;
    }

    setLoading(true);

    try {
      await SolicitudService.actualizarEstado(selectedSolicitud.id_solicitud, approvalData);
      setSuccess("Estado actualizado correctamente");
      setShowApprovalModal(false);
      fetchSolicitudes();
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al actualizar";
      setError(mensaje);
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

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", class: "status-pending" },
      autorizada: { label: "Autorizada", class: "status-approved" },
      rechazada: { label: "Rechazada", class: "status-rejected" },
      pagada: { label: "Pagada", class: "status-paid" },
    };
    
    const config = statusConfig[estado] || statusConfig.pendiente;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const filteredSolicitudes = solicitudes.filter(solicitud => 
    filterStatus === "todas" || solicitud.estado === filterStatus
  );

  return (
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
              onClick={toggleMenu}
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
              className="add-solicitud-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openNewSolicitudModal}
              aria-label="Nueva solicitud"
            >
              <span>+ Nueva Solicitud</span>
            </motion.button>
          </div>

          {/* Page Title */}
          <motion.div
            className="page-title-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="page-title">Gestión de Solicitudes de Pago</h1>
            <p className="page-subtitle">Administra todas las solicitudes de pago del sistema</p>
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
              value={solicitudes.length}
              icon="📄"
              color="blue"
            />
            <StatsWidget
              title="Pendientes"
              value={solicitudes.filter(s => s.estado === 'pendiente').length}
              icon="⏳"
              color="orange"
            />
            <StatsWidget
              title="Aprobadas"
              value={solicitudes.filter(s => s.estado === 'autorizada').length}
              icon="✅"
              color="green"
            />
            <StatsWidget
              title="Rechazadas"
              value={solicitudes.filter(s => s.estado === 'rechazada').length}
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

          {/* Filter Controls */}
          <motion.div
            className="filter-controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="todas">Todas las solicitudes</option>
              <option value="pendiente">Pendientes</option>
              <option value="autorizada">Autorizadas</option>
              <option value="rechazada">Rechazadas</option>
              <option value="pagada">Pagadas</option>
            </select>
          </motion.div>

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
                    <th>ID</th>
                    <th>Departamento</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSolicitudes.map((solicitud, index) => (
                    <motion.tr
                      key={solicitud.id_solicitud}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                    >
                      <td>#{solicitud.id_solicitud}</td>
                      <td>{solicitud.departamento}</td>
                      <td className="concept-cell">{solicitud.concepto}</td>
                      <td className="amount-cell">${solicitud.monto?.toLocaleString()}</td>
                      <td>{getStatusBadge(solicitud.estado)}</td>
                      <td>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {(user.rol === 'aprobador' || user.rol === 'admin_general') && 
                           solicitud.estado === 'pendiente' && (
                            <motion.button
                              className="approve-button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApproval(solicitud)}
                              disabled={loading}
                            >
                              <span>✓</span>
                              <span>Revisar</span>
                            </motion.button>
                          )}
                          {user.rol === 'admin_general' && (
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
                  ))}
                  {filteredSolicitudes.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <div className="empty-content">
                          <span className="empty-icon">📄</span>
                          <p>No hay solicitudes {filterStatus !== "todas" ? `con estado "${filterStatus}"` : "registradas"}</p>
                          <motion.button
                            className="add-first-solicitud-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openNewSolicitudModal}
                          >
                            Crear primera solicitud
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
                <h3>Nueva Solicitud de Pago</h3>
                <motion.button
                  className="modal-close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </motion.button>
              </div>
              
              <form onSubmit={handleSubmit} className="solicitud-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="departamento">Departamento</label>
                    <input
                      type="text"
                      id="departamento"
                      name="departamento"
                      placeholder="Ej: Recursos Humanos"
                      value={formData.departamento}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="monto">Monto</label>
                    <input
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="concepto">Concepto</label>
                  <textarea
                    id="concepto"
                    name="concepto"
                    placeholder="Describe el motivo del pago..."
                    value={formData.concepto}
                    onChange={handleChange}
                    disabled={loading}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cuenta_destino">Cuenta Destino</label>
                  <input
                    type="text"
                    id="cuenta_destino"
                    name="cuenta_destino"
                    placeholder="Número de cuenta o información bancaria"
                    value={formData.cuenta_destino}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fecha_limite_pago">Fecha Límite de Pago</label>
                    <input
                      type="date"
                      id="fecha_limite_pago"
                      name="fecha_limite_pago"
                      value={formData.fecha_limite_pago}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="factura_url">URL de Factura</label>
                    <input
                      type="url"
                      id="factura_url"
                      name="factura_url"
                      placeholder="https://ejemplo.com/factura.pdf"
                      value={formData.factura_url}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="soporte_url">URL de Soporte</label>
                    <input
                      type="url"
                      id="soporte_url"
                      name="soporte_url"
                      placeholder="https://ejemplo.com/soporte.pdf"
                      value={formData.soporte_url}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
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
                    {loading ? "Creando..." : "Crear Solicitud"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Approval */}
      <AnimatePresence>
        {showApprovalModal && (
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
                <h3>Revisar Solicitud #{selectedSolicitud?.id_solicitud}</h3>
                <motion.button
                  className="modal-close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowApprovalModal(false)}
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="solicitud-details">
                <p><strong>Departamento:</strong> {selectedSolicitud?.departamento}</p>
                <p><strong>Concepto:</strong> {selectedSolicitud?.concepto}</p>
                <p><strong>Monto:</strong> ${selectedSolicitud?.monto?.toLocaleString()}</p>
              </div>

              <form onSubmit={handleApprovalSubmit} className="approval-form">
                <div className="form-group">
                  <label htmlFor="estado">Decisión</label>
                  <select
                    id="estado"
                    name="estado"
                    value={approvalData.estado}
                    onChange={(e) => setApprovalData({...approvalData, estado: e.target.value})}
                    disabled={loading}
                    required
                  >
                    <option value="">-- Selecciona una decisión --</option>
                    <option value="autorizada">Autorizar</option>
                    <option value="rechazada">Rechazar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comentario_aprobador">Comentarios</label>
                  <textarea
                    id="comentario_aprobador"
                    name="comentario_aprobador"
                    placeholder="Comentarios sobre la decisión..."
                    value={approvalData.comentario_aprobador}
                    onChange={(e) => setApprovalData({...approvalData, comentario_aprobador: e.target.value})}
                    disabled={loading}
                    rows="3"
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
                    type="submit"
                    className="submit-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "Confirmar Decisión"}
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

export default SolicitudesPage;
