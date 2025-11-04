"use client";
import { useEffect, useState } from "react";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/productos")
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
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
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-rose-800 mb-6 text-center">
          🥖 Lista de Productos
        </h1>

        {productos.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos.</p>
        ) : (
          <ul className="space-y-4">
            {productos.map((producto) => (
              <li
                key={producto.id}
                className="border border-amber-200 bg-amber-50 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="text-lg font-semibold text-gray-800">
                  {producto.nombre}
                </div>
                <div className="text-sm text-gray-600">
                  Precio: <span className="font-medium">{producto.precio}€</span> &nbsp;|&nbsp;
                  Stock: <span className="font-medium">{producto.stock}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
