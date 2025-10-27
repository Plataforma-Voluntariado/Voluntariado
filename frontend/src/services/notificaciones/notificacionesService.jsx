import api from "../../config/AxiosConfig";

// Obtener notificaciones del usuario
export const GetNotifications = async () => {
  try {
    const response = await api.get("/notificaciones");
    return response.data; // solo retornamos los datos
  } catch (error) {
    console.error("Error al obtener las notificaciones", error);
    return false;
  }
};

// Marcar una notificación como vista
export const MarkNotificationAsSeen = async (notificacionId) => {
  try {
    const response = await api.post(`/notificaciones/marcar-vista/${notificacionId}`);
    return response.data;
  } catch (error) {
    console.error("Error al marcar la notificación como vista", error);
    return false;
  }
};
