import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs } from "../../../components/Creador/Tabs/Tabs";
import CreatorInscriptionLayout from "../../../layouts/Creador/ManagementeEventsLayout/CreatorInscriptionLayout/CreatorInscriptionLayout";
import { getInscripcionesByVoluntariado } from "../../../services/inscripcion/inscripcionService";
import "./CreatorInscripcionPage.css"
import { useLocation, useNavigate } from "react-router-dom";

const tabsConfig = [
  { key: "pendientes", label: "Pendientes" },
  { key: "aceptadas", label: "Aceptadas" },
  { key: "rechazadas", label: "Rechazadas" },
];

const CreatorInscripcionPage = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState("pendientes");
  const [inscripciones, setInscripciones] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { estadoVoluntariado } = location.state || {};

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        setLoading(true);
        const data = await getInscripcionesByVoluntariado(eventId);
        setInscripciones(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInscripciones();
  }, [eventId]);

  return (
    <section className="creator-inscription-page">
      <div className="header-inscripcion-page">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <span className="back-icon">← </span>
          <span className="back-text">Volver</span>
        </button>

        <h1 className="creator-inscription-page-title">
          Inscripciones del voluntariado
        </h1>
      </div>

      <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />

      <CreatorInscriptionLayout
        inscripciones={inscripciones[activeTab] || []}
        setInscripciones={setInscripciones}
        loading={loading}
        estadoVoluntariado={estadoVoluntariado}
      />
    </section>
  );
};

export default CreatorInscripcionPage;
