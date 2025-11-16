import React, { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./LocationPickerMap.css";
import { reverseGeocode } from "../../../services/map/geocodingService";
import { handleStyleLoad, attachClickOutside } from "../../../services/map/MapService";

const token = process.env.REACT_APP_MAPBOX_TOKEN;

function LocationPickerMap({
  initialLat = 1.1491254,
  initialLng = -76.6465421,
  onSelect,
  height = 320,
}) {
  const [viewState, setViewState] = useState({
    longitude: Number(initialLng),
    latitude: Number(initialLat),
    zoom: 14,
  });
  const [marker, setMarker] = useState({ lat: initialLat, lng: initialLng });
  const [loading, setLoading] = useState(false);

  // Activo/Inactivo como VolunteeringMap.jsx
  const [isInteractive, setIsInteractive] = useState(false);
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    cleanupRef.current = attachClickOutside(containerRef, () => setIsInteractive(false));
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const onStyleLoad = useCallback((map) => {
    handleStyleLoad(map);
  }, []);

  const handleClick = useCallback(async (e) => {
    try {
      setLoading(true);
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;
      setMarker({ lat, lng });
      const info = await reverseGeocode(lat, lng);
      if (onSelect) {
        onSelect({
          latitud: lat,
          longitud: lng,
          direccion: info?.address || "",
          ciudad_nombre: info?.city || "",
          departamento_nombre: info?.region || "",
        });
      }
    } catch (err) {
      if (onSelect) onSelect({ latitud: marker.lat, longitud: marker.lng });
    } finally {
      setLoading(false);
    }
  }, [onSelect, marker.lat, marker.lng]);

  return (
    <div
      ref={containerRef}
      className="location-picker-map-container"
      style={{ height }}
    >
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={token}
        onStyleLoad={onStyleLoad}
        onClick={handleClick}
        className={`location-picker-map ${isInteractive ? "active" : "inactive"}`}
        dragPan={isInteractive}
        scrollZoom={isInteractive}
        boxZoom={isInteractive}
        keyboard={isInteractive}
        doubleClickZoom={isInteractive}
      >
        <NavigationControl position="top-left" />
        {marker && (
          <Marker latitude={Number(marker.lat)} longitude={Number(marker.lng)} anchor="bottom">
            <div className="marker-container">
              <div className="marker-icon" />
            </div>
          </Marker>
        )}
      </Map>

      {!isInteractive && (
        <div className="map-overlay" onClick={() => setIsInteractive(true)}>
          <div className="map-overlay-hint">Haz clic para activar el mapa</div>
        </div>
      )}

      {loading && (
        <div className="location-picker-loading">Obteniendo dirección…</div>
      )}
    </div>
  );
}

export default LocationPickerMap;
