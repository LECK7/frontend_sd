"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/services/apiService";
import {
  BarChart3,
  Loader2,
  FileDown,
  TrendingUp,
  DollarSign,
  Calculator,
  TrendingDown,
  PieChart as PieChartIcon,
  Clock,
  Wallet,
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
  const { token, usuario, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [diaSeleccionado, setDiaSeleccionado] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [resumen, setResumen] = useState({
    ingresos: 0,
    egresos: 0,
    balance: 0,
  });
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasHora, setVentasHora] = useState([]);
  const [productos, setProductos] = useState([]);
  const [topIngresos, setTopIngresos] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [flujo, setFlujo] = useState({ ingresos: [], egresos: [] });
  const [ticketPromedio, setTicketPromedio] = useState([]);
  const [proyeccion, setProyeccion] = useState(null);

  const PIE_COLORS = ["#16a34a", "#2563eb", "#f97316", "#dc2626", "#6b21a8"];

  const fetchConToken = async (url) => {
    if (!token) throw new Error("No hay token disponible");
    const data = await authenticatedFetch(url, { method: "GET" }, token, logout);
    if (data?.error) throw new Error(data.error || `Error al obtener ${url}`);
    return data;
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
        `${base}/api/reportes/productos-mas-vendidos`,
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

      setVentasDia(Array.isArray(ventasPorDiaData) ? ventasPorDiaData : []);
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

  function fluxIsObj(obj) {
    return obj && (Array.isArray(obj.ingresos) || Array.isArray(obj.egresos));
  }

  const ventasParaGrafico = () => {
    return ventasDia.map((v) => ({
      fecha:
        v.fecha && v.fecha.includes("-")
          ? new Date(v.fecha).toLocaleDateString("es-PE")
          : String(v.fecha),
      total: Number(v.total || v.total_ventas || 0),
    }));
  };

  const ventasHoraParaGrafico = () => {
    const map = {};
    ventasHora.forEach((h) => {
      const hora = Number(h.hora_del_dia ?? h.hora ?? h.h ?? h.Hour ?? 0);
      map[hora] = (map[hora] || 0) + Number(h.total_ventas || h.total || 0);
    });
    const res = Array.from({ length: 24 }, (_, i) => ({
      hora: String(i).padStart(2, "0") + ":00",
      total: map[i] || 0,
    }));
    return res;
  };

  const flujoParaGrafico = () => {
    const ingresos = (flujo.ingresos || []).map((x) => ({
      fecha: new Date(x.fecha).toLocaleDateString("es-PE"),
      ingresos: Number(x.ingresos_diarios || x.ingresos || x.total || 0),
    }));
    const egresos = (flujo.egresos || []).map((x) => ({
      fecha: new Date(x.fecha).toLocaleDateString("es-PE"),
      egresos: Number(x.egresos || x.monto || 0),
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

  const ticketParaGrafico = () =>
    ticketPromedio.map((t) => ({
      fecha: new Date(t.fecha).toLocaleDateString("es-PE"),
      ticket: Number(t.ticket_promedio_diario || t.ticket_promedio || t.ticketPromedio || 0),
    }));

  const metodoPagoLabel = (m) =>
    m === "EFECTIVO"
      ? "Efectivo"
      : m === "YAPE"
      ? "Yape"
      : m === "TRANSFERENCIA"
      ? "Transferencia"
      : m || "—";

  const metodosParaPie = () =>
    metodosPago.map((m) => ({
      name: metodoPagoLabel(m.metodo),
      value: Number(m.total || m.cantidad || 0),
    }));

  const fmt = (n) => Number(n || 0).toFixed(2);
  const ventasMesTotal = ventasDia.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const promedioDiario = proyeccion?.promedioDiario || 0;
  const ticketPromedioMes =
    ticketPromedio.length > 0
      ? ticketPromedio.reduce((acc, t) => acc + Number(t.ticket_promedio_diario || 0), 0) /
        ticketPromedio.length
      : 0;

  const exportarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-PE");

    doc.setFontSize(16);
    doc.text("Reporte de Ventas y Finanzas - Panadería", 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${fecha}`, 14, 28);
    doc.text(`Generado por: ${usuario?.nombre || usuario?.email || "usuario"}`, 14, 34);

    const headStyles = { fillColor: [100, 116, 139], textColor: 255 };

    autoTable(doc, {
      startY: 40,
      head: [["Ingresos hoy (S/)", "Egresos hoy (S/)", "Balance hoy (S/)"]],
      body: [[fmt(resumen.ingresos), fmt(resumen.egresos), fmt(resumen.balance)]],
      styles: { halign: "right" },
      headStyles,
      theme: "grid",
    });

    let y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Ventas mes (S/)", "Ticket promedio mes (S/)", "Proyección mes (S/)"]],
      body: [[fmt(ventasMesTotal), fmt(ticketPromedioMes), fmt(proyeccion?.proyeccion || 0)]],
      styles: { halign: "right" },
      headStyles,
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Ventas por día", "Total (S/)"]],
      body: ventasParaGrafico().map((r) => [r.fecha, fmt(r.total)]),
      headStyles,
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Ventas por hora", "Total (S/)"]],
      body: ventasHoraParaGrafico().map((r) => [r.hora, fmt(r.total)]),
      headStyles,
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Ingresos (S/)", "Egresos (S/)"]],
      body: flujoParaGrafico().map((r) => [r.fecha, fmt(r.ingresos), fmt(r.egresos)]),
      headStyles,
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 8;

    if (topIngresos.length) {
      autoTable(doc, {
        startY: y,
        head: [["Top productos por ingresos", "Ingresos (S/)"]],
        body: topIngresos.map((p) => [p.nombre, fmt(p.ingresos || p.total || 0)]),
        headStyles,
        theme: "grid",
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (productos.length) {
      autoTable(doc, {
        startY: y,
        head: [["Productos más vendidos", "Cantidad", "Total (S/)"]],
        body: productos.map((p) => [
          p.nombre,
          p.cantidadVendida || p.cantidad || 0,
          fmt(p.total || p.ingresos || 0),
        ]),
        headStyles,
        theme: "grid",
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (metodosPago.length) {
      autoTable(doc, {
        startY: y,
        head: [["Método de pago", "Cantidad", "Total (S/)"]],
        body: metodosPago.map((m) => [
          metodoPagoLabel(m.metodo),
          m.cantidad || 0,
          fmt(m.total || 0),
        ]),
        headStyles,
        theme: "grid",
      });
    }

    doc.save(`Reporte_Panaderia_${fecha}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reportes de la panadería</h1>
              <p className="text-sm text-slate-500">
                Ventas, flujo, productos y métodos de pago en un solo panel.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 font-medium">Mes</label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 font-medium">Día</label>
              <input
                type="date"
                value={diaSeleccionado}
                onChange={(e) => setDiaSeleccionado(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={exportarPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
            >
              <FileDown className="w-4 h-4" /> Exportar PDF completo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-600">
            <Loader2 className="animate-spin inline-block w-6 h-6 mr-2" /> Cargando...
          </div>
        ) : mensaje ? (
          <div className="py-6 text-red-600">{mensaje}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card color="blue" label="Ingresos hoy" value={`S/ ${fmt(resumen.ingresos)}`} icon={<DollarSign />} />
          <Card color="red" label="Egresos hoy" value={`S/ ${fmt(resumen.egresos)}`} icon={<TrendingDown />} />
          <Card color={resumen.balance >= 0 ? "green" : "red"} label="Balance hoy" value={`S/ ${fmt(resumen.balance)}`} icon={<Calculator />} />
          <Card color="blue" label="Proyección mes" value={proyeccion ? `S/ ${fmt(proyeccion.proyeccion)}` : "—"} icon={<TrendingUp />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card color="yellow" label="Ventas del mes" value={`S/ ${fmt(ventasMesTotal)}`} icon={<Wallet />} />
          <Card color="green" label="Promedio diario" value={`S/ ${fmt(promedioDiario)}`} icon={<Clock />} />
          <Card color="blue" label="Ticket promedio" value={`S/ ${fmt(ticketPromedioMes)}`} icon={<PieChartIcon />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <li key={i} className="flex justify-between text-slate-600">
                        <span>{m.name}</span>
                        <span className="font-semibold text-slate-800">S/ {fmt(m.value)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </PanelCard>

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

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-800">Detalle de productos vendidos</h3>
          <div className="overflow-auto max-h-64 border border-slate-200 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 text-left">Producto</th>
                  <th className="p-3 text-center">Cantidad</th>
                  <th className="p-3 text-right">Total (S/)</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td className="p-3 text-center text-slate-500" colSpan={3}>
                      No hay datos
                    </td>
                  </tr>
                ) : (
                  productos.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{p.nombre}</td>
                      <td className="p-3 text-center">{p.cantidadVendida || p.cantidad || 0}</td>
                      <td className="p-3 text-right font-semibold">S/ {fmt(p.total || p.ingresos || 0)}</td>
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
      ? "from-amber-50 to-amber-100 border-amber-200"
      : "from-blue-50 to-blue-100 border-blue-200";

  return (
    <div className={`p-4 rounded-2xl border ${bg} flex items-center justify-between shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow">
          {icon}
        </div>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <h4 className="font-semibold text-slate-700 mb-3">{title}</h4>
      {children}
    </div>
  );
}
