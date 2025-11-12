"use client";
import { useAuth } from "../../../../context/AuthContext";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TablaProductos({ productos, usuario }) {
  const { token } = useAuth();

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas desactivar este producto?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("✅ Producto desactivado");
        window.location.reload();
      } else {
        alert("❌ Error al eliminar producto");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la solicitud");
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-3xl shadow-xl border border-amber-100">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gradient-to-r from-amber-100 to-rose-100 text-rose-800 font-semibold">
          <tr>
            <th className="p-3 text-left">Código</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-center">Precio</th>
            <th className="p-3 text-center">Stock</th>
            {usuario?.rol === "ADMIN" && <th className="p-3 text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr
              key={p.id}
              className={`border-t hover:bg-amber-50 transition ${
                i % 2 === 0 ? "bg-white" : "bg-amber-50/40"
              }`}
            >
              <td className="p-3">{p.codigo || "—"}</td>
              <td className="p-3 font-medium text-gray-800">{p.nombre}</td>
              <td className="p-3 text-center text-rose-700 font-semibold">
                S/ {Number(p.precio).toFixed(2)}
              </td>
              <td
                className={`p-3 text-center font-semibold ${
                  p.stock > 10
                    ? "text-green-600"
                    : p.stock > 0
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {p.stock}
              </td>
              {usuario?.rol === "ADMIN" && (
                <td className="p-3 flex justify-center gap-3">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <FaEdit className="text-xs" /> Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(p.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                  >
                    <FaTrash className="text-xs" /> Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
