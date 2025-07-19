import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/EstadisticasUser.css";
import Header from "../components/Header";
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

export default function EstadisticasUser() {
  const [metadata, setMetadata] = useState({ vendedores: [] });
  const [data, setData] = useState(null);
  const [filtros, setFiltros] = useState({ rango: "todos", vendedor: "" });
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
    if (ctxZona && data.porMes) {
      zonaChartRef.current = new Chart(ctxZona, {
        type: "pie",
        data: {
          labels: Object.keys(data.porMes),
          datasets: [{
            data: Object.values(data.porMes),
            backgroundColor: ["#ffb74d", "#F06292", "#7986CB", "#4DB6AC","#A1887F","#C8E6C9"]
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: "Totalidad de registros del rango seleccionado" },
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
      const labels = Object.keys(data.porMes).map((mes) => {
        const [anio, mesNum] = mes.split("-");
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return `${meses[parseInt(mesNum, 10) - 1]} ${anio}`;
      });

      const valores = Object.values(data.porMes);

      mensualChartRef.current = new Chart(ctxMensual, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Consultas por Mes",
            data: valores,
            fill: false,
            borderColor: "#6A00FF",
            tension: 0.3,
            pointBackgroundColor: "#6A00FF",
            pointRadius: 5
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Tendencia Mensual de Consultas"
            },
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `Consultas: ${ctx.raw}`
              }
            },
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#6A00FF',
              font: { weight: 'bold' },
              formatter: (value) => value
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Consultas"
              }
            },
            x: {
              title: {
                display: true,
                text: "Mes"
              }
            }
          }
        },
        plugins: [ChartDataLabels]
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
          <button onClick={() => setFiltros({ rango: "todos", vendedor: "" })}>Limpiar</button>
          <button onClick={exportarPDF}>Exportar PDF</button>
        </div>

        {data ? (
          <div className="tabs-container">
            <div className="tabs">
              <button onClick={() => setTab("zona")} className={tab === "zona" ? "show" : ""}>📊 Historicos</button>
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
                <h3 style={{ padding: "10px", color: "#111", fontSize: "20px" }}>📌 Últimos 10 Registros</h3>
                {data.ultimos?.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                        <th style={{ padding: "10px", borderBottom: "2px solid #111", color: "#111", fontSize: "14px" }}>Referencia</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #111", color: "#111", fontSize: "14px" }}>Zona</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #111", color: "#111", fontSize: "14px" }}>Vendedor</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #111", color: "#111", fontSize: "14px" }}>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ultimos.map((item, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #666" }}>
                          <td style={{ padding: "10px", color: "#666", fontSize: "12px" }}><strong>{item.referencia}</strong></td>
                          <td style={{ padding: "10px", color: "#666", fontSize: "12px" }}>{item.zona}</td>
                          <td style={{ padding: "10px", color: "#666", fontSize: "12px" }}>{item.vendedor}</td>
                          <td style={{ padding: "10px", color: "#666", fontSize: "12px" }}>{new Date(item.fecha).toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay registros recientes.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>Por favor espere mientras EiryBot carga la informacion.</div>
        )}
      </div>
    </>
  );
}
