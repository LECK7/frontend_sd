"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
    return <p className="text-center mt-10 text-gray-600">Verificando acceso...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-10 w-full max-w-md text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
          ¡Bienvenido, {usuario?.nombre}!
        </h1>

        <div className="grid gap-4">
          <button
            onClick={() => router.push("/menu/ventas")}
            className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <FaCashRegister className="text-xl" />
            Ventas
          </button>

          <button
            onClick={() => router.push("/menu/administracion")}
            className="flex items-center justify-center gap-3 py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <FaTools className="text-xl" />
            Administración
          </button>

          <button
            onClick={() => router.push("/menu/productos")}
            className="flex items-center justify-center gap-3 py-3 px-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <FaBreadSlice className="text-xl" />
            Productos
          </button>
        </div>
      </div>
    </div>
  );
}
