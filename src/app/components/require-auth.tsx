'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from './auth-context'

// Rutas públicas (sin login)
const PUBLIC_ROUTES = new Set([
  '/login',
  '/login/forgot-password',
  '/login/reset-password',
  '/reset-password',
  '/unauthorized',
  '/', // landing pública si querés
])

// ----- REGLAS DE ACCESO POR ROL -----
//
// ADMINISTRADOR  -> acceso total
// SUPERVISOR     -> todo EXCEPTO la vista especial del técnico (/visitas/tecnico)
// TECNICO        -> SOLO:
//    - /visitas/tecnico
//    - /visitas/[id]/editar
//    - /clientes (lista / detalle clientes)
//
// Nota: pathname viene completo, ej: "/visitas/01ABC/editar"
//
function canRoleAccessPath(roles: string[], pathname: string): boolean {
  if (!pathname) return false

  // normalizamos mayúsculas
  const upperRoles = roles.map((r) => r.toUpperCase())

  const isAdmin = upperRoles.includes('ADMINISTRADOR')
  const isSupervisor = upperRoles.includes('SUPERVISOR')
  const isTecnico = upperRoles.includes('TECNICO')

  // ADMIN: todo
  if (isAdmin) return true

  // SUPERVISOR:
  // puede todo menos la vista especial del técnico
  if (isSupervisor) {
    // bloquear SOLO la vista del técnico
    if (pathname.startsWith('/visitas/tecnico')) {
      return false
    }
    return true
  }

  // TECNICO:
  if (isTecnico) {
    // 1. dashboard propio
    if (pathname === '/visitas/tecnico' || pathname.startsWith('/visitas/tecnico')) {
      return true
    }

    // 2. detalle/editar de visita
    //    match: /visitas/[id]/editar
    //    eso siempre empieza con /visitas/ y contiene /editar al final
    if (
      pathname.startsWith('/visitas/') &&
      pathname.endsWith('/editar')
    ) {
      return true
    }

    // 3. clientes (para ver info del cliente)
    if (pathname === '/clientes' || pathname.startsWith('/clientes')) {
      return true
    }

    // todo lo demás: NO
    return false
  }

  // si no tiene ninguno de esos roles válidos -> no entra
  return false
}

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname() || ''
  const { isAuthenticated, roles } = useAuth()

  const [checking, setChecking] = useState(true)
  const [allow, setAllow] = useState(false)

  useEffect(() => {
    // 1. Página pública -> pasa directo
    if (PUBLIC_ROUTES.has(pathname)) {
      setAllow(true)
      setChecking(false)
      return
    }

    // 2. Sin sesión -> al login
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // 3. Check permisos por rol
    const ok = canRoleAccessPath(roles, pathname)
    if (!ok) {
      router.replace('/unauthorized')
      return
    }

    // 4. Todo ok
    setAllow(true)
    setChecking(false)
  }, [pathname, isAuthenticated, roles, router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs text-zinc-500">
        Verificando acceso…
      </div>
    )
  }

  if (!allow) {
    return null
  }

  return <>{children}</>
}
