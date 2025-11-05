"use client";
import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext'; 
import { createProducto, updateProducto } from '@/services/apiService'; 

export default function ProductForm({ productToEdit, onClose, onSave }) {
    const initialProductState = {
        nombre: '',
        codigo: '', 
        descripcion: '', 
        precio: '',
        stock: '',
        activo: true, 
    };
    const [formData, setFormData] = useState(initialProductState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                nombre: productToEdit.nombre,
                codigo: productToEdit.codigo || '', 
                descripcion: productToEdit.descripcion || '',
                activo: productToEdit.activo ?? true, 
                precio: String(productToEdit.precio), 
                stock: String(productToEdit.stock),
            });
        } else {
            setFormData(initialProductState);
        }
    }, [productToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Manejo especial para checkbox
        if (e.target.type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        const dataToSend = {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
        };
        
        if (!dataToSend.codigo) delete dataToSend.codigo;

        try {
            let result;
            if (productToEdit) {
                result = await updateProducto(productToEdit.id, dataToSend, token);
            } else {
                result = await createProducto(dataToSend, token);
            }
            
            onSave(result); 
            onClose();      
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
                    
                    {/* CAMPO CÓDIGO AÑADIDO */}
                    <div className="mb-4">
                        <label htmlFor="codigo" className="block text-gray-700 font-semibold mb-1">Código (Opcional)</label>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:border-rose-500"
                        />
                    </div>
                    {/* ----------------------- */}

                    {/* CAMPO DESCRIPCIÓN AÑADIDO */}
                    <div className="mb-4">
                        <label htmlFor="descripcion" className="block text-gray-700 font-semibold mb-1">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded focus:border-rose-500"
                        ></textarea>
                    </div>
                    {/* ------------------------- */}
                    
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

                    {/* Checkbox de Activo */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="activo"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                        />
                        <label htmlFor="activo" className="text-gray-700 font-semibold">Producto Activo</label>
                    </div>
                    {/* -------------------- */}

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