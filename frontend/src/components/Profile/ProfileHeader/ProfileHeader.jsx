import React from "react";
import "./ProfileHeader.css";

function ProfileHeader({ user }) {
  // Verificamos si el campo verificado es 1 (verificado) o 0 (no verificado)
  const isVerified = user.verificado === 1 || user.verificado === "1" || user.verificado === true;

  return (
    <header className="profile-header">
      <img
        src={user.urlImage}
        alt={`${user.nombre} ${user.apellido}`}
        className="profile-avatar"
      />
      <h2 className="profile-name">
        {user.rol === "CREADOR"
          ? user.nombre_entidad || "Entidad sin nombre"
          : user.nombreCompleto}
      </h2>
      <p className="profile-role">
        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1).toLowerCase()}
      </p>
      <p className={`profile-status ${isVerified ? "verified" : "unverified"}`}>
        {isVerified ? "Cuenta verificada" : "Cuenta no verificada"}
      </p>
    </header>
  );
}

export default ProfileHeader;
