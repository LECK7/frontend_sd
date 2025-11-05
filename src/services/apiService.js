// src/services/apiService.js

const BASE_URL = "http://localhost:4000/api";

const authenticatedFetch = async (endpoint, options = {}, token) => {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
    };

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Manejo de errores sin lanzar excepción visible al usuario
        if (!res.ok) {
            let errorData = {};
            try {
                errorData = await res.json();
            } catch {
                // si la respuesta no es JSON, dejamos vacío
            }

            if (res.status === 401 || res.status === 403) {
                console.warn("⚠️ Acceso denegado o sesión expirada.");
                return { error: "Acceso denegado o sesión expirada" };
            }

            console.error("❌ Error en la solicitud:", errorData.error || res.statusText);
            return { error: errorData.error || `Error: ${res.status}` };
        }

        if (res.status === 204 || res.headers.get('Content-Length') === '0') {
            return {};
        }

        return await res.json();
    } catch (err) {
        console.error("🚨 Error de conexión con el servidor:", err.message);
        return { error: "No se pudo conectar con el servidor" };
    }
};

// --- Funciones API ---
export const getProductos = (token) => authenticatedFetch("/productos", { method: "GET" }, token);

export const createProducto = (productoData, token) =>
    authenticatedFetch("/productos", {
        method: "POST",
        body: JSON.stringify(productoData),
    }, token);

export const updateProducto = (id, productoData, token) =>
    authenticatedFetch(`/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(productoData),
    }, token);

export const updateProductoStock = (id, cantidadAAgregar, token) =>
    authenticatedFetch(`/productos/${id}/stock`, {
        method: "PUT",
        body: JSON.stringify({ cantidadAAgregar }),
    }, token);

export const deleteProducto = (id, token) =>
    authenticatedFetch(`/productos/${id}`, { method: "DELETE" }, token);

export const getUsuarios = (token) =>
    authenticatedFetch("/usuarios", { method: "GET" }, token);

export const createUsuario = (usuarioData, token) =>
    authenticatedFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(usuarioData),
    }, token);

export const deleteUsuario = (id, token) =>
    authenticatedFetch(`/usuarios/${id}`, { method: "DELETE" }, token);

export const getVentas = (token) =>
    authenticatedFetch("/ventas", { method: "GET" }, token);
