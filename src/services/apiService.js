// src/services/apiService.js

const BASE_URL = "http://localhost:4000/api";

const authenticatedFetch = async (endpoint, options = {}, token) => {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
    }

    if (res.status === 204 || res.headers.get('Content-Length') === '0') {
        return {};
    }

    return res.json();
};

export const getProductos = (token) => {
    return authenticatedFetch("/productos", { method: "GET" }, token);
};

export const createProducto = (productoData, token) => {
    return authenticatedFetch("/productos", { 
        method: "POST", 
        body: JSON.stringify(productoData) 
    }, token);
};

export const updateProducto = (id, productoData, token) => {
    return authenticatedFetch(`/productos/${id}`, { 
        method: "PUT", // O PATCH
        body: JSON.stringify(productoData) 
    }, token);
};

export const deleteProducto = (id, token) => {
    return authenticatedFetch(`/productos/${id}`, { method: "DELETE" }, token);
};

// --- Otras funciones ---

export const getVentas = (token) => {
    return authenticatedFetch("/ventas", { method: "GET" }, token);
};