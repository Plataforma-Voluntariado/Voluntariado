import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaCertificate } from "react-icons/fa";
import "./HomeVolunteerLayout.css";
import VolunteeringMapLayout from "../VolunteeringMapLayout/VolunteeringMapLayout";
import SearchVolunteerings from "../../components/SearchVolunteerings/SearchVolunteerings";
import VolunteeringCardLayout from "../VolunteeringCardLayout/VolunteeringCardLayout";

function HomeVolunteerLayout() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [volunteeringsForMap, setVolunteeringsForMap] = useState([]);
  const mapApiRef = useRef(null);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters || {});
  };

  const handleVolunteeringsChange = useCallback((list) => {
    setVolunteeringsForMap(Array.isArray(list) ? list : []);
  }, []);

  return (
    <div className="home-volunteer-layout">
      <div className="home-volunteer-header">
        <div className="home-volunteer-layout-title-container">
          <h1 className="home-volunteer-layout-title">
            Ubica los próximos eventos y elige dónde quieres aportar tu tiempo.
          </h1>
        </div>

        <button
          className="home-volunteer-certificates-btn"
          onClick={() => navigate("/mis-certificados")}
          title="Ver mis certificados"
        >
          <FaCertificate /> Mis Certificados
        </button>
      </div>

      <VolunteeringMapLayout
        volunteerings={volunteeringsForMap}
        mapApiRef={mapApiRef}
      />
        <div className="home-volunteer-layout-title-container">
<h1 className="home-volunteer-layout-title">Filtrar eventos</h1>
        </div>
      <SearchVolunteerings onApplyFilters={handleApplyFilters} />
        <div className="home-volunteer-layout-title-container">
      <h1 className="home-volunteer-layout-title">Eventos disponibles</h1>
        </div>


      <VolunteeringCardLayout
        filters={filters}
        mapApiRef={mapApiRef}
        onVolunteeringsChange={handleVolunteeringsChange}
      />
    </div>
  );
}

export default HomeVolunteerLayout;
