import React, { useEffect, useState, useCallback, useRef } from "react";
import "./UserVerificationLayout.css";
import { GetUserByVerificationId } from "../../../services/auth/UserManagementService";
import UserVerificationItem from "../../../components/Admin/UserVerificationItem/UserVerificationItem";
import { useVerificacionArchivoAdminSocket } from "../../../hooks/useVerificacionArchivoSocketAdmin";

function UserVerificationLayout({ verificationId, admin }) {
  const [files, setFiles] = useState([]);
  const fetchFilesRef = useRef(null); 

  const fetchFiles = useCallback(async () => {
    const filesData = await GetUserByVerificationId(verificationId);
    setFiles(filesData);
  }, [verificationId]);

  fetchFilesRef.current = fetchFiles;

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useVerificacionArchivoAdminSocket(admin?.userId, (evento) => {
    const { tipo } = evento;
    if (["subido", "aprobado", "rechazado"].includes(tipo)) {
      fetchFilesRef.current?.(); 
    }
  });

  if (!files.length) {
    return (
      <p className="user-verification-empty">
        No se encontraron archivos para esta verificación.
      </p>
    );
  }

  return (
    <div className="user-verification-layout">
      {files.map((file) => (
        <UserVerificationItem key={file.idVerificacionArchivo} data={file} />
      ))}
    </div>
  );
}

export default UserVerificationLayout;
