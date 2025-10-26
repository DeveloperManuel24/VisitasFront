'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/button'
import { GradientBackground } from '@/components/gradient'
import { Link } from '@/components/link'
import { Mark } from '@/components/logo'
import { Field, Input, Label } from '@headlessui/react'
import { clsx } from 'clsx'
import { forgotPasswordRequest } from '../../../../api/Auth/apiAuth'
// ojo: ../../../ porque estamos en app/login/forgot-password/page.tsx
// subimos 2 niveles hasta src/, luego api/Auth/apiAuth

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await forgotPasswordRequest(email)

      // si el backend responde ok, no tiramos error aunque el correo no exista
      setSuccessMsg(
        'Si la cuenta existe, enviamos un enlace de recuperación a tu correo.'
      )
      setLoading(false)
    } catch (err) {
      console.error('[forgot-password] error', err)
      setErrorMsg('No se pudo procesar la solicitud en este momento.')
      setLoading(false)
    }
  }

  function handleVolverLogin() {
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
              ¿Olvidaste tu contraseña?
            </h1>

            <p className="mt-1 text-sm/5 text-gray-600">
              Ingresa tu correo. Te enviaremos un enlace temporal
              para restablecer tu contraseña.
            </p>

            {/* email */}
            <Field className="mt-8 space-y-3">
              <Label className="text-sm/5 font-medium">Email</Label>
              <Input
                required
                autoFocus
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={clsx(
                  'block w-full rounded-lg border border-transparent shadow-sm ring-1 ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
            </Field>

            {/* error */}
            {errorMsg && (
              <div className="mt-4 text-sm/5 font-medium text-red-500">
                {errorMsg}
              </div>
            )}

            {/* success */}
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
                  ? 'Enviando…'
                  : 'Enviar enlace de recuperación'}
              </Button>
            </div>

            {/* Volver a login */}
            <div className="mt-6 text-center text-sm/5 text-gray-600">
              <button
                type="button"
                onClick={handleVolverLogin}
                className="font-medium hover:text-gray-800"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>

          {/* cajita inferior */}
          <div className="m-1.5 rounded-lg bg-gray-50 py-4 text-center text-sm/5 ring-1 ring-black/5">
            <span className="text-gray-600">¿Recordaste tu clave?</span>{' '}
            <button
              type="button"
              onClick={handleVolverLogin}
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
