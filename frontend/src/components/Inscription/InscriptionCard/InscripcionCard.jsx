import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {aceptarInscripcion,rechazarInscripcion,marcarAsistencia,} from "../../../services/inscripcion/inscripcionService";
import { SuccessAlert, WrongAlert } from "../../../utils/ToastAlerts";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { MdEmail, MdDateRange } from "react-icons/md";
import "./InscripcionCard.css";

const InscripcionCard = ({
  inscripcion,
  setInscripciones,
  estadoVoluntariado,
  highlightAsistencia = false,
}) => {
  const [loading, setLoading] = useState(false);
  const usuario = inscripcion.voluntario;

  const navigate = useNavigate();

  const ESTADO_VOLUNTARIADO = estadoVoluntariado?.toUpperCase();
  const ESTADO_INSCRIPCION = inscripcion.estado_inscripcion?.toUpperCase();

  const mostrarBotonesAceptarRechazar = ESTADO_VOLUNTARIADO === "PENDIENTE" && ESTADO_INSCRIPCION === "PENDIENTE";
  const mostrarBotonAsistencia = ESTADO_VOLUNTARIADO === "TERMINADO" && ESTADO_INSCRIPCION === "TERMINADA" && inscripcion.asistencia == null;
  console.log(ESTADO_VOLUNTARIADO, ESTADO_INSCRIPCION, inscripcion.asistencia);
  const moverInscripcion = (listaDestino, nuevoEstado = {}) => {
    setInscripciones(prev => {
      const nuevoState = Object.fromEntries(
        Object.entries(prev).map(([key, list]) => [
          key,
          list.filter(i => i.id_inscripcion !== inscripcion.id_inscripcion)
        ])
      );

      nuevoState[listaDestino] = [...(nuevoState[listaDestino] || []), { ...inscripcion, ...nuevoEstado }];
      return nuevoState;
    });
  };

  const handleAceptar = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await aceptarInscripcion(inscripcion.id_inscripcion);
      moverInscripcion("aceptadas", { estado_inscripcion: "ACEPTADA" });
      await SuccessAlert({ message: `${usuario.nombre} fue aceptado correctamente.` });
    } catch (error) {
      await WrongAlert({ message: `No se pudo aceptar a ${usuario.nombre}. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await rechazarInscripcion(inscripcion.id_inscripcion);
      moverInscripcion("rechazadas", { estado_inscripcion: "CANCELADO" });
      await SuccessAlert({ message: `${usuario.nombre} fue rechazado.` });
    } catch (error) {
      await WrongAlert({ message: `No se pudo rechazar a ${usuario.nombre}. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleAsistencia = async (asistencia) => {
    if (loading) return;
    setLoading(true);
    try {
      await marcarAsistencia(inscripcion.id_inscripcion, asistencia);
      moverInscripcion("terminadas", { asistencia: true, estado_inscripcion: "TERMINADA" });
      await SuccessAlert({ message: `Asistencia de ${usuario.nombre} marcada.` });
    } catch (error) {
      await WrongAlert({ message: `No se pudo actualizar la asistencia de ${usuario.nombre}. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const cardClassName = [
    "inscripcion-card",
    highlightAsistencia ? "highlight-asistencia" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassName}>
      <span className={`inscripcion-card-status inscripcion-card-status-${ESTADO_INSCRIPCION.toLowerCase()}`}>
        {ESTADO_INSCRIPCION.replace("_", " ")}
      </span>

      <img
        src={usuario.url_imagen}
        alt={usuario.nombre}
        className="inscripcion-avatar"
        style={{ cursor: usuario?.id_usuario || usuario?.id ? "pointer" : "default" }}
        onClick={() => {
          const id = usuario?.id_usuario || usuario?.id || usuario;
          if (id) navigate(`/voluntario/${id}`);
        }}
      />
      <h3>{usuario.nombre} {usuario.apellido}</h3>
      <p><MdEmail className="inscripcion-icon"/> {usuario.correo}</p>
      <p><MdDateRange className="inscripcion-icon" /> {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</p>

      <div className="inscripcion-card-indicators">
        {inscripcion.asistencia && <span className="indicator asistencia"><FaCheckCircle /> Asistió</span>}
        {inscripcion.calificado && <span className="indicator calificado"><FaStar /> Calificado</span>}
      </div>

      <div className="inscripcion-card-actions">
        {mostrarBotonesAceptarRechazar && (
          <>
            <button className="inscripcion-card-aceptar-btn" onClick={handleAceptar} disabled={loading}>Aceptar</button>
            <button className="inscripcion-card-rechazar-btn" onClick={handleRechazar} disabled={loading}>Rechazar</button>
          </>
        )}
        {mostrarBotonAsistencia && (
          <button
            className={`asistencia ${highlightAsistencia ? "pulse" : ""}`}
            onClick={() => handleAsistencia(true)}
            disabled={loading}
          >
            Marcar asistencia
          </button>
        )}
        {mostrarBotonAsistencia && (
          <button
            className={`ausencia ${highlightAsistencia ? "pulse" : ""}`}
            onClick={() => handleAsistencia(false)}
            disabled={loading}
          >
            Marcar ausencia
          </button>
        )}
      </div>
    </div>
  );
};

export default InscripcionCard;
