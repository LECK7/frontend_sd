"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/services/apiService";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CajaPage() {
  const { usuario, token, loading, logout } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const rolesPermitidos = ["ADMIN", "VENDEDOR", "PRODUCCION"];

  // --- Autenticación y roles ---
  useEffect(() => {
    if (!loading) {
      if (!usuario) {
        router.replace("/login");
        return;
      }
      if (!rolesPermitidos.includes(usuario.rol)) {
        router.replace("/menu");
        return;
      }
    }
  }, [usuario, loading]);

  // --- Cargar datos de caja ---
  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const data = await authenticatedFetch("/caja/resumen", { method: "GET" }, token, logout);
        if (data?.error) {
          throw new Error(data.error || "Error al obtener el detalle de caja");
        }
        setData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (token && usuario) cargarDetalle();
  }, [token, usuario]);

  if (loading) return <p className="text-center mt-10 text-gray-600">Cargando usuario...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!data) return <p className="text-center mt-10 text-gray-600">Cargando caja...</p>;

  const { resumen, ventas, gastos, fecha } = data;

  // === Generar PDF ===
  const generarPDF = () => {
    const doc = new jsPDF();

    // Título principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte Diario de Caja", 105, 20, { align: "center" });
    doc.setDrawColor(0);
    doc.line(14, 25, 196, 25);

    // Datos generales
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date(fecha).toLocaleDateString("es-PE")}`, 14, 32);
    doc.text(`Generado por: ${usuario?.nombre || usuario?.email}`, 14, 38);

    // --- RESUMEN ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumen General", 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [["Ingresos (S/)", "Egresos (S/)", "Balance (S/)"]],
      body: [
        [
          resumen.ingresos.toFixed(2),
          resumen.egresos.toFixed(2),
          resumen.balance.toFixed(2),
        ],
      ],
      styles: { halign: "right" },
      headStyles: { fillColor: [220, 220, 220] },
      theme: "grid",
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // --- VENTAS AGRUPADAS ---
    if (ventas.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ventas agrupadas por producto", 14, currentY);

      // Agrupar las ventas por producto
      const ventasAgrupadas = ventas.reduce((acc, venta) => {
        const key = venta.producto;
        if (!acc[key]) {
          acc[key] = { producto: key, cantidad: 0, total: 0 };
        }
        acc[key].cantidad += venta.cantidad;
        acc[key].total += venta.total;
        return acc;
      }, {});

      const ventasArray = Object.values(ventasAgrupadas);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Producto", "Cantidad total", "Total (S/)"]],
        body: ventasArray.map((v) => [
          v.producto,
          v.cantidad,
          v.total.toFixed(2),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220] },
        columnStyles: { 2: { halign: "right" } },
        theme: "grid",
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
    // --- VENTAS ---
    if (ventas.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ventas del día", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Cliente", "Producto", "Cant.", "Método", "Total (S/)"]],
        body: ventas.map((v) => [
          v.cliente || "Venta rápida",
          v.producto,
          v.cantidad,
          v.metodoPago,
          v.total.toFixed(2),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220] },
        columnStyles: { 4: { halign: "right" } },
        theme: "grid",
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
    // --- GASTOS ---
    if (gastos.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Gastos del día", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Categoría", "Descripción", "Monto (S/)"]],
        body: gastos.map((g) => [g.categoria, g.descripcion || "-", g.monto.toFixed(2)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220] },
        columnStyles: { 2: { halign: "right" } },
        theme: "grid",
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }

    doc.setFontSize(10);
    doc.text("Reporte generado automáticamente por el sistema", 14, currentY);

    doc.save(`Reporte_Caja_${new Date(fecha).toLocaleDateString("es-PE")}.pdf`);
  };

  // === Renderizado ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Wallet className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Resumen de Caja</h1>
              <p className="text-slate-500 mt-1">
                Estado financiero del día y detalle de movimientos.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <span>
                  {new Date(fecha).toLocaleDateString("es-PE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-slate-300">•</span>
                <span>{usuario?.nombre || usuario?.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={generarPDF}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            <FileDown className="w-5 h-5" /> Descargar PDF
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <CardRow
            color="green"
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            label="Ingresos"
            value={resumen.ingresos}
          />
          <CardRow
            color="red"
            icon={<TrendingDown className="w-6 h-6 text-rose-600" />}
            label="Egresos"
            value={resumen.egresos}
          />
          <CardRow
            color={resumen.balance >= 0 ? "green" : "red"}
            icon={<Calculator className="w-6 h-6 text-blue-600" />}
            label="Balance"
            value={resumen.balance}
            highlight
          />
        </div>

        <Section title="Ventas agrupadas por producto" subtitle="Consolidado por producto vendido en el día.">
          {ventas.length ? (() => {
            const ventasAgrupadas = ventas.reduce((acc, venta) => {
              const key = venta.producto;
              if (!acc[key]) {
                acc[key] = { producto: key, cantidad: 0, total: 0 };
              }
              acc[key].cantidad += venta.cantidad;
              acc[key].total += venta.total;
              return acc;
            }, {});

            const ventasArray = Object.values(ventasAgrupadas);

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Producto</th>
                      <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
                      <th className="px-4 py-3 text-right font-semibold">Total (S/)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ventasArray.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{v.producto}</td>
                        <td className="px-4 py-3 text-center">{v.cantidad}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {v.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })() : (
            <p className="text-slate-500 text-sm">No hay ventas registradas hoy.</p>
          )}
        </Section>

        <Section title="Ventas del día" subtitle="Detalle por cliente y método de pago.">
          {ventas.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold">Producto</th>
                    <th className="px-4 py-3 text-center font-semibold">Cant.</th>
                    <th className="px-4 py-3 text-center font-semibold">Método</th>
                    <th className="px-4 py-3 text-right font-semibold">Total (S/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ventas.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{v.cliente || "Venta rápida"}</td>
                      <td className="px-4 py-3">{v.producto}</td>
                      <td className="px-4 py-3 text-center">{v.cantidad}</td>
                      <td className="px-4 py-3 text-center">{v.metodoPago}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {v.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay ventas registradas hoy.</p>
          )}
        </Section>

        <Section title="Gastos del día" subtitle="Egresos registrados en la jornada.">
          {gastos.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                    <th className="px-4 py-3 text-right font-semibold">Monto (S/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gastos.map((g, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{g.categoria}</td>
                      <td className="px-4 py-3">{g.descripcion || "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {g.monto.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay egresos registrados hoy.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}

function CardRow({ color, icon, label, value, highlight = false }) {
  const colors = {
    green: "from-emerald-50 to-emerald-100 border-emerald-200",
    red: "from-rose-50 to-rose-100 border-rose-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border p-5 rounded-2xl shadow-sm transition-all ${
        highlight ? "shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p
            className={`text-2xl font-bold ${
              color === "red"
                ? "text-rose-700"
                : color === "green"
                ? "text-emerald-700"
                : "text-blue-700"
            }`}
          >
            S/ {value.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
