import React, { useState } from "react";
import "./UploadProfilePhotoModal.css";
import { UploadProfilePhoto, DeleteProfilePhoto } from "../../../services/auth/UserManagementService";
import { SuccessAlert } from "../../../utils/ToastAlerts";
import { WrongAlert } from "../../../utils/ToastAlerts";

function UploadProfilePhotoModal({ currentPhotoUrl, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stop propagation helper
  const stopPropagation = (e) => e.stopPropagation();

  // Manejo de selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return WrongAlert({
        title: "Error",
        message: "Por favor selecciona un archivo de imagen válido.",
      });
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Función helper para manejo de acciones async con alerts
  const handleAsyncAction = async (action) => {
    try {
      setLoading(true);
      const response = await action();
      if (response && !response.error) {
        return { ok: true };
      }
      throw new Error(response.error || "Ocurrió un error");
    } catch (error) {
      return { ok: false, error };
    } finally {
      setLoading(false);
    }
  };


  // Subir nueva foto
  const handleUpload = () =>
    handleAsyncAction(
      () => UploadProfilePhoto(selectedFile),
      {
        title: "Foto actualizada",
        message: "Tu foto de perfil se ha actualizado correctamente.",
      }
    );

  // Eliminar foto actual
  const handleDelete = () =>
    handleAsyncAction(
      DeleteProfilePhoto,
      {
        title: "Foto eliminada",
        message: "Tu foto de perfil se ha eliminado correctamente.",
      }
    );

  return (
    <div className="upload-photo-modal-overlay" onClick={onClose}>
      <div className="upload-photo-modal-content" onClick={stopPropagation}>
        {/* Header */}
        <div className="upload-photo-modal-header">
          <h3>Foto de perfil</h3>
          <button className="upload-photo-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="upload-photo-modal-body">
          <div className="upload-photo-preview">
            <img
              src={previewUrl || currentPhotoUrl || "/placeholder.svg"}
              alt="Vista previa"
              className="upload-photo-preview-image"
            />
          </div>

          <div className="upload-photo-file-input-wrapper">
            <input
              type="file"
              id="photo-upload"
              className="upload-photo-file-input"
              onChange={handleFileChange}
              accept="image/*"
              disabled={loading}
            />
            <label htmlFor="photo-upload" className="upload-photo-file-label">
              {selectedFile ? "Cambiar imagen" : "Seleccionar nueva imagen"}
            </label>
          </div>

          {selectedFile && (
            <p className="upload-photo-file-info">
              Imagen seleccionada: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="upload-photo-modal-actions">
          <button
            className="upload-photo-modal-button delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar foto"}
          </button>

          <button
            className="upload-photo-modal-button upload"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
          >
            {loading ? "Subiendo..." : "Subir nueva foto"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadProfilePhotoModal;
