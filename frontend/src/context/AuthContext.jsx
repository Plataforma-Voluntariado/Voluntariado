import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUserData } from "../services/auth/AuthService";
import { useUserSocket } from "../hooks/useUserSocket";


const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(user)

  //Maneja actualizaciones en tiempo real por WebSocket
  const handleUserUpdate = useCallback((userData) => {

    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
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
    }));
  }, []);

  //Inicializa conexión de socket (si aplica)
  useUserSocket(user?.userId, handleUserUpdate);

  //Carga el perfil del usuario al iniciar
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
            nombreCompleto: profile.nombre || profile.apellido ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim() : null,

          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error al obtener el perfil del usuario:", err);
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
