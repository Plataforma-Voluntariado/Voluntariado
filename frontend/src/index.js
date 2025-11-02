import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
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
import AboutUsPage from "./pages/AboutUsPage/AboutUsPage";
import LandingPage from "./pages/LandingPage/LandingPage";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas - SIN AuthProvider para evitar verificaciones innecesarias */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recuperar-contrasena" element={<PasswordRecoveryPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Rutas privadas - CON AuthProvider */}
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
        </Route>
      </Route>

      {/* Rutas de administración - CON AuthProvider */}
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

      {/* Ruta fallback - redirige a landing page */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);
