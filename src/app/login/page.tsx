'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/button'
import { GradientBackground } from '@/components/gradient'
import { Link } from '@/components/link'
import { Mark } from '@/components/logo'

import { Checkbox, Field, Input, Label } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { clsx } from 'clsx'
import { loginRequest } from '../../../api/Auth/apiAuth'


export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMsg(null)

    try {
      await loginRequest(email, password)
      router.replace('/')
    } catch (err) {
      console.error('[login] error', err)
      setErrorMsg('Credenciales inválidas')
      setLoading(false)
    }
  }

  return (
    <main className="overflow-hidden bg-gray-50">
      <GradientBackground />

      <div className="isolate flex min-h-dvh items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md rounded-xl bg-white shadow-md ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="p-7 sm:p-11">
            {/* Logo / marca */}
            <div className="flex items-start">
              <Link href="/" title="Home">
                <Mark className="h-9 fill-black" />
              </Link>
            </div>

            {/* Título y subtítulo */}
            <h1 className="mt-8 text-base/6 font-medium">
              Bienvenido de vuelta
            </h1>
            <p className="mt-1 text-sm/5 text-gray-600">
              Inicia sesión para continuar.
            </p>

            {/* Email */}
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

            {/* Password */}
            <Field className="mt-8 space-y-3">
              <Label className="text-sm/5 font-medium">Password</Label>
              <Input
                required
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={clsx(
                  'block w-full rounded-lg border border-transparent shadow-sm ring-1 ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
            </Field>

            {/* Remember me / Forgot password */}
            <div className="mt-8 flex items-center justify-between text-sm/5">
              <Field className="flex items-center gap-3">
                <Checkbox
                  name="remember-me"
                  className={clsx(
                    'group block size-4 rounded-sm border border-transparent shadow-sm ring-1 ring-black/10',
                    'data-checked:bg-black data-checked:ring-black',
                    'data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-black',
                  )}
                >
                  <CheckIcon className="fill-white opacity-0 group-data-checked:opacity-100" />
                </Checkbox>
                <Label>Recordarme</Label>
              </Field>

              {/* 👇 AQUÍ EL CAMBIO: apunta a /login/forgot-password */}
              <Link
                href="/login/forgot-password"
                className="font-medium hover:text-gray-600"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error de auth */}
            {errorMsg && (
              <div className="mt-4 text-sm/5 font-medium text-red-500">
                {errorMsg}
              </div>
            )}

            {/* Botón Entrar */}
            <div className="mt-8">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Entrando…' : 'Sign in'}
              </Button>
            </div>
          </form>

          {/* Footer de la tarjeta */}
          <div className="m-1.5 rounded-lg bg-gray-50 py-4 text-center text-sm/5 ring-1 ring-black/5">
            <span className="text-gray-600">
              ¿No tienes acceso?
            </span>{' '}
            <span className="font-medium text-gray-900">
              Contacta al administrador
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
