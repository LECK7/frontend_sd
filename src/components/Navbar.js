"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBreadSlice,
  FaSignOutAlt,
  FaStore,
  FaBoxOpen,
  FaCashRegister,
  FaWallet,
  FaChartLine,
  FaMoneyBillWave,
  FaTools,
  FaWarehouse,
} from "react-icons/fa";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!usuario) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItemsByRole = {
    ADMIN: [
      { href: "/menu", label: "Inicio", icon: FaStore },
      { href: "/menu/ventas", label: "Ventas", icon: FaCashRegister },
      { href: "/menu/productos", label: "Productos", icon: FaBoxOpen },
      { href: "/menu/finanzas", label: "Finanzas", icon: FaMoneyBillWave },
      { href: "/menu/caja", label: "Caja", icon: FaWallet },
      { href: "/menu/reportes", label: "Reportes", icon: FaChartLine },
      { href: "/menu/administracion", label: "Administracion", icon: FaTools },
    ],
    VENDEDOR: [
      { href: "/menu", label: "Inicio", icon: FaStore },
      { href: "/menu/ventas", label: "Ventas", icon: FaCashRegister },
      { href: "/menu/productos", label: "Productos", icon: FaBoxOpen },
      { href: "/menu/caja", label: "Caja", icon: FaWallet },
      { href: "/menu/reportes", label: "Reportes", icon: FaChartLine },
    ],
    PRODUCCION: [
      { href: "/menu", label: "Inicio", icon: FaStore },
      { href: "/menu/productos", label: "Productos", icon: FaBoxOpen },
      { href: "/menu/administracion", label: "Inventario", icon: FaWarehouse },
      { href: "/menu/caja", label: "Caja", icon: FaWallet },
      { href: "/menu/reportes", label: "Reportes", icon: FaChartLine },
    ],
  };

  const navItems = navItemsByRole[usuario?.rol] || [];
  const isActive = (href) =>
    href === "/menu" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/85 backdrop-blur-lg border-b border-slate-200 text-slate-800 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 font-semibold text-lg text-blue-700 shrink-0">
          <FaBreadSlice className="text-blue-500 text-2xl" />
          <span className="hidden sm:inline">Panadería SD</span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={active ? "text-white" : "text-slate-500"} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              {usuario?.nombre || usuario?.email}
            </p>
            <p className="text-xs text-slate-500">{usuario?.rol}</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3.5 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <FaSignOutAlt /> Salir
          </button>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          <FaSignOutAlt />
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Cerrar sesión</h3>
              <p className="text-sm text-slate-500 mt-1">¿Quieres salir de la aplicación?</p>
            </div>
            <div className="px-6 py-5 flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
