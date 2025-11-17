import React, { useRef, useState, useEffect } from "react";

export const DROPZONE_MAX_PHOTOS = 5;
export const DROPZONE_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const DROPZONE_MAX_FILE_SIZE_LABEL = `${DROPZONE_MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`;

function ImageDropzone({
  label,
  maxPhotos,
  maxFileSizeLabel,
  previewImages,
  error,
  onFilesSelected,
  onRemoveImage,
  onClearAll,
  onOpenPreview,
  resetTrigger
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetTrigger]);

  const handleFiles = (files) => {
    if (!files?.length || !onFilesSelected) return;
    onFilesSelected(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer?.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="form-group">
      <label className="register-form-label">{label}</label>
      <div
        className={`drag-drop-zone ${isDragOver ? "drag-over" : ""} ${error ? "error" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        <div className="drag-drop-content">
          <div className="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 13L12 9L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="primary-text">
            {previewImages.length
              ? "Arrastra más imágenes o haz clic para agregar"
              : "Arrastra tus imágenes o haz clic para seleccionar"}
          </p>
          <p className="secondary-text">
            Máximo {maxPhotos} fotos • Hasta {maxFileSizeLabel} • JPG, PNG, GIF
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
      </div>
      {error && <span className="error-text">{error}</span>}

      {previewImages.length > 0 && (
        <div className="image-preview-container">
          <div className="preview-header">
            <p className="preview-title">
              Imágenes seleccionadas ({previewImages.length}/{maxPhotos})
            </p>
            <button type="button" className="clear-all-btn" onClick={onClearAll}>
              Limpiar todo
            </button>
          </div>
          <div className="image-preview-grid">
            {previewImages.map((image, index) => (
              <div key={image.name + index} className="image-preview-item">
                <div className="image-container" onClick={() => onOpenPreview(image, index)}>
                  <img src={image.url} alt={image.name} className="preview-image" />
                  <div className="image-overlay">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveImage(index);
                  }}
                >
                  ✕
                </button>
                <p className="image-name">{image.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ImageDropzone.defaultProps = {
  label: "Fotos del Voluntariado *",
  maxPhotos: DROPZONE_MAX_PHOTOS,
  maxFileSizeLabel: `${DROPZONE_MAX_FILE_SIZE_LABEL} cada una`,
  previewImages: [],
  error: "",
  resetTrigger: 0
};

export default ImageDropzone;
