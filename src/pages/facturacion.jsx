import React from "react";
import Header from "../components/Header";

function Facturacion() {
  return (
    <>
      <Header />
      <main style={{ padding: "40px", maxWidth: "960px", margin: "auto" }}>
        <h1>💳 Facturación</h1>
        <p>Accedé a tus facturas, historial de pagos y medios de pago configurados.</p>
      </main>
    </>
  );
}

export default Facturacion;
