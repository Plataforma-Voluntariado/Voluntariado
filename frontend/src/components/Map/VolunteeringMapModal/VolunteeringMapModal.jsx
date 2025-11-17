import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./VolunteeringMapModal.css";
import ConfirmAlert from "../../alerts/ConfirmAlert";
import { InscribeIntoVolunteering } from "../../../services/volunteering/VolunteeringService";
import { SuccessAlert, WrongAlert } from "../../../utils/ToastAlerts";
import { useAuth } from "../../../context/AuthContext";

function VolunteeringMapModal({ volunteering, onClose }) {
  const navigate = useNavigate();
  const [inscribing, setInscribing] = useState(false);
  const [localInscribed, setLocalInscribed] = useState(false);
  const { user } = useAuth();

  const { isInscrito, isRechazado, isCreatorOwner } = useMemo(() => {
    const result = {
      isInscrito: false,
      isRechazado: false,
      isCreatorOwner: false,
    };

    if (!user) return result;

    const userId = Number(user.userId);

    result.isCreatorOwner = user.rol === "CREADOR" && Number(volunteering.creador?.id_usuario) === userId;

    if (!Array.isArray(volunteering.inscripciones)) return result;
    const sorted = [...volunteering.inscripciones].sort((a, b) => {
      const idA = Number(a?.id_inscripcion ?? a?.id ?? 0);
      const idB = Number(b?.id_inscripcion ?? b?.id ?? 0);
      return idB - idA;
    });
    const ins = sorted.find((i) => {
      const voluntarioId = Number(i?.voluntario?.id_usuario || i?.usuario?.id_usuario || i?.id_usuario || i?.voluntario || i?.usuario);
      return !Number.isNaN(voluntarioId) && voluntarioId === userId;
    }) || null;

    if (!ins) return result;
    const status = (ins?.estado_inscripcion || "").toString().toLowerCase();
    result.isInscrito = status && !["cancelada", "rechazada"].includes(status);
    result.isRechazado = status === "rechazada";

    return result;
  }, [volunteering.inscripciones, user, volunteering.creador]);

  const effectiveIsInscrito = isInscrito || localInscribed;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
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

  const participantPercentage = (volunteering.maxParticipantes)
    ? Math.round((volunteering.participantesAceptados || 0) / volunteering.maxParticipantes * 100)
    : 0;

  const estadoRaw = volunteering?.estado || "";
  const estadoLower = estadoRaw.toLowerCase();
  const statusSlug = estadoLower === "pendiente" ? "available" : estadoLower;
  const statusLabel =
    estadoLower === "pendiente"
      ? "DISPONIBLE"
      : estadoRaw
        ? estadoRaw.charAt(0).toUpperCase() + estadoRaw.slice(1).toLowerCase()
        : "";

  const handleInscribe = async () => {
    if (!volunteering?.id_voluntariado || inscribing) return;
    if (effectiveIsInscrito || isCreatorOwner) return;
    const confirmed = await ConfirmAlert({
      title: "Inscribirte",
      message: "¿Deseas inscribirte a este voluntariado?",
      confirmText: "Sí, inscribirme",
      cancelText: "Cancelar"
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
      setLocalInscribed(true);
      return await SuccessAlert({
        title: "¡Inscripción exitosa!",
        message: "Esperarás ser aceptado pronto.",
        timer: 1500,
        position: "top-right",
      });
    } catch (e) {
      await WrongAlert({
        title: "Error",
        message: "No fue posible realizar la inscripción.",
      });
    } finally {
      setInscribing(false);
    }
  };

  return (
    <div className="volunteering-map-modal-overlay" onClick={onClose}>
      <div
        className="volunteering-map-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="volunteering-map-modal-header">
          <img
            src={volunteering.fotos[0]?.url || "/placeholder.svg"}
            alt={volunteering.titulo}
            className="volunteering-map-modal-image"
          />
          <div className="volunteering-map-modal-close-wrapper">
            <button
              className="volunteering-map-modal-close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="volunteering-map-modal-title-section">
            <h2 className="volunteering-map-modal-title">{volunteering.titulo}</h2>
            <span className={`volunteering-map-modal-status status-${statusSlug}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="volunteering-map-modal-body">
          <div className="volunteering-map-modal-description-section">
            <h3>Descripción</h3>
            <p>{volunteering.descripcion}</p>
          </div>

            <div className="volunteering-map-modal-info-grid">
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Categoría</span>
              <span className="volunteering-map-modal-info-value">
                {volunteering.categoria?.nombre}
              </span>
            </div>
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Horas</span>
              <span className="volunteering-map-modal-info-value">
                {volunteering.horas}h
              </span>
            </div>
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Fecha</span>
              <span className="volunteering-map-modal-info-value">
                {formatDate(volunteering.fechaHoraInicio)}
              </span>
            </div>
            <div className="volunteering-map-modal-info-item">
              <span className="volunteering-map-modal-info-label">Hora</span>
              <span className="volunteering-map-modal-info-value">
                {formatTime(volunteering.fechaHoraInicio)}
              </span>
            </div>
          </div>

          <div className="volunteering-map-modal-participants">
            <div className="volunteering-map-modal-participants-header">
              <span className="volunteering-map-modal-participants-label">Participantes</span>
              <span className="volunteering-map-modal-participants-count">
                {volunteering.participantesAceptados} / {volunteering.maxParticipantes}
              </span>
            </div>
            <div className="volunteering-map-modal-progress-bar">
              <div
                className="volunteering-map-modal-progress-fill"
                style={{ width: `${participantPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="volunteering-map-modal-location">
            <span className="volunteering-map-modal-location-label">Ubicación</span>
            <p className="volunteering-map-modal-location-text">
              {volunteering.ubicacion?.direccion}
            </p>
            <p className="volunteering-map-modal-location-sector">
              {volunteering.ubicacion?.nombre_sector}, {volunteering.ubicacion?.ciudad?.ciudad}
            </p>
          </div>

          <div className="volunteering-map-modal-creator-section">
            <span className="volunteering-map-modal-creator-label">Creador</span>
            <div className="volunteering-map-modal-creator">
              <img
                src={volunteering.creador?.url_imagen || "/placeholder.svg"}
                alt={volunteering.creador?.correo}
                className="volunteering-map-modal-creator-avatar"
              />
              <div className="volunteering-map-modal-creator-info">
                <p className="volunteering-map-modal-creator-email">
                  {volunteering.creador?.correo}
                </p>
                <p className="volunteering-map-modal-creator-phone">
                  {volunteering.creador?.telefono}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="volunteering-map-modal-actions">
          {!isCreatorOwner && (
            <button
              className={`volunteering-map-modal-button subscribe ${effectiveIsInscrito ? "inscribed" : isRechazado ? "rejected" : ""}`}
              onClick={handleInscribe}
              disabled={inscribing || effectiveIsInscrito || isRechazado}
            >
              {inscribing
                ? "Inscribiendo..."
                : effectiveIsInscrito
                  ? "Inscrito"
                  : isRechazado
                    ? "Inscripción Rechazada"
                    : "Inscribirse"}
            </button>
          )}
          <button
            className="volunteering-map-modal-button fullscreen"
            type="button"
            onClick={() => {
              // Navegar primero y cerrar el modal un poco después para evitar solapamientos visuales
              try {
                navigate(`/voluntariado/${volunteering.id_voluntariado}`);
              } catch (e) {
                // ignore
              }
              // Cerrar el modal después de un corto delay
              setTimeout(() => {
                try { onClose && onClose(); } catch (e) { /* ignore */ }
              }, 350);
            }}
            aria-label="Ver información completa"
          >
            Ver información completa
          </button>
        </div>
      </div>
    </div>
  );
}

export default VolunteeringMapModal;