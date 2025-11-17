import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUsers, FaTag } from "react-icons/fa";
import { getVoluntariadoById } from "../../services/voluntariado/voluntariadoService";
import "./VoluntariadoDetallePage.css";

function ReseñaCard({ reseña }) {
  return (
    <div className="resena-card">
      <div className="resena-header">
        <img
          src={reseña.voluntario?.url_imagen || "/placeholder.svg"}
          alt={reseña.voluntario?.nombre || "Usuario"}
          className="resena-avatar"
        />
        <div className="resena-info">
          <div className="resena-nombre">{(reseña.voluntario?.nombre || "") + (reseña.voluntario?.apellido ? ` ${reseña.voluntario.apellido}` : "") || "Usuario anónimo"}</div>
          <div className="resena-fecha">{new Date(reseña.fecha_creacion || reseña.fecha).toLocaleDateString()}</div>
        </div>
        {reseña.calificacion != null && (
          <div className="resena-rating-inline">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={14} color={i < reseña.calificacion ? "#fbbf24" : "#e5e7eb"} />
            ))}
          </div>
        )}
      </div>
      <div className="resena-contenido">{reseña.comentario}</div>
    </div>
  );
}

const VoluntariadoDetallePage = () => {
  const { id } = useParams();
  const [voluntariado, setVoluntariado] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);
  const [selectedStar, setSelectedStar] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const v = await getVoluntariadoById(id);
        setVoluntariado(v);
        if (Array.isArray(v?.resenas)) setResenas(v.resenas);
        else if (Array.isArray(v?.reviews)) setResenas(v.reviews);
      } catch (err) {
        console.error("Error fetching voluntariado:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const FOTO_COUNT = voluntariado?.fotos?.length || 0;
  useEffect(() => {
    setIndex((i) => (FOTO_COUNT === 0 ? 0 : i >= FOTO_COUNT ? 0 : i));
  }, [FOTO_COUNT]);

  useEffect(() => {
    if (FOTO_COUNT <= 1) return;
    if (isPaused) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }
    autoplayRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % FOTO_COUNT);
    }, 4000);
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [FOTO_COUNT, isPaused]);

  if (loading) return <div className="vol-detalle-container">Cargando...</div>;
  if (!voluntariado) return <div className="vol-detalle-container">No encontrado</div>;

  const totalReviews = resenas.length;
  const counts = [0,0,0,0,0,0]; 
  resenas.forEach(r => {
    const c = Number(r.calificacion);
    if (c >= 1 && c <= 5) counts[c] = (counts[c] || 0) + 1;
  });
  const avgRating = voluntariado.promedioCalificacion ?? 0;
  const filteredResenas = selectedStar >= 1 ? resenas.filter(r => Number(r.calificacion) === selectedStar) : resenas;

  return (
    <div className="vol-detalle-container">
      <div className="vol-detalle-main">
        <div className="vol-hero-section">
          <div className="vol-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <img
              src={FOTO_COUNT > 0 ? voluntariado.fotos[index]?.url : "/volunteering.jpg"}
              alt={voluntariado.titulo}
              className="vol-carousel-img"
            />
            <div className="carousel-overlay">
              <h1 className="carousel-title">{voluntariado.titulo}</h1>
              <div className="carousel-creator">
                <img src={voluntariado.creador?.url_imagen || "/placeholder.svg"} alt="Creador" />
                <div>
                  <p className="creator-name">
                    {voluntariado.creador?.creador?.nombre_entidad || 
                     `${voluntariado.creador?.nombre || ""} ${voluntariado.creador?.apellido || ""}`.trim()}
                  </p>
                  <p className="creator-role">{voluntariado.creador?.creador?.tipo_entidad || voluntariado.creador?.rol}</p>
                </div>
              </div>
            </div>
            {FOTO_COUNT > 1 && (
              <div className="carousel-dots">
                {voluntariado.fotos.map((_, i) => (
                  <button key={i} className={`dot ${i === index ? "active" : ""}`} onClick={() => setIndex(i)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="vol-content">
          <div className="vol-left">
            <div className="vol-header-card">
              <div className="vol-header-top">
                {voluntariado.categoria?.nombre && (
                  <span className="vol-category-badge"><FaTag /> {voluntariado.categoria.nombre}</span>
                )}
                {voluntariado.estado && (
                  <span className={`vol-status vol-status-${voluntariado.estado?.toLowerCase()}`}>{voluntariado.estado}</span>
                )}
              </div>
            </div>

            <div className="vol-info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <FaCalendarAlt />
                </div>
                <div className="info-content">
                  <span className="info-label">Fecha de inicio</span>
                  <span className="info-value">
                    {new Date(voluntariado.fechaHoraInicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaClock />
                </div>
                <div className="info-content">
                  <span className="info-label">Duración</span>
                  <span className="info-value">{voluntariado.horas} horas</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-content">
                  <span className="info-label">Ubicación</span>
                  <span className="info-value">
                    {voluntariado.ubicacion?.nombre_sector || voluntariado.ubicacion?.direccion || "Por definir"}
                  </span>
                </div>
              </div>

              {voluntariado.maxParticipantes != null && (
                <div className="info-card">
                  <div className="info-icon">
                    <FaUsers />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Participantes</span>
                    <span className="info-value">
                      {voluntariado.participantesAceptados || 0} / {voluntariado.maxParticipantes}
                    </span>
                  </div>
                  <div className="participants-progress">
                    <div 
                      className="participants-bar" 
                      style={{
                        width: `${voluntariado.maxParticipantes > 0 
                          ? ((voluntariado.participantesAceptados || 0) / voluntariado.maxParticipantes) * 100 
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="vol-description-card">
              <h2 className="section-title">Sobre este voluntariado</h2>
              <p className="vol-desc">{voluntariado.descripcion}</p>
            </div>
          </div>

          <div className="vol-right">
            <div className="ratings-card">
              <h2 className="section-title">Valoraciones</h2>
              
              <div className="rating-summary">
                <div className="avg-box">
                  <div className="avg-number">{avgRating ? avgRating.toFixed(1) : '0.0'}</div>
                  <div className="avg-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={18} color={i < Math.round(avgRating) ? '#fbbf24' : '#e5e7eb'} />
                    ))}
                  </div>
                  <div className="avg-count">{totalReviews} reseña{totalReviews !== 1 ? 's' : ''}</div>
                </div>

                <div className="rating-breakdown">
                  {[5,4,3,2,1].map((star) => (
                    <button 
                      key={star} 
                      className={`rating-row ${selectedStar === star ? 'active' : ''}`} 
                      onClick={() => setSelectedStar(selectedStar === star ? 0 : star)}
                    >
                      <div className="rating-label">
                        {star} <FaStar size={12} color="#fbbf24" />
                      </div>
                      <div className="rating-bar-wrapper">
                        <div 
                          className="rating-bar" 
                          style={{ width: `${totalReviews ? (counts[star] / totalReviews) * 100 : 0}%` }} 
                        />
                      </div>
                      <div className="rating-count">{counts[star]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="vol-resenas-section">
              <h2 className="section-title">
                Reseñas de voluntarios
                {selectedStar > 0 && <span className="filter-badge">{selectedStar} ★</span>}
              </h2>

              <div className="resenas-scroll-container">
                {filteredResenas.length === 0 ? (
                  <div className="no-resenas">
                    <p>No hay reseñas disponibles {selectedStar > 0 && 'con esta calificación'}</p>
                  </div>
                ) : (
                  <div className="resenas-list">
                    {filteredResenas.map((r) => (
                      <ReseñaCard key={r.id_resena || r.id} reseña={r} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoluntariadoDetallePage;
