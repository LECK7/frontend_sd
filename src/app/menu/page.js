"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FaCashRegister,
  FaTools,
  FaBreadSlice,
  FaMoneyBillWave,
  FaChartLine,
  FaWallet,
  FaWarehouse,
} from "react-icons/fa";

export default function Menu() {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !usuario) router.replace("/login");
  }, [loading, usuario, router]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Verificando acceso...</p>;
  }
  if (!usuario) {
    return <p className="text-center mt-10 text-gray-600">Redirigiendo a inicio de sesión...</p>;
  }

  const menuItemsByRole = {
    ADMIN: [
      {
        label: "Ventas",
        description: "Registrar ventas y clientes",
        path: "/menu/ventas",
        icon: FaCashRegister,
        gradient: "from-blue-500 to-blue-600",
      },
      {
        label: "Productos",
        description: "Catalogo y precios",
        path: "/menu/productos",
        icon: FaBreadSlice,
        gradient: "from-amber-500 to-amber-600",
      },
      {
        label: "Finanzas",
        description: "Registrar ingresos y egresos",
        path: "/menu/finanzas",
        icon: FaMoneyBillWave,
        gradient: "from-emerald-500 to-emerald-600",
      },
      {
        label: "Caja",
        description: "Resumen diario de caja",
        path: "/menu/caja",
        icon: FaWallet,
        gradient: "from-orange-500 to-orange-600",
      },
      {
        label: "Reportes",
        description: "Indicadores y graficos",
        path: "/menu/reportes",
        icon: FaChartLine,
        gradient: "from-indigo-500 to-indigo-600",
      },
      {
        label: "Administracion",
        description: "Usuarios, productos y stock",
        path: "/menu/administracion",
        icon: FaTools,
        gradient: "from-slate-500 to-slate-600",
      },
    ],
    VENDEDOR: [
      {
        label: "Ventas",
        description: "Registrar ventas y clientes",
        path: "/menu/ventas",
        icon: FaCashRegister,
        gradient: "from-blue-500 to-blue-600",
      },
      {
        label: "Productos",
        description: "Catalogo disponible",
        path: "/menu/productos",
        icon: FaBreadSlice,
        gradient: "from-amber-500 to-amber-600",
      },
      {
        label: "Caja",
        description: "Resumen diario de caja",
        path: "/menu/caja",
        icon: FaWallet,
        gradient: "from-orange-500 to-orange-600",
      },
      {
        label: "Reportes",
        description: "Ventas y tendencias",
        path: "/menu/reportes",
        icon: FaChartLine,
        gradient: "from-indigo-500 to-indigo-600",
      },
    ],
    PRODUCCION: [
      {
        label: "Productos",
        description: "Catalogo y stock",
        path: "/menu/productos",
        icon: FaBreadSlice,
        gradient: "from-amber-500 to-amber-600",
      },
      {
        label: "Inventario",
        description: "Actualizar stock de produccion",
        path: "/menu/administracion",
        icon: FaWarehouse,
        gradient: "from-teal-500 to-teal-600",
      },
      {
        label: "Caja",
        description: "Resumen diario de caja",
        path: "/menu/caja",
        icon: FaWallet,
        gradient: "from-orange-500 to-orange-600",
      },
      {
        label: "Reportes",
        description: "Indicadores generales",
        path: "/menu/reportes",
        icon: FaChartLine,
        gradient: "from-indigo-500 to-indigo-600",
      },
    ],
  };

  const rolLabel =
    usuario?.rol === "ADMIN"
      ? "Administracion"
      : usuario?.rol === "PRODUCCION"
      ? "Produccion"
      : "Ventas";

  const menuItems = menuItemsByRole[usuario?.rol] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            ¡Bienvenido, {usuario?.nombre}!
          </h1>
          <p className="text-slate-500 mt-2">
            Rol: <span className="font-semibold text-slate-700">{rolLabel}</span>
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="group text-left bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-white/40 via-white/20 to-transparent" />
                <div className="relative flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{item.label}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
