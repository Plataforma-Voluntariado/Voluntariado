import React, { useState, useEffect, useMemo } from "react";
import "./CreatorVolunteerPage.css";
import { useAuth } from "../../../context/AuthContext";
import CreatorVolunteerLayout from "../../../layouts/Creador/ManagementeEventsLayout/CreatorVolunteerLayout/CreatorVolunteerLayout";
import { Tabs } from "../../../components/Inscription/Tabs/Tabs";
import { getEventsByCreatorId } from "../../../services/voluntariado/voluntariadoService";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { FaQuestionCircle } from "react-icons/fa";

const tabsConfig = [
  { key: "pendientes", label: "Pendientes" },
  { key: "en_proceso", label: "En Proceso" },
  { key: "terminados", label: "Terminados" },
  { key: "cancelados", label: "Cancelados" },
];

function CreatorVolunteerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pendientes");
  const [voluntariados, setVoluntariados] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabAlerts, setTabAlerts] = useState([]);

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
      localStorage.setItem('creatorEventsPageTourCompleted', 'true');
    });
    
    tourInstance.onexit(() => {
      localStorage.setItem('creatorEventsPageTourCompleted', 'true');
    });
    
    tourInstance.start();
  };

  // Función para iniciar el tour manualmente
  const startTour = () => {
    const pageContainer = document.querySelector('.creator-volunteer-page');
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
    const tourCompleted = localStorage.getItem('creatorEventsPageTourCompleted');
    if (!tourCompleted) {
      setTimeout(() => {
        startTour();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const fetchVoluntariados = async () => {
      try {
        setLoading(true);
        const data = await getEventsByCreatorId();
        setVoluntariados(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVoluntariados();
  }, [user]);

  const terminadosList = useMemo(
    () => voluntariados?.terminados || [],
    [voluntariados]
  );

  const pendingAsistenciaIds = useMemo(() => {
    return terminadosList
      .filter((vol) =>
        vol?.inscripciones?.some((ins) => {
          const estado = ins?.estado_inscripcion?.toUpperCase();
          return estado === "TERMINADA" && ins?.asistencia === null;
        })
      )
      .map((vol) => vol.id_voluntariado);
  }, [terminadosList]);

  const hasPendingAsistencia = pendingAsistenciaIds.length > 0;

  useEffect(() => {
    const alerts = [];
    if (voluntariados.en_proceso?.length > 0) alerts.push("en_proceso");
    if (hasPendingAsistencia) alerts.push("terminados");
    setTabAlerts(alerts);
  }, [voluntariados, hasPendingAsistencia]);

  const handleCancelarVoluntariado = (idVoluntariadoCancelado) => {
    setVoluntariados((prev) => {
      const actualizado = { ...prev };

      for (const key in actualizado) {
        const index = actualizado[key]?.findIndex(
          (v) => v.id_voluntariado === idVoluntariadoCancelado
        );
        if (index !== -1) {
          const [voluntariadoCancelado] = actualizado[key].splice(index, 1);
          actualizado.cancelados = [
            ...(actualizado.cancelados || []),
            { ...voluntariadoCancelado, estado: "CANCELADO" },
          ];
          break;
        }
      }

      return { ...actualizado };
    });
  };


  return (
    <section className="creator-volunteer-page">
      <h1 className="creator-volunteer-page-title">Voluntariados creados</h1>

      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabAlerts={tabAlerts}
        tourSteps={{
          pendientes: {
            step: "1",
            intro: "Aquí verás todos los voluntariados que aún no han comenzado. Puedes gestionar las incripciones pendientes de estos voluntariados."
          },
          en_proceso: {
            step: "2",
            intro: "Esta sección muestra los voluntariados que están actualmente en curso. Puedes ver cuántos voluntarios están participando "
          },
          terminados: {
            step: "3",
            intro: "Aquí encontrarás los voluntariados completados. Puedes marcar la asistencia de los voluntarios y revisar inscripciones del evento."
          },
          cancelados: {
            step: "4",
            intro: "Esta pestaña contiene todos los voluntariados que fueron cancelados. Puedes revisar el historial de las inscripciones que estaban en ese voluntariado"
          }
        }}
      />

      <CreatorVolunteerLayout
        admin={user}
        voluntariados={voluntariados[activeTab] || []}
        loading={loading}
        tipo={activeTab}
        onCancelarGlobal={handleCancelarVoluntariado}
        pendingAsistenciaIds={pendingAsistenciaIds}
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
}

export default CreatorVolunteerPage;
