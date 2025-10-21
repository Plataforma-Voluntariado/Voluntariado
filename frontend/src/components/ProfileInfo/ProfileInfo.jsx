import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileInfo.css";

function ProfileInfo({ user }) {
  const navigate = useNavigate();

  const handleVerificationClick = () => {
    // Navegar a una página de verificación (vacía por ahora)
    navigate("/verificar-correo");
  };

  return (
    <div className="profile-info">
      <div className="profile-info-item">
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
        <h4>Ciudad</h4>
        <p>{user.ciudad?.ciudad || "No especificada"}</p>
      </div>

      <div className="profile-info-item">
        <h4>Teléfono</h4>
        <p>{user.telefono || "No disponible"}</p>
      </div>

      <div className="profile-info-item profile-info-item-centered">
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
