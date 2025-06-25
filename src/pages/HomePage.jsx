import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use custom sidebar hook
  const {
    isMenuOpen,
    activeMenuItem,
    isLoggingOut,
    setActiveMenuItem,
    setIsLoggingOut,
    toggleMenu,
    closeMenu
  } = useSidebar();

  // Dashboard stats state
  const [dashboardStats] = useState({
    totalPayments: 1250,
    pendingRequests: 23,
    completedToday: 45,
    totalUsers: 89,
    monthlyRevenue: 125000
  });
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
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

  // Dashboard widget component
  const DashboardWidget = ({ title, value, icon, trend, color = "blue" }) => (
    <motion.div
      className={`dashboard-widget widget-${color}`}
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
      {trend && (
        <div className={`widget-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  );

  return (
    <dic className="app.container" role="admin">
            {/* Sidebar Component */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        isLoggingOut={isLoggingOut}
        setIsLoggingOut={setIsLoggingOut}
      />

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        isLoggingOut={isLoggingOut}
        setIsLoggingOut={setIsLoggingOut}
      />

              <motion.div
          className="home-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          role="region"
          aria-label="Contenido principal"
        >          {/* Header */}
          <div className="home-header">
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

            <motion.button
              className="notification-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notificaciones"
            >
              <span>Notificaciones</span>
              <span className="notification-badge">🔔</span>
              <span className="badge-count">3</span>
            </motion.button>          </div>

          {/* Main Content */}
          <div className="home-content">

            {/* Contenido principal centrado */}
            <motion.div
              className="home-text"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.h1
                className="title"
                style={{ 
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1.8rem", 
                    textAlign: "center",
                     }}
              >
                {"PLATAFORMA DE PAGOS".split(" ").map((char, index) => (
                  <motion.span
                    key={index}
                    animate={{ color: ["#ffffff", "#93c5fd", "#ffffff"] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4,
                    }}
                    style={{ fontSize: "2.5rem", fontWeight: "800", textTransform: "uppercase" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>              
              
              <motion.p
                className="description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Desde aquí puedes gestionar todos los aspectos de la plataforma de pagos. 
                Supervisa las transacciones, administra usuarios, genera reportes y mantén 
                el control total del sistema financiero.
              </motion.p>

              <div className="action-buttons">
                <motion.button
                  className="help-button primary"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(30, 64, 175, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("#")}
                  aria-label="?Nesesitas ayuda?"
                >
                  <span>¿Necesitas ayuda?</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

    </dic>
  );
};

export default HomePage;