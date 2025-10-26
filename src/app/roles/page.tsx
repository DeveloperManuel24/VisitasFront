'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'

import { listarRoles, eliminarRol } from '../../../api/roles/apiRoles'
import RequireAuth from '@/app/components/require-auth'
import { useAuth } from '@/app/components/auth-context'

type RolItem = {
  id?: string | number
  nombre?: string
  descripcion?: string
  [key: string]: any
}

/**
 * VISIBILIDAD:
 * - ADMINISTRADOR ✅
 * - SUPERVISOR ❌
 * - TECNICO ❌
 */
export default function RolesPage() {
  const router = useRouter()
  const { roles } = useAuth()

  const [rolesData, setRolesData] = useState<RolItem[]>([])
  const [cargando, setCargando] = useState(false)
  const [ready, setReady] = useState(false) // ya confirmé que sí es admin
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // gate sólo ADMINISTRADOR
  useEffect(() => {
    if (!roles || roles.length === 0) {
      return
    }

    if (!roles.includes('ADMINISTRADOR')) {
      router.replace('/unauthorized')
      return
    }

    setReady(true)
  }, [roles, router])

  async function refrescarRoles() {
    try {
      setCargando(true)
      setErrorMsg(null)

      const data = await listarRoles()

      // si el backend tiró 401/403 lo marcamos
      if (data && typeof data === 'object' && (data as any).__authError) {
        setErrorMsg('No estás autorizado para ver roles.')
        // opcional: router.replace('/unauthorized')
        setRolesData([])
        return
      }

      setRolesData(Array.isArray(data) ? data : [])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (ready) {
      refrescarRoles()
    }
  }, [ready])

  // Mientras no confirmamos que es admin
  if (!ready) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950 flex items-center justify-center text-xs text-zinc-500">
          Verificando acceso…
        </main>
      </RequireAuth>
    )
  }

  async function handleEliminar(id: string | number | undefined) {
    if (!id) return
    const ok = window.confirm('¿Eliminar este rol?')
    if (!ok) return
    try {
      await eliminarRol(String(id))
      await refrescarRoles()
    } catch (err: any) {
      console.error('Error eliminando rol:', err)
      setErrorMsg(
        err?.message ||
          'No se pudo eliminar el rol (¿tienes permiso?).',
      )
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
                Admin de Roles — SkyNet Visitas
              </div>
            }
          />
        </Container>

        {/* Contenido */}
        <Container className="pb-24">
          {/* Encabezado */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Subheading>SEGURIDAD</Subheading>
              <Heading as="h1" className="mt-2">
                Roles y permisos
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Lista de perfiles de acceso del sistema (visitas, clientes,
                usuarios, etc.).
              </p>
            </div>

            <div className="flex-shrink-0">
              <Button href="/roles/crear">+ Nuevo rol</Button>
            </div>
          </div>

          {/* Lista / Tabla */}
          <section className="mt-10 rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-sm/6 font-medium text-gray-950">
                Lista de roles
              </h2>

              <div className="text-xs/5 text-gray-500">
                {cargando
                  ? 'Cargando...'
                  : `${rolesData.length} rol${
                      rolesData.length === 1 ? '' : 'es'
                    } encontrados`}
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 text-sm/6 font-medium text-red-600">
                ❌ {errorMsg}
              </div>
            )}

            {/* --- VISTA MOBILE (cards) --- */}
            <ul className="mt-6 flex flex-col gap-4 lg:hidden">
              {rolesData.length === 0 && !cargando ? (
                <li className="text-center py-8 text-gray-400 text-sm/6">
                  No hay roles registrados.
                </li>
              ) : (
                rolesData.map((rol, i) => (
                  <li
                    key={rol.id ?? i}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5"
                  >
                    {/* Título + ID */}
                    <div className="flex flex-col">
                      <div className="text-base/6 font-medium text-gray-900 break-words">
                        {rol.nombre ?? rol.name ?? '—'}
                      </div>

                      <div className="text-xs/5 text-gray-500 break-words mt-1">
                        {rol.descripcion ?? rol.description ?? '—'}
                      </div>

                      <div className="text-[10px]/4 text-gray-400 break-all mt-2">
                        ID: {rol.id ?? '—'}
                      </div>
                    </div>

                    {/* Botones acción */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="secondary"
                        href={`/roles/${rol.id}/editar`}
                        className="px-4 py-2 text-sm/6 sm:w-auto w-full"
                      >
                        Editar
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleEliminar(rol.id)}
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

            {/* --- VISTA DESKTOP (tabla) --- */}
            <div className="mt-6 overflow-x-auto hidden lg:block">
              <table className="w-full min-w-[500px] text-left text-sm/6 text-gray-700">
                <thead className="border-b border-gray-200 text-[11px]/5 uppercase text-gray-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">ID</th>
                    <th className="pb-2 pr-4 font-medium">Nombre</th>
                    <th className="pb-2 pr-4 font-medium">Descripción</th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="align-top">
                  {rolesData.length === 0 && !cargando ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-400 text-sm/6"
                      >
                        No hay roles registrados.
                      </td>
                    </tr>
                  ) : (
                    rolesData.map((rol, i) => (
                      <tr
                        key={rol.id ?? i}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 pr-4 tabular-nums font-medium text-gray-900">
                          {rol.id ?? '—'}
                        </td>
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {rol.nombre ?? rol.name ?? '—'}
                        </td>
                        <td className="py-3 pr-4 max-w-[24rem] text-gray-600">
                          {rol.descripcion ?? rol.description ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <div className="flex justify-start gap-4 sm:justify-end sm:gap-3">
                            <Button
                              variant="secondary"
                              href={`/roles/${rol.id}/editar`}
                              className="px-4 py-2 text-sm/6"
                            >
                              Editar
                            </Button>

                            <Button
                              variant="secondary"
                              onClick={() => handleEliminar(rol.id)}
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
