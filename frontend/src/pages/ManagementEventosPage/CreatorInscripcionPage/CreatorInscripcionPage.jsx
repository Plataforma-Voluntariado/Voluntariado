import React, { useEffect, useState, useCallback } from "react";
import useInscripcionSocket from "../../../hooks/useInscripcionSocket";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "../../../components/Creador/Tabs/Tabs";
import CreatorInscriptionLayout from "../../../layouts/Creador/ManagementeEventsLayout/CreatorInscriptionLayout/CreatorInscriptionLayout";
import { getInscripcionesByVoluntariado } from "../../../services/inscripcion/inscripcionService";
import "./CreatorInscripcionPage.css";

const baseTabs = {
  PENDIENTE: [
    { key: "pendientes", label: "Pendientes" },
    { key: "aceptadas", label: "Aceptadas" },
    { key: "rechazadas", label: "Rechazadas" },
  ],
  EN_PROCESO: [
    { key: "aceptadas", label: "Aceptadas" },
    { key: "rechazadas", label: "Rechazadas" },
  ],
  TERMINADO: [
    { key: "rechazadas", label: "Rechazadas" },
    { key: "terminadas", label: "Terminadas" },
  ],
  CANCELADO: [{ key: "canceladas", label: "Canceladas" }],
};

const subTabsConfig = [
  { key: "por_asistencia", label: "Por asistencia" },
  { key: "por_calificar", label: "Por calificar" },
  { key: "completadas", label: "Completadas" },
];

const initialTabMap = {
  PENDIENTE: "pendientes",
  EN_PROCESO: "aceptadas",
  TERMINADO: "rechazadas",
  CANCELADO: "canceladas",
};

const CreatorInscripcionPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const estado = (location.state?.estadoVoluntariado || "PENDIENTE").toUpperCase();
  const [activeTab, setActiveTab] = useState(initialTabMap[estado] || "pendientes");
  const [activeSubTab, setActiveSubTab] = useState("por_asistencia");
  const [inscripciones, setInscripciones] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchInscripciones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInscripcionesByVoluntariado(eventId);
      setInscripciones(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchInscripciones();
  }, [fetchInscripciones]);

  useInscripcionSocket();

  useEffect(() => {
    const handler = (e) => {
      fetchInscripciones();
    };
    window.addEventListener("inscripcion.changed", handler);
    return () => window.removeEventListener("inscripcion.changed", handler);
  }, [fetchInscripciones]);

  const terminadas = inscripciones?.terminadas || [];
  const pendingAsistencia = terminadas.filter(
    (i) => i?.estado_inscripcion === "TERMINADA" && i?.asistencia === null
  );
  const hasPendingAsistencia = pendingAsistencia.length > 0;
  const hasPendingTerminadas = hasPendingAsistencia;

  const filterInscripciones = (inscripcionesList = [], subtab) => {
    if (activeTab !== "terminadas") return inscripcionesList;

    switch (subtab) {
      case "por_asistencia":
        return inscripcionesList.filter(
          (i) => i.estado_inscripcion === "TERMINADA" && i.asistencia == null
        );
      case "por_calificar":
        return inscripcionesList.filter(
          (i) =>
            i.estado_inscripcion === "TERMINADA" &&
            i.asistencia &&
            !i.calificado
        );
      case "completadas":
        return inscripcionesList.filter(
          (i) => i.estado_inscripcion === "TERMINADA" && i.calificado
        );
      default:
        return inscripcionesList;
    }
  };

  const tabsConfig = baseTabs[estado] || [];
  const filteredInscripciones = filterInscripciones(inscripciones[activeTab], activeSubTab);

  return (
    <section className="creator-inscription-page">
      <div className="header-inscripcion-page">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <span className="back-icon">←</span>
          <span className="back-text"> Volver</span>
        </button>
        <h1 className="creator-inscription-page-title">Inscripciones del voluntariado</h1>
      </div>


      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabAlert={
          estado === "TERMINADO" && hasPendingTerminadas
            ? "terminadas"
            : undefined
        }
      />

      {estado === "TERMINADO" && activeTab === "terminadas" && (
        <div className="subtabs-container">
   
          <div className="subtabs-desktop">
            <Tabs
              tabs={subTabsConfig}
              activeTab={activeSubTab}
              onTabChange={setActiveSubTab}
              tabAlerts={
                hasPendingAsistencia ? ["por_asistencia"] : undefined
              }
            />
          </div>

          <div className="subtabs-mobile">
            <select
              className={`subtabs-select ${
                hasPendingTerminadas ? "alert" : ""
              } ${hasPendingAsistencia ? "alert-asistencia" : ""}`}
              value={activeSubTab}
              onChange={(e) => setActiveSubTab(e.target.value)}
            >
              {subTabsConfig.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <CreatorInscriptionLayout
        inscripciones={filteredInscripciones || []}
        setInscripciones={setInscripciones}
        loading={loading}
        estadoVoluntariado={estado}
        highlightAsistencia={
          estado === "TERMINADO" &&
          activeTab === "terminadas" &&
          activeSubTab === "por_asistencia" &&
          hasPendingAsistencia
        }
      />
    </section>
  );
};

export default CreatorInscripcionPage;
