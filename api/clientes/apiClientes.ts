'use client'

import axiosClientes from '../../axios/axiosClientes'

/**
 * TIPOS
 */
export type ClienteItem = {
  id: string
  nombre: string
  direccion?: string | null
  telefono?: string | null
  correo?: string | null
  nit?: string | null
  lat?: number | null
  lng?: number | null

  // timestamps opcionales
  creadoEn?: string
  actualizadoEn?: string
}

export type QueryClientesInput = {
  q?: string
  page?: number
  limit?: number
}

/**
 * LISTAR CLIENTES
 * GET /clientes
 */
export async function listarClientes(params: QueryClientesInput = {}) {
  const resp = await axiosClientes.get('/clientes', {
    params: {
      q: params.q,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    },
  })

  // backend: { data, meta }
  return resp.data
}

/**
 * OBTENER CLIENTE POR ID
 * GET /clientes/:id
 */
export async function obtenerClientePorId(
  id: string,
): Promise<ClienteItem | null> {
  if (!id) return null
  const resp = await axiosClientes.get(`/clientes/${id}`)
  return resp.data ?? null
}

/**
 * CREAR CLIENTE
 * POST /clientes
 */
export async function crearCliente(payload: {
  nombre: string
  direccion?: string | null
  telefono?: string | null
  correo?: string | null
  nit?: string | null
  lat?: number | null
  lng?: number | null
}) {
  const resp = await axiosClientes.post('/clientes', payload)
  return resp.data
}

/**
 * ACTUALIZAR CLIENTE
 * PATCH /clientes/:id
 */
export async function actualizarCliente(
  id: string,
  payload: {
    nombre?: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    nit?: string | null
    lat?: number | null
    lng?: number | null
  },
) {
  const resp = await axiosClientes.patch(`/clientes/${id}`, payload)
  return resp.data
}

/**
 * ELIMINAR CLIENTE
 * DELETE /clientes/:id
 */
export async function eliminarCliente(id: string) {
  const resp = await axiosClientes.delete(`/clientes/${id}`)
  return resp.data
}
