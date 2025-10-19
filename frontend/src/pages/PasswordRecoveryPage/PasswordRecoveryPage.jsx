import React, { useState } from "react";
import "./PasswordRecoveryPage.css";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";
import { useNavigate } from "react-router-dom";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import { requestPasswordRecovery } from "../../services/auth/authPasswordRecovery";

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

      if (response.status === 200) {
        SuccessAlert({
          title: "Correo enviado",
          message: "Se ha enviado un enlace de recuperación a tu correo electrónico",
        }).then(() => {
          navigate("/login");
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
          message: "Ocurrió un problema al procesar tu solicitud. Intenta nuevamente más tarde.",
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
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="password-recovery-form-label">Correo Electrónico</label>
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
        </form>
      </div>
    </section>
  );
}

export default PasswordRecoveryPage;