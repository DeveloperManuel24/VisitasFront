import axiosClientes from "../../axios/axiosClientes";

// src/api/clientes/apiClientes.ts

// 🧩 Función auxiliar para extraer la data útil
const safeData = (response: any) => {
  const data = response?.data?.data ?? response?.data;
  if (data === undefined) {
    console.warn("⚠️ Respuesta inesperada:", response);
  }
  return data;
};

/* ======================================================
   🧾 CLIENTES API — consumo del controlador NestJS
   ====================================================== */

// 📌 Crear nuevo cliente
export const crearCliente = async (payload: any) => {
  try {
    const response = await axiosClientes.post("/clientes", payload);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al crear cliente:", error);
    throw error;
  }
};

// 🔍 Buscar clientes (con querystring opcional)
export const buscarClientes = async (query?: string) => {
  try {
    const response = await axiosClientes.get("/clientes", {
      params: { query },
    });
    return safeData(response) || [];
  } catch (error) {
    console.error("❌ Error al buscar clientes:", error);
    return [];
  }
};

// 📋 Obtener detalle de cliente por ID
export const obtenerClientePorId = async (id: string) => {
  try {
    const response = await axiosClientes.get(`/clientes/${id}`);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al obtener cliente:", error);
    return null;
  }
};

// ✏️ Actualizar cliente existente
export const actualizarCliente = async (id: string, payload: any) => {
  try {
    const response = await axiosClientes.patch(`/clientes/${id}`, payload);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    throw error;
  }
};

// 🗑 Eliminar cliente
export const eliminarCliente = async (id: string) => {
  try {
    const response = await axiosClientes.delete(`/clientes/${id}`);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al eliminar cliente:", error);
    throw error;
  }
};
