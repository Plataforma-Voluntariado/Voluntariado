import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeCreatorLayout.css";
import { getMyVoluntariados } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import VolunteeringCard from "../../components/VolunteeringCard/VolunteeringCard";
import { FaPlus, FaCalendarAlt, FaUsers, FaChartLine } from "react-icons/fa";

function HomeCreatorLayout() {
  const [voluntariados, setVoluntariados] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadMisVoluntariados = async () => {
    try {
      setLoading(true);
      const data = await getMyVoluntariados();
      setVoluntariados(data || {});
      setError(null);
    } catch (err) {
      console.error("Error cargando voluntariados:", err);
      setError("Error al cargar los voluntariados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMisVoluntariados();
  }, []);

  useEffect(() => {
    const handler = () => {
      loadMisVoluntariados();
    };

    window.addEventListener("inscripcion.changed", handler);
    return () => window.removeEventListener("inscripcion.changed", handler);
  }, []);

  const handleCreateNew = () => {
    navigate("/crear-voluntariado");
  };

  const getStatistics = () => {
    if (!voluntariados || typeof voluntariados !== "object") return {};

    const pendientes = voluntariados.pendientes?.length || 0;
    const enProceso = voluntariados.en_proceso?.length || 0;
    const terminados = voluntariados.terminados?.length || 0;
    const cancelados = voluntariados.cancelados?.length || 0;

    const total = pendientes + enProceso + terminados + cancelados;

    const totalInscripciones = Object.values(voluntariados)
      .flat()
      .reduce(
        (sum, v) => sum + (v.inscripciones?.filter(i => i.estado_inscripcion === "PENDIENTE").length || 0),
        0
      );


    return { total, pendientes, enProceso, terminados, cancelados, totalInscripciones };
  };

  if (loading) {
    return (
      <div className="home-creator-container">
        <div className="home-creator-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tus voluntariados...</p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  const allVoluntariados = [
    ...(voluntariados.pendientes || []),
    ...(voluntariados.en_proceso || []),
    ...(voluntariados.terminados || []),
    ...(voluntariados.cancelados || []),
  ];

  return (
    <div className="home-creator-container">
      <div className="home-creator-layout">
        {/* Header Section */}
        <div className="creator-header">
          <div className="welcome-section">
            <h1>¡Bienvenido, {user?.nombres}!</h1>
            <p>Gestiona tus voluntariados y conecta con la comunidad</p>
          </div>

          <button className="create-new-btn" onClick={handleCreateNew}>
            <FaPlus />
            <span>Crear Nuevo Voluntariado</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaCalendarAlt />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Voluntariados Creados</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>{stats.enProceso}</h3>
              <p>Voluntariados en Proceso</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inscriptions">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.totalInscripciones}</h3>
              <p>Total Inscripciones Pendientes</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="creator-content">
          <div className="content-header">
            <h2>Mis Voluntariados</h2>
            {allVoluntariados.length > 0 && (
              <p>
                {allVoluntariados.length} voluntariado
                {allVoluntariados.length !== 1 ? "s" : ""} encontrado
                {allVoluntariados.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadMisVoluntariados}>Reintentar</button>
            </div>
          )}

          {!error && allVoluntariados.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FaCalendarAlt />
              </div>
              <h3>¡Comienza tu primer voluntariado!</h3>
              <p>
                Aún no has creado ningún voluntariado. Crea uno ahora y comienza
                a conectar con voluntarios.
              </p>
              <button className="create-first-btn" onClick={handleCreateNew}>
                <FaPlus />
                <span>Crear Mi Primer Voluntariado</span>
              </button>
            </div>
          )}

          {!error && allVoluntariados.length > 0 && (
            <div className="voluntariados-grid">
              {allVoluntariados.map((voluntariado) => (
                <VolunteeringCard
                  key={voluntariado.id_voluntariado}
                  volunteering={voluntariado}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeCreatorLayout;
