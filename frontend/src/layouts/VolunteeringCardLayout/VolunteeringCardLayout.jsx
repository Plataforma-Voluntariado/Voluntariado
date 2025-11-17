import React, { useEffect, useRef, useState, useCallback } from "react";
import "./VolunteeringCardLayout.css";
import { GetVolunteerings } from "../../services/voluntariado/voluntariadoService";
import VolunteeringCard from "../../components/VolunteeringCard/VolunteeringCard";

export default function VolunteeringCardLayout({ filters = {}, mapApiRef = null, onVolunteeringsChange = () => {} }) {
  const [volunteerings, setVolunteerings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;

  const onChangeRef = useRef(onVolunteeringsChange);
  useEffect(() => {
    onChangeRef.current = onVolunteeringsChange;
  }, [onVolunteeringsChange]);

  const fetchVolunteerings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GetVolunteerings(filters);
      const list = Array.isArray(data) ? data : [];
      setVolunteerings(list);
      setPage(1);
      onChangeRef.current?.(list);
    } catch (e) {
      console.error("Error cargando voluntariados", e);
      setVolunteerings([]);
      setPage(1);
      onChangeRef.current?.([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchVolunteerings();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchVolunteerings]);

  useEffect(() => {
    const handler = () => {
      fetchVolunteerings();
    };
    window.addEventListener("inscripcion.changed", handler);
    return () => window.removeEventListener("inscripcion.changed", handler);
  }, [fetchVolunteerings]);

  const totalItems = volunteerings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentSlice = volunteerings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const handleFocusOnMap = (ubicacion, zoom = 15) => {
    if (!ubicacion) return;
    const lat = parseFloat(ubicacion.latitud);
    const lng = parseFloat(ubicacion.longitud);
    if (mapApiRef?.current?.focusLocation) {
      mapApiRef.current.focusLocation(lat, lng, zoom);
    }
  };

  return (
    <section className="volunteering-card-layout">
      {loading && <p className="volunteering-card-layout-loading">Cargando...</p>}
      {!loading && currentSlice.length === 0 && (
        <p className="volunteering-card-layout-empty">No se encontraron eventos.</p>
      )}
      {!loading &&
        currentSlice.map((v) => (
          <VolunteeringCard
            key={v.id_voluntariado}
            volunteering={v}
            onFocusMap={() => handleFocusOnMap(v.ubicacion, 20)}
          />
        ))}

      {totalPages > 1 && (
        <nav className="volunteering-card-layout-pagination" aria-label="Paginación de voluntariados">
          <button
            className="volunteering-card-layout-pagination-btn volunteering-card-layout-pagination-prev"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="volunteering-card-layout-pagination-numbers">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={`volunteering-card-layout-pagination-number ${
                    p === page ? "volunteering-card-layout-pagination-number-active" : ""
                  }`}
                  onClick={() => goTo(p)}
                  aria-label={`Ir a página ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            className="volunteering-card-layout-pagination-btn volunteering-card-layout-pagination-next"
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <span className="volunteering-card-layout-pagination-info">
            {page} / {totalPages}
          </span>
        </nav>
      )}
    </section>
  );
}
