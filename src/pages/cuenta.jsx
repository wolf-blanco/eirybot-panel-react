import React from "react";
import Header from "../components/Header";

function Cuenta() {
  return (
    <>
      <Header />
      <main style={{ padding: "40px", maxWidth: "960px", margin: "auto" }}>
        <h1>👤 Cuenta del Usuario</h1>
        <p>En esta sección podrás ver y editar tu información personal.</p>
        {/* Aquí agregarás el formulario de edición de cuenta */}
      </main>
    </>
  );
}

export default Cuenta;
