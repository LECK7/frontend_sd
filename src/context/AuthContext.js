"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // 🔹 Cargar token y usuario guardados al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");
    if (storedToken) setToken(storedToken);
    if (storedUser) setUsuario(JSON.parse(storedUser));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.ok) {
        setToken(data.token);
        setUsuario(data.usuario);

        // Guardar en localStorage para mantener sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        return { ok: true };
      } else {
        return { ok: false, error: data.error || "Credenciales inválidas" };
      }
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
