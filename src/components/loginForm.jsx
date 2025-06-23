import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bloqueadoTemporal, setBloqueadoTemporal] = useState(false); // Para bloqueo temporal
  const [bloqueoPermanente, setBloqueoPermanente] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(15); // Inicializado con 15 segundos
  const navigate = useNavigate();

  // Temporizador para desbloqueo temporal
  useEffect(() => {
    let timer;
    if (bloqueadoTemporal && !bloqueoPermanente) {
      timer = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setBloqueadoTemporal(false);
            // Mensaje al expirar el bloqueo temporal, indicando que tiene un último intento
            setError("¡Atención! Has sido desbloqueado temporalmente. Te queda un último intento antes del bloqueo permanente.");
            return 15; // Resetear el tiempo para la próxima vez
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bloqueadoTemporal, bloqueoPermanente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bloqueadoTemporal || bloqueoPermanente) return; // Evita envíos si está bloqueado

    setError(""); // Limpiar errores anteriores

    try {
      const result = await authService.login(email, password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.user.rol === "admin_general") {
        navigate("/home");
      } else {
        navigate("/");
      }
    } catch (err) {
      const mensaje = err.message || "Error al iniciar sesión.";

      // Bloqueo permanente
      if (mensaje.toLowerCase().includes("bloqueada permanentemente")) {
        setBloqueoPermanente(true);
        setError("Cuenta bloqueada permanentemente. Contacta al administrador.");
        setBloqueadoTemporal(false); // Asegúrate de que el estado de bloqueo temporal se desactive
        return;
      }

      // Bloqueo temporal
      const regexTiempo = /(\d+)\s*segundos?/i;
      const matchTiempo = mensaje.match(regexTiempo);
      if (matchTiempo) {
        const segundos = parseInt(matchTiempo[1], 10);
        setTiempoRestante(segundos);
        setBloqueadoTemporal(true);
        setError(`Demasiados intentos. Tu cuenta está bloqueada por ${segundos} segundos.`);
        setBloqueoPermanente(false); // Asegúrate de que el estado de bloqueo permanente se desactive
        return;
      }

      // Último intento antes del bloqueo permanente
      if (mensaje.toLowerCase().includes("último intento antes del bloqueo permanente")) {
        setError("Contraseña incorrecta. ¡Cuidado! Es tu último intento antes del bloqueo permanente.");
        setBloqueadoTemporal(false); // Ya no está bloqueado temporalmente, ahora tiene un intento
        setBloqueoPermanente(false); // No está bloqueado permanentemente todavía
        return;
      }

      // Mensaje de intentos restantes antes del bloqueo temporal
      const regexIntento = /Intento\s*(\d+)\s*de\s*(\d+)/i;
      const matchIntento = mensaje.match(regexIntento);
      if (matchIntento) {
        const intentoActual = parseInt(matchIntento[1], 10);
        const intentosMax = parseInt(matchIntento[2], 10);
        setError(`Contraseña incorrecta. Intento ${intentoActual} de ${intentosMax}.`);
        return;
      }

      // Mensaje genérico para cualquier otra credencial inválida
      setError(mensaje);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", width: "300px" }}
    >
      <h2>Iniciar Sesión</h2>

      {error && <p style={{ color: bloqueoPermanente ? "darkred" : "red" }}>{error}</p>}

      {bloqueadoTemporal && !bloqueoPermanente && (
        <p style={{ color: "orange" }}>
          Intenta nuevamente en {tiempoRestante} segundos.
        </p>
      )}

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={bloqueadoTemporal || bloqueoPermanente}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={bloqueadoTemporal || bloqueoPermanente}
      />

      <button type="submit" disabled={bloqueadoTemporal || bloqueoPermanente}>
        Entrar
      </button>
    </form>
  );
};

export default LoginForm;