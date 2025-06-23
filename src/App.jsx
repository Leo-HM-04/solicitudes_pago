import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import UsuariosPage from "./pages/UsuariosPage";
import ProtectedRoute from "./ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import HomePage from "./pages/HomePage";


function App() {
  return (
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
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
