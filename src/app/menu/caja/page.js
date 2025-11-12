"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Wallet, TrendingUp, TrendingDown, Calculator, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CajaPage() {
  const { usuario, token, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const rolesPermitidos = ["ADMIN", "VENDEDOR", "PRODUCCION"];

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

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/caja/resumen`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al obtener el detalle de caja");
        }

        const data = await res.json();
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

  const generarPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte Diario de Caja", 105, 20, { align: "center" });
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25); // línea separadora

    // Fecha y usuario
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date(fecha).toLocaleDateString("es-PE")}`, 14, 32);
    doc.text(`Generado por: ${usuario?.nombre || usuario?.email || "Usuario"}`, 14, 38);

    // ---------------- RESUMEN ----------------
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen General", 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [["Ingresos (S/)", "Egresos (S/)", "Balance (S/)"]],
      body: [[
        resumen.ingresos.toFixed(2),
        resumen.egresos.toFixed(2),
        resumen.balance.toFixed(2),
      ]],
      styles: { halign: "right" },
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold" },
      theme: "grid",
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // ---------------- VENTAS ----------------
    if (ventas.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ventas del día", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Producto", "Cantidad", "Total (S/)"]],
        body: ventas.map(v => [v.producto, v.cantidad, v.total.toFixed(2)]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold" },
        columnStyles: { 2: { halign: "right" } }, // alinear total a la derecha
        theme: "grid",
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }

    // ---------------- GASTOS ----------------
    if (gastos.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Gastos del día", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Categoría", "Descripción", "Monto (S/)"]],
        body: gastos.map(g => [g.categoria, g.descripcion || "-", g.monto.toFixed(2)]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold" },
        columnStyles: { 2: { halign: "right" } },
        theme: "grid",
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }

    // Pie
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Reporte generado automáticamente por el sistema`, 14, currentY);

    // Guardar PDF
    doc.save(`Reporte_Caja_${new Date(fecha).toLocaleDateString("es-PE")}.pdf`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl border border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 to-transparent pointer-events-none"></div>

        {/* Encabezado */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-center bg-blue-100 rounded-full w-16 h-16 mb-3">
            <Wallet className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Resumen de Caja</h1>
          <p className="text-gray-500 text-sm mt-1">Estado financiero del día</p>
        </div>

        {/* Resumen general */}
        <div className="space-y-5 mb-6 relative z-10">
          <CardRow
            color="green"
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            label="Ingresos"
            value={resumen.ingresos}
          />
          <CardRow
            color="red"
            icon={<TrendingDown className="w-6 h-6 text-red-600" />}
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

        {/* Detalle de ventas */}
        <Section title="🛒 Ventas del día">
          {ventas.length ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border p-2 text-left">Producto</th>
                  <th className="border p-2 text-center">Cantidad</th>
                  <th className="border p-2 text-right">Total (S/)</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2">{v.producto}</td>
                    <td className="border p-2 text-center">{v.cantidad}</td>
                    <td className="border p-2 text-right">{v.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No hay ventas registradas hoy.</p>
          )}
        </Section>

        {/* Detalle de egresos */}
        <Section title="💸 Gastos del día">
          {gastos.length ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border p-2 text-left">Categoría</th>
                  <th className="border p-2 text-left">Descripción</th>
                  <th className="border p-2 text-right">Monto (S/)</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2">{g.categoria}</td>
                    <td className="border p-2">{g.descripcion || "-"}</td>
                    <td className="border p-2 text-right">{g.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No hay egresos registrados hoy.</p>
          )}
        </Section>

        {/* Botón PDF */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={generarPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            <FileDown className="w-5 h-5" /> Descargar PDF
          </button>
        </div>

        {/* Fecha */}
        <div className="mt-8 text-sm text-gray-500 text-center relative z-10">
          📅 Fecha actual:{" "}
          <span className="font-medium text-gray-700">
            {new Date(fecha).toLocaleDateString("es-PE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="border rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}

function CardRow({ color, icon, label, value, highlight = false }) {
  const colors = {
    green: "from-green-50 to-green-100 border-green-200",
    red: "from-red-50 to-red-100 border-red-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
  };

  return (
    <div
      className={`flex items-center justify-between bg-gradient-to-r ${
        colors[color]
      } border p-4 rounded-xl shadow-sm transition-all duration-200 ${
        highlight ? "scale-[1.02]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-gray-700 text-base">{label}</span>
      </div>
      <span
        className={`font-bold text-lg ${
          color === "red"
            ? "text-red-700"
            : color === "green"
            ? "text-green-700"
            : "text-blue-700"
        }`}
      >
        S/ {value.toFixed(2)}
      </span>
    </div>
  );
}
