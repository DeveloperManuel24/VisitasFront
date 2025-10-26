'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'
import { useAuth } from '@/app/components/auth-context'

import { crearVisita } from '../../../../api/visitas/apiVisitas'
import {
  listarClientes,
  type ClienteItem,
} from '../../../../api/clientes/apiClientes'
import { listarUsuarios } from '../../../../api/usuarios/apiUsuarios'

/* -------------------------------------------------
 * Mini-mapa preview sin API key, usando iframe Maps
 * ------------------------------------------------- */
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
              <div className="text-gray-900 font-medium">
                {label}
              </div>
              {direccion && (
                <div className="text-gray-500 break-words">
                  {direccion}
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              Selecciona un cliente para ver ubicación.
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
      {/* mapa */}
      <iframe
        src={gmapsEmbed}
        className="h-64 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* footer con info / acciones */}
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

/* -------------------------------------------------
 * helper: determina si un usuario tiene un rol X
 * ------------------------------------------------- */
function userHasRol(user: any, rolBuscado: 'SUPERVISOR' | 'TECNICO') {
  if (!user || !Array.isArray(user.usuariosRoles)) return false
  return user.usuariosRoles.some(
    (ur: any) => ur?.rol?.nombre?.toUpperCase() === rolBuscado,
  )
}

/* -------------------------------------------------
 * SelectRolUsuario
 * ------------------------------------------------- */
function SelectRolUsuario({
  label,
  roleFilter,
  hint,
  value,
  onChange,
}: {
  label: string
  roleFilter: 'SUPERVISOR' | 'TECNICO'
  hint: string
  value: string
  onChange: (newId: string) => void
}) {
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const run = async () => {
      setCargando(true)
      try {
        const res = await listarUsuarios()
        const lista = Array.isArray(res?.data) ? res.data : []
        const filtrados = lista.filter((u: any) =>
          userHasRol(u, roleFilter),
        )
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
        className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <option value="">
          — seleccionar {roleFilter.toLowerCase()} —
        </option>

        {cargando ? (
          <option disabled>Cargando...</option>
        ) : usuariosFiltrados.length === 0 ? (
          <option disabled>Sin resultados</option>
        ) : (
          usuariosFiltrados.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre || 'Sin nombre'}
            </option>
          ))
        )}
      </select>

      <p className="text-[11px]/5 text-gray-500">{hint}</p>
    </div>
  )
}

/* -------------------------------------------------
 * SelectCliente con buscador live
 * ------------------------------------------------- */
function SelectCliente({
  value,
  onChange,
  onClienteSelect,
}: {
  value: string
  onChange: (newId: string) => void
  onClienteSelect: (c: ClienteItem | null) => void
}) {
  const [clientes, setClientes] = useState<ClienteItem[]>([])
  const [cargando, setCargando] = useState(false)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    const run = async () => {
      setCargando(true)
      try {
        const { data } = await listarClientes({
          page: 1,
          limit: 200,
          q: filtro || undefined,
        })

        const lista = Array.isArray(data) ? data : []
        setClientes(lista)
      } catch (err) {
        console.error('Error cargando clientes:', err)
        setClientes([])
      } finally {
        setCargando(false)
      }
    }

    run()
  }, [filtro])

  function handleSelect(id: string) {
    onChange(id)

    const found = clientes.find((c) => c.id === id) ?? null
    onClienteSelect(found)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm/5 font-medium text-gray-900">
        Cliente / Agencia <span className="text-red-600">*</span>
      </label>

      {/* buscador inline */}
      <input
        className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar cliente por nombre, NIT, dirección..."
      />

      <select
        className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
        value={value}
        onChange={(e) => handleSelect(e.target.value)}
        required
      >
        <option value="">— seleccionar cliente —</option>

        {cargando ? (
          <option disabled>Cargando...</option>
        ) : clientes.length === 0 ? (
          <option disabled>Sin resultados</option>
        ) : (
          clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre ?? 'Sin nombre'}
            </option>
          ))
        )}
      </select>

      <p className="text-[11px]/5 text-gray-500">
        Se enviará como <b>clienteId</b>.
      </p>
    </div>
  )
}

