import React, { useEffect, useState } from "react";
import "./UserVerificationLayout.css";
import { GetUserByVerificationId } from "../../services/auth/UserManagementService";
import UserVerificationItem from "../../components/UserVerificationItem/UserVerificationItem";

function UserVerificationLayout({ verificationId }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    const fetchFiles = async () => {
      const filesData = await GetUserByVerificationId(verificationId);
      setFiles(filesData);
    };
    fetchFiles();
  }, [verificationId]);
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
        <UserVerificationItem key={file.idVerificacion} data={file} />
      ))}
    </div>
  );
}

export default UserVerificationLayout;
