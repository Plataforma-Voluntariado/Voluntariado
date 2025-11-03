import React from "react";
import "./VolunteeringMapPopup.css";

function VolunteeringMapPopup({ volunteering }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="volunteering-map-popup">
      <img
        src={volunteering.fotos[0]?.url || "/placeholder.svg"}
        alt={volunteering.titulo}
        className="volunteering-map-popup-image"
      />
      <div className="volunteering-map-popup-content">
        <h4 className="volunteering-map-popup-title">{volunteering.titulo}</h4>
        <p className="volunteering-map-popup-description">
          {volunteering.descripcion.slice(0, 80)}...
        </p>
        <p className="volunteering-map-popup-date">
          {formatDate(volunteering.fechaHoraInicio)}
        </p>
      </div>
    </div>
  );
}

export default VolunteeringMapPopup;