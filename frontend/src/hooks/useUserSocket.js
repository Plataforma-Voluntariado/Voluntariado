import { useEffect, useRef } from 'react';
import { createSocketConnection } from '../services/socket';

export const useUserSocket = (userId, onUserUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = createSocketConnection('/usuario');
    socket.connect();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado al namespace /usuario');
    });

    socket.on('novedad-perfil', (userData) => {
      onUserUpdate(userData);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('💥 Error de conexión:', error);
    });

    // 🧹 Cleanup al desmontar o al cambiar userId
    return () => {
      console.log('🧹 Cerrando conexión WebSocket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, onUserUpdate]);
};
