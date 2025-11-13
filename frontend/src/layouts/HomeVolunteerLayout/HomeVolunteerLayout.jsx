import React, { useState, useRef, useCallback } from "react";
import "./HomeVolunteerLayout.css";
import VolunteeringMapLayout from "../VolunteeringMapLayout/VolunteeringMapLayout";
import SearchVolunteerings from "../../components/SearchVolunteerings/SearchVolunteerings";
import VolunteeringCardLayout from "../VolunteeringCardLayout/VolunteeringCardLayout";

function HomeVolunteerLayout() {
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
      <h1 className="home-volunteer-layout-title">
        Ubica los próximos eventos y elige dónde quieres aportar tu tiempo.
      </h1>

      <VolunteeringMapLayout volunteerings={volunteeringsForMap} mapApiRef={mapApiRef} />

      <h1 className="home-volunteer-layout-title">Filtrar eventos</h1>
      <SearchVolunteerings onApplyFilters={handleApplyFilters} />

      <h1 className="home-volunteer-layout-title">Eventos disponibles</h1>

      <VolunteeringCardLayout
        filters={filters}
        mapApiRef={mapApiRef}
        onVolunteeringsChange={handleVolunteeringsChange}
      />
    </div>
  );
}

export default HomeVolunteerLayout;
