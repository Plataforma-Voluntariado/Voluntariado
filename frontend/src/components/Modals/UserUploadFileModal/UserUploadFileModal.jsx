import React, { useState } from "react";
import "./UserUploadFileModal.css";
import { UploadUserFile } from "../../../services/auth/UserManagementService";
import { SuccessAlert } from "../../../utils/ToastAlerts";
import { WrongAlert } from "../../../utils/ToastAlerts";

function UserUploadFileModal({ tipoDocumento, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFileType = (documentType) => {
    const lowerType = documentType.toLowerCase();
    if (lowerType.includes("cedula")) return "cedula";
    if (lowerType.includes("registro") && lowerType.includes("tributario"))
      return "rut";
    return documentType;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      WrongAlert({
        title: "Error",
        message: "Por favor selecciona un archivo antes de subir.",
      });
      return;
    }

    try {
      setLoading(true);
      const fileType = getFileType(tipoDocumento);
      const response = await UploadUserFile(selectedFile, fileType);
      if (response.status === 400) {
        return WrongAlert({
          title: "Error",
          message: response.response.data.message,
        });
      }
      await SuccessAlert({
        title: "Archivo subido",
        message:
          "El archivo se ha subido correctamente y está pendiente de revisión.",
      });
      onClose();
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      WrongAlert({
        title: "Error",
        message:
          error.message ||
          "Ocurrió un error al subir el archivo. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div
        className="upload-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="upload-modal-header">
          <h3>Subir nuevo archivo</h3>
          <button className="upload-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="upload-modal-body">
          <p className="upload-modal-document-type">
            Tipo de documento: <strong>{tipoDocumento}</strong>
          </p>

          <div className="upload-modal-file-input-wrapper">
            <input
              type="file"
              id="file-upload"
              className="upload-modal-file-input"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={loading}
            />
            <label htmlFor="file-upload" className="upload-modal-file-label">
              {selectedFile ? selectedFile.name : "Seleccionar archivo"}
            </label>
          </div>

          {selectedFile && (
            <p className="upload-modal-file-info">
              Archivo seleccionado: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        <div className="upload-modal-actions">
          <button
            className="upload-modal-button cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="upload-modal-button upload"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
          >
            {loading ? "Subiendo..." : "Subir archivo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserUploadFileModal;
