"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const PanaderiaIcon = () => (
  <div className="flex justify-center mb-4">
    <div className="bg-amber-100 p-3 rounded-full border border-amber-300 shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        className="stroke-[2] stroke-rose-700"
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
    <div className="h-screen flex items-center justify-center bg-amber-50 p-4 font-sans">
      <div className="bg-white p-8 md:p-10 w-full max-w-sm rounded-2xl shadow-2xl shadow-amber-300/50 transform transition duration-500 hover:scale-[1.02] border border-amber-200">
        <PanaderiaIcon />
        <h1 className="text-4xl font-extrabold text-rose-800 tracking-tight text-center mb-2">
          Panadería App
        </h1>
        <h2 className="text-xl font-medium text-gray-700 text-center mb-6">
          Iniciar Sesión
        </h2>
        {error && (
          <p className="bg-red-100 text-red-700 border border-red-300 p-3 rounded-lg mb-4 text-sm text-center animate-pulse">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-amber-300 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition duration-300 text-gray-800 placeholder-gray-500 shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-amber-300 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition duration-300 text-gray-800 placeholder-gray-500 shadow-sm"
            required
          />
          <button
            type="submit"
            className="w-full bg-rose-600 text-white rounded-xl py-3 font-bold uppercase tracking-wider hover:bg-rose-700 transition duration-300 transform shadow-lg shadow-rose-500/50 hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda?{" "}
          <a href="#" className="text-rose-600 hover:text-rose-800 font-medium transition">
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
