import React, { useState } from "react";
import "./ProfileVerificationItem.css";
import UserUploadFileModal from "../../UserUploadFileModal/UserUploadFileModal";

const baseURL = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

function ProfileVerificationItem({ data }) {
  const {
    idVerificacionArchivo,
    tipoDocumento,
    rutaArchivo,
    estado,
    comentarioAdmin,
    fechaRevision,
  } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFileName = (path) => {
    if (!path) return "";
    return path.split("\\").pop();
  };

  const handleOpenFile = () => {
    if (!idVerificacionArchivo) return;
    const fileUrl = `${baseURL}/verificacion-archivo/ver/${idVerificacionArchivo}`;
    window.open(fileUrl, "_blank");
  };

  const handleUploadClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isFileUploaded =
    rutaArchivo && rutaArchivo.trim() !== "" && estado !== "sin_subir";

  return (
    <>
      <div
        className={`profile-verification-card ${
          !isFileUploaded ? "profile-verification-card-empty" : ""
        }`}
      >
        <div className="profile-verification-header">
          <h4 className="profile-verification-title">{tipoDocumento}</h4>
          {isFileUploaded && (
            <span
              className={`profile-verification-status profile-verification-status-${estado}`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
          )}
        </div>

        {!isFileUploaded ? (
          <div className="profile-verification-empty-state">
            <p className="profile-verification-empty-message">
              No has subido este documento aún
            </p>
            <button
              className="profile-verification-button upload-primary"
              onClick={handleUploadClick}
            >
              Subir {tipoDocumento}
            </button>
          </div>
        ) : (
          <>
            <div className="profile-verification-info">
              <div className="profile-verification-field">
                <span className="profile-verification-label">Archivo:</span>
                <span
                  className="profile-verification-filename"
                  onClick={handleOpenFile}
                >
                  {getFileName(rutaArchivo)}
                </span>
              </div>

              {comentarioAdmin && (
                <div className="profile-verification-field">
                  <span className="profile-verification-label">
                    Comentario del administrador:
                  </span>
                  <span className="profile-verification-comment">
                    {comentarioAdmin}
                  </span>
                </div>
              )}

              {fechaRevision && (
                <div className="profile-verification-field">
                  <span className="profile-verification-label">
                    Fecha de revisión:
                  </span>
                  <span className="profile-verification-value">
                    {formatDate(fechaRevision)}
                  </span>
                </div>
              )}
            </div>

            <div className="profile-verification-actions">
              <button
                className="profile-verification-button view"
                onClick={handleOpenFile}
              >
                Ver archivo
              </button>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <UserUploadFileModal
          tipoDocumento={tipoDocumento}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default ProfileVerificationItem;
