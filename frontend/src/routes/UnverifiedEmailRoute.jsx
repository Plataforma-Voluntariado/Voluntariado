import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const UnverifiedEmailRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1.5em" }}>
        Cargando...
      </div>
    );
  }

  // Si no hay usuario, ir a landing page
  if (!user) return <Navigate to="/" replace />;

  // Si el correo ya está verificado, ir a perfil
  if (user.correo_verificado === 1 || user.correo_verificado === "1" || user.correo_verificado === true) {
    return <Navigate to="/profile" replace />;
  }

  // Si el correo no está verificado, permitir acceso al outlet
  return <Outlet />;
};

export default UnverifiedEmailRoute;
