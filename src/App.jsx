// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Cuenta from "./pages/Cuenta";
import Configuracion from "./pages/Configuracion";
import Facturacion from "./pages/Facturacion";
import EstadisticasUser from './pages/estadisticas_user';
import Chart from "chart.js/auto";






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/estadisticas" element={<EstadisticasUser />} />
      </Routes>
    </Router>
  );
}

export default App;
