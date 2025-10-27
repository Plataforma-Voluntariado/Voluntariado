import React, { useState } from "react";
import "./ProfileHeader.css";
import UploadProfilePhotoModal from "../../Modals/UploadProfilePhotoModal/UploadProfilePhotoModal";

function ProfileHeader({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isVerified = user.verificado === 1 || user.verificado === "1" || user.verificado === true;

  const handleAvatarClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="profile-header">
        <div className="profile-avatar-container" onClick={handleAvatarClick}>
          <img
            src={user.urlImage || "/placeholder.svg"}
            alt={`${user.nombre} ${user.apellido}`}
            className="profile-avatar"
          />
          <div className="profile-avatar-overlay">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
        </div>
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

      {isModalOpen && (
        <UploadProfilePhotoModal
          currentPhotoUrl={user.urlImage}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default ProfileHeader;