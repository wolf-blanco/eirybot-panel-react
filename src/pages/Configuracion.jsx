import React from "react";
import Header from "../components/Header";

function Configuracion() {
  return (
    <>
      <Header />
      <main style={{ padding: "40px", maxWidth: "960px", margin: "auto" }}>
        <h1>⚙️ Configuración</h1>
        <p>Desde aquí podrás modificar las opciones y preferencias del bot.</p>
      </main>
    </>
  );
}

export default Configuracion;
