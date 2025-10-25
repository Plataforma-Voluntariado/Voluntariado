import React, { useState } from "react";
import "./UserVerificationItem.css";
import ConfirmAlert from "../alerts/ConfirmAlert";
import SuccessAlert from "../alerts/SuccessAlert";
import WrongAlert from "../alerts/WrongAlert";
import { AcceptUserFile, RejectUserFile } from "../../services/auth/UserManagementService";

const baseURL = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

function UserVerificationItem({ data }) {
  const { idVerificacionArchivo, tipoDocumento, rutaArchivo, estado } = data;
  const [loading, setLoading] = useState(false);

  const getFileName = (path) => path.split("\\").pop();

  const handleOpenFile = () => {
    const fileUrl = `${baseURL}/verificacion-archivo/ver/${idVerificacionArchivo}`;
    window.open(fileUrl, "_blank");
  };

  const handleAccept = async () => {
    const confirmResult = await ConfirmAlert({
      title: "Aceptar archivo",
      message: "¿Estás seguro de que deseas aceptar este archivo?",
      confirmText: "Sí, aceptar",
      cancelText: "Cancelar",
    });

    if (!confirmResult) return;

    try {
      setLoading(true);
      const response = await AcceptUserFile(idVerificacionArchivo);

      if (response?.success || response?.status === 200) {
        SuccessAlert({
          title: "Archivo aceptado",
          message: "El archivo ha sido aceptado correctamente.",
        });
      } else {
        throw new Error("El servidor no devolvió una respuesta válida.");
      }
    } catch (error) {
      console.error("Error aceptando el archivo:", error);
      WrongAlert({
        title: "Error",
        message: "Ocurrió un error al aceptar el archivo. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const confirmResult = await ConfirmAlert({
      title: "Rechazar archivo",
      message: "¿Estás seguro de que deseas rechazar este archivo?",
      confirmText: "Sí, rechazar",
      cancelText: "Cancelar",
    });

    if (!confirmResult) return;

    try {
      setLoading(true);
      const response = await RejectUserFile(idVerificacionArchivo);

      if (response?.success || response?.status === 200) {
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
        message: "Ocurrió un error al rechazar el archivo. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-verification-item">
      <div className="user-verification-item-info">
        <h3>{tipoDocumento}</h3>
        <p className="user-verification-status">{estado}</p>
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
          disabled={loading}
        >
          {loading ? "Procesando..." : "Aceptar"}
        </button>
        <button
          className="user-verification-button reject"
          onClick={handleReject}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Rechazar"}
        </button>
      </div>
    </div>
  );
}

export default UserVerificationItem;