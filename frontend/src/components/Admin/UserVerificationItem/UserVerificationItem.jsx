import React, { useState } from "react";
import "./UserVerificationItem.css";
import ConfirmAlert from "../../alerts/ConfirmAlert";
import SuccessAlert from "../../alerts/SuccessAlert";
import WrongAlert from "../../alerts/WrongAlert";
import TextAreaAlert from "../../alerts/TextAreaAlert";
import { AcceptUserFile, RejectUserFile } from "../../../services/auth/UserManagementService";

const baseURL = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

function UserVerificationItem({ data }) {
  const { idVerificacionArchivo, tipoDocumento, rutaArchivo } = data;

  const [fileStatus, setFileStatus] = useState(data.estado);
  const [loading, setLoading] = useState(false);

  const getFileName = (path) => path.split("\\").pop();

  const handleOpenFile = () => {
    const fileUrl = `${baseURL}/verificacion-archivo/ver/${idVerificacionArchivo}`;
    window.open(fileUrl, "_blank");
  };

  const handleAccept = async () => {
    const confirmResult = await ConfirmAlert({
      title: "Aceptar archivo",
      message: "¿Estás seguro de aceptar este archivo?",
      confirmText: "Sí, aceptar",
      cancelText: "Cancelar",
    });

    if (!confirmResult) return;

    try {
      setLoading(true);
      const response = await AcceptUserFile(idVerificacionArchivo);

      if (response?.statusText==="Created" || response?.status === 201) {
        setFileStatus("aprovado");
        SuccessAlert({
          title: "Archivo aceptado",
          message: "El archivo ha sido aceptado correctamente.",
        });
      } else {
        throw new Error(response.response.data.message);
      }
    } catch (error) {
      console.error("Error aceptando el archivo:", error);
      WrongAlert({
        title: "Error",
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const { confirmed, text } = await TextAreaAlert({
      title: "Rechazar archivo",
      message: "Por favor, escribe una observación para el usuario.",
      confirmText: "Rechazar archivo",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await RejectUserFile(idVerificacionArchivo, text);

        if (response?.statusText==="Created" || response?.status === 201) {
        setFileStatus("rechazado");
        SuccessAlert({
          title: "Archivo rechazado",
          message: "El archivo ha sido rechazado correctamente.",
        });
      } else {
        throw new Error("El servidor no devolvió una respuesta válida.");
      }
    } catch (error) {
      console.error("Error rechazando el archivo:", error);
      WrongAlert({
        title: "Error",
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`user-verification-item ${loading ? "loading" : ""}`}>
      <div className="user-verification-item-info">
        <h3>{tipoDocumento}</h3>

        <p className={`user-verification-status user-verification-status-${fileStatus}`}>
          {fileStatus.charAt(0).toUpperCase() + fileStatus.slice(1)}
        </p>

        <p
          className="user-verification-filename"
          onClick={handleOpenFile}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          {getFileName(rutaArchivo)}
        </p>
      </div>

      <div className="user-verification-actions">
        <button
          className="user-verification-button accept"
          onClick={handleAccept}
          disabled={loading || fileStatus === "aceptado"}
        >
          Aceptar
        </button>
        <button
          className="user-verification-button reject"
          onClick={handleReject}
          disabled={loading || fileStatus === "rechazado"}
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}

export default UserVerificationItem;