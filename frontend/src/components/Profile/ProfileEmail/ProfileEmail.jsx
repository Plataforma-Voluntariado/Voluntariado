import React from "react";
import "./ProfileEmail.css";
import { sendVerificationEmail } from "../../../services/auth/authEmailVerificationService";
import { SuccessAlert } from "../../../utils/ToastAlerts";
import { WrongAlert } from "../../../utils/ToastAlerts";
import { useNavigate } from "react-router-dom";
import { FaMailBulk } from "react-icons/fa";
function ProfileEmail({ user }) {
  const navigate = useNavigate();

  const handleVerificationClick = async () => {
    try {
      const response = await sendVerificationEmail(user.correo);

      if (response && response.message) {
        await SuccessAlert({
          title: "¡Éxito!",
          message: "Se ha enviado un código de verificación a tu correo",
        });

        navigate("/verificar-correo");
      } else {
        await WrongAlert({
          message: response.message,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al enviar el código:", error);
      await WrongAlert({
        message:
          error.response?.data?.message ||
          "Error al procesar la solicitud. Por favor, intenta más tarde.",
      });
    }
  };
  const isVerified =
    user.correo_verificado === true ||
    user.correo_verificado === "true" ||
    user.correo_verificado === 1 ||
    user.correo_verificado === "1";

  return (
    <div 
      className="profile-email-card"
      data-intro="Aquí puedes verificar tu correo electrónico. Es importante tener el correo verificado para recibir notificaciones importantes."
      data-step="2"
    >
      <FaMailBulk
        className="profile-email-icon"
      />

      <div className="profile-email-header">
        <span className="profile-email-label">CORREO:</span>
        <span
          className={`profile-email-status ${
            isVerified ? "verified" : "not-verified"
          }`}
        >
          {isVerified ? "Verificado" : "No verificado"}
        </span>
      </div>

      <div className="profile-email-content">
        <p className="profile-email-address">{user.correo}</p>
        {!isVerified && (
          <button
            className="profile-email-verify-button"
            onClick={handleVerificationClick}
            type="button"
          >
            Verificar
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileEmail;
