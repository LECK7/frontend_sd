"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Wallet2, Send, ArrowDownCircle, ArrowUpCircle, Landmark, Wallet } from "lucide-react";
import { registrarMovimiento as registrarMovimientoApi } from "@/services/apiService";

export default function FinanzasPage() {
  const router = useRouter();
  const { token, usuario, loading, logout } = useAuth();
  const [tipo, setTipo] = useState("EGRESO");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [medio, setMedio] = useState("EFECTIVO");
  const [mensaje, setMensaje] = useState("");
  const rolesPermitidos = ["ADMIN"];

  useEffect(() => {
    if (loading) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (!rolesPermitidos.includes(usuario.rol)) {
      router.replace("/menu");
    }
  }, [loading, usuario, router]);

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

  const handleRegistrarMovimiento = async () => {
    try {
      if (!categoria || !monto) {
        setMensaje("⚠️ Debes ingresar una categoría y un monto");
        return;
      }

      const data = await registrarMovimientoApi(
        {
          tipo,
          categoria,
          descripcion,
          monto: parseFloat(monto),
          medio,
        },
        token,
        logout
      );
      if (data?.error) throw new Error(data.error || "Error al registrar movimiento");

      setMensaje("✅ Movimiento registrado correctamente");
      setCategoria("");
      setDescripcion("");
      setMonto("");
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-5/12 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                <Wallet2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Movimientos financieros</h1>
              <p className="text-emerald-100 mt-2 text-sm">
                Registra ingresos y egresos con control por categoría y medio de pago.
              </p>
            </div>
            <div className="mt-8 text-sm text-emerald-100">
              <p className="font-semibold text-white mb-1">Consejo</p>
              <p>Selecciona el tipo y el medio de pago para una mejor trazabilidad.</p>
            </div>
          </div>

          <div className="md:w-7/12 p-8">
            <div className="space-y-5">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTipo("INGRESO");
                    setCategoria("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    tipo === "INGRESO"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ArrowUpCircle className={`w-5 h-5 ${tipo === "INGRESO" ? "text-white" : "text-emerald-600"}`} />
                  Ingreso
                </button>
                <button
                  onClick={() => {
                    setTipo("EGRESO");
                    setCategoria("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    tipo === "EGRESO"
                      ? "bg-rose-600 text-white border-rose-600 shadow"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ArrowDownCircle className={`w-5 h-5 ${tipo === "EGRESO" ? "text-white" : "text-rose-600"}`} />
                  Egreso
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categoriasPredefinidas[tipo].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">
                    Medio de pago
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMedio("EFECTIVO")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        medio === "EFECTIVO"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setMedio("BANCO")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        medio === "BANCO"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Landmark className="w-4 h-4" />
                      Banco
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">
                    Monto
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 50.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Compra de harina para producción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleRegistrarMovimiento}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Registrar movimiento
              </button>

              {mensaje && (
                <p
                  className={`text-center font-medium ${
                    mensaje.includes("✅")
                      ? "text-emerald-600"
                      : mensaje.includes("⚠️")
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {mensaje}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
