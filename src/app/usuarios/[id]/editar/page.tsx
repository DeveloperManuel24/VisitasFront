'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import RequireAuth from '@/app/components/require-auth'

import {
  obtenerUsuarioPorId,
  actualizarUsuario,
  listarUsuarios,
} from '../../../../../api/usuarios/apiUsuarios'
import { listarRoles } from '../../../../../api/roles/apiRoles'
import { changePassword } from '../../../../../api/auth/apiAuth'

type RolLite = { id: string; nombre: string }

type UsuarioData = {
  id: string
  nombre: string
  email: string
  activo: boolean
  supervisorId?: string | null
  fotoBase64?: string | null
  usuariosRoles?: { rol: RolLite }[]
}

type PropsEditar = {
  params: { id: string }
}

export default function EditarUsuarioPage({ params }: PropsEditar) {
  const { id } = params
  const router = useRouter()

  // estado general
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // campos principales
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [activo, setActivo] = useState(true)
  const [supervisorId, setSupervisorId] = useState<string>('') // "" = Sin supervisor
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('')

  // foto
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoBase64, setFotoBase64] = useState<string | null>(null)

  // selects
  const [rolesDisponibles, setRolesDisponibles] = useState<RolLite[]>([])
  const [supervisores, setSupervisores] = useState<
    { id: string; nombre: string }[]
  >([])

  // modal Cambiar credenciales
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [nuevaPass, setNuevaPass] = useState('')
  const [errorPass, setErrorPass] = useState<string | null>(null)

  // cargar datos iniciales
  useEffect(() => {
    const cargar = async () => {
      try {
        const user: UsuarioData | null = await obtenerUsuarioPorId(id)
        if (!user) {
          setMensaje('No se encontró el usuario')
          setCargando(false)
          return
        }

        setNombre(user.nombre ?? '')
        setEmail(user.email ?? '')
        setActivo(Boolean(user.activo))
        setSupervisorId(user.supervisorId ?? '') // si viene null => set ''
        setFotoPreview(user.fotoBase64 ?? null)
        setFotoBase64(user.fotoBase64 ?? null)

        // rol actual (primer rol asignado si existe)
        const rolActual =
          user.usuariosRoles && user.usuariosRoles[0]
            ? user.usuariosRoles[0].rol?.id
            : ''
        setRolSeleccionado(rolActual || '')

        // catálogo roles
        const roles = await listarRoles()
        setRolesDisponibles(Array.isArray(roles) ? roles : [])

        // supervisores activos
        const { data: listaSup } = await listarUsuarios({
          activo: true,
          limit: 100,
        })
        setSupervisores(
          Array.isArray(listaSup)
            ? listaSup.map((u: any) => ({
                id: u.id,
                nombre: u.nombre ?? u.email ?? '—',
              }))
            : [],
        )
      } catch (err) {
        console.error('Error cargando usuario:', err)
        setMensaje('Error cargando datos del usuario')
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [id])

  // manejo de imagen de perfil
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFotoPreview(base64)
      setFotoBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  // guardar datos generales del usuario
  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    try {
      await actualizarUsuario(id, {
        nombre,
        email,
        activo,
        // si `supervisorId` está vacío => manda null explícito para limpiar
        supervisorId: supervisorId ? supervisorId : null,
        roles: rolSeleccionado ? [rolSeleccionado] : [],
        fotoBase64: fotoBase64 ?? undefined,
      })

      setMensaje('✅ Cambios guardados correctamente.')
    } catch (err) {
      console.error('Error actualizando usuario:', err)
      setMensaje('❌ Error al guardar cambios.')
    } finally {
      setGuardando(false)
    }
  }

  // abrir / cerrar modal
  function openPasswordModal() {
    setErrorPass(null)
    setNuevaPass('')
    setShowPasswordModal(true)
  }

  function closePasswordModal() {
    setShowPasswordModal(false)
  }

  // guardar nueva contraseña via /auth/change-password (admin cambia password de este user)
  async function handleGuardarCredenciales(e: React.FormEvent) {
    e.preventDefault()
    setErrorPass(null)

    // validaciones frontend
    if (!nuevaPass.trim()) {
      setErrorPass('Debes ingresar la nueva contraseña.')
      return
    }

    if (nuevaPass.length < 8) {
      setErrorPass('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    try {
      const resp = await changePassword(id, nuevaPass)

      if (!resp.ok) {
        console.error('❌ Error al cambiar contraseña:', resp.error)
        setErrorPass('No se pudo cambiar la contraseña.')
        return
      }

      setShowPasswordModal(false)
      setNuevaPass('')
      setMensaje(`✅ Contraseña actualizada para el usuario ${nombre}.`)
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error)
      setErrorPass('Error inesperado al cambiar la contraseña.')
    }
  }

  // loading state
  if (cargando) {
    return (
      <RequireAuth>
        <main className="bg-gray-50 min-h-dvh text-gray-950">
          <Container>
            <Navbar />
          </Container>
          <Container className="py-24 text-sm/6 text-gray-500">
            Cargando usuario...
          </Container>
        </main>
      </RequireAuth>
    )
  }

  // UI
  return (
    <RequireAuth>
      <main className="overflow-hidden bg-gray-50 min-h-dvh text-gray-950">
        {/* Navbar */}
        <Container>
          <Navbar
            banner={
              <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
                Editar Usuario — SkyNet Visitas
              </div>
            }
          />
        </Container>

        <Container className="pb-24">
          {/* header */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <Subheading>SEGURIDAD</Subheading>
              <Heading as="h1" className="mt-2 text-balance">
                Editar usuario #{id}
              </Heading>
              <p className="mt-4 max-w-xl text-sm/6 text-gray-600">
                Actualiza datos, rol, supervisor y acceso.
              </p>
            </div>

            {/* acciones lado derecho */}
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Cambiar credenciales -> abre modal */}
                <button
                  type="button"
                  onClick={openPasswordModal}
                  className={[
                    'rounded-full border border-transparent bg-white px-4 py-2 text-sm/6 font-medium text-gray-900 shadow-sm ring-1 ring-black/10',
                    'hover:bg-gray-50 hover:ring-black/20',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-black',
                  ].join(' ')}
                >
                  Cambiar credenciales
                </button>

                {/* Volver */}
                <Button variant="secondary" href="/usuarios">
                  ← Volver a Usuarios
                </Button>
              </div>
            </div>
          </div>

          {/* Card principal */}
          <section className="mt-10 max-w-3xl rounded-xl bg-white p-6 shadow-md ring-1 ring-black/5">
            <form
              onSubmit={handleGuardar}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {/* Columna izquierda */}
              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nombre completo
                  </label>
                  <input
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
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
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-[11px]/5 text-gray-500">
                    También puedes cambiar contraseña desde &quot;Cambiar
                    credenciales&quot;.
                  </p>
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
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
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
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
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
                      <span>Cambiar imagen</span>
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

              {/* feedback general */}
              {mensaje && (
                <div className="lg:col-span-2 text-sm/6 font-medium text-gray-700">
                  {mensaje}
                </div>
              )}

              {/* botones guardar/cancelar */}
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
                  href="/usuarios"
                  className="sm:w-auto w-full"
                >
                  volver
                </Button>
              </div>
            </form>
          </section>
        </Container>

        {/* MODAL CAMBIAR CREDENCIALES */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-black/10">
              <form
                onSubmit={handleGuardarCredenciales}
                className="p-6 space-y-5"
              >
                {/* header modal */}
                <div className="flex items-start justify-between">
                  <h2 className="text-base/6 font-semibold text-gray-900">
                    Cambiar credenciales
                  </h2>
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="text-sm/6 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm/6 text-gray-600">
                  Ingresa la nueva contraseña para este usuario.
                </p>

                {/* nueva contraseña */}
                <div>
                  <label className="block text-sm/5 font-medium text-gray-900">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    className="mt-2 block w-full rounded-lg border border-transparent bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-sm ring-1 ring-black/10"
                    value={nuevaPass}
                    onChange={(e) => setNuevaPass(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                {/* feedback modal */}
                {errorPass && (
                  <div className="text-sm/6 font-medium text-red-600 flex items-start gap-2">
                    <span>❌</span>
                    <span>{errorPass}</span>
                  </div>
                )}

                {/* botones modal */}
                <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" className="sm:w-auto w-full">
                    Guardar credenciales
                  </Button>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={closePasswordModal}
                    className="sm:w-auto w-full"
                  >
                    Cancelar
                  </Button>
                </div>

                <p className="text-[11px]/5 text-gray-500">
                  Por seguridad, la contraseña actual nunca se muestra.
                </p>
              </form>
            </div>
          </div>
        )}
      </main>
    </RequireAuth>
  )
}
