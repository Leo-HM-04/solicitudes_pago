import { useEffect, useState, useRef } from "react"; // Removed 'use'
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Pagina de inicio");
  const sidebarRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Added for logout animation

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

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
    } else {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="app-container" role="main">
      {/* Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="sidebar"
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
                <p className="user-name">Usuario 01</p>
                <span className="user-role">Administrador</span>
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
        animate={{ marginLeft: isMenuOpen ? "280px" : "0" }}
        transition={{ type: "spring", damping: 20 }}
      >
        <motion.div
          className="home-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          role="region"
          aria-label="Contenido principal"
        >
          {/* Header */}
          <div className="home-header">
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
            <motion.button
              className="notification-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notificaciones"
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
                aria-label="Obtener ayuda"
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
                <img src="/be.png" alt="Video tutorial" className="video-thumbnail" />
                <motion.div
                  className="play-button"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    backgroundColor: isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
                  }}
                  transition={{ duration: 0.8 }}
                  aria-label="Reproducir video"
                >
                  <span className="play-icon">▶️</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;