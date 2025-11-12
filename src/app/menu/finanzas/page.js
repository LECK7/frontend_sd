"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Wallet2, Send, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function FinanzasPage() {
  const { token } = useAuth();
  const [tipo, setTipo] = useState("EGRESO");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const categoriasPredefinidas = {
    INGRESO: [
      "Venta de productos",
      "Abono del cliente",
      "Inversión recibida",
      "Otro ingreso",
    ],
    EGRESO: [
      "Compra de insumos",
      "Pago de servicios",
      "Mantenimiento",
      "Sueldo personal",
      "Otro gasto",
    ],
  };

  const registrarMovimiento = async () => {
    try {
      if (!categoria || !monto) {
        setMensaje("⚠️ Debes ingresar una categoría y un monto");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/finanzas/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo,
          categoria,
          descripcion,
          monto: parseFloat(monto),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar movimiento");

      setMensaje("✅ Movimiento registrado correctamente");
      setCategoria("");
      setDescripcion("");
      setMonto("");
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-8 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-tl from-emerald-100/40 to-transparent pointer-events-none"></div>

        {/* Encabezado */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="flex items-center justify-center bg-emerald-100 rounded-full w-16 h-16 mb-3 shadow-inner">
            <Wallet2 className="text-emerald-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Registrar Movimiento
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Controla tus ingresos y egresos diarios
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4 relative z-10">
          {/* Tipo */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTipo("INGRESO");
                setCategoria("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                tipo === "INGRESO"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ArrowUpCircle
                className={`w-5 h-5 ${
                  tipo === "INGRESO" ? "text-white" : "text-emerald-600"
                }`}
              />
              Ingreso
            </button>
            <button
              onClick={() => {
                setTipo("EGRESO");
                setCategoria("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                tipo === "EGRESO"
                  ? "bg-red-600 text-white border-red-600 shadow"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ArrowDownCircle
                className={`w-5 h-5 ${
                  tipo === "EGRESO" ? "text-white" : "text-red-600"
                }`}
              />
              Egreso
            </button>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Seleccionar categoría...</option>
              {categoriasPredefinidas[tipo].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Descripción (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Compra de harina para producción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Monto
            </label>
            <input
              type="number"
              placeholder="Ej. 50.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botón */}
          <button
            onClick={registrarMovimiento}
            className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Registrar Movimiento
          </button>

          {/* Mensaje */}
          {mensaje && (
            <p
              className={`mt-3 text-center font-medium ${
                mensaje.includes("✅")
                  ? "text-green-600"
                  : mensaje.includes("⚠️")
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
