import { useState, useEffect } from "react";
import VolunteerCard from "../../../../components/Creador/VolunteerCard/VolunteerCard";
import "./CreatorVolunteerLayout.css";

function CreatorVolunteerLayout({ voluntariados, loading, tipo, onCancelarGlobal }) {
  const [voluntariadosState, setVoluntariadosState] = useState([]);

  // Cada vez que cambien las props, actualizamos el estado
  useEffect(() => {
    setVoluntariadosState(voluntariados || []);
  }, [voluntariados]);

  const handleCancelar = (idVoluntariadoCancelado) => {
    setVoluntariadosState(prev =>
      prev.map(v =>
        v.id_voluntariado === idVoluntariadoCancelado
          ? { ...v, estado: "CANCELADO" }
          : v
      )
    );
    if (onCancelarGlobal) onCancelarGlobal(idVoluntariadoCancelado);
  };

  const displayedVoluntariados = voluntariadosState.filter((v) => {
    const estado = v.estado.toUpperCase();
    if (tipo === "pendientes") return estado === "PENDIENTE";
    if (tipo === "en_proceso") return estado === "EN_PROCESO";
    if (tipo === "terminados") return estado === "TERMINADO";
    if (tipo === "cancelados") return estado === "CANCELADO";
    return true;
  });


  if (loading) return <p>Cargando voluntariados...</p>;
  if (displayedVoluntariados.length === 0) return (
    <div className="no-voluntariados-container">
      <div className="no-voluntariados-content">
        <h3 className="no-voluntariados-title">No hay voluntariados</h3>
        <p className="no-voluntariados-description">
          Aún no se han registrado voluntariados en esta categoría.
        </p>
      </div>
    </div>
  );

  return (
    <div className="creator-volunteer-layout">
      {displayedVoluntariados.map((v) => (
        <VolunteerCard
          key={v.id_voluntariado}
          voluntariado={v}
          onCancelar={handleCancelar}
        />
      ))}
    </div>
  );
}

export default CreatorVolunteerLayout;
