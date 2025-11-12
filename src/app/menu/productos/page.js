"use client";
import { useEffect, useState } from "react";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:4000/api/productos", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductos(data);
        else {
          setProductos([]);
          setError(data.error || "No se pudieron cargar los productos");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error de conexión con el servidor");
        setProductos([]);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 text-gray-600 text-lg animate-pulse">
        Cargando productos...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-amber-100">
        <h1 className="text-4xl font-extrabold text-rose-700 mb-6 text-center tracking-tight">
          🥐 Catálogo de Productos
        </h1>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        {productos.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => (
              <div
                key={p.id}
                className="border border-amber-100 bg-amber-50 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {p.nombre}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Código: <span className="font-medium">{p.codigo || "—"}</span>
                </div>
                <div className="text-sm text-gray-700">
                  💰 Precio:{" "}
                  <span className="font-semibold text-rose-700">
                    S/ {Number(p.precio).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  📦 Stock:{" "}
                  <span
                    className={`font-semibold ${
                      p.stock > 10
                        ? "text-green-600"
                        : p.stock > 0
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
