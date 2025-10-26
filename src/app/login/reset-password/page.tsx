'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/button'
import { GradientBackground } from '@/components/gradient'
import { Link } from '@/components/link'
import { Mark } from '@/components/logo'
import { Field, Input, Label } from '@headlessui/react'
import { clsx } from 'clsx'
import { resetPasswordRequest } from '../../../../api/Auth/apiAuth'


export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // sacamos el ?token=...
  const tokenFromQuery = searchParams.get('token') || ''

  // state interno
  const [token, setToken] = useState('')
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // cuando entra la página, guardamos el token del query param
  useEffect(() => {
    setToken(tokenFromQuery)
  }, [tokenFromQuery])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setErrorMsg(null)
    setSuccessMsg(null)

    // Validaciones básicas frontend
    if (!token) {
      setErrorMsg('Token inválido. Vuelve a solicitar el enlace.')
      return
    }
    if (!pass1 || pass1.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (pass1 !== pass2) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await resetPasswordRequest(token, pass1)

      setSuccessMsg('Tu contraseña fue actualizada correctamente.')
      setLoading(false)

      // opcional: después de unos segundos o botón, mandar al login
      // acá usamos botón abajo, no redirigimos automático
    } catch (err: any) {
      console.error('[reset-password] error', err)
      // mensaje estándar que tu backend manda en errores comunes:
      // "Token inválido o expirado", "La contraseña debe tener al menos 8 caracteres"
      setErrorMsg(
        err?.response?.data?.message ||
          'No se pudo actualizar la contraseña. El enlace puede haber expirado.',
      )
      setLoading(false)
    }
  }

  function handleIrLogin() {
    router.replace('/login')
  }

  return (
    <main className="overflow-hidden bg-gray-50">
      <GradientBackground />

      <div className="isolate flex min-h-dvh items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md rounded-xl bg-white shadow-md ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="p-7 sm:p-11">
            {/* header / logo */}
            <div className="flex items-start">
              <Link href="/" title="Home">
                <Mark className="h-9 fill-black" />
              </Link>
            </div>

            <h1 className="mt-8 text-base/6 font-medium">
              Restablecer contraseña
            </h1>

            <p className="mt-1 text-sm/5 text-gray-600">
              Ingresa tu nueva contraseña. Este enlace es temporal.
            </p>

            {/* campo contraseña nueva */}
            <Field className="mt-8 space-y-3">
              <Label className="text-sm/5 font-medium">Nueva contraseña</Label>
              <Input
                required
                type="password"
                name="new-password"
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                className={clsx(
                  'block w-full rounded-lg border border-transparent shadow-sm ring-1 ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
              <p className="text-xs text-gray-500">
                Mínimo 8 caracteres.
              </p>
            </Field>

            {/* confirmar contraseña */}
            <Field className="mt-6 space-y-3">
              <Label className="text-sm/5 font-medium">Confirmar contraseña</Label>
              <Input
                required
                type="password"
                name="confirm-password"
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                className={clsx(
                  'block w-full rounded-lg border border-transparent shadow-sm ring-1 ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
            </Field>

            {/* Mensajes de error / ok */}
            {errorMsg && (
              <div className="mt-4 text-sm/5 font-medium text-red-500">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mt-4 text-sm/5 font-medium text-emerald-600">
                {successMsg}
              </div>
            )}

            {/* submit */}
            <div className="mt-8">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? 'Actualizando…'
                  : 'Guardar nueva contraseña'}
              </Button>
            </div>

            {/* volver a login */}
            <div className="mt-6 text-center text-sm/5 text-gray-600">
              <button
                type="button"
                onClick={handleIrLogin}
                className="font-medium hover:text-gray-800"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>

          {/* cajita footer interna */}
          <div className="m-1.5 rounded-lg bg-gray-50 py-4 text-center text-sm/5 ring-1 ring-black/5">
            <span className="text-gray-600">¿Ya tienes acceso?</span>{' '}
            <button
              type="button"
              onClick={handleIrLogin}
              className="font-medium text-gray-900 hover:text-gray-700"
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
