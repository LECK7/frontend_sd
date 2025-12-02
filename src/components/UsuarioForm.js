"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function UsuarioForm({ usuarioToEdit, onClose, onSave }) {
  const [nombre, setNombre] = useState(usuarioToEdit?.nombre || "");
  const [email, setEmail] = useState(usuarioToEdit?.email || "");
  const [telefono, setTelefono] = useState(usuarioToEdit?.telefono || "");
  const [rol, setRol] = useState(usuarioToEdit?.rol || "VENDEDOR");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    if (!usuarioToEdit && !password.trim()) {
        alert("La contraseña es requerida para un nuevo usuario.");
        return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = usuarioToEdit
        ? `http://localhost:4000/api/usuarios/${usuarioToEdit.id}`
        : "http://localhost:4000/api/usuarios";

      const method = usuarioToEdit ? "PUT" : "POST";

        const dataToSend = { nombre, email, telefono, rol };

        if (password) {
            dataToSend.password = password; 
        }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar usuario");

      onSave(data);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {usuarioToEdit ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded"
            required={!usuarioToEdit}
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border px-3 py-2 rounded"
            required={!usuarioToEdit}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Administrador</option>
            <option value="PRODUCCION">Produccion</option>
          </select>
          <button
            type="submit"
            className="bg-rose-600 text-white py-2 rounded mt-3 flex justify-center items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <FaSpinner className="animate-spin" />}
            {usuarioToEdit ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
