// src/api/visitas/apiVisitas.ts
import axiosClientes from "../../axios/axiosClientes";

// 🔧 Auxiliar para extraer la data útil del backend
const safeData = (response: any) => {
  const data = response?.data?.data ?? response?.data;
  if (data === undefined) {
    console.warn("⚠️ Respuesta inesperada:", response);
  }
  return data;
};

/* ======================================================
   📋 VISITAS API — consumo del controlador NestJS
   ====================================================== */

// 🆕 Crear una nueva visita
export const crearVisita = async (payload: any) => {
  try {
    const response = await axiosClientes.post("/visitas", payload);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al crear la visita:", error);
    throw error;
  }
};

// 🔍 Obtener todas las visitas (opcionalmente filtradas)
export const listarVisitas = async (query?: Record<string, any>) => {
  try {
    const response = await axiosClientes.get("/visitas", { params: query });
    return safeData(response) || [];
  } catch (error) {
    console.error("❌ Error al listar visitas:", error);
    return [];
  }
};

// 🔎 Obtener una visita específica por ID
export const obtenerVisitaPorId = async (id: string) => {
  try {
    const response = await axiosClientes.get(`/visitas/${id}`);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al obtener visita:", error);
    return null;
  }
};

// ✏️ Actualizar una visita existente
export const actualizarVisita = async (id: string, payload: any) => {
  try {
    const response = await axiosClientes.patch(`/visitas/${id}`, pay
