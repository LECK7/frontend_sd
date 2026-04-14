"use client";

import { useEffect, useState } from "react";
import { FaSave, FaTimes, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { createSucursal, updateSucursal } from "@/services/apiService";

export default function SucursalForm({ sucursalToEdit, onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [activo, setActivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { token, logout } = useAuth();

  useEffect(() => {
    if (sucursalToEdit) {
      setNombre(sucursalToEdit.nombre || "");
      setDireccion(sucursalToEdit.direccion || "");
      setTelefono(sucursalToEdit.telefono || "");
      setActivo(sucursalToEdit.activo ?? true);
    } else {
      setNombre("");
      setDireccion("");
      setTelefono("");
      setActivo(true);
    }
  }, [sucursalToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setFormError("El nombre de la sucursal es obligatorio.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        nombre: nombre.trim(),
        direccion: direccion || null,
        telefono: telefono || null,
        activo,
      };

      const result = sucursalToEdit
        ? await updateSucursal(sucursalToEdit.id, payload, token, logout)
        : await createSucursal(payload, token, logout);

      if (result?.error) throw new Error(result.error);

      onSave(result);
      onClose();
    } catch (err) {
      setFormError(err.message || "Error al guardar la sucursal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {sucursalToEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="text-sm bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-600">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Sucursal principal"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Av. Siempre Viva 123"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="999 999 999"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 text-rose-600 border-slate-300 rounded"
            />
            Sucursal activa
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-xl font-semibold shadow-sm transition disabled:bg-slate-300"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <FaSave /> {sucursalToEdit ? "Guardar cambios" : "Crear sucursal"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
