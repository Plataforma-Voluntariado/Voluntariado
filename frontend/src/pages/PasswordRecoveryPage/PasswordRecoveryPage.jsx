import React, { useState } from "react";
import "./PasswordRecoveryPage.css";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";
import { useNavigate } from "react-router-dom";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import { requestPasswordRecovery } from "../../services/auth/authPasswordRecoveryService";
import VoluntariadoLogo from "../../assets/photos/logo.png";

function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      WrongAlert({
        title: "Campo requerido",
        message: "Por favor ingresa tu correo electrónico",
      });
      return;
    }

    setLoading(true);

    try {
      // Usar el servicio de recuperación de contraseña
      const response = await requestPasswordRecovery(email);
      

      // Mostrar alerta de éxito si la petición fue exitosa (cualquier status 2xx)
      if (response.status >= 200 && response.status < 300) {
        
        
        // Solo usar SweetAlert2
        SuccessAlert({
          title: "¡Enlace enviado exitosamente!",
          message:
            "Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.",
          timer: 4000,
        }).then(() => {
          navigate("/login");
        });
      } else {
        WrongAlert({
          title: "Error",
          message: "No se pudo enviar el correo. Intenta nuevamente más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);

      if (error.response?.status === 404) {
        WrongAlert({
          title: "Correo no encontrado",
          message: "No existe una cuenta asociada a este correo",
        });
      } else {
        WrongAlert({
          title: "Error",
          message:
            "Ocurrió un problema al procesar tu solicitud. Intenta nuevamente más tarde.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="password-recovery-page">
      <div className="password-recovery-page-image-wrapper">
        <img
          className="password-recovery-page-background-image"
          src={ImgHandsBackground}
          alt="Voluntariado manos"
        />
      </div>
      <div className="password-recovery-form">
        <h1 className="password-recovery-form-title">Recuperar Contraseña</h1>
        <p className="password-recovery-form-description">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="password-recovery-form-label">
            Correo Electrónico
          </label>
          <input
            className="password-recovery-form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@ejemplo.com"
            required
          />

          <button
            className="password-recovery-form-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
          </button>

          <div className="password-recovery-form-back-link">
            <p>
              <a href="/login">Volver al inicio de sesión</a>
            </p>
          </div>
          <img
            className="login-form-logo-img"
            src={VoluntariadoLogo}
            alt="Voluntariado Logo"
          />
        </form>
      </div>
    </section>
  );
}

export default PasswordRecoveryPage;
