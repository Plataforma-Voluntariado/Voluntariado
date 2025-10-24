import React from "react";
import "./ProfileHeader.css";

function ProfileHeader({ user }) {
  // Verificamos si la cuenta está verificada
  const isVerified =user.verificado === 1 ||user.verificado === "1" ||user.verificado === true;
  // Determinar qué nombre mostrar según el rol
  const displayName =
    user.rol === "CREADOR"? user.nombre_entidad: user.nombreCompleto || `${user.nombre || ""} ${user.apellido || ""}`.trim();

  return (
    <header className="profile-header">
      <img
        src={user.urlImage}
        alt={displayName}
        className="profile-avatar"
      />
      <h2 className="profile-name">{displayName}</h2>
      <p className="profile-role">
        {user.rol
          ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1).toLowerCase()
          : ""}
      </p>
      <p className={`profile-status ${isVerified ? "verified" : "unverified"}`}>
        {isVerified ? "Cuenta verificada" : "Cuenta no verificada"}
      </p>
    </header>
  );
}

export default ProfileHeader;
