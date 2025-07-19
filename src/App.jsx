// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Cuenta from "./pages/cuenta";
import Configuracion from "./pages/configuracion";
import Facturacion from "./pages/facturacion";
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
