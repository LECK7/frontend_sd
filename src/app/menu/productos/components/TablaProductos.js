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
        alert("Producto desactivado");
        window.location.reload();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la solicitud");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-amber-200 rounded-xl shadow-md text-sm">
        <thead className="bg-amber-100 text-rose-800 font-semibold">
          <tr>
            <th className="p-3 text-left">Código</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Precio</th>
            <th className="p-3 text-left">Stock</th>
            {usuario?.rol === "ADMIN" && <th className="p-3 text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className="border-t hover:bg-amber-50 transition">
              <td className="p-3">{p.codigo}</td>
              <td className="p-3">{p.nombre}</td>
              <td className="p-3">{p.precio}€</td>
              <td className="p-3">{p.stock}</td>
              {usuario?.rol === "ADMIN" && (
                <td className="p-3 flex gap-2 justify-center">
                  <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    <FaEdit className="text-sm" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(p.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    <FaTrash className="text-sm" />
                    Eliminar
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
