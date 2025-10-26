import axios from "axios";

let TEMP_AUTH_TOKEN_CLIENTES = "";

/**
 * Permite setear el token después de login.
 * Si no lo seteas manualmente, igual tratamos de leer localStorage en el interceptor.
 */
export const setClientesAuthToken = (token: string) => {
  TEMP_AUTH_TOKEN_CLIENTES = token;
};

/**
 * Determinar la URL base.
 * - En producción (Railway frontend), DEBE venir de NEXT_PUBLIC_CLIENTES_API_BASE_URL
 *   y debe apuntar al backend Nest (NO al frontend).
 *   Ejemplo en Railway:
 *   NEXT_PUBLIC_CLIENTES_API_BASE_URL=https://visitasapi-production.up.railway.app
 *
 * - En local, usamos http://localhost:3001
 */
const fallbackLocal = "http://localhost:3001";

const baseURLEnv = process.env.NEXT_PUBLIC_CLIENTES_API_BASE_URL;

// Nota: esto va a pasar en runtime del browser ya con el valor inyectado por Next.
// Si baseURLEnv viene undefined o vacío, usamos el fallbackLocal.
const resolvedBaseURL =
  baseURLEnv && baseURLEnv.trim().length > 0
    ? baseURLEnv
    : fallbackLocal;

// Aviso en consola si estamos usando fallback (te salva la vida debuggeando prod)
if (!baseURLEnv || baseURLEnv.trim().length === 0) {
  console.warn(
    "[axiosClientes] WARNING: NEXT_PUBLIC_CLIENTES_API_BASE_URL no está definida. Usando fallback:",
    fallbackLocal
  );
}

const axiosClientes = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Interceptor: agrega Authorization: Bearer <token>
 * Busca primero el token en memoria (setClientesAuthToken),
 * si no, intenta leer de localStorage (esto solo existe en browser).
 */
axiosClientes.interceptors.request.use(
  (config) => {
    try {
      const token =
        TEMP_AUTH_TOKEN_CLIENTES || localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage puede explotar en SSR, ignoramos silencioso
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClientes;
