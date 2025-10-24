'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  listarUsuarios,
  eliminarUsuario,
} from '../../../api/usuarios/apiUsuarios'

type RolLite = {
  id: string
  nombre: string
}

type UsuarioItem = {
  id: string
  nombre: string
  email: string
  activo: boolean
  supervisor?: {
    id: string
    nombre: string
  } | null
  usuariosRoles?: { rol: RolLite }[]
  fotoBase64?: string | null
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [cargando, setCargando] = useState(false)

  async function refrescar() {
    try {
      setCargando(true)

      const { data } = await listarUsuarios({
        page: 1,
        limit: 50,
      })

      setUsuarios(Array.isArray(data) ? data : [])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    refrescar()
  }, [])

  async function handleEliminar(id: string) {
    const ok = window.confirm('¿Eliminar este usuario?')
    if (!ok) return
    try {
      await eliminarUsuario(id)
      await refrescar()
    } catch (err) {
      console.error('Error eliminando usuario:', err)
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
                Admin de Usuarios — SkyNet Visitas
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
                Usuarios del sistema
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Personal operativo, supervisores y administradores. Desde aquí
                puedes gestionar accesos.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Button href="/usuarios/crear">+ Nuevo usuario</Button>
            </div>
          </div>

          {/* Wrapper tabla / lista */}
          <section className="mt-10 rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-sm/6 font-medium text-gray-950">
                Lista de usuarios
              </h2>

              <div className="text-xs/5 text-gray-500">
                {cargando
                  ? 'Cargando...'
                  : `${usuarios.length} usuario${
                      usuarios.length === 1 ? '' : 's'
                    } encontrados`}
              </div>
            </div>

            {/* --- Vista MOBILE (cards) --- */}
            <ul className="mt-6 flex flex-col gap-4 lg:hidden">
              {usuarios.length === 0 && !cargando ? (
                <li className="text-center py-8 text-gray-400 text-sm/6">
                  No hay usuarios registrados.
                </li>
              ) : (
                usuarios.map((u) => {
                  const rolesList =
                    u.usuariosRoles && u.usuariosRoles.length > 0
                      ? u.usuariosRoles.map((ur) => ur.rol?.nombre).filter(Boolean)
                      : []

                  return (
                    <li
                      key={u.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5"
                    >
                      {/* fila superior: avatar + nombre/email + estado pill */}
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 ring-1 ring-black/10 flex items-center justify-center text-[10px] text-gray-400">
                          {u.fotoBase64 ? (
                            <img
                              src={u.fotoBase64}
                              alt={u.nombre || 'usuario'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src="/avatar-default.png"
                              alt="sin foto"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 break-words">
                                {u.nombre || '—'}
                              </div>
                              <div className="text-xs/5 text-gray-500 break-all">
                                {u.email || '—'}
                              </div>
                              <div className="text-[10px]/4 text-gray-400 break-all">
                                ID: {u.id}
                              </div>
                            </div>

                            <div>
                              {u.activo ? (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-[2px] text-[11px]/4 font-medium text-green-700 ring-1 ring-green-200">
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-[2px] text-[11px]/4 font-medium text-gray-600 ring-1 ring-gray-200">
                                  Inactivo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rol principal / Supervisor */}
                      <div className="mt-4 grid grid-cols-1 gap-4 text-sm/6 text-gray-700 sm:grid-cols-2">
                        <div>
                          <div className="text-[11px]/5 uppercase text-gray-500 font-medium">
                            Rol(es)
                          </div>
                          {rolesList.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {rolesList.map((rolName, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px]/4 text-gray-700 ring-1 ring-gray-200"
                                >
                                  {rolName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1 text-gray-400 text-sm/6">
                              Sin rol
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[11px]/5 uppercase text-gray-500 font-medium">
                            Supervisor
                          </div>
                          {u.supervisor ? (
                            <div className="mt-1">
                              <div className="font-medium text-gray-900">
                                {u.supervisor.nombre ?? '—'}
                              </div>
                              <div className="text-[10px]/4 text-gray-400 break-all">
                                {u.supervisor.id}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1 text-gray-400 text-sm/6">
                              —
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones acción */}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Button
                          variant="secondary"
                          href={`/usuarios/${u.id}/editar`}
                          className="px-4 py-2 text-sm/6 sm:w-auto w-full"
                        >
                          Editar
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => handleEliminar(u.id)}
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
                  )
                })
              )}
            </ul>

            {/* --- Vista DESKTOP (tabla) --- */}
            <div className="mt-6 overflow-x-auto hidden lg:block">
              <table className="w-full min-w-[700px] text-left text-sm/6 text-gray-700">
                <thead className="border-b border-gray-200 text-[11px]/5 uppercase text-gray-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Usuario</th>
                    <th className="pb-2 pr-4 font-medium">Rol(es)</th>
                    <th className="pb-2 pr-4 font-medium">Supervisor</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="align-top">
                  {usuarios.length === 0 && !cargando ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400 text-sm/6"
                      >
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        {/* Usuario / foto / email */}
                        <td className="py-3 pr-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden ring-1 ring-black/10 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                              {u.fotoBase64 ? (
                                <img
                                  src={u.fotoBase64}
                                  alt={u.nombre || 'usuario'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <img
                                  src="/avatar-default.png"
                                  alt="sin foto"
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-medium text-gray-900">
                                {u.nombre || '—'}
                              </div>
                              <div className="text-xs/5 text-gray-500 break-all">
                                {u.email || '—'}
                              </div>
                              <div className="text-[10px]/4 text-gray-400">
                                ID: {u.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="py-3 pr-4 text-gray-900 font-medium align-top">
                          {u.usuariosRoles && u.usuariosRoles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {u.usuariosRoles.map((ur, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px]/4 text-gray-700 ring-1 ring-gray-200"
                                >
                                  {ur.rol?.nombre ?? '—'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin rol</span>
                          )}
                        </td>

                        {/* Supervisor */}
                        <td className="py-3 pr-4 text-gray-700 align-top">
                          {u.supervisor ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {u.supervisor.nombre ?? '—'}
                              </div>
                              <div className="text-[10px]/4 text-gray-400">
                                {u.supervisor.id}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-3 pr-4 align-top">
                          {u.activo ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-[2px] text-[11px]/4 font-medium text-green-700 ring-1 ring-green-200">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-[2px] text-[11px]/4 font-medium text-gray-600 ring-1 ring-gray-200">
                              Inactivo
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3 pr-4 text-right align-top">
                          <div className="flex justify-start gap-4 sm:justify-end sm:gap-3">
                            <Button
                              variant="secondary"
                              href={`/usuarios/${u.id}/editar`}
                              className="px-4 py-2 text-sm/6"
                            >
                              Editar
                            </Button>

                            <Button
                              variant="secondary"
                              onClick={() => handleEliminar(u.id)}
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
