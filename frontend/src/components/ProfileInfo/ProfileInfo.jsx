import React from "react";
import "./ProfileInfo.css";

function ProfileInfo({ user }) {
  return (
    <div className="profile-info">
      <div className="profile-info-item">
        <h4>Correo</h4>
        <p>{user.correo}</p>
      </div>

      <div className="profile-info-item">
        <h4>Ciudad</h4>
        <p>{user.ciudad?.ciudad || "No especificada"}</p>
      </div>

      <div className="profile-info-item">
        <h4>Departamento</h4>
        <p>{user.ciudad?.departamento?.departamento || "No disponible"}</p>
      </div>
    </div>
  );
}

export default ProfileInfo;
