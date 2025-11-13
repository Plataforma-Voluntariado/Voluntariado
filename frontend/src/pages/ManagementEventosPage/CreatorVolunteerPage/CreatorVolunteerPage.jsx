import React, { useState, useEffect, useMemo } from "react";
import "./CreatorVolunteerPage.css";
import { useAuth } from "../../../context/AuthContext";
import CreatorVolunteerLayout from "../../../layouts/Creador/ManagementeEventsLayout/CreatorVolunteerLayout/CreatorVolunteerLayout";
import { Tabs } from "../../../components/Creador/Tabs/Tabs";
import { getEventsByCreatorId } from "../../../services/voluntariado/voluntariadoService";

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
  
  useEffect(() => {
    const fetchVoluntariados = async () => {
      try {
        setLoading(true);
        const data = await getEventsByCreatorId();
        setVoluntariados(data);
      } catch (error) {
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
      />

      <CreatorVolunteerLayout
        admin={user}
        voluntariados={voluntariados[activeTab] || []}
        loading={loading}
        tipo={activeTab}
        onCancelarGlobal={handleCancelarVoluntariado}
        pendingAsistenciaIds={pendingAsistenciaIds}
      />
    </section>
  );
}

export default CreatorVolunteerPage;
