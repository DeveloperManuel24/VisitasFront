// src/api/roles/apiRoles.ts

import axiosUsuarios from "../../axios/axiosUsuarios"

// Helper para extraer la data del backend Nest
const safeData = (response: any) => {
  const data = response?.data?.data ?? response?.data
  if (data === undefined) {
    console.warn('⚠️ Respuesta inesperada en roles:', response)
  }
  return data
}

/* ============================
   ROLES API (usa /roles del back)
   ============================ */

// GET /roles?q=algo
export const listarRoles = async (q?: string) => {
  try {
    const resp = await axiosUsuarios.get('/roles', {
      params: q ? { q } : undefined,
    })
    return safeData(resp) || []
  } catch (err) {
    console.error('❌ Error al listar roles:', err)
    return []
  }
}

// GET /roles/:id
export const obtenerRol = async (id: string) => {
  try {
    const resp = await axiosUsuarios.get(`/roles/${id}`)
    return safeData(resp)
  } catch (err) {
    console.error('❌ Error al obtener rol:', err)
    throw err
  }
}

// POST /roles
export const crearRol = async (payload: {
  nombre: string
  descripcion?: string
}) => {
  try {
    const resp = await axiosUsuarios.post('/roles', payload)
    return safeData(resp)
  } catch (err) {
    console.error('❌ Error al crear rol:', err)
    throw err
  }
}

// PATCH /roles/:id
export const actualizarRol = async (
  id: string,
  payload: { nombre?: string; descripcion?: string },
) => {
  try {
    const resp = await axiosUsuarios.patch(`/roles/${id}`, payload)
    return safeData(resp)
  } catch (err) {
    console.error('❌ Error al actualizar rol:', err)
    throw err
  }
}

// DELETE /roles/:id
export const eliminarRol = async (id: string) => {
  try {
    const resp = await axiosUsuarios.delete(`/roles/${id}`)
    return safeData(resp)
  } catch (err) {
    console.error('❌ Error al eliminar rol:', err)
    throw err
  }
}
