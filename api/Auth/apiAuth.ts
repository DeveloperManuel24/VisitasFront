'use client'

import axios from 'axios'

const AUTH_STORAGE_KEY = 'authToken'

/* =========================
   Base URL dinámica
   ========================= */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_USUARIOS_API_BASE_URL

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

/* =========================
   validar token local
   ========================= */
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

export function isAuthenticated(): boolean {
  const token = getAuthToken()
  if (!token) return false

  const payload = decodeJwtPayload(token)
  if (!payload) return false

  if (typeof payload.exp === 'number') {
    const nowMs = Date.now()
    const expMs = payload.exp * 1000
    if (nowMs >= expMs) return false
  }

  return true
}

/* =========================
   instancia AXIOS para AUTH
   ========================= */
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* =========================
   LOGIN
   ========================= */
export async function loginRequest(email: string, password: string) {
  const resp = await axiosAuth.post('/auth/login', { email, password })
  const token = resp?.data?.access_token
  if (!token) throw new Error('No se recibió access_token del backend')
  setAuthToken(token)
  return token
}

/* =========================
   FORGOT PASSWORD
   ========================= */
export async function forgotPasswordRequest(email: string) {
  const resp = await axiosAuth.post('/auth/forgot-password', { email })
  return resp?.data
}

/* =========================
   RESET PASSWORD
   ========================= */
export async function resetPasswordRequest(
  token: string,
  newPassword: string,
) {
  const resp = await axiosAuth.post('/auth/reset-password', {
    token,
    newPassword,
  })
  return resp?.data
}

/* =========================
   CHANGE PASSWORD (PROTEGIDO)
   POST /auth/change-password
   {
     "userId": "<id del usuario>",
     "newPassword": "<nueva contraseña>"
   }
   ========================= */
export async function changePassword(
  userId: string,
  newPassword: string,
) {
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
      { userId, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
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
      error: data?.message || 'Error desconocido al cambiar contraseña',
      data: data ?? null,
    }
  }
}