/* ======================================================
 * Página principal: CrearVisitaPage
 * ====================================================== */
export default function CrearVisitaPage() {
  const router = useRouter()
  const { roles } = useAuth()

  // gate de acceso: solo ADMINISTRADOR o SUPERVISOR crean visitas
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!roles || roles.length === 0) return
    const upper = roles.map((r) => r.toUpperCase())
    if (!upper.includes('ADMINISTRADOR') && !upper.includes('SUPERVISOR')) {
      router.replace('/unauthorized')
      return
    }
    setReady(true)
  }, [roles, router])

  // estado del formulario
  const [clienteId, setClienteId] = useState('')
  const [clienteSel, setClienteSel] = useState<ClienteItem | null>(null)

  const [supervisorId, setSupervisorId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')

  const [scheduledAt, setScheduledAt] = useState('') // datetime-local
  const [notaSupervisor, setNotaSupervisor] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    if (!clienteId || !supervisorId || !tecnicoId || !scheduledAt) {
      setMensaje('❌ Faltan datos obligatorios.')
      setGuardando(false)
      return
    }

    try {
      const iso = new Date(scheduledAt).toISOString()

      await crearVisita({
        clienteId,
        supervisorId,
        tecnicoId,
        scheduledAt: iso,
        notaSupervisor: notaSupervisor || null,
      })

      router.push('/visitas')
    } catch (err) {
      console.error('Error creando visita:', err)
      setMensaje('❌ Error al crear la visita.')
      setGuardando(false)
    }
  }

  if (!ready) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950 flex items-center justify-center text-xs text-zinc-500">
          Verificando acceso…
        </main>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
        {/* Navbar */}
        <Container>
          <Navbar
            banner={
              <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                Nueva Visita — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* header */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <Subheading>OPERACIÓN</Subheading>
              <Heading as="h1" className="mt-2 text-balance">
                Programar nueva visita
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Define cliente, responsable y horario.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" href="/visitas">
                  ← Volver a Visitas
                </Button>
              </div>
            </div>
          </div>

          {/* Card principal */}
          <section className="mt-10 rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            {/* grid responsiva: izquierda form, derecha mapa */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {/* ======= COLUMNA IZQUIERDA ======= */}
              <div className="space-y-5">
                {/* Cliente */}
                <SelectCliente
                  value={clienteId}
                  onChange={setClienteId}
                  onClienteSelect={setClienteSel}
                />

                {/* Supervisor */}
                <SelectRolUsuario
                  label="Supervisor asignado"
                  roleFilter="SUPERVISOR"
                  hint="Solo se muestran usuarios con rol SUPERVISOR."
                  value={supervisorId}
                  onChange={setSupervisorId}
                />

                {/* Técnico */}
                <SelectRolUsuario
                  label="Técnico asignado"
                  roleFilter="TECNICO"
                  hint="Solo se muestran usuarios con rol TECNICO."
                  value={tecnicoId}
                  onChange={setTecnicoId}
                />

                {/* Fecha/Hora programada */}
                <div className="space-y-2">
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Fecha y hora programada{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                {/* Nota supervisor */}
                <div className="space-y-2">
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nota del supervisor
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    rows={5}
                    value={notaSupervisor}
                    onChange={(e) => setNotaSupervisor(e.target.value)}
                    placeholder="Instrucciones iniciales, contexto, riesgos, etc."
                  />
                </div>
              </div>

              {/* ======= COLUMNA DERECHA (MAPA) ======= */}
              <div className="flex flex-col">
                <label className="block text-sm/5 font-medium text-gray-900 mb-2">
                  Ubicación del cliente
                </label>

                <MapPreviewLite
                  lat={clienteSel?.lat}
                  lng={clienteSel?.lng}
                  label={clienteSel?.nombre || 'Cliente'}
                  direccion={clienteSel?.direccion || null}
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

              {/* botones */}
              <div className="lg:col-span-2 pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="sm:w-auto w-full"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Crear visita'}
                </Button>

                <Button
                  variant="secondary"
                  href="/visitas"
                  className="sm:w-auto w-full"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </section>
        </Container>
      </main>
    </RequireAuth>
  )
}
