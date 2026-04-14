"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const isTokenExpired = (jwtToken) => {
  try {
    const decoded = jwtDecode(jwtToken);
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true); 

  const clearSession = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }, []);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("usuario");

      if (storedToken && !isTokenExpired(storedToken)) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUsuario(JSON.parse(storedUser));
          } catch {
            clearSession();
          }
        }
      } else if (storedToken || storedUser) {
        clearSession();
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession, router]);

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

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        return { ok: true };
      }

      return { ok: false, error: data.error || "Credenciales inválidas" };

    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ token, usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
