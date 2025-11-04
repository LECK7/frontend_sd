"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { FaBreadSlice, FaSignOutAlt, FaStore, FaBoxOpen, FaCashRegister, FaUser } from "react-icons/fa";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  if (!usuario) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg px-6 py-4 flex justify-between items-center z-50">
      <div className="flex items-center gap-2 font-bold text-xl tracking-wide">
        <FaBreadSlice className="text-2xl" />
        <span>Sabor del Cielo</span>
      </div>

      <div className="flex gap-6 font-medium">
        <Link href="/menu" className="flex items-center gap-2 hover:scale-105 transition">
          <FaStore /> Inicio
        </Link>
        <Link href="/menu/productos" className="flex items-center gap-2 hover:scale-105 transition">
          <FaBoxOpen /> Productos
        </Link>
        <Link href="/menu/ventas" className="flex items-center gap-2 hover:scale-105 transition">
          <FaCashRegister /> Ventas
        </Link>
        <Link href="/menu/administracion" className="flex items-center gap-2 hover:scale-105 transition">
          <FaUser /> Administración
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-white text-rose-600 px-4 py-2 rounded-lg shadow hover:bg-rose-100 hover:scale-105 transition"
      >
        <FaSignOutAlt /> Salir
      </button>
    </nav>
  );
}
