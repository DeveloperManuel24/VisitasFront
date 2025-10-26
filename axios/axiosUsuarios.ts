import axios from "axios";

let TEMP_AUTH_TOKEN_USUARIOS = "";

export const setUsuariosAuthToken = (token: string) => {
  TEMP_AUTH_TOKEN_USUARIOS = token;
};

const axiosUsuarios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_USUARIOS_API_BASE_URL ,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json", // <- FIX: sin espacio raro
    Accept: "application/json",
  },
});

// interceptor para inyectar Authorization si hay token
axiosUsuarios.interceptors.request.use(
  (config) => {
    let token = TEMP_AUTH_TOKEN_USUARIOS;

    // safe check por si estamos en browser
    if (!token && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("authToken");
      if (stored) token = stored;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// opcional: debug para que veas lo que sale y entra (te salva la madrugada)
axiosUsuarios.interceptors.request.use((config) => {
  console.log(
    "[axiosUsuarios REQUEST]",
    config.method?.toUpperCase(),
    config.url,
    config.data
  );
  return config;
});

axiosUsuarios.interceptors.response.use(
  (res) => {
    console.log("[axiosUsuarios RESPONSE]", res.status, res.data);
    return res;
  },
  (err) => {
    console.error(
      "[axiosUsuarios ERROR]",
      err?.response?.status,
      err?.response?.data
    );
    throw err;
  }
);

export default axiosUsuarios;
