import { useEffect, useRef } from "react";
import { createSocketConnection } from "../services/socket";

export const useVerificacionArchivoAdminSocket = (adminId, onAdminEvent) => {
  const socketRef = useRef(null);
  const eventRef = useRef(onAdminEvent);

  // Mantener la función actualizada
  useEffect(() => {
    eventRef.current = onAdminEvent;
  }, [onAdminEvent]);

  useEffect(() => {
    if (!adminId) return;
    if (socketRef.current) return;

    const socket = createSocketConnection("/verificacion-archivo-admin", {
      auth: { userId: adminId, rol: "ADMIN" },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ [AdminSocket] Conectado a /verificacion-archivo-admin");
    });

    socket.on("actualizacion-verificacion-admin", (data) => {
      console.log("📡 [AdminSocket] Evento recibido:", data);
      eventRef.current?.(data);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ [AdminSocket] Desconectado (${reason})`);
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [adminId]);
};
