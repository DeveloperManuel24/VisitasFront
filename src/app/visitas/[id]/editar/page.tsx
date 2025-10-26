'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  obtenerVisitaPorId,
  actualizarVisita,
  checkInVisita,
  checkOutVisita,
  cancelarVisita,
  type VisitaItem,
} from '../../../../../api/visitas/apiVisitas'

import { listarUsuarios } from '../../../../../api/usuarios/apiUsuarios'
import { listarClientes } from '../../../../../api/clientes/apiClientes'

/* ======================================================
 * JWT helper
 * ====================================================== */
function decodeJwtPayload(token: string | null) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return payload
  } catch {
    return null
  }
}

function useSessionInfo() {
  const [userId, setUserId] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    const raw = window.localStorage.getItem('authToken')
    if (!raw) return
    const parsed = decodeJwtPayload(raw)
    if (!parsed) return
    setUserId(parsed.sub ?? null)
    const arr = Array.isArray(parsed.roles) ? parsed.roles : []
    setRoles(arr.map((r: any) => String(r).toUpperCase()))
  }, [])

  const isTecnico = useMemo(() => roles.includes('TECNICO'), [roles])
  const canEdit = useMemo(() => !isTecnico, [isTecnico]) // admin/supervisor sí editan todo; técnico no

  return { userId, roles, isTecnico, canEdit }
}

/* ======================================================
 * Helpers para selects
 * ====================================================== */

function userHasRol(user: any, rolBuscado: 'SUPERVISOR' | 'TECNICO') {
  if (!user || !Array.isArray(user.usuariosRoles)) return false
  return user.usuariosRoles.some(
    (ur: any) => ur?.rol?.nombre?.toUpperCase() === rolBuscado,
  )
}

function SelectRolUsuario({
  label,
  roleFilter,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string
  roleFilter: 'SUPERVISOR' | 'TECNICO'
  hint: string
  value: string
  onChange: (newId: string) => void
  disabled?: boolean
}) {
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const run = async () => {
      setCargando(true)
      try {
        const res = await listarUsuarios()
        const lista = Array.isArray(res?.data) ? res.data : []
        const filtrados = lista.filter((u: any) => userHasRol(u, roleFilter))
        setUsuariosFiltrados(filtrados)
      } catch (err) {
        console.error('Error cargando usuarios:', err)
        setUsuariosFiltrados([])
      } finally {
        setCargando(false)
      }
    }
    run()
  }, [roleFilter])

  return (
    <div className="space-y-2">
      <label className="block text-sm/5 font-medium text-gray-900">
        {label} <span className="text-red-600">*</span>
      </label>

      <select
        className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 disabled:bg-gray-100 disabled:text-gray-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
      >
        <option value="">— seleccionar {roleFilter.toLowerCase()} —</option>

        {cargando ? (
          <option disabled>Cargando...</option>
        ) : usuariosFiltrados.length === 0 ? (
          <option disabled>Sin resultados</option>
        ) : (
          usuariosFiltrados.map((u) => (
            <option key={u.id} value={u.id}>
              {u?.nombre || 'Sin nombre'}
            </option>
          ))
        )}
      </select>

      <p className="text-[11px]/5 text-gray-500">{hint}</p>
    </div>
  )
}

function SelectCliente({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (newId: string) => void
  disabled?: boolean
}) {
  const [clientes, setClientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const run = async () => {
      setCargando(true)
      try {
        const res = await listarClientes({ limit: 200 })
        const lista = Array.isArray(res?.data) ? res.data : []
        setClientes(lista)
      } catch (err) {
        console.error('Error cargando clientes:', err)
        setClientes([])
      } finally {
        setCargando(false)
      }
    }
    run()
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm/5 font-medium text-gray-900">
        Cliente / Agencia
      </label>

      <select
        className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 disabled:bg-gray-100 disabled:text-gray-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
      >
        <option value="">— seleccionar cliente —</option>

        {cargando ? (
          <option disabled>Cargando...</option>
        ) : clientes.length === 0 ? (
          <option disabled>Sin resultados</option>
        ) : (
          clientes.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.nombre || 'Sin nombre'}
            </option>
          ))
        )}
      </select>

      <p className="text-[11px]/5 text-gray-500">
        clienteId: {value || '—'}
      </p>
    </div>
  )
}

