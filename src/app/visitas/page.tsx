'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  listarVisitas,
  eliminarVisita,
  type VisitaItem,
  type VisitaEstado,
} from '../../../api/visitas/apiVisitas'

/* ---------------- utils ---------------- */

function chipEstado(estado?: VisitaEstado) {
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px]/4 font-medium ring-1'
  switch (estado) {
    case 'PENDIENTE':
      return (
        <span
          className={`${base} bg-yellow-50 text-yellow-800 ring-yellow-300`}
        >
          Pendiente
        </span>
      )
    case 'EN_CURSO':
      return (
        <span
          className={`${base} bg-blue-50 text-blue-800 ring-blue-300`}
        >
          En curso
        </span>
      )
    case 'COMPLETADA':
      return (
        <span
          className={`${base} bg-green-50 text-green-800 ring-green-300`}
        >
          Completada
        </span>
      )
    case 'CANCELADA':
      return (
        <span
          className={`${base} bg-gray-100 text-gray-600 ring-gray-300`}
        >
          Cancelada
        </span>
      )
    default:
      return (
        <span
          className={`${base} bg-gray-100 text-gray-600 ring-gray-300`}
        >
          —
        </span>
      )
  }
}

function fmtFechaHora(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtHora(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ---------------- page ---------------- */

export default function VisitasPage() {
  // filtros
  const [q, setQ] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<
    '' | VisitaEstado
  >('')
  const [page, setPage] = useState(1)

  // data
  const [visitas, setVisitas] = useState<VisitaItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // cargar lista
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        setCargando(true)
        setMensaje(null)

        const res = await listarVisitas({
          q: q || undefined,
          estado: estadoFiltro || undefined,
          page,
          limit: 20,
        })

        if (!cancelado) {
          setVisitas(Array.isArray(res?.data) ? res.data : [])
          setTotal(res?.meta?.total ?? 0)
          setPages(res?.meta?.pages ?? 1)
        }
      } catch (err) {
        console.error('Error listando visitas:', err)
        if (!cancelado) {
          setMensaje('❌ Error cargando visitas.')
          setVisitas([])
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
  }, [q, estadoFiltro, page])

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
  }

  function handlePrevPage() {
    setPage((p) => Math.max(1, p - 1))
  }
  function handleNextPage() {
    setPage((p) => Math.min(pages, p + 1))
  }

  async function handleEliminar(id: string) {
    const ok = window.confirm(
      '¿Seguro que deseas eliminar esta visita? Esta acción no se puede deshacer.',
    )
    if (!ok) return

    try {
      await eliminarVisita(id)

      const res = await listarVisitas({
        q: q || undefined,
        estado: estadoFiltro || undefined,
        page,
        limit: 20,
      })

      setVisitas(Array.isArray(res?.data) ? res.data : [])
      setTotal(res?.meta?.total ?? 0)
      setPages(res?.meta?.pages ?? 1)

      setMensaje('✅ Visita eliminada.')
    } catch (err) {
      console.error('Error eliminando visita:', err)
      setMensaje('❌ Error al eliminar la visita.')
    }
  }

  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
        {/* Navbar */}
        <Container>
          <Navbar
            banner={
              <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                Visitas — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* Header */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <Subheading>OPERACIÓN</Subheading>
              <Heading as="h1" className="mt-2 text-balance">
                Visitas programadas
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Consulta, filtra y administra las visitas técnicas. Desde
                aquí también puedes crear nuevas asignaciones.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href="/visitas/crear">
                  + Nueva visita
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <section className="mt-10 max-w-5xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <form
              onSubmit={handleBuscar}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {/* Buscar texto */}
              <div className="space-y-2">
                <label className="block text-sm/5 font-medium text-gray-900">
                  Búsqueda
                </label>
                <input
                  className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Cliente, notas..."
                />
                <p className="text-[11px]/5 text-gray-500">
                  Busca por nombre del cliente o nota.
                </p>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label className="block text-sm/5 font-medium text-gray-900">
                  Estado
                </label>
                <select
                  className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                  value={estadoFiltro}
                  onChange={(e) => {
                    setEstadoFiltro(
                      e.target.value as '' | VisitaEstado,
                    )
                    setPage(1)
                  }}
                >
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="COMPLETADA">Completada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
                <p className="text-[11px]/5 text-gray-500">
                  Filtrar por estado operativo.
                </p>
              </div>

              {/* Paginación resumen */}
              <div className="space-y-2">
                <label className="block text-sm/5 font-medium text-gray-900">
                  Resultados
                </label>
                <div className="rounded-lg border border-transparent bg-gray-50 px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10">
                  {cargando
                    ? 'Cargando...'
                    : `${total} visita${
                        total === 1 ? '' : 's'
                      } (${page}/${pages})`}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1 text-xs/5"
                    onClick={handlePrevPage}
                    disabled={page <= 1 || cargando}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1 text-xs/5"
                    onClick={handleNextPage}
                    disabled={page >= pages || cargando}
                  >
                    →
                  </Button>
                </div>
              </div>
            </form>

            {mensaje && (
              <div className="mt-4 text-sm/6 font-medium text-gray-700">
                {mensaje}
              </div>
            )}
          </section>

          {/* Tabla / lista */}
          <section className="mt-10 max-w-5xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-sm/6 font-medium text-gray-900">
                Resultado de visitas
              </h2>
              <div className="text-xs/5 text-gray-500 sm:text-right">
                {cargando
                  ? 'Cargando…'
                  : `Página ${page} de ${pages}`}
              </div>
            </div>

            {/* encabezados desktop */}
            <div className="mt-6 hidden text-[11px]/4 font-medium text-gray-500 sm:grid sm:grid-cols-12 sm:gap-4">
              <div className="col-span-3">Cliente</div>
              <div className="col-span-2">Supervisor</div>
              <div className="col-span-2">Técnico</div>
              <div className="col-span-2">Horario</div>
              <div className="col-span-1 text-center">
                Duración
              </div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            {/* lista */}
            <ul className="mt-2 flex flex-col divide-y divide-gray-200">
              {visitas.length === 0 && !cargando ? (
                <li className="py-10 text-center text-sm/6 text-gray-500">
                  No hay visitas que coincidan con tu filtro.
                </li>
              ) : (
                visitas.map((v) => (
                  <li
                    key={v.id}
                    className="py-6 sm:grid sm:grid-cols-12 sm:gap-4"
                  >
                    {/* Cliente + estado */}
                    <div className="col-span-3 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 text-sm/6 font-medium text-gray-900">
                        <span className="truncate">
                          {v.cliente?.nombre ?? 'Sin cliente'}
                        </span>
                        {chipEstado(v.estado)}
                      </div>

                      <div className="mt-1 text-xs/5 text-gray-600">
                        ID:{' '}
                        <span className="font-medium text-gray-900">
                          {v.id}
                        </span>
                        <br />
                        {v.notaSupervisor
                          ? `Nota sup: ${v.notaSupervisor}`
                          : v.notaTecnico
                          ? `Nota tec: ${v.notaTecnico}`
                          : ''}
                      </div>

                      {/* mobile-only extra */}
                      <div className="mt-4 text-xs/5 text-gray-600 sm:hidden">
                        <div>
                          <span className="font-medium text-gray-900">
                            Supervisor:{' '}
                          </span>
                          {v.supervisor?.nombre ?? '—'}
                        </div>
                        <div className="mt-1">
                          <span className="font-medium text-gray-900">
                            Técnico:{' '}
                          </span>
                          {v.tecnico?.nombre ?? '—'}
                        </div>
                        <div className="mt-1">
                          <span className="font-medium text-gray-900">
                            Programada:{' '}
                          </span>
                          {fmtFechaHora(v.scheduledAt)}
                        </div>
                        <div className="mt-1">
                          <span className="font-medium text-gray-900">
                            Check-in:{' '}
                          </span>
                          {fmtHora(v.checkInAt)} /{' '}
                          <span className="font-medium text-gray-900">
                            Check-out:{' '}
                          </span>
                          {fmtHora(v.checkOutAt)}
                        </div>
                        <div className="mt-1">
                          <span className="font-medium text-gray-900">
                            Duración:{' '}
                          </span>
                          {v.duracionMin != null
                            ? `${v.duracionMin} min`
                            : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Supervisor (desktop) */}
                    <div className="col-span-2 hidden text-sm/6 text-gray-900 sm:block">
                      {v.supervisor?.nombre ?? '—'}
                    </div>

                    {/* Técnico (desktop) */}
                    <div className="col-span-2 hidden text-sm/6 text-gray-900 sm:block">
                      {v.tecnico?.nombre ?? '—'}
                    </div>

                    {/* Horario (desktop) */}
                    <div className="col-span-2 hidden text-xs/5 text-gray-600 sm:block">
                      <div>
                        <span className="font-medium text-gray-900">
                          Programada:{' '}
                        </span>
                        {fmtFechaHora(v.scheduledAt)}
                      </div>
                      <div className="mt-1">
                        <span className="font-medium text-gray-900">
                          Check-in:{' '}
                        </span>
                        {fmtHora(v.checkInAt)} /{' '}
                        <span className="font-medium text-gray-900">
                          Out:{' '}
                        </span>
                        {fmtHora(v.checkOutAt)}
                      </div>
                    </div>

                    {/* Duración (desktop) */}
                    <div className="col-span-1 hidden items-center text-center text-sm/6 text-gray-900 sm:flex">
                      {v.duracionMin != null
                        ? `${v.duracionMin} min`
                        : '—'}
                    </div>

                    {/* Acciones */}
                    <div className="col-span-2 mt-4 flex flex-col gap-2 text-sm/6 sm:mt-0 sm:items-end sm:text-right">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        href={`/visitas/${v.id}/editar`}
                      >
                        ✏️ Editar
                      </Button>

                      <Button
                        variant="secondary"
                        className={[
                          'w-full sm:w-auto',
                          'text-red-600 ring-red-200',
                          'data-hover:bg-red-50 data-hover:text-red-700 data-hover:ring-red-300',
                          'focus-visible:outline-red-600',
                        ].join(' ')}
                        onClick={() => handleEliminar(v.id)}
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {/* footer de paginación */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-xs/5 text-gray-500">
                {cargando
                  ? '…'
                  : `Mostrando página ${page} de ${pages} (${total} total)`}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs/5"
                  onClick={handlePrevPage}
                  disabled={page <= 1 || cargando}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs/5"
                  onClick={handleNextPage}
                  disabled={page >= pages || cargando}
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </RequireAuth>
  )
}
