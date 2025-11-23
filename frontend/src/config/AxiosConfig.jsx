import axios from "axios";
import { logout } from "../services/auth/AuthService.jsx"
const URI = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;
const api = axios.create({
  baseURL: URI,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async error => {
    const reqUrl = error.config?.url;

    if (error.response?.status === 401 && reqUrl?.includes("/auth/perfil")){
      // Solo hacer logout, no redirigir automáticamente para evitar bucles
      // La redirección se manejará en el contexto/componente
      try {
        await logout();
      } catch (logoutError) {
        // eslint-disable-next-line no-console
        console.error("Error during logout:", logoutError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
