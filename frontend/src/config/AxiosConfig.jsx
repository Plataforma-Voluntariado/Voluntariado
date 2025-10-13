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

    if (error.response?.status === 401 && reqUrl.includes("/auth/perfil")){
      await logout();
      window.location.href("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
