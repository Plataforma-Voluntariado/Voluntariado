import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserData } from "../services/auth/AuthService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
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
      setLoading(false);
    };
    fetchUserProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
