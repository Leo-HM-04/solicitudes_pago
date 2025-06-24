import { motion } from "framer-motion";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "payment",
      description: "Pago procesado por $1,250.00",
      user: "Juan Pérez",
      time: "Hace 5 minutos",
      status: "completed",
      icon: "💰"
    },
    {
      id: 2,
      type: "user",
      description: "Nuevo usuario registrado",
      user: "María González",
      time: "Hace 15 minutos",
      status: "new",
      icon: "👤"
    },
    {
      id: 3,
      type: "request",
      description: "Solicitud de pago pendiente",
      user: "Carlos Rodríguez",
      time: "Hace 30 minutos",
      status: "pending",
      icon: "⏳"
    },
    {
      id: 4,
      type: "report",
      description: "Reporte mensual generado",
      user: "Sistema",
      time: "Hace 1 hora",
      status: "info",
      icon: "📊"
    },
    {
      id: 5,
      type: "security",
      description: "Inicio de sesión detectado",
      user: "Admin Usuario",
      time: "Hace 2 horas",
      status: "security",
      icon: "🔐"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: "#22c55e",
      new: "#3b82f6",
      pending: "#f59e0b",
      info: "#8b5cf6",
      security: "#ef4444"
    };
    return colors[status] || "#6b7280";
  };

  return (
    <motion.div
      className="recent-activity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <div className="activity-header">
        <h3 className="activity-title">Actividad Reciente</h3>
        <motion.button
          className="view-all-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Ver todo
        </motion.button>
      </div>
      
      <div className="activity-list">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="activity-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ backgroundColor: "#f8fafc", scale: 1.01 }}
          >
            <div 
              className="activity-icon"
              style={{ backgroundColor: `${getStatusColor(activity.status)}15` }}
            >
              {activity.icon}
            </div>
            <div className="activity-content">
              <p className="activity-description">{activity.description}</p>
              <div className="activity-meta">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-separator">•</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
            <div 
              className="activity-status"
              style={{ backgroundColor: getStatusColor(activity.status) }}
            ></div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
