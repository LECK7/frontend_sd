"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaUsers, FaBox, FaWarehouse, FaSave, FaTimes } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; 
import { 
    getProductos, 
    deleteProducto, 
    getUsuarios, 
    deleteUsuario,
    updateProductoStock
} from "@/services/apiService"; 
import ProductForm from "@/components/ProductoForm";
import UserForm from "@/components/UsuarioForm";

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
            <h1 className="text-2xl font-bold text-rose-700 mb-6">Agregar Stock a Inventario</h1>
            <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-green-200 text-green-800">
                    <tr>
                        <th className="py-3 px-4 text-left">Nombre</th>
                        <th className="py-3 px-4 text-left">Descripción</th>
                        <th className="py-3 px-4 text-left">Stock Actual</th>
                        <th className="py-3 px-4 text-center">Cantidad a Agregar</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((prod) => (
                        <tr key={prod.id} className="border-b hover:bg-green-50">
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
                                            className="w-20 border rounded text-center p-1"
                                            min="1"
                                            step="1"
                                        />
                                        <button 
                                            onClick={() => handleSave(prod.id)}
                                            className="text-green-600 hover:text-green-800"
                                            disabled={parseInt(cantidadAAgregar) <= 0 || !Number.isInteger(parseInt(cantidadAAgregar))}
                                        >
                                            <FaSave />
                                        </button>
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTimes />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => startEdit(prod)}
                                        className="text-amber-500 hover:text-amber-700 font-medium"
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [vistaActual, setVistaActual] = useState('productos'); 
    const router = useRouter();
    const { usuario, token } = useAuth();
    const rolesPermitidos = ["ADMIN", "PRODUCCION"];

    const loadData = async (authToken) => {
        if (!authToken) return;
        setIsLoading(true);
        setError(null);
        try {
        if (vistaActual === 'productos' || vistaActual === 'stock') {
            const data = await getProductos(authToken);

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
            const data = await getUsuarios(authToken);
            console.log("Token usado para getUsuarios:", authToken);
            console.log("Usuario actual:", usuario);
            console.log("Respuesta getUsuarios:", data);
            

            if (Array.isArray(data)) {
                setUsuarios(data);
            } else {
                console.warn("Respuesta inesperada o sin permisos:", data);
                setUsuarios([]);
                if (data?.error?.toLowerCase().includes("permiso") || data?.error?.toLowerCase().includes("denegado")) {
                    setError("🚫 Acceso denegado: no tienes permisos para ver la gestión de usuarios.");
                } else {
                    setError("⚠️ No se pudieron obtener los usuarios correctamente.");
                }
            }
        }
        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError(err.message || "No se pudieron cargar los datos.");
            if (err.message.includes("401") || err.message.includes("403")) {
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
                await deleteProducto(id, token);
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
                await deleteUsuario(id, token);
                setUsuarios(usuarios.filter((u) => u.id !== id));
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                alert("Error al eliminar el usuario.");
            }
        }
    };

    // ======== STOCK (Nueva funcionalidad) ========
    const handleUpdateStock = async (id, newStock) => {
        if (!token) return;
        
        try {
            // Llama al apiService.js para actualizar solo el stock
            const updatedProduct = await updateProductoStock(id, newStock, token); 
            
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
        <div className="pt-10 p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-center gap-4 mb-8">
                {/* Productos */}
                <button
                    onClick={() => setVistaActual('productos')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition ${
                        vistaActual === 'productos' ? "bg-rose-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    <FaBox /> Productos
                </button>
                {/* Usuarios */}
                <button
                    onClick={() => setVistaActual('usuarios')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition ${
                        vistaActual === 'usuarios' ? "bg-rose-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    <FaUsers /> Usuarios
                </button>
                {/* Stock */}
                 <button
                    onClick={() => setVistaActual('stock')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition ${
                        vistaActual === 'stock' ? "bg-rose-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    <FaWarehouse /> Gestionar Stock
                </button>
            </div>

            {/* ======= Contenido ======= */}
            {isLoading ? (
                <div className="flex justify-center items-center py-10 text-rose-700">
                    <FaSpinner className="animate-spin text-3xl mr-2" />
                    <span className="text-xl">Cargando...</span>
                </div>
            ) : error ? (
                <div className="text-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Error de Carga</p>
                    <p>{error}</p>
                </div>
            ) : vistaActual === 'productos' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-rose-700">Administración de Productos</h1>
                        <button
                            onClick={handleOpenCreateProducto}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105"
                        >
                            <FaPlus /> Nuevo Producto
                        </button>
                    </div>
                    {productos.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No hay productos registrados.</p>
                        </div>
                    ) : (
                        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-amber-200 text-rose-800">
                                <tr>
                                    <th className="py-3 px-4 text-left">Nombre</th>
                                    <th className="py-3 px-4 text-left">Descripción</th>
                                    <th className="py-3 px-4 text-left">Precio</th>
                                    <th className="py-3 px-4 text-left">Stock</th>
                                    <th className="py-3 px-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((prod) => (
                                    <tr key={prod.id} className="border-b hover:bg-amber-50">
                                        <td className="py-3 px-4">{prod.nombre}</td>
                                        <td className="py-3 px-4">{prod.descripcion}</td>
                                        <td className="py-3 px-4">S/ {parseFloat(prod.precio).toFixed(2)}</td>
                                        <td className="py-3 px-4">{prod.stock}</td>
                                        <td className="py-3 px-4 flex justify-center gap-3">
                                            <button onClick={() => handleOpenEditProducto(prod)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                            <button onClick={() => handleDeleteProducto(prod.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : vistaActual === 'usuarios' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-rose-700">Administración de Usuarios</h1>
                        <button
                            onClick={handleOpenCreateUsuario}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105"
                        >
                            <FaPlus /> Nuevo Usuario
                        </button>
                    </div>
                    {usuarios.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No hay usuarios registrados.</p>
                        </div>
                    ) : (
                        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-blue-200 text-blue-800">
                                <tr>
                                    <th className="py-3 px-4 text-left">Nombre</th>
                                    <th className="py-3 px-4 text-left">Email</th>
                                    <th className="py-3 px-4 text-left">Rol</th>
                                    <th className="py-3 px-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.id || `${u.email}-${Math.random()}`} className="border-b hover:bg-blue-50">
                                        <td className="py-3 px-4">{u.nombre}</td>
                                        <td className="py-3 px-4">{u.email}</td>
                                        <td className="py-3 px-4">{u.rol || "Usuario"}</td>
                                        <td className="py-3 px-4 flex justify-center gap-3">
                                            <button onClick={() => handleOpenEditUsuario(u)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                            <button onClick={() => handleDeleteUsuario(u.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : vistaActual === 'stock' ? (
                // Nueva Vista de Stock
                <StockTable productos={productos} handleUpdateStock={handleUpdateStock} />
            ) : null}
            
            {/* Modales */}
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
                />
            )}
        </div>
    );
}