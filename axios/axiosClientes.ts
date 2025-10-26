import axios from "axios";

let TEMP_AUTH_TOKEN_CLIENTES = "";

export const setClientesAuthToken = (token: string) => {
  TEMP_AUTH_TOKEN_CLIENTES = token;
};

const axiosClientes = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_CLIENTES_API_BASE_URL ||
    "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

axiosClientes.interceptors.request.use(
  (config) => {
    const token = TEMP_AUTH_TOKEN_CLIENTES || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClientes;
