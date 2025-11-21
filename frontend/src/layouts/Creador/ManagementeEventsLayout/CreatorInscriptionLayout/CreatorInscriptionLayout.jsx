// src/layouts/Creador/ManagementeEventsLayout/CreatorInscriptionLayout/CreatorInscriptionLayout.jsx
import InscripcionCard from "../../../../components/Inscription/InscriptionCard/InscripcionCard";
import "./CreatorInscriptionLayout.css";

const CreatorInscriptionLayout = ({
  inscripciones,
  setInscripciones,
  loading,
  estadoVoluntariado,
  highlightAsistencia = false,
}) => {
  if (loading) return <p>Cargando inscripciones...</p>;

  if (!inscripciones || inscripciones.length === 0) {
    return (
      <div className="no-inscripciones-container">
        <div className="no-inscripciones-content">
          <h3 className="no-inscripciones-title">No hay inscripciones</h3>
          <p className="no-inscripciones-description">
            Aún no hay inscripciones en este estado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-inscription-layout">
      {inscripciones.map((i) => (
        <InscripcionCard
          key={i.id_inscripcion}
          inscripcion={i}
          setInscripciones={setInscripciones}
          estadoVoluntariado={estadoVoluntariado}
          highlightAsistencia={highlightAsistencia}
        />
      ))}
    </div>
  );
};

export default CreatorInscriptionLayout;
