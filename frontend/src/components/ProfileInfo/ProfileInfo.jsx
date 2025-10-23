import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileInfo.css";
import iconoCorreo from "../../assets/photos/icono-correo.jpg";
import iconoCiudad from "../../assets/photos/icono-ciudad.png";
import iconoTelefono from "../../assets/photos/icono-telefono2.png";
import iconoFechaNacimiento from "../../assets/photos/icono-fecha-nacimiento.png";
import { sendVerificationEmail } from "../../services/auth/authEmailVerificationService";
import SuccessAlert from "../alerts/SuccessAlert";
import WrongAlert from "../alerts/WrongAlert";

function ProfileInfo({ user }) {
  const navigate = useNavigate();

  const handleVerificationClick = async () => {
    try {
      const response = await sendVerificationEmail(user.correo);

      if (response && response.message) {
        // Espera a que termine la alerta antes de navegar
        await SuccessAlert({
          title: "¡Éxito!",
          message: "Se ha enviado un código de verificación a tu correo",
        });

        navigate("/verificar-correo");
      } else {
        await WrongAlert({
          message: response.message
        });
      }
    } catch (error) {
      console.error("Error al enviar el código:", error);
      await WrongAlert(
        {
          message: error.response?.data?.message || "Error al procesar la solicitud. Por favor, intenta más tarde."
        }
      );
    }
  };



  return (
    <div className="profile-info">
      <div className="profile-info-item">
        <img src={iconoCorreo} alt="Correo" className="profile-info-icon" />
        <h4>Correo</h4>
        <div className="email-container">
          <p>{user.correo}</p>
          {user.correo_verificado === 1 || user.correo_verificado === "1" || user.correo_verificado === true ? (
            <span className="verification-badge verified">Verificado</span>
          ) : (
            <button
              className="verification-badge not-verified"
              onClick={handleVerificationClick}
              type="button"
            >
              No verificado
            </button>
          )}
        </div>
      </div>

      <div className="profile-info-item">
        <img src={iconoCiudad} alt="Ciudad" className="profile-info-icon" />
        <h4>Ciudad</h4>
        <p>{user.ciudad?.ciudad || "No especificada"}</p>
      </div>

      <div className="profile-info-item">
        <img src={iconoTelefono} alt="Teléfono" className="profile-info-icon" />
        <h4>Teléfono</h4>
        <p>{user.telefono || "No disponible"}</p>
      </div>

      <div className="profile-info-item profile-info-item-centered">
        <img src={iconoFechaNacimiento} alt="Fecha de Nacimiento" className="profile-info-icon" />
        <h4>Fecha de Nacimiento</h4>
        <p>{user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : "No especificada"}</p>
      </div>
    </div>
  );
}

export default ProfileInfo;
