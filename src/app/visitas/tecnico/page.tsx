'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
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

function getTokenPayload() {
  try {
    const raw = window.localStorage.getItem('authToken')
    if (!raw) return null
    const parts = raw.split('.')
    if (parts.length !== 3) return null
    const payloadJson = atob(
      parts[1].replace(/-/g, '+').replace(/_/g, '/'),
    )
    const payload = JSON.parse(payloadJson)
    return { token: raw, payload }
  } catch {
    return null
  }
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
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

function CardVisitaPendiente({ v }: { v: VisitaItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5">
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

      <div className="space-y-1 text-xs/5 text-gray-600">
        <div>
          <span className="font-medium text-gray-900">
            Agendado:
          </span>{' '}
          {formatDateTime(v.scheduledAt)}
        </div>

        {v.notaSupervisor && (
          <div className="break-words">
            <span className="font-medium text-gray-900">
              Nota sup:
            </span>{' '}
            {v.notaSupervisor}
          </div>
        )}

        {v.notaTecnico && (
          <div className="break-words">
            <span className="font-medium text-gray-900">
              Nota tec:
            </span>{' '}
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
            <span className="font-medium text-gray-900">
              Agendada:
            </span>{' '}
            {formatDateTime(v.scheduledAt)}
          </div>

          <div className="truncate">
            <span className="font-medium text-gray-900">
              Check-in:
            </span>{' '}
            {formatDateTime(v.checkInAt)}
          </div>

          <div className="truncate">
            <span className="font-medium text-gray-900">
              Check-out:
            </span>{' '}
            {formatDateTime(v.checkOutAt)}
          </div>

          <div className="truncate">
            <span className="font-medium text-gray-900">
              Duración:
            </span>{' '}
            {v.duracionMin != null
              ? `${v.duracionMin} min`
              : '—'}
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

/* ======================================================
 * Página principal
 * ====================================================== */
export default function VisitasTecnicoPage() {
  const router = useRouter()

  const [tecnicoId, setTecnicoId] = useState<string | null>(null)
  const [rolesUsuario, setRolesUsuario] = useState<string[]>([])
  const [sessionReady, setSessionReady] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [visitasPendientesRaw, setVisitasPendientesRaw] = useState<
    VisitaItem[]
  >([])
  const [visitasHistoricoRaw, setVisitasHistoricoRaw] = useState<
    VisitaItem[]
  >([])

  const today = new Date()
  const defaultMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] =
    useState(defaultMonth)

  function rangoMes(mesYYYYMM: string) {
    const [yy, mm] = mesYYYYMM
      .split('-')
      .map((n) => parseInt(n, 10))
    const first = new Date(yy, mm - 1, 1)
    const next = new Date(yy, mm, 1)
    const last = new Date(next.getTime() - 1)
    return { fromISO: first.toISOString(), toISO: last.toISOString() }
  }

  // 1. leer token una vez
  useEffect(() => {
    const info = getTokenPayload()
    if (!info || !info.payload) {
      setTecnicoId(null)
      setRolesUsuario([])
      setSessionReady(true)
      setCargando(false)
      setErrorMsg('No se pudo identificar la sesión.')
      return
    }

    const sub = info.payload.sub ?? null
    const rolesRaw = Array.isArray(info.payload.roles)
      ? info.payload.roles
      : []
    const rolesUpper = rolesRaw.map((r: any) =>
      String(r).toUpperCase(),
    )

    setTecnicoId(sub)
    setRolesUsuario(rolesUpper)
    setSessionReady(true)
  }, [])

  const allowed =
    rolesUsuario.includes('ADMINISTRADOR') ||
    rolesUsuario.includes('TECNICO')

  // 2. cargar data si allowed
  useEffect(() => {
    if (!sessionReady) return
    if (!tecnicoId) return
    if (!allowed) return

    let cancelado = false
    ;(async () => {
      try {
        setCargando(true)
        setErrorMsg(null)

        const pendientesResp =
          await listarVisitasPorTecnico(tecnicoId)

        const { fromISO, toISO } = rangoMes(mesSeleccionado)
        const historicoResp = await listarVisitasPorTecnico(
          tecnicoId,
          {
            from: fromISO,
            to: toISO,
          },
        )

        if (cancelado) return

        setVisitasPendientesRaw(
          Array.isArray(pendientesResp.data)
            ? pendientesResp.data
            : [],
        )
        setVisitasHistoricoRaw(
          Array.isArray(historicoResp.data)
            ? historicoResp.data
            : [],
        )
      } catch (err) {
        if (!cancelado) {
          setErrorMsg('No se pudieron cargar tus visitas.')
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    })()

    return () => {
      cancelado = true
    }
  }, [sessionReady, tecnicoId, allowed, mesSeleccionado])

  // listas derivadas
  const visitasProximas = useMemo(() => {
    return visitasPendientesRaw
      .filter(
        (v) =>
          v.estado === 'PENDIENTE' ||
          v.estado === 'EN_CURSO',
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime(),
      )
  }, [visitasPendientesRaw])

  const visitasHistorico = useMemo(() => {
    return visitasHistoricoRaw
      .filter(
        (v) =>
          v.estado === 'COMPLETADA' ||
          v.estado === 'CANCELADA',
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime(),
      )
  }, [visitasHistoricoRaw])

  // ==== estados UI ====

  // todavía cargando roles/token
  if (!sessionReady) {
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
            Verificando acceso…
          </Container>
        </main>
      </RequireAuth>
    )
  }

  // sesión lista pero NO permitido
  if (!allowed || !tecnicoId) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar
              banner={
                <div className="flex items-center gap-1 rounded-full bg-red-600/20 px-3 py-0.5 text-sm/6 font-medium text-red-700">
                  Acceso denegado
                </div>
              }
            />
          </Container>

          <Container className="py-24 text-center text-sm/6 text-gray-600">
            No tenés permisos para ver esta sección.
            <div className="mt-6">
              <Button href="/" variant="secondary">
                Volver al panel
              </Button>
            </div>
          </Container>
        </main>
      </RequireAuth>
    )
  }

  // allowed pero estamos trayendo data
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

  // render final
  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
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
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <Subheading>MI DÍA</Subheading>
              <Heading as="h1" className="mt-2 text-balance">
                Tus visitas en campo
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Aquí ves lo que tenés pendiente, podés entrar al
                detalle para hacer check-in / check-out y dejar
                notas. También mirás tu historial por mes.
              </p>

              {errorMsg && (
                <p className="mt-4 text-sm/6 font-medium text-red-600">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              {/* botón admin opcional, lo dejamos igual que tenías */}
              <Button variant="secondary" href="/visitas">
                ← Ir a Visitas (admin)
              </Button>
            </div>
          </div>

          <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* próximas visitas */}
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

            {/* historial mensual */}
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

                <div className="flex flex-col gap-1">
                  <label className="text-[11px]/5 font-medium text-gray-700">
                    Mes
                  </label>
                  <input
                    type="month"
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-xs/5 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={mesSeleccionado}
                    onChange={(e) =>
                      setMesSeleccionado(e.target.value)
                    }
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
