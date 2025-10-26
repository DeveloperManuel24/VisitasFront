'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'

import {
  actualizarRol,
  listarRoles,
} from '../../../../../api/roles/apiRoles'

import RequireAuth from '@/app/components/require-auth'
import { useAuth } from '@/app/components/auth-context'

type EditPageProps = {
  params: { id: string }
}

/**
 * VISIBILIDAD:
 * - ADMINISTRADOR ✅
 * - SUPERVISOR ❌
 * - TECNICO ❌
 */
export default function EditarRolPage({ params }: EditPageProps) {
  const { id } = params
  const router = useRouter()

  // auth del user logueado
  const { roles } = useAuth()

  // gateo de acceso
  const [ready, setReady] = useState(false)

  // estado de carga / edición
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // campos del rol
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  // =========================
  // 1. validar acceso (solo ADMINISTRADOR)
  // =========================
  useEffect(() => {
    // todavía no tenemos roles (primer render), esperamos
    if (!roles || roles.length === 0) return

    if (!roles.includes('ADMINISTRADOR')) {
      // no tiene permisos para ver roles
      router.replace('/unauthorized')
      return
    }

    setReady(true)
  }, [roles, router])

  // =========================
  // 2. cargar datos iniciales del rol UNA VEZ tengamos permiso
  // =========================
  useEffect(() => {
    if (!ready) return

    const cargarRol = async () => {
      try {
        const rolesArr = await listarRoles()
        const rolActual = Array.isArray(rolesArr)
          ? rolesArr.find((r: any) => String(r.id) === String(id))
          : null

        if (rolActual) {
          setNombre(rolActual.nombre ?? '')
          setDescripcion(rolActual.descripcion ?? '')
        } else {
          setMensaje('No se encontró el rol solicitado.')
        }
      } catch (err) {
        console.error('Error cargando rol:', err)
        setMensaje('Error cargando datos del rol.')
      } finally {
        setCargando(false)
      }
    }

    cargarRol()
  }, [ready, id])

  // =========================
  // 3. guardar cambios
  // =========================
  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    try {
      await actualizarRol(String(id), {
        nombre,
        descripcion,
      })

      setMensaje('✅ Cambios guardados.')
    } catch (err) {
      console.error('Error actualizando rol:', err)
      setMensaje('❌ Error al guardar cambios.')
    } finally {
      setGuardando(false)
    }
  }

  // =========================
  // estados de "espera"
  // =========================

  // 1) todavía verificando si es admin:
  if (!ready) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950 flex items-center justify-center text-xs text-zinc-500">
          Verificando acceso…
        </main>
      </RequireAuth>
    )
  }

  // 2) ya sé que es admin, pero aún no traje el rol
  if (cargando) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar />
          </Container>
          <Container className="py-24 text-sm/6 text-gray-500">
            Cargando rol...
          </Container>
        </main>
      </RequireAuth>
    )
  }

  // =========================
  // UI normal
  // =========================
  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
        {/* Navbar con banner */}
        <Container>
          <Navbar
            banner={
              <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                Editar Rol — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* Header de la página */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Subheading>Seguridad</Subheading>
              <Heading as="h1" className="mt-2">
                Editar rol #{id}
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Actualiza nombre y descripción del rol.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" href="/roles">
                ← Volver a Roles
              </Button>
            </div>
          </div>

          {/* Card / Formulario */}
          <section className="mt-10 max-w-xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <form onSubmit={handleGuardar} className="space-y-5">
              {/* Nombre del rol */}
              <div>
                <label className="block text-sm/5 font-medium text-gray-900">
                  Nombre del rol
                </label>
                <input
                  className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. SupervisorCampo"
                  required
                />
              </div>

              {/* Descripción */}
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

              {/* Mensaje de feedback */}
              {mensaje && (
                <div className="text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </div>
              )}

              {/* Botones */}
              <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="sm:w-auto w-full"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Button>

                <Button
                  variant="secondary"
                  href="/roles"
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
