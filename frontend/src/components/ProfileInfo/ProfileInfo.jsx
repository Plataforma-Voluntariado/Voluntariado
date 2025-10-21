import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileInfo.css";
import iconoCorreo from "../../assets/photos/icono-correo.jpg";
import iconoCiudad from "../../assets/photos/icono-ciudad.png";
import iconoTelefono from "../../assets/photos/icono-telefono2.png";
import iconoFechaNacimiento from "../../assets/photos/icono-fecha-nacimiento.png";

function ProfileInfo({ user }) {
  const navigate = useNavigate();

  const handleVerificationClick = () => {
    // Navegar a una página de verificación (vacía por ahora)
    navigate("/verificar-correo");
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
