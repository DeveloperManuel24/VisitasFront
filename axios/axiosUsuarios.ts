import axios from "axios";

let TEMP_AUTH_TOKEN_USUARIOS = "";

export const setUsuariosAuthToken = (token: string) => {
  TEMP_AUTH_TOKEN_USUARIOS = token;
};

const axiosUsuarios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_USUARIOS_API_BASE_URL ||
    "http://localhost:3000",
  timeout: 10000,
  headers: { "Content-Type": "applica tion/json" },
});

axiosUsuarios.interceptors.request.use(
  (config) => {
    const token = TEMP_AUTH_TOKEN_USUARIOS || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosUsuarios;
