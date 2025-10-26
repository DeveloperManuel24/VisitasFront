// src/api/usuarios/apiUsuarios.ts
import axiosUsuarios from "../../axios/axiosUsuarios";

// Helper para extraer la data útil del backend
const safeData = (response: any) => {
  const data = response?.data?.data ?? response?.data;
  if (data === undefined) {
    console.warn("⚠️ Respuesta inesperada:", response);
  }
  return data;
};

/* ======================================================
   👤 USUARIOS API — consumo del controlador NestJS
   ====================================================== */

// 🆕 Crear nuevo usuario
export const crearUsuario = async (payload: any) => {
  try {
    const response = await axiosUsuarios.post("/usuarios", payload);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    throw error;
  }
};

// 📋 Listar usuarios (con filtros/paginación opcional)
export const listarUsuarios = async (query?: Record<string, any>) => {
  try {
    const response = await axiosUsuarios.get("/usuarios", { params: query });

    const raw = response?.data;
    // Caso normal del backend:
    // {
    //   data: [...usuarios...],
    //   meta: { total, page, limit, pages }
    // }
    if (raw && Array.isArray(raw.data) && raw.meta) {
      return {
        data: raw.data,
        meta: raw.meta,
      };
    }

    // Fallback por si algún día cambia la forma
    const soloData = safeData(response) || [];
    return {
      data: Array.isArray(soloData) ? soloData : [],
      meta: null,
    };
  } catch (error) {
    console.error("❌ Error al listar usuarios:", error);
    return {
      data: [],
      meta: null,
    };
  }
};

// 🔍 Obtener usuario por ID
export const obtenerUsuarioPorId = async (id: string) => {
  try {
    const response = await axiosUsuarios.get(`/usuarios/${id}`);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    return null;
  }
};

// ✏️ Actualizar usuario (parcial)
// Puede incluir nombre, email, activo, supervisorId,
// roles, hash (password), fotoBase64, etc.
export const actualizarUsuario = async (id: string, payload: any) => {
  try {
    const response = await axiosUsuarios.patch(`/usuarios/${id}`, payload);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    throw error;
  }
};

// 📸 Actualizar SOLO la foto de perfil
export const actualizarFotoUsuario = async (id: string, fotoBase64: string) => {
  try {
    const response = await axiosUsuarios.post(`/usuarios/${id}/foto`, {
      fotoBase64,
    });
    return safeData(response); // { ok: true, id }
  } catch (error) {
    console.error("❌ Error al actualizar foto del usuario:", error);
    throw error;
  }
};

// 🗑 Eliminar (soft-delete) usuario
export const eliminarUsuario = async (id: string) => {
  try {
    const response = await axiosUsuarios.delete(`/usuarios/${id}`);
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    throw error;
  }
};

// 🧩 Reemplazar roles de un usuario existente
export const asignarRolesAUsuario = async (id: string, roles: string[]) => {
  try {
    const response = await axiosUsuarios.post(`/usuarios/${id}/roles`, {
      roles,
    });
    return safeData(response);
  } catch (error) {
    console.error("❌ Error al asignar roles al usuario:", error);
    throw error;
  }
};

