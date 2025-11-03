import React from "react";
import "./VolunteeringMapModal.css";

function VolunteeringMapModal({ volunteering, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const participantPercentage = (volunteering.maxParticipantes) ? 
    Math.round((volunteering.participantes?.length || 0) / volunteering.maxParticipantes * 100) : 0;

  return (
    <div className="volunteering-map-modal-overlay" onClick={onClose}>
      <div
        className="volunteering-map-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="volunteering-map-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="volunteering-map-modal-header">
          <img
            src={volunteering.fotos[0]?.url || "/placeholder.svg"}
            alt={volunteering.titulo}
            className="volunteering-map-modal-image"
          />
          <div className="volunteering-map-modal-title-section">
            <h2 className="volunteering-map-modal-title">{volunteering.titulo}</h2>
            <span className={`volunteering-map-modal-status status-${volunteering.estado}`}>
              {volunteering.estado.charAt(0).toUpperCase() + volunteering.estado.slice(1)}
            </span>
          </div>
        </div>

        <div className="volunteering-map-modal-body">
          <div className="volunteering-map-modal-description-section">
            <h3>Descripción</h3>
            <p>{volunteering.descripcion}</p>
          </div>

          <div className="volunteering-map-modal-info-grid">
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Categoría</span>
              <span className="volunteering-map-modal-info-value">
                {volunteering.categoria?.nombre}
              </span>
            </div>
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Horas</span>
              <span className="volunteering-map-modal-info-value">
                {volunteering.horas}h
              </span>
            </div>
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Fecha</span>
              <span className="volunteering-map-modal-info-value">
                {formatDate(volunteering.fechaHoraInicio)}
              </span>
            </div>
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Hora</span>
              <span className="volunteering-map-modal-info-value">
                {formatTime(volunteering.fechaHoraInicio)}
              </span>
            </div>
          </div>

          <div className="volunteering-map-modal-participants">
            <div className="volunteering-map-modal-participants-header">
              <span className="volunteering-map-modal-participants-label">Participantes</span>
              <span className="volunteering-map-modal-participants-count">
                {volunteering.participantes?.length || 0} / {volunteering.maxParticipantes}
              </span>
            </div>
            <div className="volunteering-map-modal-progress-bar">
              <div
                className="volunteering-map-modal-progress-fill"
                style={{ width: `${participantPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="volunteering-map-modal-location">
            <span className="volunteering-map-modal-location-label">Ubicación</span>
            <p className="volunteering-map-modal-location-text">
              {volunteering.ubicacion?.direccion}
            </p>
            <p className="volunteering-map-modal-location-sector">
              {volunteering.ubicacion?.nombre_sector}, {volunteering.ubicacion?.ciudad?.ciudad}
            </p>
          </div>

          <div className="volunteering-map-modal-creator-section">
            <span className="volunteering-map-modal-creator-label">Creador</span>
            <div className="volunteering-map-modal-creator">
              <img
                src={volunteering.creador?.url_imagen || "/placeholder.svg"}
                alt={volunteering.creador?.correo}
                className="volunteering-map-modal-creator-avatar"
              />
              <div className="volunteering-map-modal-creator-info">
                <p className="volunteering-map-modal-creator-email">
                  {volunteering.creador?.correo}
                </p>
                <p className="volunteering-map-modal-creator-phone">
                  {volunteering.creador?.telefono}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="volunteering-map-modal-actions">
          <button className="volunteering-map-modal-button subscribe">
            Inscribirse
          </button>
          <button className="volunteering-map-modal-button fullscreen">
            Ver en pantalla completa
          </button>
        </div>
      </div>
    </div>
  );
}

export default VolunteeringMapModal;