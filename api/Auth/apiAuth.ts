import axiosUsuarios from "../../axios/axiosUsuarios"

const AUTH_STORAGE_KEY = "authToken"

/* ======================= AUTH HELPERS ======================= */

// Guarda el token
export function setAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
  } catch {
    /* SSR o storage bloqueado, ignorar */
  }
}

// Obtiene el token
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

// Limpia token
export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    /* noop */
  }
}

// flag rápido
export function isAuthenticated() {
  return !!getAuthToken()
}

/* ======================= ENDPOINTS ======================= */

/**
 * LOGIN:
 * POST /auth/login { email, password }
 * Guarda access_token en localStorage.
 */
export async function login(email: string, password: string) {
  try {
    const resp = await axiosUsuarios.post("/auth/login", { email, password })
    const token = resp?.data?.access_token

    if (!token) throw new Error("No se recibió access_token del backend")
    setAuthToken(token)

    return { ok: true, token }
  } catch (err) {
    console.error("❌ Error en login:", err)
    return { ok: false, token: null, error: err }
  }
}

/**
 * CAMBIAR CONTRASEÑA (modo administrador o self-change)
 * POST /auth/change-password
 * Body:
 * {
 *   userId: string,
 *   newPassword: string
 * }
 * 
 * Requiere Authorization: Bearer <token>
 * (El backend valida si el usuario es admin/supervisor o si cambia su propia pass)
 */
export async function changePassword(userId: string, newPassword: string) {
  try {
    const resp = await axiosUsuarios.post(
      "/auth/change-password",
      { userId, newPassword },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    )

    return {
      ok: true,
      data: resp?.data ?? null,
    }
  } catch (err) {
    console.error("❌ Error en changePassword:", err)
    return {
      ok: false,
      error: err,
    }
  }
}
