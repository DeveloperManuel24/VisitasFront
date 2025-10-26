'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  listarVisitasPorTecnico,
  type VisitaItem,
  type VisitaEstado,
} from '../../../../api/visitas/apiVisitas'

/* -------------------------------------------------
 * Helpers JWT
 * ------------------------------------------------- */

/**
 * Intenta leer el JWT desde localStorage y decodificarlo sin validar firma.
 * Esperamos algo tipo:
 * {
 *   "sub": "01K7CHAFG016YJVBT81WBAPFN2",
 *   "email": "mordonezsilva@gmail.com",
 *   "name": "Manuel Ordoñez",
 *   "roles": ["ADMIN"],
 *   "iat": ...,
 *   "exp": ...
 * }
 *
 * Devuelve ese payload (o null si falla).
 */
function getTokenPayload() {
  try {
    // ajusta la key si en tu login lo guardaste con otro nombre
    const raw = window.localStorage.getItem('authToken')
    if (!raw) return null

    const parts = raw.split('.')
    if (parts.length !== 3) return null

    const payloadB64 = parts[1]
    // JWT usa base64url -> hay que normalizar
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    const payloadJson = atob(base64)
    const payload = JSON.parse(payloadJson)
    return { token: raw, payload }
  } catch (err) {
    console.error('Error leyendo/parseando JWT:', err)
    return null
  }
}

/* -------------------------------------------------
 * Helpers visuales / formateo
 * ------------------------------------------------- */
function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString()
}

function badgeColor(estado: VisitaEstado) {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-amber-100 text-amber-800 ring-amber-300'
    case 'EN_CURSO':
      return 'bg-blue-100 text-blue-800 ring-blue-300'
    case 'COMPLETADA':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-300'
    case 'CANCELADA':
      return 'bg-red-100 text-red-700 ring-red-300'
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-300'
  }
}

function EstadoPill({ estado }: { estado: VisitaEstado }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px]/4 font-medium ring-1 ring-inset',
        badgeColor(estado),
      ].join(' ')}
    >
      {estado}
    </span>
  )
}

/* -------------------------------------------------
 * Tarjeta compacta de una visita (para PENDIENTES / EN_CURSO)
 * ------------------------------------------------- */
