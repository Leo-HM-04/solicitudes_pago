import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ 
  isOpen, 
  onClose, 
  activeMenuItem, 
  setActiveMenuItem, 
  isLoggingOut, 
  setIsLoggingOut 
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const menuItems = [
    { title: "Pagina de inicio", icon: "🏠", route: "/home" },
    { title: "Solicitar un pago", icon: "💸", route: "/solicitudes" },
    { title: "Estado de solicitudes", icon: "📊", route: "/solicitudes" },
    { title: "Reportes de actividad", icon: "📝", route: "/reportes" },
    { title: "Centro de administración", icon: "⚙️", route: "/usuarios" },
    { title: "Cerrar sesión", icon: "🚪", route: null },
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
    } else if (item.route) {
      navigate(item.route);
      onClose();
    } else {
      onClose();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Cerrar menú"
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
