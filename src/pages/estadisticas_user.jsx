import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/EstadisticasUser.css";
import Header from "../components/Header";

export default function EstadisticasUser() {
  const [metadata, setMetadata] = useState({ vendedores: [], referencias: [] });
  const [data, setData] = useState(null);
  const [filtros, setFiltros] = useState({ rango: "todos", vendedor: "", referencia: "" });
  const [tab, setTab] = useState("zona");

  const zonaChartRef = useRef(null);
  const vendedorChartRef = useRef(null);
  const mensualChartRef = useRef(null);

  const endpoint = "https://us-central1-newagent-kwqs.cloudfunctions.net/estadisticas_spalla";

  useEffect(() => {
    fetch(endpoint + "?meta=1")
      .then((res) => res.json())
      .then((json) => setMetadata(json.meta));
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  useEffect(() => {
    if (!data) return;

    if (zonaChartRef.current) zonaChartRef.current.destroy();
    if (vendedorChartRef.current) vendedorChartRef.current.destroy();
    if (mensualChartRef.current) mensualChartRef.current.destroy();

    const ctxZona = document.getElementById("zonaChart")?.getContext("2d");
    if (ctxZona) {
      zonaChartRef.current = new Chart(ctxZona, {
        type: "pie",
        data: {
          labels: Object.keys(data.porZona),
          datasets: [{
            data: Object.values(data.porZona),
            backgroundColor: ["#6A00FF", "#9C27B0", "#03A9F4", "#FF9800"]
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: "Por Zona" },
            legend: { position: "bottom" }
          }
        }
      });
    }

    const ctxVend = document.getElementById("vendedorChart")?.getContext("2d");
    if (ctxVend) {
      vendedorChartRef.current = new Chart(ctxVend, {
        type: "bar",
        data: {
          labels: Object.keys(data.porVendedor),
          datasets: [{
            label: "Consultas",
            data: Object.values(data.porVendedor),
            backgroundColor: "#6A00FF"
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: "Por Vendedor" },
            legend: { display: false }
          },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    const ctxMensual = document.getElementById("mensualChart")?.getContext("2d");
    if (ctxMensual && data.porMes) {
      mensualChartRef.current = new Chart(ctxMensual, {
        type: "bar",
        data: {
          labels: Object.keys(data.porMes),
          datasets: [{
            label: "Consultas por Mes",
            data: Object.values(data.porMes),
            backgroundColor: "#6A00FF"
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: "Consultas por Mes" },
            legend: { display: false }
          },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }, [data]);

  function calcularFechasDesdeRango(valor) {
    const hoy = new Date();
    let desde = "", hasta = hoy.toISOString().split('T')[0];
    if (valor === "7") {
      let d = new Date(hoy); d.setDate(d.getDate() - 7); desde = d.toISOString().split('T')[0];
    } else if (valor === "30") {
      let d = new Date(hoy); d.setDate(d.getDate() - 30); desde = d.toISOString().split('T')[0];
    } else if (valor === "hoy") {
      desde = hasta;
    }
    return { desde, hasta: valor === "todos" ? "" : hasta };
  }

  async function cargarDatos() {
    const { desde, hasta } = calcularFechasDesdeRango(filtros.rango);
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (filtros.vendedor) params.append('vendedor', filtros.vendedor);
    if (filtros.referencia) params.append('referencia', filtros.referencia);

    try {
      const res = await fetch(`${endpoint}?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setData(null);
    }
  }

  function exportarPDF() {
    if (!data) return;

    const doc = new jsPDF();
    const fecha = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text("📊 Estadísticas Bot Spalla", 14, 20);
    doc.setFontSize(10);
    doc.text("Generado: " + fecha, 14, 27);
    doc.setFontSize(12);
    doc.text(`Total de consultas: ${data.total}`, 14, 35);
    let startY = 45;

    const generarTabla = (titulo, dataObj) => {
      if (!dataObj || Object.keys(dataObj).length === 0) return;

      autoTable(doc, {
        startY,
        head: [[titulo, 'Cantidad']],
        body: Object.entries(dataObj).map(([k, v]) => [k, v]),
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      startY = doc.lastAutoTable.finalY + 10;
    };

    generarTabla("Consultas por Zona", data.porZona);
    generarTabla("Consultas por Vendedor", data.porVendedor);
    generarTabla("Referencias", data.porReferencia);
    if (data.porMes) generarTabla("Consultas por Mes", data.porMes);

    doc.save("estadisticas_spalla.pdf");
  }

  return (
    <>
      <Header />
      <div className="estadisticas-container">
        <h2>📊 Estadísticas del Bot Spalla</h2>
        <div className="filtros">
          <select onChange={(e) => setFiltros({ ...filtros, rango: e.target.value })} value={filtros.rango}>
            <option value="hoy">Hoy</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="todos">Todos</option>
          </select>
          <select onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })} value={filtros.vendedor}>
            <option value="">Todos los vendedores</option>
            {metadata.vendedores.map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>
          <select onChange={(e) => setFiltros({ ...filtros, referencia: e.target.value })} value={filtros.referencia}>
            <option value="">Todas las referencias</option>
            {metadata.referencias.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
          <button onClick={() => setFiltros({ rango: "todos", vendedor: "", referencia: "" })}>Limpiar</button>
          <button onClick={exportarPDF}>Exportar PDF</button>
        </div>

        {data ? (
          <div className="tabs-container">
            <div className="tabs">
              <button onClick={() => setTab("zona")} className={tab === "zona" ? "show" : ""}>📊 Zona</button>
              <button onClick={() => setTab("vendedor")} className={tab === "vendedor" ? "show" : ""}>📈 Vendedor</button>
              <button onClick={() => setTab("mes")} className={tab === "mes" ? "show" : ""}>📅 Por Mes</button>
              <button onClick={() => setTab("referencias")} className={tab === "referencias" ? "show" : ""}>📌 Referencias</button>
            </div>
            <div className={`tab-content ${tab === "zona" ? "show" : ""}`}>
  <div className="grafico-box"><canvas id="zonaChart" height="200"></canvas></div>
</div>

<div className={`tab-content ${tab === "vendedor" ? "show" : ""}`}>
  <div className="grafico-box"><canvas id="vendedorChart" height="200"></canvas></div>
</div>

<div className={`tab-content ${tab === "mes" ? "show" : ""}`}>
  <div className="grafico-box"><canvas id="mensualChart" height="200"></canvas></div>
</div>

<div className={`tab-content ${tab === "referencias" ? "show" : ""}`}>
  <div className="grafico-box referencias">
    <h3>📌 Últimas Referencias</h3>
    <ul id="referenciasList">
      {Object.entries(data.porReferencia).slice(0, 10).map(([ref, count]) => (
        <li key={ref}>{ref} — {count} consulta{count > 1 ? 's' : ''}</li>
      ))}
    </ul>
  </div>


              )
            </div>
          </div>
        ) : <div>⚠️ Error o sin datos.</div>}
      </div>
    </>
  );
}