function CardVisitaPendiente({ v }: { v: VisitaItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5">
      {/* header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="break-words text-sm/6 font-semibold text-gray-900">
            {v.cliente?.nombre ?? 'Sin cliente'}
          </div>
          <div className="break-words text-xs/5 text-gray-500">
            {v.cliente?.direccion ?? 'Sin dirección'}
          </div>
        </div>

        <EstadoPill estado={v.estado} />
      </div>

      {/* info row */}
      <div className="space-y-1 text-xs/5 text-gray-600">
        <div>
          <span className="font-medium text-gray-900">Agendado:</span>{' '}
          {formatDateTime(v.scheduledAt)}
        </div>

        {v.notaSupervisor && (
          <div className="break-words">
            <span className="font-medium text-gray-900">Nota sup:</span>{' '}
            {v.notaSupervisor}
          </div>
        )}

        {v.notaTecnico && (
          <div className="break-words">
            <span className="font-medium text-gray-900">Nota tec:</span>{' '}
            {v.notaTecnico}
          </div>
        )}

        {(v.cliente?.lat || v.cliente?.lng) && (
          <div className="break-all text-[11px]/5 text-gray-500">
            {v.cliente?.lat && v.cliente?.lng
              ? `(${v.cliente.lat}, ${v.cliente.lng})`
              : 'sin coordenadas'}
          </div>
        )}
      </div>

      {/* action row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/visitas/${v.id}/editar`}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm/6 font-medium text-white ring-1 ring-inset ring-black/15 hover:bg-gray-800"
        >
          Ir al detalle
        </Link>

        {v.cliente?.lat && v.cliente?.lng && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-[11px]/5 font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${v.cliente.lat},${v.cliente.lng}`}
            >
              Abrir en Maps
            </a>

            <a
              className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-[11px]/5 font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://waze.com/ul?ll=${v.cliente.lat},${v.cliente.lng}&navigate=yes`}
            >
              Waze
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------
 * Fila historial (COMPLETADA / CANCELADA)
 * ------------------------------------------------- */
function RowHistorial({ v }: { v: VisitaItem }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="break-words text-sm/6 font-semibold text-gray-900">
              {v.cliente?.nombre ?? 'Sin cliente'}
            </div>
            <div className="break-words text-xs/5 text-gray-500">
              {v.cliente?.direccion ?? 'Sin dirección'}
            </div>
          </div>

          <EstadoPill estado={v.estado} />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]/5 text-gray-600 sm:text-xs/5">
          <div className="truncate">
            <span className="font-medium text-gray-900">Agendada:</span>{' '}
            {formatDateTime(v.scheduledAt)}
          </div>

          <div className="truncate">
            <span className="font-medium text-gray-900">Check-in:</span>{' '}
            {formatDateTime(v.checkInAt)}
          </div>

          <div className="truncate">
            <span className="font-medium text-gray-900">Check-out:</span>{' '}
            {formatDateTime(v.checkOutAt)}
          </div>

          <div className="truncate">
            <span className="font-medium text-gray-900">Duración:</span>{' '}
            {v.duracionMin != null ? `${v.duracionMin} min` : '—'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:shrink-0">
        <Link
          href={`/visitas/${v.id}/editar`}
          className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm/6 font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Ver visita
        </Link>

        {v.cliente?.lat && v.cliente?.lng && (
          <a
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm/6 font-medium text-white ring-1 ring-inset ring-black/15 hover:bg-gray-800"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${v.cliente.lat},${v.cliente.lng}`}
          >
            Ver mapa
          </a>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------
 * Página principal del Técnico
 * ------------------------------------------------- */
export default function VisitasTecnicoPage() {
  // 1. agarramos el usuario logueado desde el JWT
  const [tecnicoId, setTecnicoId] = useState<string | null>(null)

  // loading / error global
  const [cargando, setCargando] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // visitas del técnico (sin filtro de fechas = "pendientes / próximas")
  const [visitasPendientesRaw, setVisitasPendientesRaw] = useState<VisitaItem[]>([])

  // historial del mes seleccionado
  const [visitasHistoricoRaw, setVisitasHistoricoRaw] = useState<VisitaItem[]>([])

  // filtro de mes para histórico (YYYY-MM)
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const defaultMonth = `${y}-${m}`
  const [mesSeleccionado, setMesSeleccionado] = useState(defaultMonth)

  // util para rango del mes seleccionado
  function rangoMes(mesYYYYMM: string) {
    const [yy, mm] = mesYYYYMM.split('-').map((n) => parseInt(n, 10))
    const first = new Date(yy, mm - 1, 1) // primer día del mes
    const next = new Date(yy, mm, 1) // primer día del mes siguiente
    const last = new Date(next.getTime() - 1) // último ms del mes actual

    return {
      fromISO: first.toISOString(),
      toISO: last.toISOString(),
    }
  }

  // 2. al montar, decodificamos el token y seteamos tecnicoId
  useEffect(() => {
    const info = getTokenPayload()
    if (!info || !info.payload?.sub) {
      setErrorMsg('No se pudo identificar al usuario técnico.')
      setTecnicoId(null)
      setCargando(false)
      return
    }
    setTecnicoId(info.payload.sub)
  }, [])

  // 3. cada vez que tengamos tecnicoId y/o cambie el mes, cargamos visitas
  useEffect(() => {
    if (!tecnicoId) return

    let cancelado = false
    async function run() {
      try {
        setCargando(true)
        setErrorMsg(null)

        // visitas pendientes / próximas (sin rango)
        const pendientesResp = await listarVisitasPorTecnico(tecnicoId)

        // historial filtrado por mes
        const { fromISO, toISO } = rangoMes(mesSeleccionado)
        const historicoResp = await listarVisitasPorTecnico(tecnicoId, {
          from: fromISO,
          to: toISO,
        })

        if (cancelado) return

        setVisitasPendientesRaw(
          Array.isArray(pendientesResp.data) ? pendientesResp.data : [],
        )
        setVisitasHistoricoRaw(
          Array.isArray(historicoResp.data) ? historicoResp.data : [],
        )
      } catch (err) {
        console.error('Error cargando visitas del técnico:', err)
        if (!cancelado) {
          setErrorMsg('No se pudieron cargar tus visitas.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    run()
    return () => {
      cancelado = true
    }
  }, [tecnicoId, mesSeleccionado])

  // derivar listas listas para UI

  // próximas = PENDIENTE o EN_CURSO más cercanas primero
  const visitasProximas = useMemo(() => {
    return visitasPendientesRaw
      .filter(
        (v) => v.estado === 'PENDIENTE' || v.estado === 'EN_CURSO',
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime(),
      )
  }, [visitasPendientesRaw])

  // histórico (COMPLETADA / CANCELADA) más recientes arriba
  const visitasHistorico = useMemo(() => {
    return visitasHistoricoRaw
      .filter(
        (v) => v.estado === 'COMPLETADA' || v.estado === 'CANCELADA',
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime(),
      )
  }, [visitasHistoricoRaw])

  /* -------------------------------------------------
   * Estados de carga inicial
   * ------------------------------------------------- */

  // si todavía no obtuvimos ni siquiera el tecnicoId del token
  if (tecnicoId === null && cargando) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar
              banner={
                <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                  Visitas Técnico — SkyNet Visitas
                </div>
              }
            />
          </Container>

          <Container className="py-24 text-sm/6 text-gray-500">
            Preparando tu sesión...
          </Container>
        </main>
      </RequireAuth>
    )
  }

  // si no hay tecnicoId válido
  if (!tecnicoId) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar
              banner={
                <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                  Visitas Técnico — SkyNet Visitas
                </div>
              }
            />
          </Container>

          <Container className="py-24 text-sm/6 text-gray-500">
            {errorMsg ??
              'No se pudo identificar al usuario. Inicia sesión de nuevo.'}
          </Container>
        </main>
      </RequireAuth>
    )
  }

  // si ya tenemos tecnicoId pero estamos cargando datos
  if (cargando) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar
              banner={
                <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                  Visitas Técnico — SkyNet Visitas
                </div>
              }
            />
          </Container>

          <Container className="py-24 text-sm/6 text-gray-500">
            Cargando tus visitas...
          </Container>
        </main>
      </RequireAuth>
    )
  }

  /* -------------------------------------------------
   * UI principal
   * ------------------------------------------------- */
  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
        {/* Navbar */}
        <Container>
          <Navbar
            banner={
              <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                Visitas Técnico — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* Header */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <Subheading>MI DÍA</Subheading>
              <Heading as="h1" className="mt-2 text-balance">
                Tus visitas en campo
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Aquí ves lo que tenés pendiente, podés entrar al detalle para
                hacer check-in / check-out y dejar notas. También mirás tu
                historial por mes.
              </p>

              {errorMsg && (
                <p className="mt-4 text-sm/6 font-medium text-red-600">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <Button variant="secondary" href="/visitas">
                ← Ir a Visitas (admin)
              </Button>
            </div>
          </div>

          {/* Contenido responsive 2 columnas */}
          <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* IZQ: próximas visitas */}
            <div className="flex flex-col rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-sm/6 font-medium text-gray-900">
                  Tus próximas visitas
                </h2>
                <div className="text-xs/5 text-gray-500">
                  {visitasProximas.length} pendiente
                  {visitasProximas.length === 1 ? '' : 's'}
                </div>
              </div>

              {visitasProximas.length === 0 ? (
                <div className="mt-6 text-sm/6 text-gray-500">
                  No tienes visitas pendientes.
                </div>
              ) : (
                <ul className="mt-6 flex flex-col gap-4">
                  {visitasProximas.map((v) => (
                    <li key={v.id}>
                      <CardVisitaPendiente v={v} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* DER: historial */}
            <div className="flex flex-col rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm/6 font-medium text-gray-900">
                    Historial del mes
                  </h2>
                  <p className="mt-1 text-xs/5 text-gray-500">
                    Visitas completadas / canceladas
                  </p>
                </div>

                {/* selector de mes */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px]/5 font-medium text-gray-700">
                    Mes
                  </label>
                  <input
                    type="month"
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-xs/5 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                  />
                </div>
              </div>

              {visitasHistorico.length === 0 ? (
                <div className="mt-6 text-sm/6 text-gray-500">
                  Sin historial en este rango.
                </div>
              ) : (
                <ul className="mt-6 flex flex-col gap-4">
                  {visitasHistorico.map((v) => (
                    <li key={v.id}>
                      <RowHistorial v={v} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </Container>
      </main>
    </RequireAuth>
  )
}
