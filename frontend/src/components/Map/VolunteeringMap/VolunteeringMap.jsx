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
  const containerRef = useRef();
  const mapRef = useRef(null);
  const cleanupRef = useRef(null);
  const markerHoverRef = useRef(null);

  // <CHANGE> Improved popup anchor logic with better positioning and margin calculation
  const [popupAnchor, setPopupAnchor] = useState("top");
  useEffect(() => {
    if (!hovered || !containerRef.current || !mapRef.current) return;
    const lng = parseFloat(hovered?.ubicacion?.longitud);
    const lat = parseFloat(hovered?.ubicacion?.latitud);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

    const ref = mapRef.current;
    const project = ref.project ? ref.project.bind(ref) : ref.getMap?.().project.bind(ref.getMap());
    if (!project) return;

    const pt = project([lng, lat]);
    const { clientWidth: w, clientHeight: h } = containerRef.current;
    const popupHeight = 200;
    const popupWidth = 280;
    const safeMargin = 40;

    let anchor = "top";
    
    // Determine vertical position
    if (pt.y < safeMargin + popupHeight) {
      anchor = "top";
    } else if (pt.y > h - safeMargin - popupHeight) {
      anchor = "bottom";
    } else {
      anchor = "bottom";
    }

    // Adjust horizontal position
    if (pt.x < safeMargin + popupWidth / 2) {
      anchor = anchor === "top" ? "top-left" : "bottom-left";
    } else if (pt.x > w - safeMargin - popupWidth / 2) {
      anchor = anchor === "top" ? "top-right" : "bottom-right";
    }

    setPopupAnchor(anchor);
  }, [hovered, viewState]);

  // <CHANGE> Handle marker hover with delay to prevent popup flickering
  const handleMarkerEnter = (volunteering) => {
    if (markerHoverRef.current) clearTimeout(markerHoverRef.current);
    setHovered(volunteering);
  };

  const handleMarkerLeave = () => {
    markerHoverRef.current = setTimeout(() => {
      setHovered(null);
    }, 100);
  };

  useEffect(() => {
    initMapApi({
      mapApiRef,
      containerRef,
      setViewState,
      setIsInteractive,
      opts: { defaultZoom: 20 },
    });

    cleanupRef.current = attachClickOutside(containerRef, () => setIsInteractive(false));

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      destroyMapApi(mapApiRef);
      if (markerHoverRef.current) clearTimeout(markerHoverRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapApiRef]);

  const onStyleLoad = useCallback((map) => {
    handleStyleLoad(map);
  }, []);

  return (
    <div className="volunteering-map-container" ref={containerRef}>
      <Map
        ref={mapRef}
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
              onMouseEnter={() => handleMarkerEnter(v)}
              onMouseLeave={handleMarkerLeave}
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
            anchor={popupAnchor}
            offset={20}
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