import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const CreatorRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5em",
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.rol !== "CREADOR") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default CreatorRoute;
