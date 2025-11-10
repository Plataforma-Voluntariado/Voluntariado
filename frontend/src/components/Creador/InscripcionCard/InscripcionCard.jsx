// src/components/Creador/InscripcionCard/InscripcionCard.jsx
import React, { useState } from "react";
import { aceptarInscripcion, rechazarInscripcion, marcarAsistencia } from "../../../services/inscripcion/inscripcionService";
import { SuccessAlert, WrongAlert } from "../../../utils/ToastAlerts";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { MdEmail, MdDateRange } from "react-icons/md";

import "./InscripcionCard.css";

const InscripcionCard = ({ inscripcion, setInscripciones, estadoVoluntariado }) => {
  const [loading, setLoading] = useState(false);
  const usuario = inscripcion.voluntario;

  const ESTADO_VOLUNTARIADO = estadoVoluntariado?.toUpperCase();
  const ESTADO_INSCRIPCION = inscripcion.estado_inscripcion?.toUpperCase();

  const mostrarBotonesAceptarRechazar = ESTADO_VOLUNTARIADO === "PENDIENTE" && ESTADO_INSCRIPCION === "PENDIENTE";
  const mostrarBotonAsistencia = ESTADO_VOLUNTARIADO === "TERMINADO" && ESTADO_INSCRIPCION === "ACEPTADA" && !inscripcion.asistencia;

  const handleAceptar = async () => {
    try {
      setLoading(true);
      await aceptarInscripcion(inscripcion.id_inscripcion);
      setInscripciones(prev => ({
        ...prev,
        pendientes: prev.pendientes.filter(i => i.id_inscripcion !== inscripcion.id_inscripcion),
        aceptadas: [...prev.aceptadas, { ...inscripcion, estado_inscripcion: "ACEPTADO" }]
      }));
      await SuccessAlert({ message: `${usuario.nombre} fue aceptado correctamente.` });
    } catch (error) {
      await WrongAlert({ message: `No se pudo aceptar a ${usuario.nombre}. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    try {
      setLoading(true);
      await rechazarInscripcion(inscripcion.id_inscripcion);
      setInscripciones(prev => ({
        ...prev,
        pendientes: prev.pendientes.filter(i => i.id_inscripcion !== inscripcion.id_inscripcion),
        rechazadas: [...prev.rechazadas, { ...inscripcion, estado_inscripcion: "CANCELADO" }]
      }));
      await SuccessAlert({ message: `${usuario.nombre} fue rechazado.` });
    } catch (error) {
      await WrongAlert({ message: `No se pudo rechazar a ${usuario.nombre}. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleAsistencia = async () => {
    try {
      setLoading(true);
      await marcarAsistencia(inscripcion.id_inscripcion, true);
      setInscripciones(prev => ({
        ...prev,
        aceptadas: prev.aceptadas.map(i =>
          i.id_inscripcion === inscripcion.id_inscripcion
            ? { ...i, asistencia: true }
            : i
        )
      }));
      await SuccessAlert({ message: `Asistencia de ${usuario.nombre} marcada como presente.` });
    } catch (error) {
      await WrongAlert({ message: `No se pudo actualizar la asistencia de ${usuario.nombre}. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscripcion-card">
      <span className={`status ${ESTADO_INSCRIPCION.toLowerCase()}`}>
        {ESTADO_INSCRIPCION.replace("_", " ")}
      </span>

      <img src={usuario.url_imagen} alt={usuario.nombre} className="inscripcion-avatar" />
      <h3>{usuario.nombre} {usuario.apellido}</h3>
      <p><MdEmail style={{ marginRight: "6px" }} /> {usuario.correo}</p>
      <p><MdDateRange style={{ marginRight: "6px" }} /> {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</p>


      <div className="inscripcion-card-indicators">
        {inscripcion.asistencia && (
          <span className="indicator asistencia"><FaCheckCircle /> Asistió</span>
        )}
        {inscripcion.calificado && (
          <span className="indicator calificado"><FaStar /> Calificado</span>
        )}
      </div>

      <div className="inscripcion-card-actions">
        {mostrarBotonesAceptarRechazar && (
          <>
            <button onClick={handleAceptar} disabled={loading}>Aceptar</button>
            <button onClick={handleRechazar} disabled={loading}>Rechazar</button>
          </>
        )}

        {mostrarBotonAsistencia && (
          <button className="asistencia" onClick={handleAsistencia} disabled={loading}>
            Marcar asistencia
          </button>
        )}
      </div>
    </div>
  );
};

export default InscripcionCard;
