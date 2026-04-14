"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaUsers, FaBox, FaWarehouse, FaSave, FaTimes, FaStore } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; 
import { 
    getProductos, 
    deleteProducto, 
    getUsuarios, 
    deleteUsuario,
    updateProductoStock,
    getSucursales,
    deleteSucursal
} from "@/services/apiService"; 
import ProductForm from "@/components/ProductoForm";
import UserForm from "@/components/UsuarioForm";
import SucursalForm from "@/components/SucursalForm";

// =========================================================
// COMPONENTE DE TABLA DE STOCK
// =========================================================
const StockTable = ({ productos, handleUpdateStock }) => {
    const [editingId, setEditingId] = useState(null);
    const [cantidadAAgregar, setCantidadAAgregar] = useState(1); 

    const startEdit = (prod) => {
        setEditingId(prod.id);
        setCantidadAAgregar(1);
    };

    const handleSave = async (id) => {
        const cantidadInt = parseInt(cantidadAAgregar);
        if (isNaN(cantidadInt) || cantidadInt <= 0 || !Number.isInteger(cantidadInt)) {
            alert("Por favor, ingrese una cantidad entera positiva para agregar.");
            return;
        }
        
        await handleUpdateStock(id, cantidadInt);
        setEditingId(null);
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Agregar Stock a Inventario</h2>
            <table className="w-full bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                    <tr>
                        <th className="py-3 px-4 text-left">Nombre</th>
                        <th className="py-3 px-4 text-left">Descripción</th>
                        <th className="py-3 px-4 text-left">Stock Actual</th>
                        <th className="py-3 px-4 text-center">Cantidad a Agregar</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((prod) => (
                        <tr key={prod.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">{prod.nombre}</td>
                            <td className="py-3 px-4">{prod.descripcion}</td>
                            <td className="py-3 px-4 text-center font-bold text-lg">{prod.stock}</td>
                            <td className="py-3 px-4 flex justify-center items-center gap-2">
                                {editingId === prod.id ? (
                                    <>
                                <input
                                    type="number"
                                    value={cantidadAAgregar} 
                                    onChange={(e) => setCantidadAAgregar(e.target.value)}
                                    className="w-20 border border-slate-200 rounded-lg text-center p-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    min="1"
                                    step="1"
                                />
                                <button 
                                    onClick={() => handleSave(prod.id)}
                                    className="text-emerald-600 hover:text-emerald-700"
                                    disabled={parseInt(cantidadAAgregar) <= 0 || !Number.isInteger(parseInt(cantidadAAgregar))}
                                >
                                    <FaSave />
                                </button>
                                <button 
                                    onClick={() => setEditingId(null)}
                                    className="text-rose-600 hover:text-rose-700"
                                >
                                    <FaTimes />
                                </button>
                                    </>
                                ) : (
                                <button 
                                    onClick={() => startEdit(prod)}
                                    className="text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    Agregar
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
};

// =========================================================
// COMPONENTE PRINCIPAL AdministracionPage
// =========================================================
export default function AdministracionPage() {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [sucursalToEdit, setSucursalToEdit] = useState(null);
    const [vistaActual, setVistaActual] = useState('productos'); 
    const [isSucursalModalOpen, setIsSucursalModalOpen] = useState(false);
    const router = useRouter();
    const { usuario, token, logout } = useAuth();
    const rolesPermitidos = ["ADMIN", "PRODUCCION"];
    const isAdmin = usuario?.rol === "ADMIN";
    const isProduccion = usuario?.rol === "PRODUCCION";
    const vistasDisponibles = useMemo(() => (
        isAdmin
            ? ["productos", "usuarios", "stock", "sucursales"]
            : isProduccion
            ? ["stock"]
            : []
    ), [isAdmin, isProduccion]);

    const loadData = async (authToken) => {
        if (!authToken) return;
        setIsLoading(true);
        setError(null);
        try {
        if (vistaActual === 'productos' || vistaActual === 'stock') {
            const data = await getProductos(authToken, logout);

            if (Array.isArray(data)) {
                setProductos(data);
            } else {
                console.warn("Respuesta inesperada o sin permisos (productos/stock):", data);
                setProductos([]);

                if (data?.error?.toLowerCase().includes("permiso") || data?.error?.toLowerCase().includes("denegado")) {
                    if (vistaActual === 'stock') {
                        setError("🚫 Acceso denegado: no tienes permisos para gestionar el stock.");
                    } else {
                        setError("🚫 Acceso denegado: no tienes permisos para ver los productos.");
                    }
                } else {
                    setError("⚠️ No se pudieron obtener los productos correctamente.");
                }
            }
        }

        if (vistaActual === 'usuarios') {
            const [dataUsuarios, dataSucursales] = await Promise.all([
                getUsuarios(authToken, logout),
                getSucursales(authToken, logout)
            ]);
            console.log("Token usado para getUsuarios:", authToken);
            console.log("Usuario actual:", usuario);
            console.log("Respuesta getUsuarios:", dataUsuarios);
            

            if (Array.isArray(dataUsuarios)) {
                setUsuarios(dataUsuarios);
            } else {
                console.warn("Respuesta inesperada o sin permisos:", dataUsuarios);
                setUsuarios([]);
                if (dataUsuarios?.error?.toLowerCase().includes("permiso") || dataUsuarios?.error?.toLowerCase().includes("denegado")) {
                    setError("🚫 Acceso denegado: no tienes permisos para ver la gestión de usuarios.");
                } else {
                    setError("⚠️ No se pudieron obtener los usuarios correctamente.");
                }
            }

            if (Array.isArray(dataSucursales)) {
                setSucursales(dataSucursales);
            } else {
                setSucursales([]);
            }
        }
        if (vistaActual === 'sucursales') {
            const data = await getSucursales(authToken, logout);
            if (Array.isArray(data)) {
                setSucursales(data);
            } else {
                setSucursales([]);
                setError(data?.error || "⚠️ No se pudieron obtener las sucursales.");
            }
        }
        } catch (err) {
            console.error("Error al cargar datos:", err);
            const message = err instanceof Error ? err.message : String(err || "");
            setError(message || "No se pudieron cargar los datos.");
            if (message.includes("401") || message.includes("403")) {
                logout();
                router.push("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!usuario) {
            router.replace("/login");
            return;
        }
        if (!rolesPermitidos.includes(usuario.rol)) {
            router.replace("/menu");
            return;
        }
    }, [usuario]);

    useEffect(() => {
        if (!usuario) return;
        if (vistasDisponibles.length && !vistasDisponibles.includes(vistaActual)) {
            setVistaActual(vistasDisponibles[0]);
        }
    }, [usuario, vistaActual, vistasDisponibles]);

    useEffect(() => {
        if (token && usuario) {
            console.log("Cargando datos para vista:", vistaActual);
            loadData(token);
        }
    }, [vistaActual, token, usuario]);
    // ======== PRODUCTOS CRUD (Mantenido) ========
    // ... (handleDeleteProducto, handleOpenCreateProducto, handleOpenEditProducto, handleSaveProducto)

    // Función de guardado de producto (completa o creación)
    const handleSaveProducto = (savedProduct) => {
        if (productToEdit) {
            setProductos(productos.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProductos([...productos, savedProduct]);
        }
    };
    
    // Función de edición/creación de producto (mantenida)
    const handleOpenEditProducto = (prod) => {
        setProductToEdit(prod);
        setIsProductModalOpen(true);
    };

    const handleOpenCreateProducto = () => {
        setProductToEdit(null);
        setIsProductModalOpen(true);
    };
    
    // Función de eliminación de producto (mantenida)
    const handleDeleteProducto = async (id) => {
        if (!token) return;
        if (confirm("¿Seguro que deseas eliminar este producto?")) {
            try {
                const data = await deleteProducto(id, token, logout);
                if (data?.error) throw new Error(data.error);
                setProductos(productos.filter((p) => p.id !== id));
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                alert("Hubo un error al intentar eliminar el producto.");
            }
        }
    };

    // ======== USUARIOS CRUD (Mantenido) ========
    // ... (handleDeleteUsuario, handleOpenCreateUsuario, handleOpenEditUsuario, handleSaveUsuario)

    // Función de guardado de usuario (completa o creación)
    const handleSaveUsuario = (savedUser) => {
        if (userToEdit) {
            setUsuarios(usuarios.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            setUsuarios([...usuarios, savedUser]);
        }
    };

    // Función de edición/creación de usuario (mantenida)
    const handleOpenEditUsuario = (user) => {
        setUserToEdit(user);
        setIsUserModalOpen(true);
    };

    const handleOpenCreateUsuario = () => {
        setUserToEdit(null);
        setIsUserModalOpen(true);
    };

    // Función de eliminación de usuario (mantenida)
    const handleDeleteUsuario = async (id) => {
        if (!token) return;
        if (confirm("¿Seguro que deseas eliminar este usuario?")) {
            try {
                const data = await deleteUsuario(id, token, logout);
                if (data?.error) throw new Error(data.error);
                setUsuarios(usuarios.filter((u) => u.id !== id));
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                alert("Error al eliminar el usuario.");
            }
        }
    };

    // ======== SUCURSALES CRUD ========
    const handleOpenCreateSucursal = () => {
        setSucursalToEdit(null);
        setIsSucursalModalOpen(true);
    };

    const handleOpenEditSucursal = (suc) => {
        setSucursalToEdit(suc);
        setIsSucursalModalOpen(true);
    };

    const handleSaveSucursal = (savedSucursal) => {
        if (sucursalToEdit) {
            setSucursales(sucursales.map(s => s.id === savedSucursal.id ? savedSucursal : s));
        } else {
            setSucursales([savedSucursal, ...sucursales]);
        }
    };

    const handleDeleteSucursal = async (id) => {
        if (!token) return;
        if (confirm("¿Seguro que deseas desactivar esta sucursal?")) {
            try {
                const data = await deleteSucursal(id, token, logout);
                if (data?.error) throw new Error(data.error);
                setSucursales(sucursales.map(s => s.id === id ? { ...s, activo: false } : s));
            } catch (error) {
                console.error("Error al desactivar sucursal:", error);
                alert("Error al desactivar la sucursal.");
            }
        }
    };

    // ======== STOCK (Nueva funcionalidad) ========
    const handleUpdateStock = async (id, newStock) => {
        if (!token) return;
        
        try {
            // Llama al apiService.js para actualizar solo el stock
            const updatedProduct = await updateProductoStock(id, newStock, token, logout); 
            if (updatedProduct?.error) throw new Error(updatedProduct.error);
            
            // Actualizar la lista local de productos con el stock devuelto
            setProductos(productos.map(p => 
                p.id === id ? { ...p, stock: updatedProduct.stock } : p
            ));
            alert(`Stock de ${updatedProduct.nombre} actualizado a ${updatedProduct.stock}.`);

        } catch (error) {
            console.error("Error al actualizar el stock:", error);
            alert("Error al actualizar el stock del producto. Revise el log de la consola.");
            // Recargar datos si falla para obtener el estado real
            loadData(token); 
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10">
            <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
                <p className="text-slate-500 mt-1">Gestiona productos, usuarios, stock y sucursales</p>
            </div>
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
                {isAdmin && (
                    <button
                        onClick={() => setVistaActual('productos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition ${
                            vistaActual === 'productos' ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        <FaBox /> Productos
                    </button>
                )}
                {isAdmin && (
                    <button
                        onClick={() => setVistaActual('usuarios')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition ${
                            vistaActual === 'usuarios' ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        <FaUsers /> Usuarios
                    </button>
                )}
                {(isAdmin || isProduccion) && (
                    <button
                        onClick={() => setVistaActual('stock')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition ${
                            vistaActual === 'stock' ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        <FaWarehouse /> Gestionar Stock
                    </button>
                )}
                {isAdmin && (
                    <button
                        onClick={() => setVistaActual('sucursales')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition ${
                            vistaActual === 'sucursales' ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        <FaStore /> Sucursales
                    </button>
                )}
            </div>

            {/* ======= Contenido ======= */}
            {isLoading ? (
                <div className="flex justify-center items-center py-10 text-rose-700">
                    <FaSpinner className="animate-spin text-3xl mr-2" />
                    <span className="text-xl">Cargando...</span>
                </div>
            ) : error ? (
                <div className="text-center bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl" role="alert">
                    <p className="font-bold">Error de Carga</p>
                    <p>{error}</p>
                </div>
            ) : vistaActual === 'productos' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Administración de Productos</h2>
                        {isAdmin && (
                            <button
                                onClick={handleOpenCreateProducto}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition"
                            >
                                <FaPlus /> Nuevo Producto
                            </button>
                        )}
                    </div>
            {productos.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <p>No hay productos registrados.</p>
                </div>
            ) : (
                <table className="w-full bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="py-3 px-4 text-left">Nombre</th>
                                    <th className="py-3 px-4 text-left">Descripción</th>
                                    <th className="py-3 px-4 text-left">Precio</th>
                                    <th className="py-3 px-4 text-left">Stock</th>
                                {isAdmin && <th className="py-3 px-4 text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((prod) => (
                                <tr key={prod.id} className="border-b hover:bg-slate-50">
                                    <td className="py-3 px-4">{prod.nombre}</td>
                                    <td className="py-3 px-4">{prod.descripcion}</td>
                                    <td className="py-3 px-4">S/ {parseFloat(prod.precio).toFixed(2)}</td>
                                    <td className="py-3 px-4">{prod.stock}</td>
                                    {isAdmin && (
                                        <td className="py-3 px-4 flex justify-center gap-3">
                                            <button onClick={() => handleOpenEditProducto(prod)} className="text-blue-600 hover:text-blue-700"><FaEdit /></button>
                                            <button onClick={() => handleDeleteProducto(prod.id)} className="text-rose-600 hover:text-rose-700"><FaTrash /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </>
            ) : vistaActual === 'usuarios' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Administración de Usuarios</h2>
                        {isAdmin && (
                            <button
                                onClick={handleOpenCreateUsuario}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition"
                            >
                                <FaPlus /> Nuevo Usuario
                            </button>
                        )}
                    </div>
                    {usuarios.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>No hay usuarios registrados.</p>
                        </div>
                    ) : (
                        <table className="w-full bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="py-3 px-4 text-left">Nombre</th>
                                    <th className="py-3 px-4 text-left">Email</th>
                                    <th className="py-3 px-4 text-left">Rol</th>
                                    <th className="py-3 px-4 text-left">Sucursal</th>
                                    <th className="py-3 px-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.id || `${u.email}-${Math.random()}`} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4">{u.nombre}</td>
                                        <td className="py-3 px-4">{u.email}</td>
                                        <td className="py-3 px-4">{u.rol || "Usuario"}</td>
                                        <td className="py-3 px-4">{u.sucursal?.nombre || "—"}</td>
                                        <td className="py-3 px-4 flex justify-center gap-3">
                                            <button onClick={() => handleOpenEditUsuario(u)} className="text-blue-600 hover:text-blue-700"><FaEdit /></button>
                                            <button onClick={() => handleDeleteUsuario(u.id)} className="text-rose-600 hover:text-rose-700"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : vistaActual === 'stock' ? (
                <StockTable productos={productos} handleUpdateStock={handleUpdateStock} />
            ) : vistaActual === 'sucursales' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Gestión de Sucursales</h2>
                        <button
                            onClick={handleOpenCreateSucursal}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition"
                        >
                            <FaPlus /> Nueva Sucursal
                        </button>
                    </div>
                    {sucursales.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>No hay sucursales registradas.</p>
                        </div>
                    ) : (
                        <table className="w-full bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="py-3 px-4 text-left">Nombre</th>
                                    <th className="py-3 px-4 text-left">Dirección</th>
                                    <th className="py-3 px-4 text-left">Teléfono</th>
                                    <th className="py-3 px-4 text-center">Estado</th>
                                    <th className="py-3 px-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sucursales.map((s) => (
                                    <tr key={s.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-800">{s.nombre}</td>
                                        <td className="py-3 px-4">{s.direccion || "—"}</td>
                                        <td className="py-3 px-4">{s.telefono || "—"}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                {s.activo ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex justify-center gap-3">
                                            <button onClick={() => handleOpenEditSucursal(s)} className="text-blue-600 hover:text-blue-700"><FaEdit /></button>
                                            {s.activo && (
                                                <button onClick={() => handleDeleteSucursal(s.id)} className="text-rose-600 hover:text-rose-700"><FaTrash /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : null}

            {isProductModalOpen && (
                <ProductForm
                    key={productToEdit ? productToEdit.id : 'new'}
                    productToEdit={productToEdit}
                    onClose={() => setIsProductModalOpen(false)} 
                    onSave={handleSaveProducto}
                />
            )}
            {isUserModalOpen && ( 
                <UserForm
                    usuarioToEdit={userToEdit}
                    onClose={() => setIsUserModalOpen(false)} 
                    onSave={handleSaveUsuario}
                    sucursales={sucursales}
                />
            )}
            {isSucursalModalOpen && (
                <SucursalForm
                    sucursalToEdit={sucursalToEdit}
                    onClose={() => setIsSucursalModalOpen(false)}
                    onSave={handleSaveSucursal}
                />
            )}
            </div>
        </div>
    );
}
