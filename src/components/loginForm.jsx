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

  useEffect(() => {
    let timer;
    if (bloqueadoTemporal && !bloqueoPermanente) {
      timer = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setBloqueadoTemporal(false);
            setError("¡Desbloqueado temporalmente! Último intento.");
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
      result.user.rol === "admin_general" ? navigate("/home") : navigate("/");
    } catch (err) {
      const mensaje = err.message || "Error al iniciar sesión.";

      if (mensaje.toLowerCase().includes("bloqueada permanentemente")) {
        setBloqueoPermanente(true);
        setError("Cuenta bloqueada permanentemente. Contacta al administrador.");
        return;
      }

      const matchTiempo = mensaje.match(/(\d+)\s*segundos?/i);
      if (matchTiempo) {
        setTiempoRestante(parseInt(matchTiempo[1], 10));
        setBloqueadoTemporal(true);
        setError(`Bloqueado por ${matchTiempo[1]} segundos.`);
        return;
      }

      const matchIntento = mensaje.match(/Intento\s*(\d+)\s*de\s*(\d+)/i);
      if (matchIntento) {
        setError(`Contraseña incorrecta. Intento ${matchIntento[1]} de ${matchIntento[2]}.`);
        return;
      }

      setError(mensaje);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="logo-box">
        <img src="/Logo_16x9_AzulSinFondo@2x.png" alt="Logo" className="logo-img" />
      </div>
      <div className="login-box">
        <h2>Inicio de sesión</h2>

        {error && <p className="error-msg">{error}</p>}
        {bloqueadoTemporal && !bloqueoPermanente && (
          <p className="wait-msg">Intenta nuevamente en {tiempoRestante} segundos.</p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Usuario:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@example.com"
            disabled={bloqueadoTemporal || bloqueoPermanente}
            required
          />
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            disabled={bloqueadoTemporal || bloqueoPermanente}
            required
          />
          <button type="submit" disabled={bloqueadoTemporal || bloqueoPermanente}>
            Ingresar
          </button>
        </form>
      </div>
      <div className="help-section">
        <a className="help-link" href="#">
          ¿Problemas para iniciar sesión? <strong>Contacta con administración</strong>
        </a>
      </div>
    </div>
  );
};

export default LoginForm;