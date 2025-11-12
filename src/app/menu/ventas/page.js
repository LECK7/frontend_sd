"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import {
  getProductos,
  getClientes,
  createCliente,
  createVenta,
  updateProductoStock
} from "@/services/apiService";

// Helper para color según stock
const stockColor = (stock) => {
  if (stock === 0) return "text-red-500";
  if (stock <= 5) return "text-yellow-500";
  return "text-green-600";
};

// Modal simple para seleccionar/crear cliente
function ClienteModal({ open, onClose, clientes, onSelectCliente, onCreateCliente, loading }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) {
      setNombre("");
      setTelefono("");
      setEmail("");
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Seleccionar o crear cliente</h3>
          <button onClick={onClose} className="text-gray-500">Cerrar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Clientes existentes</label>
            <div className="max-h-48 overflow-auto border rounded mt-2 p-2">
              {clientes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay clientes.</p>
              ) : clientes.map(c => (
                <div key={c.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{c.nombre}</div>
                    <div className="text-xs text-gray-500">{c.telefono || c.email || "-"}</div>
                  </div>
                  <button
                    onClick={() => { onSelectCliente(c); onClose(); }}
                    className="text-sm bg-amber-500 text-white px-3 py-1 rounded"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Crear cliente rápido</label>
            <input value={nombre} onChange={(e)=>setNombre(e.target.value)} placeholder="Nombre" className="w-full border rounded p-2 mt-2" />
            <input value={telefono} onChange={(e)=>setTelefono(e.target.value)} placeholder="Teléfono (opcional)" className="w-full border rounded p-2 mt-2" />
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email (opcional)" className="w-full border rounded p-2 mt-2" />
            <button
              onClick={() => onCreateCliente({ nombre, telefono, email })}
              disabled={!nombre || loading}
              className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear y seleccionar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VentasPage() {
  const { usuario, token } = useAuth();
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteCreando, setClienteCreando] = useState(false);

  const [metodoPago, setMetodoPago] = useState("EFECTIVO"); // EFECTIVO | YAPE | TRANSFERENCIA
  const [esCredito, setEsCredito] = useState(false);
  const rolesPermitidos = ["ADMIN", "VENDEDOR"];

  useEffect(() => {
    if (!usuario) router.replace("/login");
    if (usuario && !rolesPermitidos.includes(usuario.rol)) router.replace("/menu");
  }, [usuario]);

  useEffect(() => {
    setTotal(carrito.reduce((acc, item) => acc + item.cantidad * Number(item.precio), 0));
  }, [carrito]);

  // cargar productos y clientes
  const loadData = async () => {
    try {
      setError(null);
      const [productosData, clientesData] = await Promise.all([
        getProductos(token),
        // getClientes puede devolver { error: ... } si ruta no existe o token inválido
        getClientes ? await getClientes(token) : []
      ]);

      if (!Array.isArray(productosData)) throw new Error(productosData.error || "Error al obtener productos");
      // si no existe ruta clientes, clientesData puede venir con error; ignoramos y dejamos lista vacía
      if (!Array.isArray(clientesData)) {
        setClientes([]);
      } else {
        setClientes(clientesData);
      }

      setProductos(productosData);
    } catch (err) {
      console.error("Error carga Ventas:", err);
      setError(err.message || "Error al cargar datos. Acceso restringido o token inválido.");
    }
  };

  useEffect(() => {
    if (token && usuario) loadData();
  }, [token, usuario]);

  const agregarProducto = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((p) => p.id === producto.id);
      const cantidadActual = existente ? existente.cantidad : 0;
      if (cantidadActual + 1 > producto.stock) {
        alert(`No puedes agregar más de ${producto.stock} unidades.`);
        return prev;
      }
      if (existente) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { id: producto.id, nombre: producto.nombre, precio: Number(producto.precio), cantidad: 1, stock: producto.stock }];
    });
  };

  const quitarProducto = (id) => {
    setCarrito((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p))
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminarProductoCarrito = (id) => {
    setCarrito(prev => prev.filter(p => p.id !== id));
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  const handleCreateCliente = async (payload) => {
    try {
      setClienteCreando(true);
      const res = await createCliente(payload, token);
      if (res && res.error) throw new Error(res.error);
      // backend puede devolver el cliente creado como res.usuario o res.cliente; adaptamos
      const clienteNuevo = res?.cliente || res?.usuario || res?.nuevoCliente || res;
      if (!clienteNuevo || !clienteNuevo.id) {
        // si backend no devuelve, recargamos lista de clientes
        await loadData();
        setClienteCreando(false);
        setClienteModalOpen(false);
        return;
      }
      setClientes(prev => [clienteNuevo, ...prev]);
      setClienteSeleccionado(clienteNuevo);
      setClienteModalOpen(false);
    } catch (err) {
      alert("Error creando cliente: " + (err.message || err));
    } finally {
      setClienteCreando(false);
    }
  };

  const realizarVenta = async () => {
    if (carrito.length === 0) return alert("No hay productos en el carrito");
    try {
      const items = carrito.map(p => ({
        productoId: p.id,
        cantidad: p.cantidad,
        precioUnit: p.precio
      }));
      const body = {
        clienteId: clienteSeleccionado?.id || null, // si null, backend puede usar cliente rápido por defecto
        items,
        metodoPago,
        esCredito,
        total: Number(total)
      };

      const res = await createVenta(body, token);
      if (!res) throw new Error("Respuesta vacía del servidor");
      if (res.error) throw new Error(res.error);

      // OK: respuesta sin error
      alert("Venta registrada correctamente");

      // actualizar stock localmente (y opcionalmente pedir al backend que haga decremento)
      // intentamos actualizar los stocks usando tu endpoint de stock (si lo quieres)
      // aquí solo actualizamos UI: decrementar stock en productos y limpiar carrito
      setProductos(prev => prev.map(prod => {
        const enCarrito = carrito.find(c => c.id === prod.id);
        if (!enCarrito) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - enCarrito.cantidad) };
      }));
      setCarrito([]);
      setClienteSeleccionado(null);
    } catch (err) {
      console.error("Error registrando venta:", err);
      alert("Error al registrar venta: " + (err.message || "Desconocido"));
    }
  };

  if (!usuario) return <p className="text-center mt-10">Verificando acceso...</p>;

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-bold text-red-600">Acceso restringido</h2>
      <p className="mt-2 text-gray-700">{error}</p>
      <button onClick={() => router.push("/menu")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Volver al menú
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Productos (lado izquierdo / principal) */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Productos disponibles</h2>
          <div className="flex gap-2">
            <button onClick={() => setClienteModalOpen(true)} className="bg-amber-500 text-white px-3 py-1 rounded">Cliente / Crear</button>
            <button onClick={() => { setClienteSeleccionado(null); setCarrito([]); }} className="bg-gray-200 px-3 py-1 rounded">Reset</button>
          </div>
        </div>

        {productos.length === 0 ? (
          <p className="text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {productos.map(prod => (
              <div key={prod.id} className="border rounded-lg p-4 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{prod.nombre}</h3>
                  <p className="text-sm text-gray-500 mb-2">{prod.descripcion}</p>
                  <p className={`font-bold ${stockColor(prod.stock)}`}>Stock: {prod.stock}</p>
                  <p className="font-bold text-amber-700">S/ {parseFloat(prod.precio).toFixed(2)}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => agregarProducto(prod)}
                    disabled={prod.stock === 0}
                    className={`w-full py-2 rounded text-white ${prod.stock === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600"}`}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carrito y opciones (lado derecho) */}
      <aside className="bg-white rounded-lg shadow p-4">
        <h3 className="text-xl font-semibold mb-3">Carrito</h3>
        {carrito.length === 0 ? (
          <p className="text-gray-500">Carrito vacío.</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-auto">
            {carrito.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{item.nombre}</div>
                  <div className="text-xs text-gray-500">Cant: {item.cantidad} × S/ {item.precio.toFixed(2)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    <button onClick={() => quitarProducto(item.id)} className="px-2 py-1 bg-red-500 text-white rounded">-</button>
                    <button onClick={() => agregarProducto(item)} className="px-2 py-1 bg-green-500 text-white rounded">+</button>
                  </div>
                  <button onClick={() => eliminarProductoCarrito(item.id)} className="text-xs text-red-600">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Cliente</label>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                {clienteSeleccionado ? (
                  <div className="p-2 border rounded">
                    <div className="font-medium">{clienteSeleccionado.nombre}</div>
                    <div className="text-xs text-gray-500">{clienteSeleccionado.telefono || clienteSeleccionado.email || "-"}</div>
                  </div>
                ) : (
                  <div className="p-2 border rounded text-gray-500">Cliente rápido (predeterminado) o selecciona uno</div>
                )}
              </div>
              <button onClick={() => setClienteModalOpen(true)} className="px-3 py-1 bg-amber-500 text-white rounded">Seleccionar</button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Método de pago</label>
            <select
              value={metodoPago}
              onChange={e => setMetodoPago(e.target.value)}
              className="w-full border rounded p-2 mt-2"
              disabled={esCredito} // 🔹 Desactivar si es fiado
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              id="credito"
              checked={esCredito}
              onChange={e => setEsCredito(e.target.checked)}
              type="checkbox"
            />
            <label htmlFor="credito" className="text-sm">Vender a crédito (fiado)</label>
          </div>

          <button onClick={realizarVenta} className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Registrar venta
          </button>
        </div>
      </aside>

      <ClienteModal
        open={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        clientes={clientes}
        onSelectCliente={seleccionarCliente}
        onCreateCliente={handleCreateCliente}
        loading={clienteCreando}
      />
    </div>
  );
}
