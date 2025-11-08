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
const useAuthSockets = (userId,handleUserUpdate,handleNotifications,handleNotificationVista,handleNotificationEliminada) => {
  useUserSocket(userId, handleUserUpdate);

  const memoizedEventHandler = useCallback(
    (event) => {
      if (!event) return;
      switch (event.tipo) {
        case "VISTA":
          handleNotificationVista(event.id_notificacion);
          break;
        case "ELIMINADA":
          handleNotificationEliminada(event.id_notificacion);
          break;
        default:
          handleNotifications();
      }
    },
    [handleNotificationVista, handleNotificationEliminada, handleNotifications]
  );

  useNotificacionesSocket(userId, memoizedEventHandler);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({ vistas: [], noVistas: [] });

  // Contador de no vistas siempre derivado del estado
  const unreadCount = notifications.noVistas.length;

  // Actualiza datos del usuario desde socket
  const handleUserUpdate = useCallback((userData) => {
    setUser((prev) => {
      if (!prev) return prev;

      const nombreCompleto =
        userData.rol === "CREADOR"
          ? userData.nombre_entidad || prev.nombre_entidad || "Entidad sin nombre"
          : userData.nombre && userData.apellido
          ? `${userData.nombre} ${userData.apellido}`
          : prev.nombreCompleto;

      return {
        ...prev,
        ...userData,
        rol: prev.rol,
        nombreCompleto,
        email: userData.correo || prev.email,
        correo: userData.correo || prev.correo,
        correo_verificado: userData.correo_verificado ?? prev.correo_verificado,
        verificado: userData.verificado ?? prev.verificado,
        nombre_entidad: userData.nombre_entidad || prev.nombre_entidad,
        urlImage: userData.url_imagen || prev.urlImage,
      };
    });
  }, []);

  // Fetch de notificaciones
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await GetNotifications();
      setNotifications({
        vistas: data.vistas || [],
        noVistas: data.noVistas || [],
      });
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
      setNotifications({ vistas: [], noVistas: [] });
    }
  }, []);

  // Marcar notificación como vista en estado local
  const handleNotificationVista = useCallback((id_notificacion) => {
    setNotifications((prev) => {
      const noti = prev.noVistas.find((n) => n.id_notificacion === id_notificacion);
      if (!noti) return prev;
      return {
        vistas: [noti, ...prev.vistas],
        noVistas: prev.noVistas.filter((n) => n.id_notificacion !== id_notificacion),
      };
    });
  }, []);

  // Eliminar notificación (vistas o no vistas)
  const handleNotificationEliminada = useCallback((id_notificacion) => {
    setNotifications((prev) => ({
      vistas: prev.vistas.filter((n) => n.id_notificacion !== id_notificacion),
      noVistas: prev.noVistas.filter((n) => n.id_notificacion !== id_notificacion),
    }));
  }, []);

  // Inicializa sockets
  useAuthSockets(user?.userId, handleUserUpdate, fetchNotifications, handleNotificationVista, handleNotificationEliminada);

  // Cargar usuario y notificaciones al iniciar
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones de estado en componentes desmontados
    
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserData();
        
        if (!isMounted) return; // No actualizar si el componente se desmontó
        
        if (!profile) {
          setUser(null);
          setLoading(false);
          return;
        }

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

        // Solo cargar notificaciones si el usuario existe
        try {
          await fetchNotifications();
        } catch (notifError) {
          console.error("Error loading notifications:", notifError);
          // No bloquear el login por errores de notificaciones
        }
        
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
    
    return () => {
      isMounted = false; // Cleanup
    };
  }, [fetchNotifications]); // Sin dependencias para ejecutar solo una vez

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        unreadCount,
        notifications,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
