'use client'

import axiosClientes from '../../axios/axiosClientes'

/**
 * ENUMS / tipos del backend
 */
export type VisitaEstado =
  | 'PENDIENTE'
  | 'EN_CURSO'
  | 'COMPLETADA'
  | 'CANCELADA'

export type EvidenciaItem = {
  id: string
  tipo: string
  url: string
  descripcion?: string | null
}

export type VisitaItem = {
  id: string

  clienteId: string
  supervisorId?: string | null
  tecnicoId?: string | null

  // relaciones populadas por findAll/findOne
  cliente?: {
    id: string
    nombre: string
    direccion?: string | null
    lat?: string | number | null
    lng?: string | number | null
    email?: string | null // <- opcional si el backend ya lo manda
  }
  supervisor?: { id: string; nombre: string }
  tecnico?: { id: string; nombre: string }

  scheduledAt: string // ISO
  estado: VisitaEstado

  notaSupervisor?: string | null
  notaTecnico?: string | null

  checkInAt?: string | null
  checkOutAt?: string | null
  duracionMin?: number | null

  evidencias?: EvidenciaItem[]

  creadoEn?: string
  actualizadoEn?: string
}

export type QueryVisitasInput = {
  q?: string
  page?: number
  limit?: number
  estado?: VisitaEstado
  supervisorId?: string
  tecnicoId?: string
  clienteId?: string
  from?: string // ISO fecha (YYYY-MM-DD o ISO completa)
  to?: string   // ISO fecha
}

/* =========================================================
 * LISTAR TODAS
 * GET /visitas
 * =========================================================
 */
export async function listarVisitas(params: QueryVisitasInput = {}) {
  const resp = await axiosClientes.get('/visitas', {
    params: {
      q: params.q,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      estado: params.estado,
      supervisorId: params.supervisorId,
      tecnicoId: params.tecnicoId,
      clienteId: params.clienteId,
      from: params.from,
      to: params.to,
    },
  })
  return resp.data
}

/* =========================================================
 * LISTAR POR TÉCNICO
 * GET /visitas/tecnico/:tecnicoId
 * =========================================================
 */
export async function listarVisitasPorTecnico(
  tecnicoId: string,
  opts?: {
    from?: string
    to?: string
  },
) {
  if (!tecnicoId) {
    throw new Error('listarVisitasPorTecnico necesita tecnicoId')
  }

  const resp = await axiosClientes.get(`/visitas/tecnico/${tecnicoId}`, {
    params: {
      from: opts?.from,
      to: opts?.to,
    },
  })

  return resp.data as {
    data: VisitaItem[]
    meta: {
      total: number
      tecnicoId: string
      from?: string
      to?: string
    }
  }
}

/* =========================================================
 * OBTENER UNA
 * GET /visitas/:id
 * =========================================================
 */
export async function obtenerVisitaPorId(
  id: string,
): Promise<VisitaItem | null> {
  if (!id) return null
  const resp = await axiosClientes.get(`/visitas/${id}`)
  return resp.data ?? null
}

/* =========================================================
 * CREAR
 * POST /visitas
 * =========================================================
 */
export async function crearVisita(payload: {
  clienteId: string
  supervisorId?: string | null
  tecnicoId?: string | null
  scheduledAt: string // ISO
  estado?: VisitaEstado
  notaSupervisor?: string | null
}) {
  const resp = await axiosClientes.post('/visitas', payload)
  return resp.data
}

/* =========================================================
 * ACTUALIZAR
 * PATCH /visitas/:id
 * =========================================================
 */
export async function actualizarVisita(
  id: string,
  payload: {
    supervisorId?: string | null
    tecnicoId?: string | null
    scheduledAt?: string
    notaSupervisor?: string | null
    notaTecnico?: string | null
    // OJO: clienteId NO va acá porque el backend no lo acepta en UpdateVisitaDto
  },
) {
  const resp = await axiosClientes.patch(`/visitas/${id}`, payload)
  return resp.data
}

/* =========================================================
 * CHECK-IN
 * POST /visitas/:id/check-in
 * =========================================================
 */
export async function checkInVisita(
  id: string,
  payload: {
    at?: string // ISO opcional
    lat?: number | null
    lng?: number | null
    notaTecnico?: string | null
  },
) {
  const resp = await axiosClientes.post(`/visitas/${id}/check-in`, payload)
  return resp.data
}

/* =========================================================
 * CHECK-OUT
 * POST /visitas/:id/check-out
 * =========================================================
 */
export async function checkOutVisita(
  id: string,
  payload: {
    at?: string // ISO opcional
    lat?: number | null
    lng?: number | null
    notaTecnico?: string | null
  },
) {
  const resp = await axiosClientes.post(`/visitas/${id}/check-out`, payload)
  return resp.data
}

/* =========================================================
 * CANCELAR
 * POST /visitas/:id/cancel
 * =========================================================
 */
export async function cancelarVisita(id: string, motivo?: string) {
  const resp = await axiosClientes.post(`/visitas/${id}/cancel`, {
    motivo: motivo ?? null,
  })
  return resp.data
}

/* =========================================================
 * AGREGAR EVIDENCIA
 * POST /visitas/:id/evidencias
 * =========================================================
 */
export async function agregarEvidenciaVisita(
  id: string,
  payload: {
    tipo: string
    url: string
    descripcion?: string | null
  },
) {
  const resp = await axiosClientes.post(`/visitas/${id}/evidencias`, payload)
  return resp.data
}

/* =========================================================
 * ELIMINAR
 * DELETE /visitas/:id
 * =========================================================
 */
export async function eliminarVisita(id: string) {
  const resp = await axiosClientes.delete(`/visitas/${id}`)
  return resp.data
}
