import React, { useEffect, useState, useRef, useCallback } from "react";
import "./HomeVolunteerLayout.css";
import { GetVolunteerings } from "../../services/volunteering/VolunteeringService";
import VolunteeringCard from "../../components/VolunteeringCard/VolunteeringCard";
import VolunteeringMapLayout from "../VolunteeringMapLayout/VolunteeringMapLayout";
import SearchVolunteerings from "../../components/SearchVolunteerings/SearchVolunteerings";

function HomeVolunteerLayout() {
  const [volunteerings, setVolunteerings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const mapApiRef = useRef(null);

  const fetchVolunteerings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GetVolunteerings(filters);
      setVolunteerings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando voluntariados", e);
      setVolunteerings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVolunteerings();
  }, [fetchVolunteerings]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters || {});
  };

  const handleFocusOnMap = (ubicacion, zoom = 15) => {
    if (!ubicacion) return;
    const lat = parseFloat(ubicacion.latitud);
    const lng = parseFloat(ubicacion.longitud);
    if (mapApiRef.current?.focusLocation) {
      mapApiRef.current.focusLocation(lat, lng, zoom);
    }
  };

  return (
    <div className="home-volunteer-layout">
      <h1 className="home-volunteer-layout-title">
        Ubica los próximos eventos y elige dónde quieres aportar tu tiempo.
      </h1>
      <VolunteeringMapLayout volunteerings={volunteerings} mapApiRef={mapApiRef} />
      <h1 className="home-volunteer-layout-title">Filtrar eventos</h1>
      <SearchVolunteerings onApplyFilters={handleApplyFilters} />
      <h1 className="home-volunteer-layout-title">Eventos disponibles</h1>
      {loading && <p>Cargando...</p>}
      {volunteerings?.length > 0 ? (
        volunteerings.map((volunteering) => (
          <VolunteeringCard
            key={volunteering.id_voluntariado}
            volunteering={volunteering}
            onFocusMap={() => handleFocusOnMap(volunteering.ubicacion, 15)}
          />
        ))
      ) : (
        !loading && <p>No se encontraron eventos.</p>
      )}
    </div>
  );
}

export default HomeVolunteerLayout;