/* ======================================================
 * Mapa Preview
 * ====================================================== */
function MapPreviewLite({
  lat,
  lng,
  label,
  direccion,
}: {
  lat: string | number | null | undefined
  lng: string | number | null | undefined
  label?: string
  direccion?: string | null
}) {
  const latNum =
    typeof lat === 'string'
      ? parseFloat(lat)
      : typeof lat === 'number'
      ? lat
      : null
  const lngNum =
    typeof lng === 'string'
      ? parseFloat(lng)
      : typeof lng === 'number'
      ? lng
      : null

  const hasCoords =
    typeof latNum === 'number' &&
    !Number.isNaN(latNum) &&
    typeof lngNum === 'number' &&
    !Number.isNaN(lngNum)

  if (!hasCoords) {
    return (
      <div className="overflow-hidden rounded-lg ring-1 ring-black/10 shadow-sm bg-white">
        <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-xs/5 text-gray-500">
          Sin coordenadas del cliente.
        </div>
        <div className="border-t border-black/5 bg-white px-3 py-2 text-[11px]/5 text-gray-600">
          {label ? (
            <>
              <div className="text-gray-900 font-medium">{label}</div>
              {direccion && (
                <div className="text-gray-500 break-words">
                  {direccion}
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              No hay datos del cliente.
            </div>
          )}
        </div>
      </div>
    )
  }

  const gmapsEmbed = `https://www.google.com/maps?q=${latNum},${lngNum}&z=16&output=embed`
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latNum},${lngNum}`
  const wazeUrl = `https://waze.com/ul?ll=${latNum},${lngNum}&navigate=yes`

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-black/10 shadow-sm bg-white">
      <iframe
        src={gmapsEmbed}
        className="h-64 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex flex-col gap-2 border-t border-black/5 bg-white px-3 py-2 text-[11px]/5 text-gray-600">
        <div className="text-gray-900 font-medium">
          {label ?? 'Ubicación del cliente'}
        </div>

        {direccion && (
          <div className="text-[11px]/5 text-gray-500 break-words">
            {direccion}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            className="rounded-md bg-blue-600 px-2 py-1 font-medium text-white text-[11px]/5 shadow-sm ring-1 ring-blue-500/20 hover:bg-blue-700 hover:ring-blue-600/30"
            target="_blank"
            rel="noopener noreferrer"
            href={gmapsUrl}
          >
            Google Maps
          </a>
          <a
            className="rounded-md bg-indigo-600 px-2 py-1 font-medium text-white text-[11px]/5 shadow-sm ring-1 ring-indigo-500/20 hover:bg-indigo-700 hover:ring-indigo-600/30"
            target="_blank"
            rel="noopener noreferrer"
            href={wazeUrl}
          >
            Waze
          </a>
        </div>
      </div>
    </div>
  )
}

/* ======================================================
 * Página principal
 * ====================================================== */
type PropsEditarVisita = {
  params: { id: string }
}

export default function PageVisitaDetalle({ params }: PropsEditarVisita) {
  const [id] = useState(() => params?.id ?? '')

  const { isTecnico, canEdit } = useSessionInfo()

  // visita
  const [visita, setVisita] = useState<VisitaItem | null>(null)

  // form fields
  const [clienteId, setClienteId] = useState('')
  const [clienteCorreo, setClienteCorreo] = useState('') // 👈 nuevo
  const [supervisorId, setSupervisorId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [notaSupervisor, setNotaSupervisor] = useState('')
  const [notaTecnico, setNotaTecnico] = useState('')

  // ui state
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // load visita inicial
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setCargando(true)
        const data = await obtenerVisitaPorId(id)
        if (!data) {
          setMensaje('No se encontró la visita')
          setCargando(false)
          return
        }

        // guardamos TODO lo que venga del backend
        setVisita(data)

        setClienteId(data.clienteId ?? '')
        setSupervisorId(data.supervisorId ?? '')
        setTecnicoId(data.tecnicoId ?? '')
        setScheduledAt(
          data.scheduledAt
            ? new Date(data.scheduledAt).toISOString().slice(0, 16)
            : '',
        )
        setNotaSupervisor(data.notaSupervisor ?? '')
        setNotaTecnico(data.notaTecnico ?? '')

        // 👇 agarramos correo del cliente desde el payload real
        const correoFromApi =
          (data as any)?.cliente?.correo ||
          (data as any)?.cliente?.email ||
          ''

        setClienteCorreo(correoFromApi || '')
      } catch (err) {
        console.error('Error cargando visita:', err)
        setMensaje('Error cargando datos de la visita')
      } finally {
        setCargando(false)
      }
    })()
  }, [id])

  // estado cerrado?
  const visitaCerrada =
    visita?.estado === 'COMPLETADA' || visita?.estado === 'CANCELADA'

  // campos bloqueados en general (supervisor, técnico asignado, fecha, nota sup...)
  const camposBloqueados = visitaCerrada || !canEdit
  // pero el técnico puede escribir su propia notaTecnico mientras no esté cerrada
  const notaTecnicoDisabled = visitaCerrada

  /* ---------- acciones ---------- */
  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    if (visitaCerrada) return // nadie guarda si ya está cerrada

    // si NO es técnico (o sea admin/supervisor), validar todo
    if (!isTecnico) {
      if (!clienteId || !supervisorId || !tecnicoId || !scheduledAt) {
        setMensaje('❌ Faltan datos obligatorios.')
        return
      }
    }

    setGuardando(true)
    setMensaje(null)

    try {
      // OJO: backend UpdateVisitaDto NO acepta clienteId, entonces NO lo mandamos
      await actualizarVisita(id, {
        supervisorId,
        tecnicoId,
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
        notaSupervisor: notaSupervisor || null,
        notaTecnico: notaTecnico || null,
      })

      const refreshed = await obtenerVisitaPorId(id)
      setVisita(refreshed)

      setMensaje('✅ Cambios guardados correctamente.')
    } catch (err) {
      console.error('Error actualizando visita:', err)
      setMensaje('❌ Error al guardar cambios.')
    } finally {
      setGuardando(false)
    }
  }

  async function handleCheckIn() {
    if (!id) return
    try {
      await checkInVisita(id, {
        lat: null,
        lng: null,
        notaTecnico: notaTecnico || null,
      })

      const data = await obtenerVisitaPorId(id)
      setVisita(data)
      setNotaTecnico(data.notaTecnico ?? '')
      setMensaje('✅ Check-in registrado.')
    } catch (err) {
      console.error('Error en check-in:', err)
      setMensaje('❌ Error al hacer check-in.')
    }
  }

  async function handleCheckOut() {
    if (!id) return
    try {
      await checkOutVisita(id, {
        lat: null,
        lng: null,
        notaTecnico: notaTecnico || null,

        // 👇 extra: mandamos correo del cliente directo al backend
        clienteCorreo: clienteCorreo || null,
      })

      // después del checkout:
      // - backend marca COMPLETADA
      // - calcula duración
      // - guarda notaTecnico final
      // - agrega eventos CHECK_OUT y COMPLETADA
      // - y manda el correo usando GmailService (con clienteCorreo)
      const data = await obtenerVisitaPorId(id)
      setVisita(data)
      setNotaTecnico(data.notaTecnico ?? '')
      setMensaje('✅ Check-out registrado y cliente notificado.')
    } catch (err) {
      console.error('Error en check-out:', err)
      setMensaje('❌ Error al hacer check-out.')
    }
  }

  async function handleCancelar() {
    if (!id) return
    const motivo = window.prompt('Motivo de cancelación (opcional):') ?? ''
    try {
      await cancelarVisita(id, motivo)
      const data = await obtenerVisitaPorId(id)
      setVisita(data)
      setMensaje('✅ Visita cancelada.')
    } catch (err) {
      console.error('Error en cancelar visita:', err)
      setMensaje('❌ Error al cancelar visita.')
    }
  }

  function fmt(iso?: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString()
  }

  /* ---------- loading state ---------- */
  if (cargando) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar
              banner={
                <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                  Cargando visita…
                </div>
              }
            />
          </Container>

          <Container className="py-24 text-sm/6 text-gray-500">
            Cargando visita...
          </Container>
        </main>
      </RequireAuth>
    )
  }

  /* ======================================================
   * RENDER
   * ====================================================== */
  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
        {/* Navbar */}
        <Container>
          <Navbar
            banner={
              <div className="flex flex-col gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white lg:flex-row lg:items-center lg:gap-2">
                <span>Visita #{id} — SkyNet Visitas</span>
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* ================= HEADER + ACCIONES ================= */}
          <div className="mt-16 flex flex-col gap-6 lg:flex-row lg:justify-between">
            {/* -------- IZQUIERDA: info visita -------- */}
            <div className="max-w-3xl">
              <Subheading>OPERACIÓN</Subheading>

              <Heading as="h1" className="mt-2 text-balance">
                Visita #{id}
              </Heading>

              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                <span>
                  Estado actual:{' '}
                  <span className="font-medium text-gray-900">
                    {visita?.estado ?? '—'}
                  </span>
                </span>
                <br />
                <span>Programada: {fmt(visita?.scheduledAt)}</span>
                <br />
                <span>
                  Check-in: {fmt(visita?.checkInAt)} / Check-out:{' '}
                  {fmt(visita?.checkOutAt)}
                </span>
                <br />
                <span>
                  Duración:{' '}
                  {visita?.duracionMin != null
                    ? `${visita.duracionMin} min`
                    : '—'}
                </span>
                <br />
                <span className="text-[11px]/5 text-green-700 flex items-center gap-1">
                  {visita?.estado === 'COMPLETADA'
                    ? '✅ Check-out registrado y cliente notificado.'
                    : null}
                </span>
              </p>

              {mensaje && (
                <p className="mt-4 text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </p>
              )}
            </div>

            {/* -------- DERECHA: tarjeta acciones técnico -------- */}
            <div className="mt-8 lg:mt-24 lg:min-w-[220px] lg:max-w-[240px]">
              <div className="rounded-xl bg-white p-4 shadow-md ring-1 ring-black/5 flex flex-col gap-3">
                {/* visible solo si es tecnico y no cerrada */}
                {isTecnico && !visitaCerrada && (
                  <>
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      onClick={handleCheckIn}
                    >
                      Check-in
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      onClick={handleCheckOut}
                    >
                      Check-out
                    </Button>

                    <Button
                      variant="secondary"
                      className={[
                        'w-full justify-center',
                        'text-red-600 ring-red-200',
                        'data-hover:bg-red-50 data-hover:text-red-700 data-hover:ring-red-300',
                        'focus-visible:outline-red-600',
                      ].join(' ')}
                      onClick={handleCancelar}
                    >
                      Cancelar visita
                    </Button>

                    <div className="border-t border-black/5 pt-2" />
                  </>
                )}

                {/* Volver siempre */}
                <Button
                  variant="secondary"
                  href="/visitas"
                  className="w-full justify-center"
                >
                  ← Volver
                </Button>
              </div>
            </div>
          </div>

          {/* ================= FORM + MAPA ================= */}
          <section className="mt-10 max-w-4xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <form
              onSubmit={handleGuardar}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {/* Columna IZQ */}
              <div className="space-y-5">
                {/* Cliente */}
                {canEdit && !visitaCerrada ? (
                  <SelectCliente
                    value={clienteId}
                    onChange={setClienteId}
                    disabled={visitaCerrada}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm/5 font-medium text-gray-900">
                      Cliente / Agencia
                    </label>
                    <input
                      className="block w-full rounded-lg border border-transparent bg-gray-100 px-3 py-2 text-sm/6 text-gray-600 shadow-sm ring-1 ring-black/10"
                      value={
                        visita?.cliente
                          ? visita.cliente.nombre ?? 'Sin nombre'
                          : visita?.clienteId ?? ''
                      }
                      disabled
                    />
                    <p className="text-[11px]/5 text-gray-500">
                      clienteId: {visita?.clienteId ?? '—'}
                    </p>
                    <p className="text-[11px]/5 text-gray-500">
                      correo cliente:{' '}
                      {clienteCorreo || '—'}
                    </p>
                  </div>
                )}

                {/* Supervisor */}
                <SelectRolUsuario
                  label="Supervisor asignado"
                  roleFilter="SUPERVISOR"
                  hint="Solo se muestran usuarios con rol SUPERVISOR."
                  value={supervisorId}
                  onChange={setSupervisorId}
                  disabled={camposBloqueados}
                />

                {/* Técnico */}
                <SelectRolUsuario
                  label="Técnico asignado"
                  roleFilter="TECNICO"
                  hint="Solo se muestran usuarios con rol TECNICO."
                  value={tecnicoId}
                  onChange={setTecnicoId}
                  disabled={camposBloqueados}
                />

                {/* Fecha y hora */}
                <div className="space-y-2">
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Fecha y hora programada{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 disabled:bg-gray-100 disabled:text-gray-500"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    disabled={camposBloqueados}
                  />
                </div>

                {/* Nota supervisor */}
                <div className="space-y-2">
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nota del supervisor
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 disabled:bg-gray-100 disabled:text-gray-500"
                    rows={4}
                    value={notaSupervisor}
                    onChange={(e) => setNotaSupervisor(e.target.value)}
                    placeholder="Instrucciones, contexto previo..."
                    disabled={camposBloqueados}
                  />
                </div>

                {/* Nota técnico */}
                <div className="space-y-2">
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nota del técnico
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 disabled:bg-gray-100 disabled:text-gray-500"
                    rows={4}
                    value={notaTecnico}
                    onChange={(e) => setNotaTecnico(e.target.value)}
                    placeholder="Hallazgos, estado en sitio, etc."
                    disabled={notaTecnicoDisabled}
                  />
                  <p className="text-[11px]/5 text-gray-500">
                    Esta nota también se usa en Check-in /
                    Check-out.
                  </p>
                </div>
              </div>

              {/* Columna DER: mapa */}
              <div className="flex flex-col">
                <label className="block text-sm/5 font-medium text-gray-900 mb-2">
                  Ubicación del cliente
                </label>

                <MapPreviewLite
                  lat={visita?.cliente?.lat}
                  lng={visita?.cliente?.lng}
                  label={visita?.cliente?.nombre || 'Cliente'}
                  direccion={visita?.cliente?.direccion || null}
                />

                <p className="mt-2 text-[11px]/5 text-gray-500">
                  Vista previa de la dirección del cliente. El técnico
                  puede abrir la ruta en Google Maps o Waze.
                </p>
              </div>

              {/* feedback general */}
              {mensaje && (
                <div className="lg:col-span-2 text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </div>
              )}

              {/* botones guardar / volver */}
              <div className="lg:col-span-2 pt-2 flex flex-col gap-3 sm:flex-row">
                {!visitaCerrada && (
                  <Button
                    type="submit"
                    className="sm:w-auto w-full"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                )}

                <Button
                  variant="secondary"
                  href="/visitas"
                  className="sm:w-auto w-full"
                >
                  Volver
                </Button>
              </div>
            </form>
          </section>

          {/* EVIDENCIAS */}
          <section className="mt-10 max-w-4xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <h2 className="text-sm/6 font-medium text-gray-900">
              Evidencias
            </h2>

            {(!visita?.evidencias ||
              visita.evidencias.length === 0) && (
              <div className="mt-4 text-sm/6 text-gray-500">
                Sin evidencias adjuntas.
              </div>
            )}

            {visita?.evidencias &&
              visita.evidencias.length > 0 && (
                <ul className="mt-4 flex flex-col gap-4">
                  {visita.evidencias.map((ev) => (
                    <li
                      key={ev.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5"
                    >
                      <div className="text-sm/6 text-gray-900 font-medium break-words">
                        {ev.tipo ?? 'Evidencia'}
                      </div>
                      <div className="text-xs/5 text-gray-600 break-all">
                        URL: {ev.url}
                      </div>
                      {ev.descripcion && (
                        <div className="text-xs/5 text-gray-500 break-words mt-1">
                          {ev.descripcion}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </Container>
      </main>
    </RequireAuth>
  )
}
