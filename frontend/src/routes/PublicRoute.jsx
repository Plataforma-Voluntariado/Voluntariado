import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        fontSize: "1.5em" 
      }}>
        Verificando sesión...
      </div>
    );
  }

  // Si hay usuario logueado, redirigir a /home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Si no hay usuario, permitir acceso a rutas públicas
  return <Outlet />; 
};

export default PublicRoute;