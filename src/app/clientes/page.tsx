'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

// Estos imports asumen que tu carpeta api está en src/app/api/Auth/... etc
// Ajustá la ruta si tu árbol real es distinto
import {
  listarClientes,
  eliminarCliente,
} from '../../../api/clientes/apiClientes'
import type { ClienteItem } from '../../../api/clientes/apiClientes'

/**
 * VISIBILIDAD:
 * - ADMINISTRADOR ✅
 * - SUPERVISOR ✅
 * - TECNICO ❌ (RequireAuth lo bloquea porque /clientes no es /visitas-tecnico)
 */
export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteItem[]>([])
  const [cargando, setCargando] = useState(false)

  async function refrescar() {
    try {
      setCargando(true)
      const { data } = await listarClientes({
        page: 1,
        limit: 50,
      })
      setClientes(Array.isArray(data) ? data : [])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    refrescar()
  }, [])

  async function handleEliminar(id: string) {
    const ok = window.confirm('¿Eliminar este cliente?')
    if (!ok) return
    try {
      await eliminarCliente(id)
      await refrescar()
    } catch (err) {
      console.error('Error eliminando cliente:', err)
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
                Admin de Clientes — SkyNet Visitas
              </div>
            }
          />
        </Container>

        {/* Contenido */}
        <Container className="pb-24">
          {/* Header */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Subheading>OPERACIÓN</Subheading>
              <Heading as="h1" className="mt-2">
                Clientes registrados
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Aquí administras las agencias / puntos de visita, su NIT y la
                ubicación.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Button href="/clientes/crear">+ Nuevo cliente</Button>
            </div>
          </div>

          {/* Wrapper tabla/lista */}
          <section className="mt-10 rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-sm/6 font-medium text-gray-950">
                Lista de clientes
              </h2>

              <div className="text-xs/5 text-gray-500">
                {cargando
                  ? 'Cargando...'
                  : `${clientes.length} cliente${
                      clientes.length === 1 ? '' : 's'
                    } encontrados`}
              </div>
            </div>

            {/* --- MOBILE cards --- */}
            <ul className="mt-6 flex flex-col gap-4 lg:hidden">
              {clientes.length === 0 && !cargando ? (
                <li className="text-center py-8 text-gray-400 text-sm/6">
                  No hay clientes registrados.
                </li>
              ) : (
                clientes.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5"
                  >
                    {/* Datos principales */}
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 break-words">
                          {c.nombre || '—'}
                        </div>

                        {c.direccion && (
                          <div className="text-xs/5 text-gray-600 break-words mt-1">
                            {c.direccion}
                          </div>
                        )}

                        <div className="mt-1 text-xs/5 text-gray-500 break-all">
                          {c.telefono ? `Tel: ${c.telefono}` : ''}
                          {c.telefono && c.correo ? ' · ' : ''}
                          {c.correo ? c.correo : ''}
                        </div>

                        <div className="mt-1 text-xs/5 text-gray-500 break-all">
                          {c.nit ? `NIT: ${c.nit}` : ''}
                        </div>

                        {(c.lat || c.lng) && (
                          <div className="mt-1 text-[10px]/4 text-gray-400 break-all">
                            GPS: {c.lat ?? '—'}, {c.lng ?? '—'}
                          </div>
                        )}

                        <div className="mt-1 text-[10px]/4 text-gray-400 break-all">
                          ID: {c.id}
                        </div>
                      </div>
                    </div>

                    {/* Última actualización */}
                    <div className="mt-4 grid grid-cols-1 gap-4 text-sm/6 text-gray-700 sm:grid-cols-2">
                      <div>
                        <div className="text-[11px]/5 uppercase text-gray-500 font-medium">
                          Última actualización
                        </div>
                        <div className="mt-1 text-gray-700 text-sm/6">
                          {c.actualizadoEn
                            ? new Date(c.actualizadoEn).toLocaleString()
                            : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Botones acción */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="secondary"
                        href={`/clientes/${c.id}/editar`}
                        className="px-4 py-2 text-sm/6 sm:w-auto w-full"
                      >
                        Editar
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleEliminar(c.id)}
                        className={[
                          'px-4 py-2 text-sm/6 sm:w-auto w-full',
                          'text-red-600 ring-red-200',
                          'data-hover:bg-red-50 data-hover:text-red-700 data-hover:ring-red-300',
                          'focus-visible:outline-red-600',
                        ].join(' ')}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {/* --- DESKTOP table --- */}
            <div className="mt-6 overflow-x-auto hidden lg:block">
              <table className="w-full min-w-[760px] text-left text-sm/6 text-gray-700">
                <thead className="border-b border-gray-200 text-[11px]/5 uppercase text-gray-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Cliente</th>
                    <th className="pb-2 pr-4 font-medium">
                      Contacto / Dirección
                    </th>
                    <th className="pb-2 pr-4 font-medium">Ubicación</th>
                    <th className="pb-2 pr-4 font-medium">Actualización</th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="align-top">
                  {clientes.length === 0 && !cargando ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400 text-sm/6"
                      >
                        No hay clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    clientes.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        {/* Cliente */}
                        <td className="py-3 pr-4 align-top text-gray-900 font-medium">
                          <div className="font-medium text-gray-900">
                            {c.nombre || '—'}
                          </div>
                          <div className="text-xs/5 text-gray-500 break-words mt-1">
                            {c.nit ? `NIT: ${c.nit}` : '—'}
                          </div>
                          <div className="text-[10px]/4 text-gray-400 mt-1">
                            ID: {c.id}
                          </div>
                        </td>

                        {/* Contacto */}
                        <td className="py-3 pr-4 align-top">
                          <div className="text-gray-900 font-medium">
                            {c.telefono || c.correo
                              ? [c.telefono, c.correo]
                                  .filter(Boolean)
                                  .join(' · ')
                              : '—'}
                          </div>
                          <div className="text-xs/5 text-gray-500 break-words mt-1 max-w-[260px]">
                            {c.direccion ?? '—'}
                          </div>
                        </td>

                        {/* Ubicación */}
                        <td className="py-3 pr-4 align-top">
                          <div className="text-gray-900 font-medium">
                            {c.lat || c.lng
                              ? `${c.lat ?? '—'}, ${c.lng ?? '—'}`
                              : '—'}
                          </div>
                        </td>

                        {/* Fecha actualización */}
                        <td className="py-3 pr-4 align-top text-gray-700">
                          {c.actualizadoEn
                            ? new Date(c.actualizadoEn).toLocaleString()
                            : '—'}
                        </td>

                        {/* Acciones */}
                        <td className="py-3 pr-4 text-right align-top">
                          <div className="flex justify-start gap-4 sm:justify-end sm:gap-3">
                            <Button
                              variant="secondary"
                              href={`/clientes/${c.id}/editar`}
                              className="px-4 py-2 text-sm/6"
                            >
                              Editar
                            </Button>

                            <Button
                              variant="secondary"
                              onClick={() => handleEliminar(c.id)}
                              className={[
                                'px-4 py-2 text-sm/6',
                                'text-red-600 ring-red-200',
                                'data-hover:bg-red-50 data-hover:text-red-700 data-hover:ring-red-300',
                                'focus-visible:outline-red-600',
                              ].join(' ')}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </Container>
      </main>
    </RequireAuth>
  )
}
