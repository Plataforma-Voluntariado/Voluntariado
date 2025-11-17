import React, { useEffect, useState, useCallback } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./ProfileVerificationLayout.css";
import ProfileEmail from "../../components/Profile/ProfileEmail/ProfileEmail";
import ProfileVerificationItem from "../../components/Profile/ProfileVerificationItem/ProfileVerificationItem";
import { GetUserFilesArray } from "../../services/auth/UserManagementService";
import { useVerificacionArchivoSocket } from "../../hooks/useVerificacionArchivoSocket";

function ProfileVerificationLayout({ user }) {
  const [files, setFiles] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await GetUserFilesArray();
      if (response) setFiles(response);
    } catch (error) {
      console.error("Error al obtener archivos:", error);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleArchivoEvent = useCallback((data) => {
    fetchFiles();
  }, [fetchFiles]);

  useVerificacionArchivoSocket(user?.userId, handleArchivoEvent,user?.rol);

  const getRequiredDocuments = () => {
    if (user.rol === "ADMIN") return [];
    const required = ["Cedula De Ciudadania"];
    if (user.rol === "CREADOR") required.push("Registro Unico Tributario");
    return required;
  };

  const documentsToShow = getRequiredDocuments().map((docType) => {
    const existingFile = files.find((f) => f.tipoDocumento === docType);
    return existingFile || {
      idVerificacionArchivo: null,
      tipoDocumento: docType,
      rutaArchivo: null,
      estado: "sin_subir",
      comentarioAdmin: null,
      fechaRevision: null,
    };
  });

  const toggleVerifications = () => setIsExpanded(!isExpanded);

  return (
    <div className="profile-verification-layout">
      <ProfileEmail user={user} />

      {documentsToShow.length > 0 && (
        <>
          <div className="profile-verification-toggle-card" onClick={toggleVerifications}>
            <div className="profile-verification-toggle-content">
              <h4 className="profile-verification-toggle-title">VERIFICACIÓN DE IDENTIDAD</h4>
              <p className="profile-verification-toggle-subtitle">
                {isExpanded ? "Ocultar" : "Ver"} tus documentos de verificación
              </p>
            </div>
            <div className={`profile-verification-toggle-icon ${isExpanded ? "expanded" : ""}`}>
              <FiChevronDown size={24} />
            </div>
          </div>

          {isExpanded && (
            <div className="profile-verification-items">
              {documentsToShow.map((file, i) => (
                <ProfileVerificationItem key={i} data={file} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfileVerificationLayout;
