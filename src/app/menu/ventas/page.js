"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaSearch,
  FaUserCircle,
  FaReceipt,
  FaTrash,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
} from "react-icons/fa";
import jsPDF from "jspdf";
import {
  getProductos,
  getClientes,
  createCliente,
  createVenta
} from "@/services/apiService";

const stockColor = (stock) => {
  if (stock === 0) return "text-red-500";
  if (stock <= 5) return "text-yellow-500";
  return "text-green-600";
};

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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Clientes</h3>
            <p className="text-sm text-slate-500">Selecciona uno existente o crea uno nuevo.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">Cerrar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600">Clientes existentes</label>
            <div className="max-h-64 overflow-auto border border-slate-200 rounded-xl mt-3 p-3">
              {clientes.length === 0 ? (
                <p className="text-sm text-slate-500">No hay clientes.</p>
              ) : clientes.map(c => (
                <div key={c.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                  <div>
                    <div className="font-semibold text-slate-800">{c.nombre}</div>
                    <div className="text-xs text-slate-500">{c.telefono || c.email || "-"}</div>
                  </div>
                  <button
                    onClick={() => { onSelectCliente(c); onClose(); }}
                    className="text-sm bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600">Crear cliente rápido</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opcional)"
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => onCreateCliente({ nombre, telefono, email })}
              disabled={!nombre || loading}
              className="mt-4 w-full bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-60"
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
  const { usuario, token, logout } = useAuth();
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [ticketData, setTicketData] = useState(null);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteCreando, setClienteCreando] = useState(false);

  const [metodoPago, setMetodoPago] = useState("EFECTIVO"); // EFECTIVO | YAPE | TRANSFERENCIA
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
        getProductos(token, logout),
        getClientes(token, logout)
      ]);

      if (!Array.isArray(productosData))
        throw new Error(productosData.error || "Error al obtener productos");

      if (Array.isArray(clientesData)) setClientes(clientesData);
      else setClientes([]);

      setProductos(productosData);

    } catch (err) {
      console.error("Error carga Ventas:", err);
      setError(err.message || "Error al cargar datos");
    }
  };

  useEffect(() => {
    if (!token || !usuario) return;
    loadData();
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
      const res = await createCliente(payload, token, logout);
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
      const message = err instanceof Error ? err.message : String(err);
      alert("Error creando cliente: " + message);
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
        clienteId: clienteSeleccionado?.id || null,
        items,
        metodoPago,
        total: Number(total)
      };

      const res = await createVenta(body, token, logout);
      if (!res) throw new Error("Respuesta vacía del servidor");
      if (res.error) throw new Error(res.error);

      alert("Venta registrada correctamente");

        setTicketData({
          venta: res?.venta || null,
          items: carrito.map((p) => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            precio: p.precio,
          })),
          total: Number(total),
          metodoPago,
          cliente: clienteSeleccionado,
          fecha: new Date(),
        });

      setProductos(prev => prev.map(prod => {
        const enCarrito = carrito.find(c => c.id === prod.id);
        if (!enCarrito) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - enCarrito.cantidad) };
      }));
      setCarrito([]);
      setClienteSeleccionado(null);
    } catch (err) {
      console.error("Error registrando venta:", err);
      const message = err instanceof Error ? err.message : String(err || "Desconocido");
      alert("Error al registrar venta: " + message);
    }
  };

  const formatoMoneda = (n) => Number(n || 0).toFixed(2);

  const metodoPagoLabel = (m) =>
    m === "EFECTIVO" ? "Efectivo" : m === "YAPE" ? "Yape" : "Transferencia";

  const generarTicketPDF = () => {
    if (!ticketData) return;
    const doc = new jsPDF({ unit: "mm", format: [80, 200] });
    let y = 8;

    doc.setFontSize(12);
    doc.text("Panadería SD", 40, y, { align: "center" });
    y += 5;
    doc.setFontSize(8);
    doc.text("Comprobante de venta", 40, y, { align: "center" });
    y += 5;
    doc.text(`Fecha: ${ticketData.fecha.toLocaleString("es-PE")}`, 4, y);
    y += 4;
    doc.text(`Venta: ${ticketData.venta?.id || "—"}`, 4, y);
    y += 4;
    doc.text(`Cliente: ${ticketData.cliente?.nombre || "Venta rápida"}`, 4, y);
    y += 4;
    doc.text(`Vendedor: ${usuario?.nombre || usuario?.email || "—"}`, 4, y);
    y += 4;
    doc.text(`Pago: ${metodoPagoLabel(ticketData.metodoPago)}`, 4, y);
    y += 4;

    doc.line(4, y, 76, y);
    y += 4;

    ticketData.items.forEach((it) => {
      doc.text(it.nombre, 4, y);
      y += 4;
      doc.text(
        `${it.cantidad} x S/ ${formatoMoneda(it.precio)} = S/ ${formatoMoneda(it.cantidad * it.precio)}`,
        4,
        y
      );
      y += 4;
      if (y > 190) {
        doc.addPage();
        y = 8;
      }
    });

    doc.line(4, y, 76, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(`TOTAL: S/ ${formatoMoneda(ticketData.total)}`, 4, y);
    y += 6;
    doc.setFontSize(8);
    doc.text("Gracias por su compra", 40, y, { align: "center" });

    doc.save(`Ticket_${ticketData.venta?.id || "venta"}.pdf`);
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

  const productosFiltrados = productos.filter((p) => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return true;
    return (
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos */}
        <section className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Ventas</h2>
                <p className="text-sm text-slate-500">Selecciona productos y gestiona el carrito</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setClienteModalOpen(true)}
                  className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition"
                >
                  <FaUserCircle /> Cliente
                </button>
                <button
                  onClick={() => {
                    setClienteSeleccionado(null);
                    setCarrito([]);
                  }}
                  className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200 transition"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-slate-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar producto por nombre o descripción"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <p className="text-slate-500">No hay productos disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {productosFiltrados.map((prod) => (
                <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800 mb-1">{prod.nombre}</h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{prod.descripcion || "Sin descripción"}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${stockColor(prod.stock)}`}>
                        Stock: {prod.stock}
                      </span>
                      <span className="text-sm font-bold text-amber-700">
                        S/ {parseFloat(prod.precio).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => agregarProducto(prod)}
                    disabled={prod.stock === 0}
                    className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-white transition ${
                      prod.stock === 0
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    Agregar al carrito
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Carrito */}
        <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <FaShoppingCart /> Carrito
            </h3>
            <span className="text-sm text-slate-500">{carrito.length} items</span>
          </div>

          {carrito.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Carrito vacío.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {carrito.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800">{item.nombre}</div>
                      <div className="text-xs text-slate-500">
                        S/ {item.precio.toFixed(2)} c/u
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarProductoCarrito(item.id)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => quitarProducto(item.id)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
                      >
                        <FaMinus />
                      </button>
                      <span className="font-semibold text-slate-800">{item.cantidad}</span>
                      <button
                        onClick={() => agregarProducto(item)}
                        className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      S/ {formatoMoneda(item.cantidad * item.precio)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-slate-200 pt-4 space-y-4">
            <div className="flex justify-between font-bold text-slate-800 text-lg">
              <span>Total</span>
              <span>S/ {formatoMoneda(total)}</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Cliente</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  {clienteSeleccionado ? (
                    <div className="p-3 border border-slate-200 rounded-xl">
                      <div className="font-semibold text-slate-800">{clienteSeleccionado.nombre}</div>
                      <div className="text-xs text-slate-500">
                        {clienteSeleccionado.telefono || clienteSeleccionado.email || "-"}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border border-slate-200 rounded-xl text-slate-500">
                      Cliente rápido o selecciona uno
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setClienteModalOpen(true)}
                  className="px-3 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
                >
                  Seleccionar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Método de pago</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMetodoPago("EFECTIVO")}
                  className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl border text-sm font-semibold transition ${
                    metodoPago === "EFECTIVO"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <FaMoneyBillWave /> Efectivo
                </button>
                <button
                  onClick={() => setMetodoPago("YAPE")}
                  className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl border text-sm font-semibold transition ${
                    metodoPago === "YAPE"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <FaMobileAlt /> Yape
                </button>
                <button
                  onClick={() => setMetodoPago("TRANSFERENCIA")}
                  className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl border text-sm font-semibold transition ${
                    metodoPago === "TRANSFERENCIA"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <FaCreditCard /> Banco
                </button>
              </div>
            </div>

            <button
              onClick={realizarVenta}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Registrar venta
            </button>

            <button
              onClick={generarTicketPDF}
              disabled={!ticketData}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaReceipt /> Comprobante PDF
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
    </div>
  );
}
