import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bloqueadoTemporal, setBloqueadoTemporal] = useState(false);
  const [bloqueoPermanente, setBloqueoPermanente] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(15);
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
            setError(
              "¡Atención! Has sido desbloqueado temporalmente. Te queda un último intento antes del bloqueo permanente."
            );
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bloqueadoTemporal, bloqueoPermanente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bloqueadoTemporal || bloqueoPermanente) return;

    setError("");

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

      if (mensaje.toLowerCase().includes("bloqueada permanentemente")) {
        setBloqueoPermanente(true);
        setError("Cuenta bloqueada permanentemente. Contacta al administrador.");
        setBloqueadoTemporal(false);
        return;
      }

      const regexTiempo = /(\d+)\s*segundos?/i;
      const matchTiempo = mensaje.match(regexTiempo);
      if (matchTiempo) {
        const segundos = parseInt(matchTiempo[1], 10);
        setTiempoRestante(segundos);
        setBloqueadoTemporal(true);
        setError(`Demasiados intentos. Tu cuenta está bloqueada por ${segundos} segundos.`);
        setBloqueoPermanente(false);
        return;
      }

      if (mensaje.toLowerCase().includes("último intento antes del bloqueo permanente")) {
        setError("Contraseña incorrecta. ¡Cuidado! Es tu último intento antes del bloqueo permanente.");
        setBloqueadoTemporal(false);
        setBloqueoPermanente(false);
        return;
      }

      const regexIntento = /Intento\s*(\d+)\s*de\s*(\d+)/i;
      const matchIntento = mensaje.match(regexIntento);
      if (matchIntento) {
        const intentoActual = parseInt(matchIntento[1], 10);
        const intentosMax = parseInt(matchIntento[2], 10);
        setError(`Contraseña incorrecta. Intento ${intentoActual} de ${intentosMax}.`);
        return;
      }

      setError(mensaje);
    }
  };

  return (
    <div className="login-form-wrapper">
      <div className="logo-container">
        <img src="/bechapra.png" alt="Bechapra Logo" className="logo" />
      </div>
      <div className="form-container">
        <h2 className="text-3xl font-semibold text-white text-center mb-8">Inicio de sesión</h2>
        {error && (
          <p style={{ color: bloqueoPermanente ? "darkred" : "red", textAlign: "center" }}>{error}</p>
        )}
        {bloqueadoTemporal && !bloqueoPermanente && (
          <p style={{ color: "orange", textAlign: "center" }}>
            Intenta nuevamente en {tiempoRestante} segundos.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white font-medium mb-2 text-lg">Usuario:</label>
            <input
              id="email"
              type="email"
              placeholder="correo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={bloqueadoTemporal || bloqueoPermanente}
              className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-white font-medium mb-2 text-lg">Contraseña:</label>
            <input
              id="password"
              type="password"
              placeholder="Mayús activado"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={bloqueadoTemporal || bloqueoPermanente}
              className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <button
            type="submit"
            disabled={bloqueadoTemporal || bloqueoPermanente}
            className="w-full py-2 px-4 bg-white text-blue-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
      <a href="#" className="help-link">¿Problemas para iniciar sesión? Contacta con administración</a>
    </div>
  );
};

export default LoginForm;