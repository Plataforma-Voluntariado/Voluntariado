import React, { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./VolunteeringMap.css";
import VolunteeringMapPopup from "../VolunteeringMapPopup/VolunteeringMapPopup";
import VolunteeringMapModal from "../VolunteeringMapModal/VolunteeringMapModal";
import VolunteeringMarkImg from "../../../assets/photos/marker_voluntariado.png";
import { initMapApi, destroyMapApi, handleStyleLoad, attachClickOutside } from "../../../services/map/MapService";

const token = process.env.REACT_APP_MAPBOX_TOKEN;

const VolunteeringMap = ({ volunteerings, mapApiRef }) => {
  const [viewState, setViewState] = useState({
    longitude: -76.6465421,
    latitude: 1.1491254,
    zoom: 17,
  });
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const containerRef = useRef(); // contenedor del mapa
  const cleanupRef = useRef(null);

  // Exponer API simple usando MapService
  useEffect(() => {
    initMapApi({
      mapApiRef,
      containerRef,
      setViewState,
      setIsInteractive,
      opts: { defaultZoom: 20 },
    });

    // attach outside click handler
    cleanupRef.current = attachClickOutside(containerRef, () => setIsInteractive(false));

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      destroyMapApi(mapApiRef);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapApiRef]);

  const onStyleLoad = useCallback((map) => {
    handleStyleLoad(map);
  }, []);

  return (
    <div className="volunteering-map-container" ref={containerRef}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        className={`volunteering-map ${isInteractive ? "active" : "inactive"}`}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={token}
        onStyleLoad={onStyleLoad}
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
            longitude={parseFloat(v.ubicacion?.longitud ?? 0)}
            latitude={parseFloat(v.ubicacion?.latitud ?? 0)}
            anchor="bottom"
          >
            <div
              className="marker-container"
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(v)}
            >
              <img src={VolunteeringMarkImg || "/placeholder.svg"} alt="Marcador de voluntariado" className="marker-icon" />
            </div>
          </Marker>
        ))}

        {hovered && hovered.ubicacion && (
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

      {!isInteractive && (
        <div className="map-overlay" onClick={() => setIsInteractive(true)}>
          <p>Haz clic para activar el mapa</p>
        </div>
      )}

      {selected && <VolunteeringMapModal volunteering={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default VolunteeringMap;