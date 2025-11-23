import React, { useState } from "react";
import "./UserVerificationItem.css";
import ConfirmAlert from "../../alerts/ConfirmAlert";
import { SuccessAlert } from "../../../utils/ToastAlerts";
import { WrongAlert } from "../../../utils/ToastAlerts";
import TextAreaAlert from "../../alerts/TextAreaAlert";
import { AcceptUserFile, RejectUserFile } from "../../../services/auth/UserManagementService";

const baseURL = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

function UserVerificationItem({ data }) {
  const { idVerificacionArchivo, tipoDocumento, rutaArchivo, estado } = data;

  const [fileStatus, setFileStatus] = useState(estado);
  const [loading, setLoading] = useState(false);

  const isFinalizado = ["aprobado", "rechazado"].includes(fileStatus);
  const displayStatus = fileStatus.charAt(0).toUpperCase() + fileStatus.slice(1);

  const getFileName = (path) => path.split("\\").pop();
  const handleOpenFile = () => window.open(`${baseURL}/verificacion-archivo/ver/${idVerificacionArchivo}`, "_blank");

  const handleAction = async (tipo) => {
    if (tipo === "aceptar") {
      const confirmResult = await ConfirmAlert({
        title: "Aceptar archivo",
        message: "¿Estás seguro de aceptar este archivo?",
        confirmText: "Sí, aceptar",
        cancelText: "Cancelar",
      });
      if (!confirmResult) return;
    } else {
      const { confirmed, text } = await TextAreaAlert({
        title: "Rechazar archivo",
        message: "Por favor, escribe una observación para el usuario.",
        confirmText: "Rechazar archivo",
        cancelText: "Cancelar",
      });
      if (!confirmed) return;
      data.observacion = text; // guardar texto de rechazo
    }

    try {
      setLoading(true);
      const response =
        tipo === "aceptar"
          ? await AcceptUserFile(idVerificacionArchivo)
          : await RejectUserFile(idVerificacionArchivo, data.observacion);

      if (response?.statusText === "Created" || response?.status === 201) {
        setFileStatus(tipo === "aceptar" ? "aprobado" : "rechazado");
        SuccessAlert({
          title: `Archivo ${tipo === "aceptar" ? "aceptado" : "rechazado"}`,
          message: `El archivo ha sido ${tipo === "aceptar" ? "aceptado" : "rechazado"} correctamente.`,
        });
      } else throw new Error(response?.response?.data?.message || "Error desconocido");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error ${tipo}ndo el archivo:`, error);
      WrongAlert({ title: "Error", message: error.message || error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`user-verification-item ${loading ? "loading" : ""}`}>
      <div className="user-verification-item-info">
        <h3>{tipoDocumento}</h3>
        <p className={`user-verification-status user-verification-status-${fileStatus}`}>
          {displayStatus}
        </p>
        <p
          className="user-verification-filename"
          onClick={handleOpenFile}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          {getFileName(rutaArchivo)}
        </p>
      </div>

      {!isFinalizado && (
        <div className="user-verification-actions">
          <button className="user-verification-button accept" onClick={() => handleAction("aceptar")} disabled={loading}>
            Aceptar
          </button>
          <button className="user-verification-button reject" onClick={() => handleAction("rechazar")} disabled={loading}>
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

export default UserVerificationItem;
