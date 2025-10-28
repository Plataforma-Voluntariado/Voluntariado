// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUserData } from "../services/auth/AuthService";
import { useUserSocket } from "../hooks/useUserSocket";
import { useNotificacionesSocket } from "../hooks/useNotificacionesSocket";
import { GetNotifications } from "../services/notificaciones/notificacionesService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

// Hook personalizado para manejar sockets de usuario y notificaciones
const useAuthSockets = (userId, handleUserUpdate, handleNotifications) => {
  useUserSocket(userId, handleUserUpdate);
  useNotificacionesSocket(userId, handleNotifications);
};

export const AuthProvider = ({ children }) => {
  const [user, _setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Wrapper de setUser
  const setUser = (newUser) => _setUser(newUser);

  // Actualiza datos del usuario desde socket
  const handleUserUpdate = useCallback((userData) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const rolPrevio = prevUser.rol;

      return {
        ...prevUser,
        ...userData,
        rol: rolPrevio,
        nombreCompleto:
          userData.rol === "CREADOR"
            ? userData.nombre_entidad || prevUser.nombre_entidad || "Entidad sin nombre"
            : userData.nombre && userData.apellido
            ? `${userData.nombre} ${userData.apellido}`
            : prevUser.nombreCompleto,
        email: userData.correo || prevUser.email,
        correo: userData.correo || prevUser.correo,
        correo_verificado: userData.correo_verificado ?? prevUser.correo_verificado,
        verificado: userData.verificado ?? prevUser.verificado,
        nombre_entidad: userData.nombre_entidad || prevUser.nombre_entidad,
        urlImage: userData.url_imagen || prevUser.urlImage,
      };
    });
  }, []);

  // Función para cargar notificaciones sin leer
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await GetNotifications();
      if (response && Array.isArray(response)) {
        const sinLeer = response.filter((n) => n.visto === false).length;
        setUnreadCount(sinLeer);
      }
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  }, []);

  useAuthSockets(user?.userId, handleUserUpdate, fetchUnreadNotifications);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserData();
        if (profile) {
          setUser({
            userId: profile.id_usuario,
            email: profile.correo,
            correo: profile.correo,
            rol: profile.rol,
            verificado: profile.verificado,
            correo_verificado: profile.correo_verificado,
            urlImage: profile.url_imagen ? `${profile.url_imagen}?t=${Date.now()}` : null,
            ciudad: profile.ciudad?.ciudad,
            departamento: profile.ciudad?.departamento?.departamento,
            telefono: profile.telefono,
            fecha_nacimiento: profile.fecha_nacimiento,
            nombre_entidad: profile.creador?.nombre_entidad || null,
            nombreCompleto:
              profile.nombre || profile.apellido
                ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim()
                : null,
          });

          await fetchUnreadNotifications();
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [fetchUnreadNotifications]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        unreadCount,
        refreshNotifications: fetchUnreadNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
