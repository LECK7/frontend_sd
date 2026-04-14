"use client";

import { useEffect, useState } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { createUsuario, updateUsuario } from "@/services/apiService";

export default function UsuarioForm({ usuarioToEdit, onClose, onSave, sucursales = [] }) {
  const [nombre, setNombre] = useState(usuarioToEdit?.nombre || "");
  const [email, setEmail] = useState(usuarioToEdit?.email || "");
  const [telefono, setTelefono] = useState(usuarioToEdit?.telefono || "");
  const [rol, setRol] = useState(usuarioToEdit?.rol || "VENDEDOR");
  const [sucursalId, setSucursalId] = useState(usuarioToEdit?.sucursalId || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, logout } = useAuth();
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!sucursalId && sucursales.length) {
      setSucursalId(sucursales[0].id);
    }
  }, [sucursales, sucursalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!sucursales.length) {
      setFormError("Primero registra una sucursal para poder crear usuarios.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    if (!usuarioToEdit && !password.trim()) {
      setFormError("La contraseña es requerida para un nuevo usuario.");
      return;
    }

    if (!sucursalId) {
      setFormError("Selecciona una sucursal para el usuario.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = { nombre, email, telefono, rol, sucursalId };

      if (password) {
        dataToSend.password = password;
      }

      const data = usuarioToEdit
        ? await updateUsuario(usuarioToEdit.id, dataToSend, token, logout)
        : await createUsuario(dataToSend, token, logout);

      if (data?.error) throw new Error(data.error || "Error al guardar usuario");

      const savedUser = data?.usuario || data;
      onSave(savedUser);
      onClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 md:p-7 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            {usuarioToEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <FaTimes size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {formError && (
            <div className="text-sm bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl">
              {formError}
            </div>
          )}
          {!sucursales.length && (
            <div className="text-sm bg-amber-50 text-amber-700 border border-amber-200 p-3 rounded-xl">
              No hay sucursales disponibles. Registra una sucursal para continuar.
            </div>
          )}
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            required={!usuarioToEdit}
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            required={!usuarioToEdit}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
          <select
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          >
            <option value="">Selecciona sucursal</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Administrador</option>
            <option value="PRODUCCION">Produccion</option>
          </select>
          <button
            type="submit"
            className="bg-rose-600 text-white py-2.5 rounded-xl mt-3 flex justify-center items-center gap-2 font-semibold shadow-sm hover:bg-rose-700 transition disabled:bg-slate-300"
            disabled={isSubmitting || !sucursales.length}
          >
            {isSubmitting && <FaSpinner className="animate-spin" />}
            {usuarioToEdit ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
