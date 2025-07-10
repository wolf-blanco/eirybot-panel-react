// src/components/Header.jsx
import "./Header.css";

function Header({ nombre = "Usuario", foto }) {
  return (
    <header>
      <div className="logo">
        <img src="https://eirybot.com/wp-content/uploads/2025/04/eirylogopdf2.png" alt="EiryBot Mascota" />
        <strong>Panel de Clientes EiryBot</strong>
      </div>
      <div className="user-profile" onClick={() => toggleDropdown()}>
        <img
          id="userAvatar"
          src={foto || "https://eirybot.com/wp-content/uploads/2025/06/MASCOTA-EIRYBOT_3.png"}
          alt="Perfil"
        />
        <span className="user-name" id="userName">{nombre}</span>
        <div id="userDropdown" className="dropdown">
          <a href="/">Inicio</a>
          <a href="/dashboard">Estadísticas</a>
          <a href="/cuenta">Cuenta</a>
          <a href="#" onClick={cerrarSesion}>Cerrar sesión</a>
        </div>
      </div>
    </header>
  );
}

// funciones externas
function toggleDropdown() {
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }
}

function cerrarSesion(e) {
  e.preventDefault();
  localStorage.removeItem("clienteActivo");
  window.location.href = "/login";
}

export default Header;
