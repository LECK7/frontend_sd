"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaBreadSlice,
  FaSignOutAlt,
  FaStore,
  FaBoxOpen,
  FaCashRegister,
  FaUser,
} from "react-icons/fa";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  if (!usuario) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-blue-100 text-gray-800 shadow-sm px-8 py-3 flex justify-between items-center z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-lg text-blue-700">
        <FaBreadSlice className="text-blue-500 text-2xl" />
        <span>Sabor del Cielo</span>
      </div>

      {/* Links */}
      <div className="flex gap-6 font-medium">
        <Link
          href="/menu"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <FaStore className="text-gray-500" /> Inicio
        </Link>
        <Link
          href="/menu/productos"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <FaBoxOpen className="text-gray-500" /> Productos
        </Link>
        <Link
          href="/menu/ventas"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <FaCashRegister className="text-gray-500" /> Ventas
        </Link>
        <Link
          href="/menu/administracion"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <FaUser className="text-gray-500" /> Administración
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
      >
        <FaSignOutAlt /> Salir
      </button>
    </nav>
  );
}
