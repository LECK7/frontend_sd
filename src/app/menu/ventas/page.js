"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function VentasPage() {
  const { token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);

  // Cargar productos disponibles desde tu backend
  useEffect(() => {
    fetch("http://localhost:4000/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  // ✅ Calcular total del carrito
  useEffect(() => {
    const suma = carrito.reduce((acc, item) => acc + item.cantidad * item.precio, 0);
    setTotal(suma);
  }, [carrito]);

  // ✅ Agregar producto al carrito
  const agregarProducto = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((p) => p.id === producto.id);
      if (existente) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  // ✅ Quitar producto del carrito
  const quitarProducto = (id) => {
    setCarrito((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p))
        .filter((p) => p.cantidad > 0)
    );
  };

  // ✅ Enviar venta al backend
  const realizarVenta = async () => {
    if (carrito.length === 0) return alert("No hay productos en el carrito");
    const currentToken = token || localStorage.getItem("token"); // fallback de seguridad

    if (!currentToken) {
      alert("Debes iniciar sesión para registrar una venta.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/ventas/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          clienteId: null,
          items: carrito.map((p) => ({
            productoId: p.id,
            cantidad: p.cantidad,
            precioUnit: p.precio,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Venta realizada correctamente");
        setCarrito([]);
      } else {
        alert("❌ Error al registrar venta: " + (data.error || "Desconocido"));
      }
    } catch (err) {
      console.error("Error al registrar venta:", err);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* 📦 LISTA DE PRODUCTOS */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Productos disponibles</h2>
        <div className="grid grid-cols-2 gap-4">
          {productos.map((prod) => (
            <div
              key={prod.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white"
            >
              <h3 className="font-semibold">{prod.nombre}</h3>
              <p className="text-sm text-gray-500 mb-2">{prod.descripcion}</p>
              <p className="font-bold text-amber-700">S/ {prod.precio}</p>
              <button
                onClick={() => agregarProducto(prod)}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🛒 CARRITO */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Carrito de venta</h2>
        {carrito.length === 0 ? (
          <p className="text-gray-500">No hay productos agregados.</p>
        ) : (
          <div className="bg-white shadow rounded-lg p-4">
            {carrito.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2 border-b pb-2"
              >
                <div>
                  <h4 className="font-semibold">{item.nombre}</h4>
                  <p className="text-sm text-gray-500">
                    Cant: {item.cantidad} × S/ {item.precio}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => quitarProducto(item.id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    -
                  </button>
                  <button
                    onClick={() => agregarProducto(item)}
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-4 font-bold text-lg">
              <span>Total:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={realizarVenta}
              className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg"
            >
              Realizar Venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
