"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileDown, TrendingUp, DollarSign, BarChart3, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportesPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setMensaje("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reportes/resumen-general`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener reportes");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargarReportes();
  }, [token]);

  const generarPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte General - Panadería", 14, 20);

    // Finanzas
    doc.setFontSize(14);
    doc.text("Resumen Financiero", 14, 35);
    autoTable(doc, {
      startY: 40,
      head: [["Ingresos (S/)", "Egresos (S/)", "Balance (S/)"]],
      body: [
        [
          data.finanzas.ingresos.toFixed(2),
          data.finanzas.egresos.toFixed(2),
          data.finanzas.balance.toFixed(2),
        ],
      ],
    });

    // Ventas
    doc.text("Ventas por Día", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Fecha", "Total (S/)"]],
      body: data.ventasPorDia.map((v) => [
        new Date(v.createdAt).toLocaleDateString("es-PE"),
        Number(v._sum.total || 0).toFixed(2),
      ]),
    });

    // Productos
    doc.text("Top Productos Vendidos", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Producto", "Cantidad", "Total (S/)"]],
      body: data.productosMasVendidos.map((p) => [
        p.nombre,
        p.cantidadVendida,
        p.total.toFixed(2),
      ]),
    });

    doc.save(`Reporte_General_${new Date().toLocaleDateString("es-PE")}.pdf`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20 text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Cargando reportes...
      </div>
    );

  if (mensaje) return <p className="text-center text-red-600 font-medium">{mensaje}</p>;

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600 w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800">
              Panel de Reportes Generales
            </h1>
          </div>
          <button
            onClick={generarPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <FileDown className="w-5 h-5" /> Exportar PDF
          </button>
        </div>

        {/* Ventas */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
            <TrendingUp className="text-blue-500 w-5 h-5" /> Ventas por Día
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.ventasPorDia.map((v) => ({
                  fecha: new Date(v.createdAt).toLocaleDateString("es-PE"),
                  total: Number(v._sum.total || 0),
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

        {/* Productos */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
            <DollarSign className="text-green-600 w-5 h-5" /> Productos Más Vendidos
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.productosMasVendidos.map((p) => ({
                  nombre: p.nombre,
                  total: p.total,
                }))}
              >
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Finanzas */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm text-center">
          <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-700 mb-3">
            <DollarSign className="text-amber-500 w-5 h-5" /> Resumen Financiero
          </h2>
          <p className="text-gray-700">
            Ingresos: <span className="font-semibold text-green-600">S/ {data.finanzas.ingresos.toFixed(2)}</span> |{" "}
            Egresos: <span className="font-semibold text-red-600">S/ {data.finanzas.egresos.toFixed(2)}</span> |{" "}
            Balance: <span className="font-semibold text-blue-600">S/ {data.finanzas.balance.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
