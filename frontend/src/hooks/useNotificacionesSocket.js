// hooks/useNotificacionesSocket.js (MODIFICADO)
import { useEffect, useRef } from "react";
import { createSocketConnection } from "../services/socket";

// 🚨 Ahora acepta un callback para notificar al componente.
export const useNotificacionesSocket = (userId, onNotificationEvent) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = createSocketConnection("/notificaciones", {
      auth: { userId },
    });

    socket.connect();
    socketRef.current = socket;

    socket.on("connect", () => {
      // eslint-disable-next-line no-console
      console.log("✅ WebSocket conectado al namespace /notificaciones");
    });

    socket.on("notificacion", (data) => {

      if (onNotificationEvent) {
        onNotificationEvent(data);
      }
    });

    socket.on("notificacionVista", ({ id_notificacion }) => {
      if (onNotificationEvent) {
        onNotificationEvent({ tipo: "VISTA", id_notificacion });
      }
    });

    socket.on("notificacionEliminada", ({ id_notificacion }) => {
      if (onNotificationEvent) onNotificationEvent({ tipo: "ELIMINADA", id_notificacion });
    });

    socket.on("disconnect", (reason) => {
      // eslint-disable-next-line no-console
      console.log("❌ WebSocket /notificaciones desconectado:", reason);
    });

    socket.on("connect_error", (error) => {
      // eslint-disable-next-line no-console
      console.error("💥 Error de conexión:", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // 🚨 Agregar onNotificationEvent a las dependencias, envuélvelo en useCallback si lo pasas desde otro hook.
  }, [userId, onNotificationEvent]);
};