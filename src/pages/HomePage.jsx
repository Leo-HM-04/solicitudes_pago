import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Pagina de inicio");

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

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
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
          >
          <div className="user-profile">
            <img src="/b.png" alt="Usuario" className="user-avatar" />
            <div className="user-details">
              <p className="user-name">Usuario 01</p>
              <span className="user-role">Administrador</span>
            </div>
          </div>
            <nav className="menu">
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
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {item.title}
                    {["Reportes de actividad", "Centro de administración"].includes(item.title) && (
                      <span className="sub-item-indicator"></span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="config-fixed">
              <span>Configuración</span>
              <span>⚙️</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        className="main-content"
        animate={{ marginLeft: isMenuOpen ? "280px" : "0" }}
        transition={{ type: "spring", damping: 20 }}
      >
        <motion.div
          className="home-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="home-header">
            <motion.button
              className="menu-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span>☰</span>
              <span>Menú</span>
            </motion.button>

            <motion.button
              className="notification-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Notificaciones</span>
              <span>🔔</span>
            </motion.button>
          </div>

          {/* Main Content */}
          <div className="home-content">
            {/* Left Column */}
            <motion.div
              className="home-text"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.h1 className="title" whileHover={{ scale: 1.02 }}>
                PLATAFORMA DE PAGOS
              </motion.h1>
              <motion.h2
                className="subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Aprende a usar la nueva plataforma de bechapra.
              </motion.h2>
              <motion.p
                className="description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </motion.p>
              <motion.button
                className="help-button"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(30, 64, 175, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ¿Necesitas ayuda?
              </motion.button>
            </motion.div>

            {/* Right Column */}
            <motion.div
              className="home-video"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                className="video-container"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: 1.03 }}
              >
                <img src="/b.png" alt="Video tutorial" className="video-thumbnail" />
                <motion.div
                  className="play-button"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    backgroundColor: isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  ▶
                </motion.div>
              </motion.div>
              <div className="video-author">uxchristopher</div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;
