"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { usuario,login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (usuario) {
      router.replace("/menu");
    }
  }, [usuario]);

  const PanaderiaIcon = () => (
    <div className="flex justify-center mb-5">
      <div className="bg-blue-50 p-3 rounded-full border border-blue-100 shadow-inner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          className="stroke-[2] stroke-blue-500"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5.628 11.283l5.644 -5.637c2.665 -2.663 5.924 -3.747 8.663 -1.205l.188 .181a2.987 2.987 0 0 1 0 4.228l-11.287 11.274a3 3 0 0 1 -4.089 .135l-.143 -.135c-2.728 -2.724 -1.704 -6.117 1.024 -8.841z" />
          <path d="M9.5 7.5l1.5 3.5" />
          <path d="M6.5 10.5l1.5 3.5" />
          <path d="M12.5 4.5l1.5 3.5" />
        </svg>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (!res.ok) {
      setError(res.error || "Error al iniciar sesión");
    } else {
      router.push("/menu");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 w-full max-w-sm rounded-2xl shadow-soft border border-blue-100">
        <PanaderiaIcon />
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-1">
          Panadería SD
        </h1>
        <h2 className="text-lg text-gray-600 text-center mb-6">
          Iniciar sesión
        </h2>

        {error && (
          <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition text-gray-800 placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition text-gray-800 placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold tracking-wide hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda?{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
