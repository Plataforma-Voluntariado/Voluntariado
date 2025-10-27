import React, { useState } from "react";
import "./UploadProfilePhotoModal.css";
import { UploadProfilePhoto, DeleteProfilePhoto } from "../../../services/auth/UserManagementService";
import SuccessAlert from "../../alerts/SuccessAlert";
import WrongAlert from "../../alerts/WrongAlert";

function UploadProfilePhotoModal({ currentPhotoUrl, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        WrongAlert({
          title: "Error",
          message: "Por favor selecciona un archivo de imagen válido.",
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      WrongAlert({
        title: "Error",
        message: "Por favor selecciona una imagen antes de subir.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await UploadProfilePhoto(selectedFile);

      if (response && !response.error) {
        await SuccessAlert({
          title: "Foto actualizada",
          message: "Tu foto de perfil se ha actualizado correctamente.",
        });
        onClose();
        window.location.reload();
      } else {
        throw new Error(response.error || "Error al subir la foto");
      }
    } catch (error) {
      console.error("Error subiendo foto:", error);
      WrongAlert({
        title: "Error",
        message: error.message || "Ocurrió un error al subir la foto. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await DeleteProfilePhoto();

      if (response && !response.error) {
        await SuccessAlert({
          title: "Foto eliminada",
          message: "Tu foto de perfil se ha eliminado correctamente.",
        });
        onClose();
        window.location.reload();
      } else {
        throw new Error(response.error || "Error al eliminar la foto");
      }
    } catch (error) {
      console.error("Error eliminando foto:", error);
      WrongAlert({
        title: "Error",
        message: error.message || "Ocurrió un error al eliminar la foto. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-photo-modal-overlay" onClick={onClose}>
      <div className="upload-photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="upload-photo-modal-header">
          <h3>Foto de perfil</h3>
          <button className="upload-photo-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="upload-photo-modal-body">
          <div className="upload-photo-preview">
            <img
              src={previewUrl || currentPhotoUrl}
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