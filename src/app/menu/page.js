"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaCashRegister, FaTools, FaBreadSlice } from "react-icons/fa";

export default function Menu() {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) {
      router.replace("/login"); 
    }
  }, [usuario]);

  if (!usuario) {
    return <p className="text-center mt-10">Verificando acceso...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-rose-800 tracking-tight">
          ¡Bienvenido, {usuario?.nombre}!
        </h1>

        <div className="grid gap-4">
          <button
            onClick={() => router.push("/menu/ventas")}
            className="flex items-center justify-center gap-3 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md transition transform hover:scale-105"
          >
            <FaCashRegister className="text-xl" />
            Ventas
          </button>

          <button
            onClick={() => router.push("/menu/administracion")}
            className="flex items-center justify-center gap-3 py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-md transition transform hover:scale-105"
          >
            <FaTools className="text-xl" />
            Administración
          </button>

          <button
            onClick={() => router.push("/menu/productos")}
            className="flex items-center justify-center gap-3 py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-md transition transform hover:scale-105"
          >
            <FaBreadSlice className="text-xl" />
            Productos
          </button>
        </div>
      </div>
    </div>
  );
}
