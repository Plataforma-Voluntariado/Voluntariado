import React from "react";
import "./VolunteeringMapInfo.css";
import VolunteeringMarkImg from "../../../assets/photos/marker_voluntariado.png";

function VolunteeringMapInfo() {
  return (
    <div className="volunteering-map-info">
      <div className="volunteering-map-info-container">
        <h2 className="volunteering-map-info-title">BUSCA EN EL MAPA</h2>
        
        <div className="volunteering-map-info-steps">
          <div className="volunteering-map-info-step">
            <div className="volunteering-map-info-step-number">1</div>
            <div className="volunteering-map-info-step-content">
              <h3>Explora el mapa</h3>
              <p>Navega por los eventos de voluntariado disponibles en tu área. Puedes hacer zoom y desplazarte libremente.</p>
            </div>
          </div>

          <div className="volunteering-map-info-step">
            <div className="volunteering-map-info-step-number">2</div>
            <div className="volunteering-map-info-step-content">
              <h3>Localiza los marcadores</h3>
              <div className="volunteering-map-info-marker-showcase">
                <img
                  src={VolunteeringMarkImg || "/placeholder.svg"}
                  alt="Marcador de Voluntariado"
                  className="volunteering-map-info-marker-image"
                />
              </div>
              <p>Estos marcadores indican los lugares donde se realizan los eventos de voluntariado.</p>
            </div>
          </div>

          <div className="volunteering-map-info-step">
            <div className="volunteering-map-info-step-number">3</div>
            <div className="volunteering-map-info-step-content">
              <h3>Haz clic para detalles</h3>
              <p>Al hacer clic en un marcador, verás toda la información del evento y podrás inscribirte.</p>
            </div>
          </div>
        </div>

        <div className="volunteering-map-info-highlight">
          <p className="volunteering-map-info-highlight-text">
            ¡Encuentra la oportunidad perfecta para aportar tu tiempo y hacer la diferencia en tu comunidad!
          </p>
        </div>
      </div>
    </div>
  );
}

export default VolunteeringMapInfo;