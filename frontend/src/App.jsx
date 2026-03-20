import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AbonadosList from "./pages/AbonadosList";
import ConexionesList from "./pages/ConexionesList";
import UsuariosList from "./pages/UsuariosList";
import AdminPage from "./pages/AdminPage";
import FacturacionPage from "./pages/FacturacionPage";
import EstadoCuentaPage from "./pages/EstadoCuentaPage";
import CobroMasivoPage from "./pages/CobroMasivoPage";
import ReportesPage from "./pages/ReportesPage";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="abonados" element={<AbonadosList />} />
          <Route path="conexiones" element={<ConexionesList />} />
          <Route path="usuarios" element={<UsuariosList />} />
          <Route path="facturacion" element={<FacturacionPage />} />
          <Route path="estado-cuenta" element={<EstadoCuentaPage />} />
          <Route path="cobro-masivo" element={<CobroMasivoPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
