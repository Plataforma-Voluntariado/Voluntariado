// ...existing code...
import React, { useEffect, useRef, useState } from "react";
import "./VolunteeringCard.css";
import ConfirmAlert from "../alerts/ConfirmAlert";
import { InscribeIntoVolunteering } from "../../services/volunteering/VolunteeringService";
import Swal from "sweetalert2";
import { SuccessAlert, WrongAlert } from "../../utils/ToastAlerts";

function VolunteeringCard({ volunteering, onFocusMap }) {
  const {
    titulo,
    descripcion,
    fechaHoraInicio,
    horas,
    maxParticipantes,
    estado,
    creador,
    categoria,
    fotos = [],
    ubicacion,
    inscripciones,
    participantesAceptados,
  } = volunteering;

  const [inscribing, setInscribing] = useState(false);
  const nombreEntidad = creador?.creador?.nombre_entidad;

  const handleInscribe = async () => {
    if (!volunteering?.id_voluntariado || inscribing) return;
    const confirmed = await ConfirmAlert({
      title: "Inscribirte",
      message: "¿Deseas inscribirte a este voluntariado?",
      confirmText: "Sí, inscribirme",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;
    try {
      setInscribing(true);
      const resp = await InscribeIntoVolunteering(volunteering.id_voluntariado);
      if (resp.status === 400) {
        return await WrongAlert({
          title: "Error",
          message: resp.response.data.message,
        });
      }
      return await SuccessAlert({
        title: "¡Inscripción exitosa!",
        message: "Esperarás ser aceptado pronto.",
        timer: 1500,
        position: "top-right",
      });
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: "No fue posible realizar la inscripción.",
        icon: "error",
      });
    } finally {
      setInscribing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pendiente":
        return "available";
      case "activo":
        return "active";
      case "completado":
        return "completed";
      case "cancelado":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const photoUrl =
    fotos && fotos.length > 0 ? fotos[0].url : "/volunteering.jpg";

  const inscritos = inscripciones?.length || 0;
  const aceptados = participantesAceptados || 0;
  const ocupacionPorcentaje = maxParticipantes
    ? Math.round((aceptados / maxParticipantes) * 100)
    : 0;

  // Carousel logic
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);
  const FOTO_COUNT = Array.isArray(fotos) ? fotos.length : 0;
  const AUTOPLAY_INTERVAL = 4000;

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
    }, AUTOPLAY_INTERVAL);
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [FOTO_COUNT, isPaused]);

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i - 1 + FOTO_COUNT) % FOTO_COUNT);
  };
  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % FOTO_COUNT);
  };
  const goTo = (i) => setIndex(i);

  return (
    <div className="volunteering-card">
      <div
        className="volunteering-card-image"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {FOTO_COUNT > 0 ? (
          <>
            <img
              src={fotos[index].url}
              alt={`${titulo} - ${index + 1}`}
              className="volunteering-card-main-image"
            />
            {FOTO_COUNT > 1 && (
              <>
                <button
                  className="volunteering-card-carousel-btn left"
                  onClick={prev}
                  aria-label="Anterior imagen"
                >
                  ‹
                </button>
                <button
                  className="volunteering-card-carousel-btn right"
                  onClick={next}
                  aria-label="Siguiente imagen"
                >
                  ›
                </button>
                <div className="volunteering-card-carousel-indicators">
                  {fotos.map((f, i) => (
                    <button
                      key={f.id_foto ?? i}
                      className={`indicator ${i === index ? "active" : ""}`}
                      onClick={() => goTo(i)}
                      aria-label={`Ir a imagen ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <img src={photoUrl || "/placeholder.svg"} alt={titulo} />
        )}
        <div className="volunteering-card-category-badge">
          {categoria?.nombre}
        </div>
      </div>

      <div className="volunteering-card-content">
        <div className="volunteering-card-header">
          <h3 className="volunteering-card-title">{titulo}</h3>
          <span
            className={`volunteering-card-status volunteering-card-status-${getStatusColor(
              estado
            )}`}
          >
            {estado?.toLowerCase() === "pendiente"
              ? "DISPONIBLE"
              : estado
              ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()
              : ""}
          </span>
        </div>

        <p className="volunteering-card-description">
          {truncateText(descripcion, 100)}
        </p>

        <div className="volunteering-card-creator">
          <img
            src={creador?.url_imagen || "/placeholder.svg"}
            alt={creador?.nombre || creador?.correo}
            className="volunteering-card-creator-avatar"
          />
          <div className="volunteering-card-creator-info">
            <span className="volunteering-card-creator-label">Creador</span>
            <p className="volunteering-card-creator-name">
              {nombreEntidad ||
                (creador?.nombre && creador?.apellido
                  ? `${creador.nombre} ${creador.apellido}`
                  : creador?.correo)}
            </p>
          </div>
        </div>

        <div className="volunteering-card-meta">
          <div className="volunteering-card-meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{formatDate(fechaHoraInicio)}</span>
          </div>
          <div className="volunteering-card-meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{formatTime(fechaHoraInicio)}</span>
          </div>
          <div className="volunteering-card-meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            </svg>
            <span>{horas} horas</span>
          </div>
        </div>

        <div className="volunteering-card-participants-stats">
          <div className="volunteering-card-stat">
            <span className="volunteering-card-stat-number">{inscritos}</span>
            <span className="volunteering-card-stat-label">Inscritos</span>
          </div>
          <div className="volunteering-card-stat">
            <span className="volunteering-card-stat-number">{aceptados}</span>
            <span className="volunteering-card-stat-label">Aceptados</span>
          </div>
          <div className="volunteering-card-stat">
            <span className="volunteering-card-stat-number">
              {maxParticipantes}
            </span>
            <span className="volunteering-card-stat-label">Cupos</span>
          </div>
        </div>

        <div className="volunteering-card-occupancy">
          <div className="volunteering-card-occupancy-bar">
            <div
              className="volunteering-card-occupancy-fill"
              style={{ width: `${ocupacionPorcentaje}%` }}
            ></div>
          </div>
          <span className="volunteering-card-occupancy-text">
            {ocupacionPorcentaje}% ocupado
          </span>
        </div>

        <div className="volunteering-card-footer">
          <button
            className="volunteering-card-inscribe-btn"
            onClick={handleInscribe}
            disabled={inscribing}
          >
            {inscribing ? "Inscribiendo..." : "Inscríbete ahora"}
          </button>
          <button
            className="volunteering-card-location-btn"
            onClick={() => onFocusMap?.()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {ubicacion?.nombre_sector || ubicacion?.direccion}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VolunteeringCard;
