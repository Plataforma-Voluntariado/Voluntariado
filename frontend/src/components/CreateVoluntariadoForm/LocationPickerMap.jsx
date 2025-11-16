import React, { useState, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { reverseGeocode } from "../../services/map/geocodingService";

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
      if (onSelect) {
        onSelect({ latitud: marker.lat, longitud: marker.lng });
      }
    } finally {
      setLoading(false);
    }
  }, [onSelect, marker.lat, marker.lng]);

  return (
    <div className="location-picker-map-container" style={{ height }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={token}
        onClick={handleClick}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />
        {marker && (
          <Marker latitude={Number(marker.lat)} longitude={Number(marker.lng)} anchor="bottom">
            <div className="marker-container">
              <div className="marker-icon" style={{ width: 28, height: 28, background: "#e11d48", borderRadius: "50%" }} />
            </div>
          </Marker>
        )}
      </Map>
      {loading && <div className="location-picker-overlay">Obteniendo dirección…</div>}
    </div>
  );
}

export default LocationPickerMap;
