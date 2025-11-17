import React, { useState } from "react";
import { FiCamera } from "react-icons/fi";
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
            <FiCamera size={32} />
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