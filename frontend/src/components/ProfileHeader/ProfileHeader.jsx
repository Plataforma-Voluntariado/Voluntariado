import React from "react";
import "./ProfileHeader.css";

function ProfileHeader({ user }) {
  return (
    <header className="profile-header">
      <img
        src={user.url_imagen}
        alt={`${user.nombre} ${user.apellido}`}
        className="profile-avatar"
      />
      <h2 className="profile-name">{user.rol==="VOLUNTARIO"?`${user.nombre} ${user.apellido}`:user.correo}</h2>
      <p className="profile-role">
        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1).toLowerCase()}
      </p>
      <p className={`profile-status ${user.verificado ? "verified" : "unverified"}`}>
        {user.verificado ? "Cuenta verificada" : "Cuenta no verificada"}
      </p>
    </header>
  );
}

export default ProfileHeader;
