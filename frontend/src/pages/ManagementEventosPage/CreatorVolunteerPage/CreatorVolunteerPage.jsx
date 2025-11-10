import React, { useState, useEffect } from "react";
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
  const [tabAlert, setTabAlert] = useState(null);

  // 🔹 Obtener los voluntariados del creador
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

  useEffect(() => {
    if (voluntariados.en_proceso?.length > 0) {
      setTabAlert("en_proceso");
    } else {
      setTabAlert(null);
    }
  }, [voluntariados]);

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
        tabAlert={tabAlert}
      />

      <CreatorVolunteerLayout
        admin={user}
        voluntariados={voluntariados[activeTab] || []}
        loading={loading}
        tipo={activeTab}
        onCancelarGlobal={handleCancelarVoluntariado}
      />
    </section>
  );
}

export default CreatorVolunteerPage;
