// src/components/ProductForm.js

"use client";
import { useState, useEffect } from 'react';
import { FaSave, FaTimes,FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext'; 
import { createProducto, updateProducto } from '@/services/apiService'; 

export default function ProductForm({ productToEdit, onClose, onSave }) {
    // Inicializa el estado del formulario con el producto a editar o con valores vacíos para un nuevo producto
    const initialProductState = {
        nombre: '',
        precio: '',
        stock: '',
    };
    const [formData, setFormData] = useState(initialProductState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const { token } = useAuth();

    // Rellena el formulario si estamos en modo edición
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                nombre: productToEdit.nombre,
                // Aseguramos que el precio sea string para el campo de formulario
                precio: String(productToEdit.precio), 
                stock: String(productToEdit.stock),
            });
        } else {
            setFormData(initialProductState);
        }
    }, [productToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        // Convertir precio y stock a números antes de enviar a la API
        const dataToSend = {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
        };

        try {
            let result;
            if (productToEdit) {
                // Modo Edición (Update)
                result = await updateProducto(productToEdit.id, dataToSend, token);
            } else {
                // Modo Creación (Create)
                result = await createProducto(dataToSend, token);
            }
            
            onSave(result); // Notifica al componente padre que se guardó
            onClose();      // Cierra el modal/formulario
        } catch (error) {
            console.error("Error al guardar producto:", error);
            setFormError(error.message || "Error al guardar. Verifica los datos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-rose-700">
                        {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {formError && (
                        <div className="mb-4 text-red-700 bg-red-100 p-3 rounded">{formError}</div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="nombre" className="block text-gray-700 font-semibold mb-1">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:border-rose-500"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="precio" className="block text-gray-700 font-semibold mb-1">Precio (S/)</label>
                        <input
                            type="number"
                            id="precio"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            step="0.01"
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:border-rose-500"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="stock" className="block text-gray-700 font-semibold mb-1">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:border-rose-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg shadow-md transition disabled:bg-gray-400"
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <FaSave /> {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}