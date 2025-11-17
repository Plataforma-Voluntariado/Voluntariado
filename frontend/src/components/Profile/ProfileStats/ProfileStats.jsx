import React, { useEffect, useState } from "react";
import "./ProfileStats.css";
import { GetVoluntarioById } from "../../../services/voluntariado/voluntariadoService";

function ProfileStats({ user }) {
  const [stats, setStats] = useState({});
  const isCreator = user.rol === "CREADOR";
  const isVolunteer = user.rol === "VOLUNTARIO";
  const isAdmin = user.rol === "ADMINISTRADOR";

  useEffect(() => {
    let isMounted = true;
    const fetchStatsData = async () => {
      try {
        // Solo aplica para voluntarios
        if (!isVolunteer || !user?.userId) return;
        const response = await GetVoluntarioById(user.userId);
        if (isMounted && response?.estadisticas) {
          setStats(response.estadisticas);
        }
      } catch (err) {
        // Silenciar por ahora; podrías agregar un toast si fuese necesario
        console.error("Error cargando estadísticas de voluntario:", err);
      }
    };
    fetchStatsData();
    return () => {
      isMounted = false;
    };
  }, [user?.userId, isVolunteer]);
  return (
    <div className="profile-stats">

      {isVolunteer && (
        <>
          <div className="profile-stat">
            <h3>Horas Trabajadas</h3>
            <p>{stats.horas_trabajadas || 0}</p>
          </div>
          <div className="profile-stat">
            <h3>Participaciones</h3>
            <p>{stats.participaciones || 0}</p>
          </div>
          <div className="profile-stat">
            <h3>% asistencia</h3>
            <p>{stats.porcentaje_asistencia || 0}%</p>
          </div>
        </>
      )}

      {isCreator && (
        <>
          <div className="profile-stat">
            <h3>Eventos Creados</h3>
            <p>{user.roleData?.eventos_creados || 0}</p>
          </div>
          <div className="profile-stat">
            <h3>Voluntarios Registrados</h3>
            <p>{user.roleData?.voluntarios_registrados || 0}</p>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <div className="profile-stat">
            <h3>Usuarios Verificados</h3>
            <p>{user.roleData?.usuarios_verificados || 0}</p>
          </div>
          <div className="profile-stat">
            <h3>Creadores Pendientes</h3>
            <p>{user.roleData?.creadores_pendientes || 0}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileStats;
