import { useRef } from "react";

const defaultOpts = {
  defaultZoom: 18,
  scrollIntoViewOptions: { behavior: "smooth", block: "center" },
};

export const initMapApi = ({ mapApiRef, containerRef, setViewState, setIsInteractive, opts = {} }) => {
  const config = { ...defaultOpts, ...(opts || {}) };

  if (!mapApiRef) return;

  mapApiRef.current = {
    focusLocation: (lat, lng, zoom = config.defaultZoom) => {
      if (!lat || !lng) return;
      try {
        containerRef?.current?.scrollIntoView(config.scrollIntoViewOptions);
      } catch (e) {
      }
      setViewState((prev) => ({
        ...prev,
        latitude: Number(lat),
        longitude: Number(lng),
        zoom,
      }));
      if (typeof setIsInteractive === "function") setIsInteractive(true);
    },

    openPopupAt: (lat, lng) => {
      mapApiRef.current?.focusLocation(lat, lng, config.defaultZoom);
    },
  };
};

export const destroyMapApi = (mapApiRef) => {
  if (!mapApiRef) return;
  mapApiRef.current = null;
};

export const handleStyleLoad = (map) => {
  try {
    if (!map || typeof map.setLayoutProperty !== "function") return;
    // Intentar ocultar POIs innecesarios para limpieza visual
    map.setLayoutProperty("poi-label", "visibility", "none");
    map.setLayoutProperty("transit-label", "visibility", "none");
  } catch (err) {
    console.warn("MapService.handleStyleLoad:", err);
  }
};

export const attachClickOutside = (containerRef, onOutside) => {
  if (!containerRef || typeof onOutside !== "function") {
    return () => {};
  }
  const handler = (e) => {
    try {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOutside(e);
      }
    } catch (err) {
      // noop
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
};