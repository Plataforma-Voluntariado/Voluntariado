import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserData } from "../services/auth/AuthService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserData();
        if (profile) {
          setUser({
            userId: profile.id_usuario,
            nombreCompleto: `${profile.nombre} ${profile.apellido}`,
            email: profile.correo,
            rol: profile.rol,
            verificado: profile.verificado,
            urlImage: profile.url_imagen,
            ciudad: profile.ciudad?.ciudad,
            departamento: profile.ciudad?.departamento?.departamento,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error al obtener el perfil del usuario:", err);
        setUser(null);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};
