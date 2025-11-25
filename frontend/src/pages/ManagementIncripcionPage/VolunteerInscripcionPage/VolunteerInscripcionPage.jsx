import { useCallback, useEffect, useState } from "react";
import useInscripcionSocket from "../../../hooks/useInscripcionSocket";
import { Tabs } from "../../../components/Inscription/Tabs/Tabs";
import VolunteerInscriptionLayout from "../../../layouts/Voluntario/VolunteerInscriptionLayout/VolunteerInscriptionLayout";
import { getMisInscripciones } from "../../../services/inscripcion/inscripcionService";
import { WrongAlert } from "../../../utils/ToastAlerts";
import { initTour } from "../../../utils/TourUtils";
import "./VolunteerInscripcionPage.css";
import { FaQuestionCircle } from "react-icons/fa";

const tabsConfig = [
  { key: "pendientes", label: "Pendientes" },
  { key: "aceptadas", label: "Aceptadas" },
  { key: "rechazadas", label: "Rechazadas" },
  { key: "canceladas", label: "Canceladas" },
  { key: "terminadas", label: "Terminadas" },
];

const subTabsTerminadas = [
  { key: "porAsistencia", label: "Por asistencia" },
  { key: "porComentar", label: "Por comentar" },
  { key: "completadas", label: "Completadas" },
];

const VolunteerInscripcionPage = () => {
  const [activeTab, setActiveTab] = useState("pendientes");
  const [activeSubTab, setActiveSubTab] = useState("porComentar");
  const [inscripciones, setInscripciones] = useState({});
  const [loading, setLoading] = useState(true);
  const terminadas = inscripciones?.terminadas || [];
  const hasPendingComments = terminadas.some(
    (i) => i?.asistencia === true && !i?.calificado
  );
  const isPorComentarView =
    activeTab === "terminadas" && activeSubTab === "porComentar";

  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      const data = await getMisInscripciones();
      setInscripciones(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al cargar mis inscripciones:", error);
      WrongAlert({ message: "No se pudieron cargar tus inscripciones" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  useInscripcionSocket();

  useEffect(() => {
    const handler = () => {
      fetchInscripciones();
    };

    window.addEventListener("inscripcion.changed", handler);
    return () => window.removeEventListener("inscripcion.changed", handler);
  }, []);

  const getFilteredTerminadas = () => {
    const todas = inscripciones["terminadas"] || [];
    if (activeTab !== "terminadas") return todas;

    if (activeSubTab === "porComentar")
      return todas.filter((i) => i.asistencia === true && !i.calificado);
    if (activeSubTab === "porAsistencia")
      return todas.filter((i) => i.asistencia === null);
    if (activeSubTab === "completadas")
      return todas.filter((i) => i.asistencia && i.calificado);

    return todas;
  };

  // Function to start the tour
  const startTour = useCallback(() => {
    const tourSteps = {
      pendientes: {
        step: "1",
        intro: "Aquí verás todas tus inscripciones pendientes. Puedes gestionarlas desde esta sección.",
      },
      aceptadas: {
        step: "2",
        intro: "Esta sección muestra las inscripciones que han sido aceptadas. Puedes ver los detalles aquí.",
      },
      rechazadas: {
        step: "3",
        intro: "Aquí encontrarás las inscripciones que han sido rechazadas.",
      },
      canceladas: {
        step: "4",
        intro: "Esta pestaña contiene las inscripciones que han sido canceladas.",
      },
      terminadas: {
        step: "5",
        intro: "En esta sección puedes ver las inscripciones terminadas. Usa las subtabs para filtrar más detalles.",
      },
    };

    const subTabsTourSteps = {
      porAsistencia: {
        step: "6",
        intro: "Estas son las inscripciones que necesitan que marques asistencia.",
      },
      porComentar: {
        step: "7",
        intro: "Estas inscripciones necesitan que dejes un comentario para completarlas.",
      },
      completadas: {
        step: "8",
        intro: "Estas inscripciones ya están completamente terminadas.",
      },
    };

    const steps = [
      {
        element: ".creator-events-tabs",
        intro: tourSteps[activeTab]?.intro || "Navega entre las pestañas para ver diferentes estados de tus inscripciones.",
        step: tourSteps[activeTab]?.step || "1",
      },
    ];

    if (activeTab === "terminadas") {
      steps.push({
        element: ".subtabs-desktop",
        intro: subTabsTourSteps[activeSubTab]?.intro || "Usa estas subtabs para filtrar las inscripciones terminadas.",
        step: subTabsTourSteps[activeSubTab]?.step || "6",
      });
    }

    const tourInstance = initTour(steps, "volunteerInscriptionPageTourCompleted");
    tourInstance.start();
  }, [activeTab, activeSubTab]);

  // Auto-start the tour on first visit
  useEffect(() => {
    const tourCompleted = localStorage.getItem("volunteerInscriptionPageTourCompleted");
    if (!tourCompleted) {
      setTimeout(() => {
        startTour();
      }, 1000);
    }
  }, [startTour]);

  return (
    <section className="volunteer-inscription-page">
      <div className="header-inscripcion-page">
        <h1 className="volunteer-inscription-page-title">Mis inscripciones</h1>
      </div>

      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        activePrincipalTab={{ "activePrincipalTab": activeTab }}
        onTabChange={setActiveTab}
        tabAlert={hasPendingComments ? "terminadas" : undefined}
      />

      {activeTab === "terminadas" && (
        <div className="subtabs-container">
          <div className="subtabs-desktop">
            <Tabs
              tabs={subTabsTerminadas}
              activeTab={activeSubTab}
              onTabChange={setActiveSubTab}
              tabAlert={hasPendingComments ? "porComentar" : undefined}
            />
          </div>

          <div className="subtabs-mobile">
            <select
              value={activeSubTab}
              onChange={(e) => setActiveSubTab(e.target.value)}
              className={`subtabs-select ${
                hasPendingComments ? "alert" : ""
              }`}
            >
              {subTabsTerminadas.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="inscriptions-scroll-area">
        <VolunteerInscriptionLayout
          inscripciones={
            activeTab === "terminadas"
              ? getFilteredTerminadas()
              : inscripciones[activeTab] || []
          }
          loading={loading}
          refreshInscripciones={fetchInscripciones}
          highlightPorComentar={isPorComentarView}
        />
      </div>

      {/* Floating button to manually start the tour */}
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

export default VolunteerInscripcionPage;
