"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Loader2,
  FileDown,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportesPage() {
  const { token } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [finanzas, setFinanzas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const colores = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#9333ea"];

  const cargarReportes = async () => {
    try {
      if (!token) throw new Error("No hay token disponible");
      setLoading(true);
      setMensaje("");

      const fetchConToken = async (url) => {
        const token = localStorage.getItem("token");
        const res = await fetch(url, {
          headers: { Authorization: "Bearer " + token },
        });
        const clone = res.clone();
        const texto = await clone.text();
        console.log("Respuesta del backend:", texto);
        if (!res.ok) throw new Error(`Error al obtener ${url}`);
        return res.json();
      };

      const [ventasData, productosData, finanzasData, usuariosData] =
        await Promise.all([
          fetchConToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas-por-dia`
          ),
          fetchConToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/productos-mas-vendidos`
          ),
          fetchConToken(`${process.env.NEXT_PUBLIC_API_URL}/api/finanzas/`),
          fetchConToken(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/`),
        ]);

      setVentas(ventasData);
      setProductos(productosData);
      setFinanzas(finanzasData);
      setUsuarios(usuariosData);
    } catch (err) {
      console.error(err);
      setMensaje(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte General de la Panadería", 14, 20);

    const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
    const totalIngresos = finanzas
      .filter((f) => f.tipo === "INGRESO")
      .reduce((a, b) => a + parseFloat(b.monto || 0), 0);
    const totalEgresos = finanzas
      .filter((f) => f.tipo === "EGRESO")
      .reduce((a, b) => a + parseFloat(b.monto || 0), 0);
    const balance = totalIngresos - totalEgresos;

    doc.setFontSize(14);
    doc.text("Resumen Financiero", 14, 35);
    autoTable(doc, {
      startY: 40,
      head: [["Total Ventas (S/)", "Ingresos (S/)", "Egresos (S/)", "Balance (S/)"]],
      body: [[
        totalVentas.toFixed(2),
        totalIngresos.toFixed(2),
        totalEgresos.toFixed(2),
        balance.toFixed(2),
      ]],
    });

    doc.text("Ventas por Día", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Fecha", "Total (S/)"]],
      body: ventas.map((v) => [
        new Date(v.createdAt).toLocaleDateString("es-PE"),
        parseFloat(v.total || 0).toFixed(2),
      ]),
    });

    doc.text("Productos más Vendidos", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Producto", "Cantidad", "Total (S/)"]],
      body: productos.map((p) => [
        p.nombre,
        p.cantidadVendida,
        parseFloat(p.total || 0).toFixed(2),
      ]),
    });

    doc.save(`Reporte_General_${new Date().toLocaleDateString("es-PE")}.pdf`);
  };

  useEffect(() => {
    if (token) cargarReportes();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-6xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-100/40 to-transparent pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600 w-8 h-8" />
            <h1 className="text-2xl font-extrabold text-gray-800">
              Panel de Reportes Generales
            </h1>
          </div>
          <button
            onClick={generarPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
          >
            <FileDown className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-600">
            <Loader2 className="animate-spin w-6 h-6 mr-2" /> Cargando reportes...
          </div>
        ) : mensaje ? (
          <p className="text-center text-red-600 font-medium">{mensaje}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <TrendingUp className="text-blue-500 w-5 h-5" /> Ventas por Día
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ventas.map((v) => ({
                      fecha: new Date(v.createdAt).toLocaleDateString("es-PE"),
                      total: parseFloat(v.total || 0),
                    }))}
                  >
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <DollarSign className="text-green-600 w-5 h-5" /> Productos más Vendidos
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productos.map((p) => ({
                      nombre: p.nombre,
                      cantidad: p.cantidadVendida || 0,
                    }))}
                  >
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm md:col-span-2">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <DollarSign className="text-amber-500 w-5 h-5" /> Distribución Financiera
              </h2>
              <div className="h-72 flex justify-center">
                <ResponsiveContainer width="70%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Ingresos", value: finanzas.filter(f => f.tipo === "INGRESO").length },
                        { name: "Egresos", value: finanzas.filter(f => f.tipo === "EGRESO").length },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {colores.map((color, index) => (
                        <Cell key={index} fill={colores[index % colores.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm md:col-span-2">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <Users className="text-purple-500 w-5 h-5" /> Actividad de Usuarios
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={usuarios.map((u) => ({
                      nombre: u.nombre,
                      ventas: u.totalVentas || 0,
                    }))}
                  >
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ventas" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
