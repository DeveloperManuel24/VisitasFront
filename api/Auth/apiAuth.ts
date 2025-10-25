'use client'

import axios from 'axios'

const AUTH_STORAGE_KEY = 'authToken'

/* =========================
   helpers de token localStorage
   ========================= */

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
  } catch {
    /* ignore SSR / bloqueo storage */
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function isAuthenticated() {
  return !!getAuthToken()
}

/* =========================
   instancia AXIOS para el servicio de AUTH
   IMPORTANTE: baseURL debe apuntar al backend Nest
   donde vive /auth/change-password y /auth/login
   ========================= */

const axiosAuth = axios.create({
  baseURL: 'http://localhost:3000', // <-- cambia esto si tu backend auth NO corre en 3000
})

/* =========================
   LOGIN
   POST /auth/login { email, password }
   Backend responde { access_token }
   ========================= */

export async function login(email: string, password: string) {
  try {
    const resp = await axiosAuth.post('/auth/login', { email, password })
    const token = resp?.data?.access_token

    if (!token) {
      throw new Error('No se recibió access_token del backend')
    }

    setAuthToken(token)

    return {
      ok: true,
      token,
    }
  } catch (err) {
    console.error('❌ Error en login:', err)
    return {
      ok: false,
      token: null,
      error: err,
    }
  }
}

/* =========================
   changePassword
   POST /auth/change-password

   Body que espera el backend Nest:
   {
     "userId": "<id del usuario a cambiar>",
     "newPassword": "<nueva pass>"
   }

   Este endpoint está protegido con JwtAuthGuard,
   o sea NECESITA Authorization: Bearer <token>
   ========================= */

export async function changePassword(userId: string, newPassword: string) {
  try {
    const token = getAuthToken()
    if (!token) {
      return {
        ok: false,
        status: 401,
        error: 'No hay token en sesión',
        data: null,
      }
    }

    const resp = await axiosAuth.post(
      '/auth/change-password',
      {
        userId,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return {
      ok: true,
      status: resp?.status ?? 200,
      data: resp?.data ?? null,
    }
  } catch (err: any) {
    console.error('❌ Error en changePassword:', err)

    const status = err?.response?.status
    const data = err?.response?.data

    return {
      ok: false,
      status: status ?? 500,
      error:
        data?.message || 'Error desconocido al cambiar contraseña',
      data: data ?? null,
    }
  }
}
