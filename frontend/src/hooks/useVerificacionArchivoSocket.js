// src/hooks/useVerificacionArchivoSocket.js
import { useEffect, useRef } from "react";
import { createSocketConnection } from "../services/socket";

export const useVerificacionArchivoSocket = (userId, onArchivoEvent,rol) => {
    const socketRef = useRef(null);

    useEffect(() => {
         if (!userId || rol === "ADMIN") return;

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const socket = createSocketConnection("/verificacion-archivo", {
            auth: { userId },
        });

        socket.connect();
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ WebSocket conectado a /verificacion-archivo");
        });

        socket.on("actualizacion-verificacion", (data) => {
            onArchivoEvent?.(data);
        });

        socket.on("disconnect", () => {
            console.log("❌ Desconectado de /verificacion-archivo");
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId, onArchivoEvent,rol]);
};
