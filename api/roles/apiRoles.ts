'use client'

import axios from 'axios'
import { getAuthToken } from '../Auth/apiAuth' // <-- ajusta ruta real si está en otro lado
// si apiAuth está en ../../api/Auth/apiAuth entonces cámbialo a "../../Auth/apiAuth"

// ============================
// instancia axios para el microservicio de USUARIOS/ROLES
// este es el backend Nest que expone /roles
// ============================
const axiosUsuarios = axios.create({
  baseURL: 'http://localhost:3000', // <-- asegúrate que acá vive /roles en tu Nest
})

// inyectar Bearer token en cada request
axiosUsuarios.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// helper genérico para leer backend
function safeData(resp: any) {
  // soporta:
  // - { data: [...] }
  // - { data: { ... } }
  // - [ ... ]
  // - { ... }
  if (resp?.data?.data !== undefined) return resp.data.data
  if (resp?.data !== undefined) return resp.data
  return resp
}

/* ============================
   ROLES API
   ============================ */

// GET /roles?q=algo
export async function listarRoles(q?: string) {
  try {
    const resp = await axiosUsuarios.get('/roles', {
      params: q ? { q } : undefined,
    })
    const data = safeData(resp)
    return Array.isArray(data) ? data : []
  } catch (err: any) {
    console.error('❌ Error al listar roles:', err?.response || err)

    // si es 401 / 403 devolvemos flag especial para que el front sepa
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      return {
        __authError: true,
        status,
        message: 'No autorizado para listar roles',
      }
    }

    return []
  }
}

// GET /roles/:id
export async function obtenerRol(id: string) {
  try {
    const resp = await axiosUsuarios.get(`/roles/${id}`)
    return safeData(resp)
  } catch (err) {
    console.error('❌ Error al obtener rol:', err)
    throw err
  }
}

// POST /roles
export async function crearRol(payload: {
  nombre: string
  descripcion?: string
}) {
  try {
    const resp = await axiosUsuarios.post('/roles', payload)
    return safeData(resp)
  } catch (err: any) {
    console.error('❌ Error al crear rol:', err?.response || err)
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      throw new Error(
        'No tienes permiso para crear roles (backend devolvió ' + status + ')'
      )
    }
    throw err
  }
}

// PATCH /roles/:id
export async function actualizarRol(
  id: string,
  payload: { nombre?: string; descripcion?: string },
) {
  try {
    const resp = await axiosUsuarios.patch(`/roles/${id}`, payload)
    return safeData(resp)
  } catch (err: any) {
    console.error('❌ Error al actualizar rol:', err?.response || err)
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      throw new Error(
        'No tienes permiso para actualizar este rol (backend devolvió ' +
          status +
          ')',
      )
    }
    throw err
  }
}

// DELETE /roles/:id
export async function eliminarRol(id: string) {
  try {
    const resp = await axiosUsuarios.delete(`/roles/${id}`)
    return safeData(resp)
  } catch (err: any) {
    console.error('❌ Error al eliminar rol:', err?.response || err)
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      throw new Error(
        'No tienes permiso para eliminar este rol (backend devolvió ' +
          status +
          ')',
      )
    }
    throw err
  }
}
