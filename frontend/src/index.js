import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import UnverifiedEmailRoute from "./routes/UnverifiedEmailRoute";
import { AuthProvider } from "./context/AuthContext";
import NavbarLayout from "./layouts/NavbarLayout/NavbarLayout";
import HomePage from "./pages/HomePage/HomePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import PasswordRecoveryPage from "./pages/PasswordRecoveryPage/PasswordRecoveryPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage/EmailVerificationPage";
import AdministratorRoute from "./routes/AdministratorRoute";
import UserManagementPage from "./pages/UserManagementPage/UserManagementPage";
import UserVerificationPage from "./pages/UserVerificationPage/UserVerificationPage";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Rutas privadas */}
      <Route
        element={
          <AuthProvider>
            <ProtectedRoute />
          </AuthProvider>
        }
      >
        <Route element={<NavbarLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<UnverifiedEmailRoute />}>
            <Route
              path="/verificar-correo"
              element={<EmailVerificationPage />}
            />
          </Route>
          <Route path="*" element={<HomePage />} />
        </Route>
      </Route>
      {/* Rutas de administración */}
      <Route
        element={
          <AuthProvider>
            <AdministratorRoute />
          </AuthProvider>
        }
      >
        <Route element={<NavbarLayout />}>
          <Route
            path="/user-management/:role"
            element={<UserManagementPage />}
          />
          <Route
            path="/user-management/verification/:id"
            element={<UserVerificationPage />}
          />
        </Route>
      </Route>

      {/* Rutas públicas */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="recuperar-contrasena" element={<PasswordRecoveryPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />

      {/* Ruta fallback */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  </BrowserRouter>
);
