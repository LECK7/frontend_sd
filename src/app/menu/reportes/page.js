"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Loader2,
  FileDown,
  TrendingUp,
  DollarSign,
  Calculator,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportesPage() {
  const { token, usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [diaSeleccionado, setDiaSeleccionado] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Datos
  const [resumen, setResumen] = useState({
    ingresos: 0,
    egresos: 0,
    balance: 0,
  });
  const [ventasDia, setVentasDia] = useState([]); // ventas-por-dia (array {fecha, total})
  const [ventasHora, setVentasHora] = useState([]); // ventas-por-hora (array {hora, total})
  const [productos, setProductos] = useState([]); // productos-mas-vendidos
  const [topIngresos, setTopIngresos] = useState([]); // top5-productos-ingresos
  const [metodosPago, setMetodosPago] = useState([]); // metodos-de-pago
  const [flujo, setFlujo] = useState({ ingresos: [], egresos: [] }); // flujo-diario
  const [ticketPromedio, setTicketPromedio] = useState([]); // ticket-promedio
  const [proyeccion, setProyeccion] = useState(null);

  // Colores para pie
  const PIE_COLORS = ["#16a34a", "#2563eb", "#f97316", "#dc2626", "#6b21a8"];

  // Helper: request con token y manejo
  const fetchConToken = async (url) => {
    if (!token) throw new Error("No hay token disponible");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const texto = await res.clone().text();
    console.log("Respuesta backend:", url, texto);
    if (!res.ok) {
      const errText = texto || `Error al obtener ${url}`;
      throw new Error(errText);
    }
    return res.json();
  };

  const cargarTodos = async () => {
    try {
      setLoading(true);
      setMensaje("");

      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const urls = [
        `${base}/api/reportes/resumen-general`,
        `${base}/api/reportes/ventas-por-dia?mes=${mes}`,
        `${base}/api/reportes/ventas-por-hora?dia=${diaSeleccionado}`,
        `${base}/api/reportes/productos-mas-vendidos?mes=${mes}`,
        `${base}/api/reportes/top5-productos-ingresos?mes=${mes}`,
        `${base}/api/reportes/metodos-de-pago?mes=${mes}`,
        `${base}/api/reportes/flujo-diario?mes=${mes}`,
        `${base}/api/reportes/ticket-promedio?mes=${mes}`,
        `${base}/api/reportes/proyeccion-ventas?mes=${mes}`,
      ];

      const [
        resumenData,
        ventasPorDiaData,
        ventasPorHoraData,
        productosData,
        topIngresosData,
        metodosPagoData,
        flujoData,
        ticketPromedioData,
        proyeccionData,
      ] = await Promise.all(urls.map((u) => fetchConToken(u)));

      setResumen(
        resumenData.resumen
          ? resumenData.resumen
          : {
              ingresos: resumenData.ingresos || 0,
              egresos: resumenData.egresos || 0,
              balance: resumenData.balance || 0,
            }
      );

      // ventas por día: puede ser array [{fecha, total}] o fechasMes
      setVentasDia(Array.isArray(ventasPorDiaData) ? ventasPorDiaData : []);

      // ventas por hora: array [{hora, total}]
      setVentasHora(Array.isArray(ventasPorHoraData) ? ventasPorHoraData : []);

      setProductos(Array.isArray(productosData) ? productosData : []);
      setTopIngresos(Array.isArray(topIngresosData) ? topIngresosData : []);
      setMetodosPago(Array.isArray(metodosPagoData) ? metodosPagoData : []);
      setFlujo(
        flujoData && (fluxIsObj(flujoData))
          ? flujoData
          : { ingresos: [], egresos: [] }
      );
      setTicketPromedio(Array.isArray(ticketPromedioData) ? ticketPromedioData : []);
      setProyeccion(proyeccionData || null);
    } catch (err) {
      console.error("Error cargarTodos:", err);
      setMensaje(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargarTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mes, diaSeleccionado]);

  // Util: determinar si flujo viene como objeto {ingresos, egresos}
  function fluxIsObj(obj) {
    return obj && (Array.isArray(obj.ingresos) || Array.isArray(obj.egresos));
  }

  // Map para gráfico: ventas por día (si vienen fechas ISO o 'fecha' string)
  const ventasParaGrafico = () => {
    return ventasDia.map((v) => ({
      fecha:
        v.fecha && v.fecha.includes("-")
          ? new Date(v.fecha).toLocaleDateString("es-PE")
          : String(v.fecha),
      total: Number(v.total || 0),
    }));
  };

  // Ventas por hora -> map a 0..23 con totales
  const ventasHoraParaGrafico = () => {
    const map = {};
    ventasHora.forEach((h) => {
      const hora = Number(h.hora ?? h.h ?? h.Hour ?? 0);
      map[hora] = (map[hora] || 0) + Number(h.total || 0);
    });
    const res = Array.from({ length: 24 }, (_, i) => ({
      hora: String(i).padStart(2, "0") + ":00",
      total: map[i] || 0,
    }));
    return res;
  };

  // Flujo diario: juntar por fecha incomes vs egresos
  const flujoParaGrafico = () => {
    const ingresos = (flujo.ingresos || []).map((x) => ({
      fecha: new Date(x.fecha).toLocaleDateString("es-PE"),
      ingresos: Number(x.ingresos || x.total || 0),
    }));
    const egresos = (flujo.egresos || []).map((x) => ({
      fecha: new Date(x.fecha).toLocaleDateString("es-PE"),
      egresos: Number(x.egresos || x.total || x.monto || 0),
    }));
    const map = {};
    ingresos.forEach((i) => {
      map[i.fecha] = { fecha: i.fecha, ingresos: i.ingresos, egresos: 0 };
    });
    egresos.forEach((e) => {
      if (!map[e.fecha]) map[e.fecha] = { fecha: e.fecha, ingresos: 0, egresos: e.egresos };
      else map[e.fecha].egresos = e.egresos;
    });
    return Object.values(map).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  // Ticket promedio gráfico
  const ticketParaGrafico = () =>
    ticketPromedio.map((t) => ({
      fecha: new Date(t.fecha).toLocaleDateString("es-PE"),
      ticket: Number(t.ticket_promedio || t.ticket_promedio || t.ticketPromedio || 0),
    }));

  // Métodos de pago para pie
  const metodosParaPie = () =>
    metodosPago.map((m) => ({ name: m.metodo || m.metodoPago || m.metodo, value: Number(m.total || m.cantidad || 0) }));

  // Exportar PDF (resumen + tablas básicas)
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte General - Panadería", 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, 14, 28);
    doc.text(`Generado por: ${usuario?.nombre || usuario?.email || "usuario"}`, 14, 34);

    // Resumen
    autoTable(doc, {
      startY: 40,
      head: [["Ingresos (S/)", "Egresos (S/)", "Balance (S/)"]],
      body: [[resumen.ingresos.toFixed(2), resumen.egresos.toFixed(2), resumen.balance.toFixed(2)]],
    });

    let y = doc.lastAutoTable.finalY + 10;

    // Ventas por día (tabla pequeña)
    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Total (S/)"]],
      body: ventasParaGrafico().slice(0, 50).map((r) => [r.fecha, r.total.toFixed(2)]),
    });

    y = doc.lastAutoTable.finalY + 8;

    // Top productos por ingresos
    if (topIngresos.length) {
      autoTable(doc, {
        startY: y,
        head: [["Producto", "Ingresos (S/)"]],
        body: topIngresos.map((p) => [p.nombre, Number(p.ingresos || p.total || 0).toFixed(2)]),
      });
    }

    doc.save(`Reporte_General_${new Date().toLocaleDateString("es-PE")}.pdf`);
  };

  const fmt = (n) => Number(n || 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white p-8 rounded-2xl shadow">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Panel de Reportes</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">Mes:</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="border rounded px-2 py-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <label className="text-sm ml-4">Día (ventas por hora):</label>
            <input
              type="date"
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
              className="border rounded px-2 py-1"
            />

            <button onClick={exportarPDF} className="ml-4 bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2">
              <FileDown className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Mensaje / Loader */}
        {loading ? (
          <div className="py-12 text-center text-gray-600">
            <Loader2 className="animate-spin inline-block w-6 h-6 mr-2" /> Cargando...
          </div>
        ) : mensaje ? (
          <div className="py-6 text-red-600">{mensaje}</div>
        ) : null}

        {/* Cards resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card color="blue" label="Ingresos" value={`S/ ${fmt(resumen.ingresos)}`} icon={<DollarSign />} />
          <Card color="red" label="Egresos" value={`S/ ${fmt(resumen.egresos)}`} icon={<TrendingDown />} />
          <Card color={resumen.balance >= 0 ? "green" : "red"} label="Balance" value={`S/ ${fmt(resumen.balance)}`} icon={<Calculator />} />
          <Card
            color="blue"
            label="Proyección mes"
            value={proyeccion ? `S/ ${fmt(proyeccion.proyeccion)}` : "—"}
            icon={<TrendingUp />}
          />
        </div>

        {/* Grid Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por día (line) */}
          <PanelCard title="Ventas por día (mes seleccionado)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasParaGrafico()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" minTickGap={10} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          {/* Flujo ingresos vs egresos */}
          <PanelCard title="Flujo diario (ingresos vs egresos)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={flujoParaGrafico()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ingresos" stroke="#16a34a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="egresos" stroke="#dc2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          {/* Ventas por hora (bar) */}
          <PanelCard title={`Ventas por hora (${diaSeleccionado})`}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasHoraParaGrafico()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          {/* Métodos de pago (pie) */}
          <PanelCard title="Métodos de pago (mes)">
            <div className="flex gap-4 items-center">
              <div className="w-2/5 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={metodosParaPie()} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} label>
                      {metodosParaPie().map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                {metodosParaPie().length === 0 ? (
                  <p className="text-sm text-gray-500">No hay datos</p>
                ) : (
                  <ul className="text-sm space-y-2">
                    {metodosParaPie().map((m, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{m.name}</span>
                        <span>S/ {fmt(m.value)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </PanelCard>

          {/* Productos más vendidos (bar) */}
          <PanelCard title="Productos más vendidos (cantidad)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productos.map((p) => ({ nombre: p.nombre, cantidad: p.cantidadVendida || p.cantidad || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          {/* Top5 ingresos */}
          <PanelCard title="Top 5 productos por ingresos">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topIngresos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip formatter={(v) => `S/ ${fmt(v)}`} />
                  <Bar dataKey="ingresos" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          {/* Ticket promedio */}
          <PanelCard title="Ticket promedio diario">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketParaGrafico()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(v) => `S/ ${fmt(v)}`} />
                  <Line type="monotone" dataKey="ticket" stroke="#f97316" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>

        {/* Tabla / lista simple resumen productos */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Productos más vendidos (detalle)</h3>
          <div className="overflow-auto max-h-64 border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-right">Total (S/)</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td className="p-2 text-center" colSpan={3}>
                      No hay datos
                    </td>
                  </tr>
                ) : (
                  productos.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{p.nombre}</td>
                      <td className="p-2 text-center">{p.cantidadVendida || p.cantidad || 0}</td>
                      <td className="p-2 text-right">S/ {fmt(p.total || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------
   Componentes UI
   ------------------- */
function Card({ color = "blue", label, value, icon }) {
  const bg =
    color === "green"
      ? "from-green-50 to-green-100 border-green-200"
      : color === "red"
      ? "from-red-50 to-red-100 border-red-200"
      : color === "yellow"
      ? "from-yellow-50 to-yellow-100 border-yellow-200"
      : "from-blue-50 to-blue-100 border-blue-200";

  return (
    <div className={`p-4 rounded-lg border ${bg} flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow">{icon}</div>
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function PanelCard({ title, children }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
      {children}
    </div>
  );
}
