'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  crearUsuario,
  listarUsuarios,
} from '../../../../api/usuarios/apiUsuarios'
import { listarRoles } from '../../../../api/roles/apiRoles'

type RolLite = { id: string; nombre: string }
type SupervisorLite = { id: string; nombre: string }

export default function CrearUsuarioPage() {
  // form state
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [activo, setActivo] = useState(true)
  const [supervisorId, setSupervisorId] = useState<string>('')
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('')

  // foto
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoBase64, setFotoBase64] = useState<string | null>(null)

  // datos auxiliares
  const [rolesDisponibles, setRolesDisponibles] = useState<RolLite[]>([])
  const [supervisores, setSupervisores] = useState<SupervisorLite[]>([])

  // feedback
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // cargar roles y supervisores
  useEffect(() => {
    ;(async () => {
      try {
        // roles
        const roles = await listarRoles()
        setRolesDisponibles(
          Array.isArray(roles) ? roles : [],
        )

        // supervisores:
        // Básicamente traemos usuarios activos y que podrían ser supervisor
        // Por ahora traemos todos y ya. Luego puedes filtrar por rol 'SUPERVISOR'
        const { data: lista } = await listarUsuarios({
          activo: true,
          limit: 100,
        })
        setSupervisores(
          Array.isArray(lista)
            ? lista.map((u: any) => ({
                id: u.id,
                nombre: u.nombre ?? u.email ?? '—',
              }))
            : [],
        )
      } catch (err) {
        console.error('Error cargando data inicial:', err)
      }
    })()
  }, [])

  // manejar imagen
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string // "data:image/png;base64,AAAA"
      setFotoPreview(base64)
      setFotoBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setMensaje('❌ Faltan campos obligatorios.')
      return
    }

    try {
      setGuardando(true)
      setMensaje(null)

      await crearUsuario({
        nombre,
        email,
        hash: password, // backend lo hashea si no empieza con $2
        activo,
        supervisorId: supervisorId || undefined,
        roles: rolSeleccionado ? [rolSeleccionado] : [],
        fotoBase64: fotoBase64 ?? undefined,
      })

      setMensaje('✅ Usuario creado con éxito.')
      // limpiar
      setNombre('')
      setEmail('')
      setPassword('')
      setActivo(true)
      setSupervisorId('')
      setRolSeleccionado('')
      setFotoBase64(null)
      setFotoPreview(null)
    } catch (err) {
      console.error('Error creando usuario:', err)
      setMensaje('❌ Error al crear el usuario.')
    } finally {
      setGuardando(false)
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
                Crear Usuario — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* Header + volver */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Subheading>Seguridad</Subheading>
              <Heading as="h1" className="mt-2">
                Nuevo Usuario
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Crea una cuenta de acceso para técnicos, supervisores o
                administradores.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" href="/usuarios">
                ← Volver a Usuarios
              </Button>
            </div>
          </div>

          {/* Form */}
          <section className="mt-10 max-w-3xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <h2 className="text-base/6 font-medium text-gray-950">
              Datos del usuario
            </h2>
            <p className="mt-1 text-sm/5 text-gray-600">
              Define información básica, acceso y supervisor directo.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Columna izquierda */}
              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nombre completo
                  </label>
                  <input
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder='Ej. "Carlos Gómez"'
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Email
                  </label>
                  <input
                    type="email"
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tecnico.beta@skynet.local"
                    required
                  />
                </div>

                {/* Password inicial */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Contraseña inicial
                  </label>
                  <input
                    type="password"
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                {/* Activo */}
                <div className="flex items-center gap-3">
                  <input
                    id="activo"
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-gray-900 ring-1 ring-black/10"
                  />
                  <label
                    htmlFor="activo"
                    className="text-sm/5 font-medium text-gray-900"
                  >
                    Usuario activo
                  </label>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-5">
                {/* Rol */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Rol
                  </label>
                  <select
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                    value={rolSeleccionado}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccionar rol…</option>
                    {rolesDisponibles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supervisor */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Supervisor directo
                  </label>
                  <select
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10 data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black"
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                  >
                    <option value="">Sin supervisor</option>
                    {supervisores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Foto de perfil
                  </label>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="size-16 rounded-full ring-1 ring-black/10 bg-gray-100 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                      {fotoPreview ? (
                        <img
                          src={fotoPreview}
                          alt="preview"
                          className="size-full object-cover"
                        />
                      ) : (
                        'Sin foto'
                      )}
                    </div>

                    <label className="cursor-pointer text-sm/6 font-medium text-blue-600 hover:underline">
                      <span>Subir imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <p className="mt-2 text-[11px]/5 text-gray-500">
                    JPG o PNG. Se guarda en Base64.
                  </p>
                </div>
              </div>

              {/* Mensaje feedback */}
              {mensaje && (
                <div className="lg:col-span-2 text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </div>
              )}

              {/* Botones */}
              <div className="lg:col-span-2 pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="sm:w-auto w-full"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar usuario'}
                </Button>

                <Button
                  variant="secondary"
                  href="/usuarios"
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
