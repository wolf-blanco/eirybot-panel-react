import React from 'react';
import '../styles/Dashboard.css'; // crearemos este también si lo necesitás
import Header from '../components/Header';

const Dashboard = () => {
  return (
    <>
      <Header />
      <main className="dashboard-container">
        <h1 className="dashboard-title">Bienvenido al Panel de Clientes</h1>
        <p className="dashboard-subtext">
          Visualizá el rendimiento de tu bot, personalizá tu cuenta, gestioná tu facturación y accedé a configuraciones.
        </p>
        <div className="dashboard-cards">
          <div className="card">
            <img src="https://eirybot.com/wp-content/uploads/2025/06/MASCOTA-EIRYBOT_4.png" alt="Estadísticas" />
            <h3>Estadísticas</h3>
            <a href="/estadisticas">Ver más</a>
          </div>
          <div className="card">
            <img src="https://eirybot.com/wp-content/uploads/2025/06/MASCOTA-EIRYBOT_3.png" alt="Perfil" />
            <h3>Perfil</h3>
            <a href="#">Personalizar</a>
          </div>
          <div className="card">
            <img src="https://eirybot.com/wp-content/uploads/2025/06/MASCOTA-EIRYBOT_2.png" alt="Facturación" />
            <h3>Facturación</h3>
            <a href="#">Gestionar</a>
          </div>
          <div className="card">
            <img src="https://eirybot.com/wp-content/uploads/2025/06/MASCOTA-EIRYBOT_1.png" alt="Configuración" />
            <h3>Configuración</h3>
            <a href="#">Acceder</a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
