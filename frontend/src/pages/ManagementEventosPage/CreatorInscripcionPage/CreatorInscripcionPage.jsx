import React, { useEffect, useState, useCallback } from "react";
import useInscripcionSocket from "../../../hooks/useInscripcionSocket";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "../../../components/Inscription/Tabs/Tabs";
import CreatorInscriptionLayout from "../../../layouts/Creador/ManagementeEventsLayout/CreatorInscriptionLayout/CreatorInscriptionLayout";
import { getInscripcionesByVoluntariado } from "../../../services/inscripcion/inscripcionService";
import "./CreatorInscripcionPage.css";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { FaQuestionCircle } from "react-icons/fa";

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

  // Función auxiliar para inicializar el tour
  const initTour = () => {
    const tourInstance = introJs();
    
    tourInstance.setOptions({
      prevLabel: 'Anterior',
      nextLabel: 'Siguiente', 
      skipLabel: 'Salir',
      doneLabel: 'Finalizar',
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      disableInteraction: true,
      scrollToElement: true,
      scrollPadding: 80,
      overlayOpacity: 0.8,
      tooltipClass: 'modern-gray-tooltip',
      helperElementPadding: 10,
      highlightClass: 'modern-gray-highlight',
      scrollTo: 'tooltip'
    });
    
    tourInstance.onbeforechange(() => {
      return true;
    });
    
    tourInstance.oncomplete(() => {
      localStorage.setItem('creatorInscripcionPageTourCompleted', 'true');
    });
    
    tourInstance.onexit(() => {
      localStorage.setItem('creatorInscripcionPageTourCompleted', 'true');
    });
    
    tourInstance.start();
  };

  // Función para iniciar el tour manualmente
  const startTour = () => {
    const pageContainer = document.querySelector('.creator-inscription-page');
    if (pageContainer) {
      pageContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    setTimeout(() => {
      initTour();
    }, 700);
  };

  // Auto-iniciar el tour en la primera visita
  useEffect(() => {
    const tourCompleted = localStorage.getItem('creatorInscripcionPageTourCompleted');
    if (!tourCompleted) {
      setTimeout(() => {
        startTour();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInscripciones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInscripcionesByVoluntariado(eventId);
      setInscripciones(data);
    } catch (error) {
      // eslint-disable-next-line no-console
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
    const handler = () => {
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

  // Configuración dinámica de tourSteps basada en el estado
  const getTourSteps = () => {
    const steps = {};
    
    if (estado === "PENDIENTE") {
      steps.pendientes = {
        step: "1",
        intro: "Aquí verás todas las solicitudes de inscripción que aún no has revisado. Puedes aceptar o rechazar cada una."
      };
      steps.aceptadas = {
        step: "2",
        intro: "En esta pestaña encontrarás todas las inscripciones que has aceptado para este voluntariado."
      };
      steps.rechazadas = {
        step: "3",
        intro: "Aquí se muestran las inscripciones que fueron rechazadas."
      };
    } else if (estado === "EN_PROCESO") {
      steps.aceptadas = {
        step: "1",
        intro: "Voluntarios confirmados que están participando activamente en el evento."
      };
      steps.rechazadas = {
        step: "2",
        intro: "Inscripciones rechazadas para este voluntariado en proceso."
      };
    } else if (estado === "TERMINADO") {
      steps.rechazadas = {
        step: "1",
        intro: "Inscripciones que fueron rechazadas antes de que iniciara el voluntariado."
      };
      steps.terminadas = {
        step: "2",
        intro: "Voluntarios que completaron el evento. Aquí puedes marcar asistencia."
      };
    } else if (estado === "CANCELADO") {
      steps.canceladas = {
        step: "1",
        intro: "Todas las inscripciones asociadas a este voluntariado cancelado."
      };
    }
    
    return steps;
  };

  // Configuración de subtabs para terminadas
  const subTabsTourSteps = {
    por_asistencia: {
      step: "3",
      intro: "Voluntarios que necesitan que marques su asistencia al evento."
    },
    por_calificar: {
      step: "4",
      intro: "Voluntarios que asistieron y pero necesitan comentar el voluntariado para terminar por completo el voluntariado."
    },
    completadas: {
      step: "5",
      intro: "Voluntarios que completaron todo el proceso: asistencia marcada y calificación realizada."
    }
  };

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
        activePrincipalTab={{activePrincipalTab: activeTab}}
        onTabChange={setActiveTab}
        tabAlert={
          estado === "TERMINADO" && hasPendingTerminadas
            ? "terminadas"
            : undefined
        }
        tourSteps={getTourSteps()}
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
              tourSteps={subTabsTourSteps}
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

      {/* Botón flotante para iniciar el tour */}
      <button 
        className="floating-tour-btn"
        onClick={startTour}
        title="Iniciar tour guiado"
        aria-label="Iniciar tour guiado"
      >
        <FaQuestionCircle />
      </button>
    </section>
  );
};

export default CreatorInscripcionPage;
