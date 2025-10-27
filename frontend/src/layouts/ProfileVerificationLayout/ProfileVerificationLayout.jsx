import React, { useEffect, useState } from "react";
import "./ProfileVerificationLayout.css";
import ProfileEmail from "../../components/Profile/ProfileEmail/ProfileEmail";
import ProfileVerificationItem from "../../components/Profile/ProfileVerificationItem/ProfileVerificationItem";
import { GetUserFilesArray } from "../../services/auth/UserManagementService";

function ProfileVerificationLayout({ user }) {
  const [files, setFiles] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await GetUserFilesArray();
        if (response) {
          setFiles(response);
        }
      } catch (error) {
        console.error("Error al obtener archivos:", error);
      }
    };
    fetchFiles();
  }, []);

  const getRequiredDocuments = () => {
    if(user.rol === "ADMIN"){
      return [];
    }
    const required = ["Cedula De Ciudadania"];
    if (user.rol === "CREADOR") {
      required.push("Registro Unico Tributario");
    }
    return required;
  };

  const getAllDocuments = () => {
    const requiredDocs = getRequiredDocuments();

    return requiredDocs.map((docType) => {
      const existingFile = files.find((file) => file.tipoDocumento === docType);
      return (
        existingFile || {
          idVerificacionArchivo: null,
          tipoDocumento: docType,
          rutaArchivo: null,
          estado: "sin_subir",
          comentarioAdmin: null,
          fechaRevision: null,
        }
      );
    });
  };

  const documentsToShow = getAllDocuments();

  const toggleVerifications = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="profile-verification-layout">
      <ProfileEmail user={user} />
      
      {documentsToShow.length > 0 && (
        <>
          <div 
            className="profile-verification-toggle-card" 
            onClick={toggleVerifications}
          >
            <div className="profile-verification-toggle-content">
              <h4 className="profile-verification-toggle-title">
                Verificación de Identidad
              </h4>
              <p className="profile-verification-toggle-subtitle">
                {isExpanded ? 'Ocultar' : 'Ver'} tus documentos de verificación
              </p>
            </div>
            <div className={`profile-verification-toggle-icon ${isExpanded ? 'expanded' : ''}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {isExpanded && (
            <div className="profile-verification-items">
              {documentsToShow.map((file, index) => (
                <ProfileVerificationItem key={index} data={file} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfileVerificationLayout;