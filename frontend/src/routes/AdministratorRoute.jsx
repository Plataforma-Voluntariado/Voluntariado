import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AdministratorRoute = () => {
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
  if (user.rol !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdministratorRoute;
