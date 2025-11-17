import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VoluntariadoDetailPage.css";
import { getVoluntariadoById } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import { WrongAlert, SuccessAlert } from "../../utils/ToastAlerts";
import Map from "react-map-gl";
import { Marker } from "react-map-gl";
import EditVoluntariadoModal from "../../components/Modals/EditVoluntariadoModal/EditVoluntariadoModal";
import { InscribeIntoVolunteering } from "../../services/volunteering/VolunteeringService";
import ConfirmAlert from "../../components/alerts/ConfirmAlert";
import { FaMapMarkerAlt, FaClock, FaUsers, FaCalendarAlt, FaEdit } from "react-icons/fa";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function VoluntariadoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voluntariado, setVoluntariado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inscribing, setInscribing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadVoluntariado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Carrusel automático de imágenes
  useEffect(() => {
    if (!voluntariado?.fotos || voluntariado.fotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % voluntariado.fotos.length
      );
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [voluntariado?.fotos]);

  const loadVoluntariado = async () => {
    try {
      setLoading(true);
      const data = await getVoluntariadoById(id);
      setVoluntariado(data);
    } catch (error) {
      console.error("Error al cargar voluntariado:", error);
      await WrongAlert({
        title: "Error",
        message: "No se pudo cargar el voluntariado",
      });
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const isCreator = user?.rol === "CREADOR" && user?.userId === voluntariado?.creador?.id_usuario;
  
  const myInscripcion = voluntariado?.inscripciones?.find(
    (i) => Number(i?.voluntario?.id_usuario) === Number(user?.userId)
  );
  const isInscrito = myInscripcion && !["cancelada", "rechazada"].includes(myInscripcion?.estado_inscripcion?.toLowerCase());

  const handleInscribe = async () => {
    if (!voluntariado?.id_voluntariado || inscribing || isInscrito || isCreator) return;
    
    const confirmed = await ConfirmAlert({
      title: "Inscribirte",
      message: "¿Deseas inscribirte a este voluntariado?",
      confirmText: "Sí, inscribirme",
      cancelText: "Cancelar",
    });
    
    if (!confirmed) return;
    
    try {
      setInscribing(true);
      await InscribeIntoVolunteering(voluntariado.id_voluntariado);
      await SuccessAlert({
        title: "¡Inscripción exitosa!",
        message: "Esperarás ser aceptado pronto.",
        timer: 1500,
      });
      await loadVoluntariado(); // Recargar para actualizar inscripciones
    } catch (e) {
      await WrongAlert({
        title: "Error",
        message: e.message || "No fue posible realizar la inscripción.",
      });
    } finally {
      setInscribing(false);
    }
  };

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

  if (loading) {
    return (
      <div className="voluntariado-detail-loading">
        <div className="spinner"></div>
        <p>Cargando detalles del voluntariado...</p>
      </div>
    );
  }

  if (!voluntariado) {
    return null;
  }

  const {
    titulo,
    descripcion,
    fechaHoraInicio,
    fechaHoraFin,
    horas,
    maxParticipantes,
    participantesAceptados,
    categoria,
    fotos = [],
    ubicacion,
    creador,
  } = voluntariado;

  const hasLocation = ubicacion && ubicacion.latitud && ubicacion.longitud;

  const handleCreatorClick = () => {
    const creatorId = creador?.id_usuario;
    if (creatorId) {
      navigate(`/creador/${creatorId}`);
    }
  };

  return (
    <div className="voluntariado-detail-page">
      <div className="voluntariado-detail-container">
        {/* Botones superiores */}
        <div className="top-buttons">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          {isCreator && (
            <button
              className="btn-edit-top"
              onClick={() => setShowEditModal(true)}
              title="Editar voluntariado"
            >
              <FaEdit /> Editar
            </button>
          )}
        </div>

        {/* Layout principal: Izquierda (Carrusel) | Derecha (Información) */}
        <div className="detail-layout">
          {/* COLUMNA IZQUIERDA: Carrusel + Info del creador */}
          <div className="detail-left-column">
            {/* Carrusel de imágenes con título superpuesto */}
            <div className="carousel-container">
              <div className="carousel-images">
                {fotos.length > 0 ? (
                  fotos.map((foto, index) => (
                    <img
                      key={index}
                      src={foto.url}
                      alt={`${titulo} - Imagen ${index + 1}`}
                      className={`carousel-image ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                    />
                  ))
                ) : (
                  <img
                    src="https://via.placeholder.com/800x400?text=Sin+Imagen"
                    alt={titulo}
                    className="carousel-image active"
                  />
                )}
              </div>

              {/* Overlay con gradiente para legibilidad */}
              <div className="carousel-overlay"></div>

              {/* Título y categoría en la parte superior de las imágenes */}
              <div className="carousel-title-overlay">
                <h1 
                  className="voluntariado-title-overlay"
                  onClick={handleCreatorClick}
                  style={{ cursor: 'pointer' }}
                >
                  {titulo}
                </h1>
                <span className="badge-categoria-overlay">{categoria?.nombre}</span>
              </div>

              {/* Indicadores de puntos */}
              {fotos.length > 1 && (
                <div className="carousel-indicators">
                  {fotos.map((_, index) => (
                    <span
                      key={index}
                      className={`indicator-dot ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Información del creador */}
            <div className="creator-info-card">
              <div className="creator-label-header">
                <span>Organizado por</span>
              </div>
              <div 
                className="creator-content"
                onClick={handleCreatorClick}
              >
                <img
                  src={creador?.url_imagen || "/placeholder.svg"}
                  alt={creador?.nombre || "Creador"}
                  className="creator-avatar"
                />
                <div className="creator-details">
                  <p className="creator-name">
                    {creador?.creador?.nombre_entidad ||
                      `${creador?.nombre || ""} ${creador?.apellido || ""}`.trim()}
                  </p>
                  <p className="creator-email">{creador?.correo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Información del voluntariado */}
          <div className="detail-right-column">
            {/* Botón de inscripción */}
            <div className="action-section">
              {!isCreator && !isInscrito && user?.rol === "VOLUNTARIO" && (
                <button
                  className="btn-inscribe-detail"
                  onClick={handleInscribe}
                  disabled={inscribing || participantesAceptados >= maxParticipantes}
                >
                  {inscribing ? "Inscribiendo..." : "Inscribirse"}
                </button>
              )}
              {isInscrito && (
                <div className="badge-inscrito">Ya estás inscrito</div>
              )}
            </div>

            {/* Información rápida */}
            <div className="detail-quick-info">
              <div className="info-item">
                <FaCalendarAlt className="icon" />
                <div>
                  <strong>Fecha:</strong>
                  <p>{formatDate(fechaHoraInicio)}</p>
                </div>
              </div>
              <div className="info-item">
                <FaClock className="icon" />
                <div>
                  <strong>Hora:</strong>
                  <p>
                    {formatTime(fechaHoraInicio)} - {formatTime(fechaHoraFin)}
                  </p>
                </div>
              </div>
              <div className="info-item">
                <FaClock className="icon" />
                <div>
                  <strong>Duración:</strong>
                  <p>{horas} horas</p>
                </div>
              </div>
              <div className="info-item">
                <FaUsers className="icon" />
                <div>
                  <strong>Participantes:</strong>
                  <p>
                    {participantesAceptados || 0} / {maxParticipantes}
                  </p>
                </div>
              </div>
              {ubicacion && (
                <div className="info-item">
                  <FaMapMarkerAlt className="icon" />
                  <div>
                    <strong>Ubicación:</strong>
                    <p>{ubicacion.direccion}</p>
                    <p className="text-muted">
                      {ubicacion.ciudad?.ciudad}, {ubicacion.ciudad?.departamento?.departamento}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="detail-section">
              <h2>Descripción</h2>
              <p className="detail-description">{descripcion}</p>
            </div>

            {/* Mapa */}
            {hasLocation && (
              <div className="detail-section">
                <h2>Ubicación en el mapa</h2>
                <div className="detail-map-container">
                  <Map
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={{
                      longitude: ubicacion.longitud,
                      latitude: ubicacion.latitud,
                      zoom: 14,
                    }}
                    style={{ width: "100%", height: "400px" }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                  >
                    <Marker
                      longitude={ubicacion.longitud}
                      latitude={ubicacion.latitud}
                      anchor="bottom"
                    >
                      <div className="custom-marker">
                        <FaMapMarkerAlt size={32} color="#FF5A5F" />
                      </div>
                    </Marker>
                  </Map>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <EditVoluntariadoModal
          voluntariado={voluntariado}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadVoluntariado();
          }}
        />
      )}
    </div>
  );
}

export default VoluntariadoDetailPage;
