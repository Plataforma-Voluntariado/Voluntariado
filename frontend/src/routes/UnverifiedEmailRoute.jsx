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

  if (!user) return <Navigate to="/" replace />;

  if (user.correo_verificado === 1 || user.correo_verificado === "1" || user.correo_verificado === true) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default UnverifiedEmailRoute;
