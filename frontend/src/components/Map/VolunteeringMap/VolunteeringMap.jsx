import React, { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./VolunteeringMap.css";
import VolunteeringMapPopup from "../VolunteeringMapPopup/VolunteeringMapPopup";
import VolunteeringMapModal from "../VolunteeringMapModal/VolunteeringMapModal";
import VolunteeringMarkImg from "../../../assets/photos/marker_voluntariado.png";

const token = process.env.REACT_APP_MAPBOX_TOKEN;

const VolunteeringMap = ({ volunteerings }) => {
  const [viewState, setViewState] = useState({
    longitude: -76.648213,
    latitude: 1.1465863,
    zoom: 14,
  });
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isInteractive, setIsInteractive] = useState(false); // control de bloqueo
  const mapRef = useRef();

  const handleStyleLoad = useCallback((map) => {
    try {
      map.setLayoutProperty("poi-label", "visibility", "none");
      map.setLayoutProperty("transit-label", "visibility", "none");
    } catch (err) {
      console.warn("No se pudo ocultar POIs", err);
    }
  }, []);

  // Si el usuario hace clic fuera del mapa, se bloquea otra vez
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mapRef.current && !mapRef.current.contains(e.target)) {
        setIsInteractive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="volunteering-map-container" ref={mapRef}>
      {/* Mapa */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        className={`volunteering-map ${isInteractive ? "active" : "inactive"}`}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={token}
        onStyleLoad={handleStyleLoad}
        dragPan={isInteractive}
        scrollZoom={isInteractive}   
        boxZoom={isInteractive}
        keyboard={isInteractive}
        doubleClickZoom={isInteractive}
      >
        <NavigationControl position="top-left" />
        {volunteerings.map((v) => (
          <Marker
            key={v.id_voluntariado}
            longitude={parseFloat(v.ubicacion.longitud)}
            latitude={parseFloat(v.ubicacion.latitud)}
            anchor="bottom"
          >
            <div
              className="marker-container"
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(v)}
            >
              <img
                src={VolunteeringMarkImg || "/placeholder.svg"}
                alt="Marcador de voluntariado"
                className="marker-icon"
              />
            </div>
          </Marker>
        ))}

        {hovered && (
          <Popup
            longitude={parseFloat(hovered.ubicacion.longitud)}
            latitude={parseFloat(hovered.ubicacion.latitud)}
            anchor="top"
            closeButton={false}
            closeOnClick={false}
            className="volunteering-popup"
          >
            <VolunteeringMapPopup volunteering={hovered} />
          </Popup>
        )}
      </Map>

      {/* Overlay para bloquear arrastre */}
      {!isInteractive && (
        <div
          className="map-overlay"
          onClick={() => setIsInteractive(true)} // activa el mapa al hacer click
        >
          <p>Haz clic para activar el mapa</p>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <VolunteeringMapModal
          volunteering={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default VolunteeringMap;
