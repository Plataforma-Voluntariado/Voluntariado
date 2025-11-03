import api from "../../config/AxiosConfig";

// Obtener notificaciones del usuario sin ver para poner en la campanita como feedback primario
export const GetNotifications = async () => {
  try {
    const response = await api.get("/notificaciones");
    return response.data;
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

// Eliminar una notificación (marcar como eliminado)
export const DeleteNotification = async (notificacionId) => {
  try {
    const response = await api.post(`/notificaciones/eliminar/${notificacionId}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la notificación", error);
    return false;
  }
};

