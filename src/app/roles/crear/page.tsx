'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'

import { crearRol } from '../../../../api/roles/apiRoles'
import RequireAuth from '@/app/components/require-auth'
import { useAuth } from '@/app/components/auth-context'

/**
 * VISIBILIDAD:
 * - ADMINISTRADOR ✅
 * - SUPERVISOR ❌
 * - TECNICO ❌
 */
export default function CrearRolPage() {
  const router = useRouter()
  const { roles } = useAuth()

  const [ready, setReady] = useState(false)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // gate admin
  useEffect(() => {
    if (!roles || roles.length === 0) return
    if (!roles.includes('ADMINISTRADOR')) {
      router.replace('/unauthorized')
      return
    }
    setReady(true)
  }, [roles, router])

  const handleCrearRol = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    try {
      setGuardando(true)
      setMensaje(null)

      await crearRol({
        nombre,
        descripcion,
      })

      setMensaje('✅ Rol creado con éxito.')

      setNombre('')
      setDescripcion('')
    } catch (err: any) {
      console.error('Error creando rol:', err)
      setMensaje(
        err?.message || '❌ Error al crear el rol (permiso?).',
      )
    } finally {
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
        {/* Navbar arriba */}
        <Container>
          <Navbar
            banner={
              <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                Crear Rol — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* Encabezado + Regresar */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Subheading>Seguridad</Subheading>
              <Heading as="h1" className="mt-2">
                Nuevo Rol
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Define un nombre y una descripción. Este rol luego se puede
                asignar a usuarios.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" href="/roles">
                ← Volver a Roles
              </Button>
            </div>
          </div>

          {/* Formulario */}
          <section className="mt-10 max-w-xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <h2 className="text-base/6 font-medium text-gray-950">
              Datos del rol
            </h2>
            <p className="mt-1 text-sm/5 text-gray-600">
              Usa un nombre claro. Ej: “Supervisor Campo”, “Auditor”,
              “Backoffice”.
            </p>

            <form onSubmit={handleCrearRol} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm/5 font-medium text-gray-900">
                  Nombre del rol
                </label>
                <input
                  className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder='Ej. "SupervisorCampo" o "Auditor"'
                  required
                />
              </div>

              <div>
                <label className="block text-sm/5 font-medium text-gray-900">
                  Descripción
                </label>
                <textarea
                  className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Acceso a visitas y evidencias; sin acceso a usuarios."
                  rows={3}
                />
              </div>

              {mensaje && (
                <div className="text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="sm:w-auto w-full"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar rol'}
                </Button>

                <Button
                  variant="secondary"
                  href="/roles"
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
