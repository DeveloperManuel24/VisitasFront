'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  obtenerClientePorId,
  actualizarCliente,
} from '../../../../../api/clientes/apiClientes'

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
      <div className="overflow-hidden rounded-lg ring-1 ring-black/10 shadow-sm bg-gray-100 text-gray-500">
        <div className="flex h-48 w-full items-center justify-center text-xs/5">
          Sin coordenadas del cliente.
        </div>
        <div className="border-t border-black/5 bg-white px-3 py-2 text-[11px]/5 text-gray-600">
          <div className="text-gray-900 font-medium">
            {label ?? 'Cliente'}
          </div>
          {direccion && (
            <div className="text-gray-500 break-words">{direccion}</div>
          )}
        </div>
      </div>
    )
  }

  const latVal = typeof latNum === 'number' ? latNum : 0
  const lngVal = typeof lngNum === 'number' ? lngNum : 0

  const gmapsEmbed = `https://www.google.com/maps?q=${latVal},${lngVal}&z=16&output=embed`
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latVal},${lngVal}`
  const wazeUrl = `https://waze.com/ul?ll=${latVal},${lngVal}&navigate=yes`

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-black/10 shadow-sm bg-white">
      <iframe
        src={gmapsEmbed}
        className="h-48 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex flex-col gap-2 border-t border-black/5 bg-white px-3 py-2 text-[11px]/5 text-gray-600">
        <div className="text-gray-900 font-medium">
          {label ?? 'Cliente'}
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

type PropsEditarCliente = {
  params: { id: string }
}

/**
 * VISIBILIDAD:
 * - ADMINISTRADOR ✅
 * - SUPERVISOR ✅
 * - TECNICO ❌ (RequireAuth lo bloquea)
 */
export default function EditarClientePage({ params }: PropsEditarCliente) {
  const [id] = useState(() => params?.id ?? '')
  const router = useRouter()

  // form
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [nit, setNit] = useState('')
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')

  // geocoding
  const [searchUbicacion, setSearchUbicacion] = useState('')
  const [geoMsg, setGeoMsg] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const geocodeTimeoutRef = useRef<number | null>(null)

  // ui
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // cargar cliente inicial
  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      try {
        const data = await obtenerClientePorId(id)
        if (!data) {
          setMensaje('No se encontró el cliente')
          setCargando(false)
          return
        }

        setNombre(data.nombre ?? '')
        setDireccion(data.direccion ?? '')
        setTelefono(data.telefono ?? '')
        setCorreo(data.correo ?? '')
        setNit(data.nit ?? '')
        setLat(
          data.lat !== undefined && data.lat !== null
            ? String(data.lat)
            : '',
        )
        setLng(
          data.lng !== undefined && data.lng !== null
            ? String(data.lng)
            : '',
        )
      } catch (err) {
        console.error('Error cargando cliente:', err)
        setMensaje('Error cargando datos del cliente')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  // geocoding debounce
  useEffect(() => {
    if (!searchUbicacion.trim()) {
      setGeoMsg(null)
      return
    }

    if (geocodeTimeoutRef.current) {
      window.clearTimeout(geocodeTimeoutRef.current)
    }

    geocodeTimeoutRef.current = window.setTimeout(async () => {
      try {
        setGeocoding(true)
        setGeoMsg('Buscando ubicación…')

        const q = encodeURIComponent(searchUbicacion.trim())
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error('falló geocoding')
        }

        const results = await res.json()

        if (!Array.isArray(results) || results.length === 0) {
          setGeoMsg('No se encontró la dirección 😕')
          return
        }

        const best = results[0]
        if (best?.lat && best?.lon) {
          setLat(String(best.lat))
          setLng(String(best.lon))
          setGeoMsg('Ubicación encontrada ✔')
        } else {
          setGeoMsg('Respuesta sin coordenadas')
        }
      } catch (err) {
        console.error('Error geocoding:', err)
        setGeoMsg('Error buscando ubicación')
      } finally {
        setGeocoding(false)
      }
    }, 800) as unknown as number

    return () => {
      if (geocodeTimeoutRef.current) {
        window.clearTimeout(geocodeTimeoutRef.current)
      }
    }
  }, [searchUbicacion])

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return

    setGuardando(true)
    setMensaje(null)

    try {
      await actualizarCliente(id, {
        nombre,
        direccion: direccion || null,
        telefono: telefono || null,
        correo: correo || null,
        nit: nit || null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
      })

      setMensaje('✅ Cambios guardados correctamente.')
    } catch (err: any) {
      console.error('Error actualizando cliente:', err)

      const detalleBackend =
        err?.response?.data?.message ??
        err?.message ??
        'Error al guardar cambios.'

      setMensaje(`❌ ${detalleBackend}`)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar />
          </Container>
          <Container className="py-24 text-sm/6 text-gray-500">
            Cargando cliente...
          </Container>
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
                Editar Cliente — SkyNet Visitas
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
                Editar cliente
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Actualiza datos básicos, contacto y ubicación del sitio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" href="/clientes">
                  ← Volver a Clientes
                </Button>
              </div>
            </div>
          </div>

          {/* Card principal */}
          <section className="mt-10 max-w-4xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <form
              onSubmit={handleGuardar}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {/* Columna izquierda */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nombre del cliente / agencia
                  </label>
                  <input
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Dirección / punto de servicio
                  </label>
                  <textarea
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    rows={3}
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder={`Cañadas del valle manzana E lote 12
zona 5 Villa Nueva, portón negro, casa esquina`}
                  />
                  <p className="mt-2 text-[11px]/5 text-gray-500">
                    Descripción humana para el técnico. Ej: "portón azul",
                    "tercer nivel", etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    NIT
                  </label>
                  <input
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="1234567-8"
                  />
                </div>

                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Teléfono
                  </label>
                  <input
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="54215106"
                  />
                </div>

                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Correo de contacto
                  </label>
                  <input
                    type="email"
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="contacto@acme.com"
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Buscar ubicación en mapa
                  </label>
                  <input
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={searchUbicacion}
                    onChange={(e) => setSearchUbicacion(e.target.value)}
                    placeholder="Ej. Cañadas del Valle manzana E lote 12 zona 5 Villa Nueva"
                  />
                  {searchUbicacion && (
                    <p className="mt-2 text-[11px]/5 text-gray-600">
                      {geocoding
                        ? 'Buscando ubicación…'
                        : geoMsg || 'Esperando resultados…'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm/5 font-medium text-gray-900">
                      Latitud
                    </label>
                    <input
                      className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="14.613333"
                    />
                  </div>

                  <div>
                    <label className="block text-sm/5 font-medium text-gray-900">
                      Longitud
                    </label>
                    <input
                      className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="-90.535556"
                    />
                  </div>
                </div>

                <MapPreviewLite
                  lat={lat}
                  lng={lng}
                  label={nombre || 'Cliente'}
                  direccion={direccion || null}
                />

                <p className="text-[11px]/5 text-gray-500">
                  Vista previa de la ubicación. El técnico podrá abrir la ruta
                  en Google Maps o Waze.
                </p>
              </div>

              {mensaje && (
                <div className="lg:col-span-2 text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </div>
              )}

              <div className="lg:col-span-2 pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="sm:w-auto w-full"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Button>

                <Button
                  variant="secondary"
                  href="/clientes"
                  className="sm:w-auto w-full"
                >
                  Volver
                </Button>
              </div>
            </form>
          </section>
        </Container>
      </main>
    </RequireAuth>
  )
}
