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
import AboutUsPage from "./pages/AboutUsPage/AboutUsPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import CreateVoluntariadoPage from "./pages/CreateVoluntariadoPage/CreateVoluntariadoPage";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { Toaster } from "react-hot-toast";
import CreatorRoute from "./routes/CreatorRoute";
import CreatorInscripcionPage from "./pages/ManagementEventosPage/CreatorInscripcionPage/CreatorInscripcionPage"
import CreatorVolunteerPage from "./pages/ManagementEventosPage/CreatorVolunteerPage/CreatorVolunteerPage";
import VolunteerRoute from "./routes/VolunteerRoute";
import VolunteerInscripcionPage from "./pages/ManagementIncripcionPage/VolunteerInscripcionPage/VolunteerInscripcionPage";
import VoluntariadoDetailPage from "./pages/VoluntariadoDetailPage/VoluntariadoDetailPage";
import CreatorProfilePage from "./pages/CreatorProfile/CreatorProfilePage";
import VolunteerProfile from "./pages/VolunteerProfile/VolunteerProfile";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ScrollToTop />
    <Toaster position="top-right" />
    <Routes>
      {/* Rutas Publicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recuperar-contrasena" element={<PasswordRecoveryPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/about-us" element={<AuthProvider><AboutUsPage /></AuthProvider>} />

      {/* Rutas privadas*/}
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
          <Route path="/crear-voluntariado" element={<CreateVoluntariadoPage />} />
          <Route path="/voluntariado/:id" element={<VoluntariadoDetailPage />} />
          <Route path="/creador/:id" element={<CreatorProfilePage />} />
          <Route path="/voluntario/:id" element={<VolunteerProfile />} />
          <Route element={<UnverifiedEmailRoute />}><Route path="/verificar-correo" element={<EmailVerificationPage />} /></Route>
        </Route>
      </Route>

      {/* Rutas de administración*/}
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

      {/* Rutas de creadores */}
      <Route
        element={
          <AuthProvider>
            <CreatorRoute />
          </AuthProvider>
        }
      >
        <Route element={<NavbarLayout />}>
          <Route path="/manage-events" element={<CreatorVolunteerPage />} />
          <Route path="/manage-events/:eventId" element={<CreatorInscripcionPage />} />
        </Route>
      </Route>

      {/* Ruras de Voluntarios */}
      <Route
        element={
          <AuthProvider>
            <VolunteerRoute />
          </AuthProvider>
        }
      >
        <Route element={<NavbarLayout />}>
          <Route path="/manage-inscripciones" element={<VolunteerInscripcionPage />} />
        </Route>
      </Route>


      {/* Ruta 404 */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);
