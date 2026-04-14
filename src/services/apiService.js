const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const BASE_URL = `${API_BASE}/api`;

export const authenticatedFetch = async (endpoint, options = {}, token, onUnauthorized) => {

  if (!token) {
    onUnauthorized?.();
    return { error: "Sesión no válida" };
  }

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
      onUnauthorized?.();
      return { error: "Acceso denegado o sesión expirada" };
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || "Error de servidor" };
    }

    if (res.status === 204) return {};
    return await res.json();

  } catch {
    return { error: "No se pudo conectar con el servidor" };
  }
};

export const getUsuarios = (token, onUnauthorized) =>
  authenticatedFetch("/usuarios", { method: "GET" }, token, onUnauthorized);

export const getProductos = (token, onUnauthorized) =>
  authenticatedFetch("/productos", { method: "GET" }, token, onUnauthorized);

export const getClientes = (token, onUnauthorized) =>
  authenticatedFetch("/clientes", { method: "GET" }, token, onUnauthorized);

export const createCliente = (data, token, onUnauthorized) =>
  authenticatedFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(data)
  }, token, onUnauthorized);

export const createVenta = (data, token, onUnauthorized) =>
  authenticatedFetch("/ventas/crear", {
    method: "POST",
    body: JSON.stringify(data)
  }, token, onUnauthorized);

export const createProducto = (data, token, onUnauthorized) =>
  authenticatedFetch("/productos", {
    method: "POST",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const updateProducto = (id, data, token, onUnauthorized) =>
  authenticatedFetch(`/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const deleteProducto = (id, token, onUnauthorized) =>
  authenticatedFetch(`/productos/${id}`, { method: "DELETE" }, token, onUnauthorized);

export const updateProductoStock = (id, cantidadAAgregar, token, onUnauthorized) =>
  authenticatedFetch(`/productos/${id}/stock`, {
    method: "PUT",
    body: JSON.stringify({ cantidadAAgregar }),
  }, token, onUnauthorized);

export const createUsuario = (data, token, onUnauthorized) =>
  authenticatedFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const updateUsuario = (id, data, token, onUnauthorized) =>
  authenticatedFetch(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const deleteUsuario = (id, token, onUnauthorized) =>
  authenticatedFetch(`/usuarios/${id}`, { method: "DELETE" }, token, onUnauthorized);

export const registrarMovimiento = (data, token, onUnauthorized) =>
  authenticatedFetch("/finanzas/registrar", {
    method: "POST",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const getSucursales = (token, onUnauthorized) =>
  authenticatedFetch("/sucursales", { method: "GET" }, token, onUnauthorized);

export const createSucursal = (data, token, onUnauthorized) =>
  authenticatedFetch("/sucursales", {
    method: "POST",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const updateSucursal = (id, data, token, onUnauthorized) =>
  authenticatedFetch(`/sucursales/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token, onUnauthorized);

export const deleteSucursal = (id, token, onUnauthorized) =>
  authenticatedFetch(`/sucursales/${id}`, { method: "DELETE" }, token, onUnauthorized);
