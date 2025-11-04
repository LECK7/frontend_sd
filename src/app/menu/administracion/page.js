"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; 
import { getProductos, deleteProducto } from "@/services/apiService"; 
import ProductForm from "@/components/ProductoForm";

export default function AdministracionPage() {
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null); 
    const router = useRouter();

    const { token, logout } = useAuth(); 

    const loadProductos = async (authToken) => {
        if (!authToken) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await getProductos(authToken); 
            setProductos(data);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError(err.message || "No se pudieron cargar los productos.");

            if (err.message.includes("401") || err.message.includes("403")) { 
                logout();
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadProductos(token);
        } else {
            router.push('/login');
        }
    }, [token]); 

    const handleDelete = async (id) => {
        if (!token) return; 
        
        if (confirm("¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.")) {
            try {
                await deleteProducto(id, token); 
                
                setProductos(productos.filter((prod) => prod.id !== id));
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                alert("Hubo un error al intentar eliminar el producto.");
            }
        }
    };
    
    const handleOpenCreate = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
    };
    
    const handleSave = (savedProduct) => {
        if (productToEdit) {
            setProductos(productos.map(p => 
                p.id === savedProduct.id ? savedProduct : p
            ));
        } else {
            setProductos([...productos, savedProduct]);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-rose-700">Administración de Productos</h1>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105"
                >
                    <FaPlus /> Nuevo Producto
                </button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center py-10 text-rose-700">
                    <FaSpinner className="animate-spin text-3xl mr-2" />
                    <span className="text-xl">Cargando productos...</span>
                </div>
            ) : error ? (
                <div className="text-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Error de Carga</p>
                    <p>{error}</p>
                </div>
            ) : productos.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p className="text-lg">No hay productos registrados en el inventario.</p>
                </div>
            ) : (
                <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                    <thead className="bg-amber-200 text-rose-800">
                        <tr>
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Nombre</th>
                            <th className="py-3 px-4 text-left">Precio</th>
                            <th className="py-3 px-4 text-left">Stock</th>
                            <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((prod) => (
                            <tr key={prod.id} className="border-b hover:bg-amber-50">
                                <td className="py-3 px-4 font-semibold text-gray-600">{prod.id}</td>
                                <td className="py-3 px-4 text-black">{prod.nombre}</td>
                                <td className="py-3 px-4 text-black font-mono">S/ {parseFloat(prod.precio).toFixed(2)}</td>
                                <td className="py-3 px-4 text-black font-semibold">{prod.stock}</td>
                                <td className="py-3 px-4 flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenEdit(prod)}
                                        className="text-blue-500 hover:text-blue-700 transition transform hover:scale-110"
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(prod.id)}
                                        className="text-red-500 hover:text-red-700 transition transform hover:scale-110"
                                        title="Eliminar"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {isModalOpen && (
                <ProductForm
                    productToEdit={productToEdit}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}