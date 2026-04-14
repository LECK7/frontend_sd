"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getProductos } from "@/services/apiService";

export default function ProductosPage() {
  const router = useRouter();
  const { token, usuario, loading: loadingAuth, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (loadingAuth) return;
    if (!usuario) router.replace("/login");
  }, [loadingAuth, usuario, router]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductos(token, logout);
        if (Array.isArray(data)) setProductos(data);
        else {
          setProductos([]);
          setError(data?.error || "No se pudieron cargar los productos");
        }
      } catch {
        setError("Error de conexión con el servidor");
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) cargarProductos();
  }, [token, logout]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 text-gray-600 text-lg animate-pulse">
        Cargando productos...
      </div>
    );

  const productosFiltrados = productos.filter((p) => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return true;
    return (
      p.nombre?.toLowerCase().includes(term) ||
      (p.descripcion || "").toLowerCase().includes(term) ||
      (p.codigo || "").toLowerCase().includes(term)
    );
  });

  const totalProductos = productos.length;
  const sinStock = productos.filter((p) => Number(p.stock) === 0).length;
  const stockBajo = productos.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;

  const stockBadge = (stock) => {
    if (stock === 0) return "bg-rose-100 text-rose-700";
    if (stock <= 5) return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                Catálogo de Productos
              </h1>
              <p className="text-slate-500 mt-2">
                Visualiza precios, códigos y disponibilidad del inventario.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-semibold text-slate-800">{totalProductos}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-amber-700">Stock bajo</p>
                <p className="text-xl font-semibold text-amber-800">{stockBajo}</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-rose-700">Sin stock</p>
                <p className="text-xl font-semibold text-rose-800">{sinStock}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o descripción"
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-3">
            {error}
          </div>
        )}

        {productosFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            No hay productos disponibles.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {p.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Código: <span className="font-semibold text-slate-700">{p.codigo || "—"}</span>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(
                      Number(p.stock)
                    )}`}
                  >
                    {Number(p.stock) === 0
                      ? "Sin stock"
                      : Number(p.stock) <= 5
                      ? "Stock bajo"
                      : "Disponible"}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                  {p.descripcion || "Sin descripción"}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Precio</p>
                    <p className="text-lg font-bold text-amber-700">
                      S/ {Number(p.precio).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Stock</p>
                    <p className="text-base font-semibold text-slate-800">{p.stock}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
