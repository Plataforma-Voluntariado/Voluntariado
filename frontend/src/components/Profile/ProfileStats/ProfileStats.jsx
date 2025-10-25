import React from "react";
import "./ProfileStats.css";

function ProfileStats({ user }) {
  const isCreator = user.rol === "CREADOR";
  const isVolunteer = user.rol === "VOLUNTARIO";
  const isAdmin = user.rol === "ADMINISTRADOR";

  return (
    <div className="profile-stats">
      {isVolunteer && (
        <>
          <div className="profile-stat">
            <h3>Eventos Participados</h3>
            <p>{user.roleData?.eventos_participados || 0}</p>
          </div>
          <div className="profile-stat">
            <h3>Horas de Voluntariado</h3>
            <p>{user.roleData?.horas_voluntariado || 0}</p>
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
