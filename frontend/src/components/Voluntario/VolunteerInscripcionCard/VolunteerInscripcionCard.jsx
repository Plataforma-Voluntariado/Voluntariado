import React, { useState } from "react";
import { FaCheckCircle, FaStar, FaCommentDots } from "react-icons/fa";
import { MdEmail, MdDateRange } from "react-icons/md";
import { cancelarInscripcion } from "../../../services/inscripcion/inscripcionService";
import { SuccessAlert, WrongAlert } from "../../../utils/ToastAlerts";
import ComentarioModal from "../ComentarioModal/ComentarioModal";
import "./VolunteerInscripcionCard.css";
import { crearResenaVoluntariado } from "../../../services/resenas/resenas.service";

const VolunteerInscripcionCard = ({
  inscripcion,
  refreshInscripciones,
  highlightComment = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const voluntariado = inscripcion.voluntariado;
  const ESTADO_INSCRIPCION = inscripcion.estado_inscripcion?.toUpperCase();
  const ESTADO_VOLUNTARIADO = voluntariado?.estado?.toUpperCase();

  const puedeCancelar = ESTADO_INSCRIPCION === "PENDIENTE" && ESTADO_VOLUNTARIADO === "PENDIENTE";
  const puedeComentar = inscripcion.asistencia === true && !inscripcion.calificado;

  const handleCancelar = async () => {
    try {
      setLoading(true);
      await cancelarInscripcion(inscripcion.id_inscripcion);
      refreshInscripciones();
      SuccessAlert({ message: "Inscripción cancelada correctamente.", title: "Cancelación Exitosa" });
    } catch (error) {
      await WrongAlert({ message: error.message || "No se pudo cancelar la inscripción." });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarComentario = async (comentario) => {
    try {
      await crearResenaVoluntariado(inscripcion.voluntariado.id_voluntariado, { comentario });
      setModalOpen(false);
      refreshInscripciones();
      SuccessAlert({ message: "Comentario enviado correctamente.", title: "Reseña Exitosa" });
    } catch (error) {
      await WrongAlert({ message: error.message || "No se pudo enviar el comentario." });
    }
  };

  return (
    <div
      className={`inscripcion-card ${highlightComment ? "highlight-comment" : ""}`}
    >
      <span className={`status ${ESTADO_INSCRIPCION?.toLowerCase()}`}>
        {ESTADO_INSCRIPCION?.replace("_", " ")}
      </span>

      <img src={voluntariado?.creador.url_imagen} alt={voluntariado?.titulo} className="inscripcion-avatar" />

      <h3>{voluntariado?.titulo}</h3>
      <p><MdDateRange style={{ marginRight: "6px" }} />{new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</p>
      <p><MdEmail style={{ marginRight: "6px" }} />{voluntariado?.creador.correo}</p>

      <div className="inscripcion-card-indicators">
        {inscripcion.asistencia && <span className="indicator asistencia"><FaCheckCircle /> Asistió</span>}
        {inscripcion.calificado && <span className="indicator calificado"><FaStar /> Calificado</span>}
      </div>

      <div className="inscripcion-card-actions">
        {puedeCancelar && <button onClick={handleCancelar} disabled={loading} className="cancelar-btn">{loading ? "Cancelando..." : "Cancelar inscripción"}</button>}
        {puedeComentar && <button onClick={() => setModalOpen(true)} className="comentar-btn"><FaCommentDots style={{ marginRight: "6px" }} />Comentar</button>}
      </div>

      <ComentarioModal
        abierto={modalOpen}
        onCerrar={() => setModalOpen(false)}
        onEnviar={handleEnviarComentario}
        inscripcion={inscripcion}
      />
    </div>
  );
};

export default VolunteerInscripcionCard;
