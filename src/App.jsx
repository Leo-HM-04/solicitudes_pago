import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import UsuariosPage from "./pages/UsuariosPage";
import SolicitudesPage from "./pages/SolicitudesPage";
import ProtectedRoute from "./ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import HomePage from "./pages/HomePage";
import "./index.css";
import "./styles/login/index.css"
import "./styles/home/index.css"

function App() { 
  return (
    <div id="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["admin_general"]}>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitudes"
            element={
              <ProtectedRoute allowedRoles={["admin_general", "solicitante", "aprobador", "pagador_banca"]}>
                <SolicitudesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
