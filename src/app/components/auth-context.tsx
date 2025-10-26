'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'

// helpers actuales
import {
  getAuthToken,
  clearAuthToken,
  isAuthenticated as checkTokenValid,
} from '../../../api/Auth/apiAuth'

type AuthUser = {
  sub: string
  name?: string
  email?: string
  roles: string[]
}

type AuthContextType = {
  isAuthenticated: boolean
  user: AuthUser | null
  roles: string[]
  authReady: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  roles: [],
  authReady: false,
  logout: () => {},
})

// --- helper local para decodificar JWT ---
function decodeJwtPayload(token: string | null): any | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return payload
  } catch {
    return null
  }
}

// --- initAuthState: se corre SIN useEffect ---
// objetivo: hidratar todo en el primer render del provider
function initAuthState() {
  // estamos en el server? (Next puede intentar renderizar en server)
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null as AuthUser | null,
      roles: [] as string[],
      authReady: false,
    }
  }

  // cliente:
  const token = getAuthToken()
  const stillValid = checkTokenValid()
  if (!token || !stillValid) {
    return {
      isAuthenticated: false,
      user: null,
      roles: [],
      authReady: true,
    }
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return {
      isAuthenticated: false,
      user: null,
      roles: [],
      authReady: true,
    }
  }

  const rolesArr = Array.isArray(payload.roles)
    ? payload.roles.map((r: any) => String(r))
    : []

  const user: AuthUser = {
    sub: payload.sub ?? '',
    name: payload.name ?? '',
    email: payload.email ?? '',
    roles: rolesArr,
  }

  return {
    isAuthenticated: true,
    user,
    roles: rolesArr,
    authReady: true,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // ⬇ hidrata inmediatamente desde localStorage si estamos en el browser
  const [
    { isAuthenticated, user, roles, authReady },
    setAuthState,
  ] = useState(() => initAuthState())

  const logout = useCallback(() => {
    clearAuthToken()
    setAuthState({
      isAuthenticated: false,
      user: null,
      roles: [],
      authReady: true,
    })
    router.replace('/login')
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        roles,
        authReady,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
