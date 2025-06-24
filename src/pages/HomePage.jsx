import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  return (
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>☰</span>
          <span>Menú</span>
        </motion.button>
        <motion.button
          className="notifications-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Rectificaciones</span>
          <span>🔔</span>
        </motion.button>
      </div>

      {/* Contenido principal */}
      <div className="home-content">
        {/* Columna izquierda */}
        <motion.div 
          className="home-text"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1 
            className="title"
            whileHover={{ scale: 1.02 }}
          >
            PLATAFORMA DE PAGOS
          </motion.h1>
          
          <motion.h2
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Aprende a usar la nueva plataforma de bechapra.
          </motion.h2>
          
          <motion.p
            className="description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </motion.p>
          
          <motion.button
            className="help-button"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(26, 35, 126, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            ¿Necesitas ayuda?
          </motion.button>
        </motion.div>

        {/* Columna derecha: Video */}
        <motion.div 
          className="home-video"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="video-container"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
          >
            <img
              src="/b.png"
              alt="Video tutorial"
              className="video-thumbnail"
            />
            <motion.div 
              className="play-button"
              animate={{
                scale: isHovered ? 1.1 : 1,
                backgroundColor: isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.9)"
              }}
            >
              ▶
            </motion.div>
          </motion.div>
          <div className="video-author">uxchristopher</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;