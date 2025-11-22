import { useEffect, useState } from "react";
import useInscripcionSocket from "../../../hooks/useInscripcionSocket";
import { Tabs } from "../../../components/Inscription/Tabs/Tabs";
import VolunteerInscriptionLayout from "../../../layouts/Voluntario/VolunteerInscriptionLayout/VolunteerInscriptionLayout";
import { getMisInscripciones } from "../../../services/inscripcion/inscripcionService";
import { WrongAlert } from "../../../utils/ToastAlerts";
import "./VolunteerInscripcionPage.css";

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
    const handler = (e) => {
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

  return (
    <section className="volunteer-inscription-page">
      <div className="header-inscripcion-page">
        <h1 className="volunteer-inscription-page-title">Mis inscripciones</h1>
      </div>

      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        activePrincipalTab={{"activePrincipalTab": activeTab}}
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
    </section>
  );
};

export default VolunteerInscripcionPage;
