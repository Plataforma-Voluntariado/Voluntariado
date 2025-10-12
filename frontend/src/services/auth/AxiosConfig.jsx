import axios from "axios";
const URI = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;
const api = axios.create({
  baseURL: "URI",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
