import VolunteerInscripcionCard from "../../../components/Inscription/InscriptionCard/VolunteerInscripcionCard";
import "./VolunteerInscriptionLayout.css";

const VolunteerInscriptionLayout = ({
  inscripciones,
  loading,
  refreshInscripciones,
  highlightPorComentar = false,
}) => {
  if (loading) return <p>Cargando inscripciones...</p>;

  if (!inscripciones || inscripciones.length === 0) {
    return (
      <div className="volunteer-no-inscripciones-container">
        <div className="no-inscripciones-content">
          <h3 className="no-inscripciones-title">No hay inscripciones</h3>
          <p className="no-inscripciones-description">
            Aún no tienes inscripciones en este estado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-inscription-layout">
      {inscripciones.map((i) => (
        <VolunteerInscripcionCard
          key={i.id_inscripcion}
          inscripcion={i}
          refreshInscripciones={refreshInscripciones}
          highlightComment={
            highlightPorComentar && i?.asistencia === true && !i?.calificado
          }
        />
      ))}
    </div>
  );
};

export default VolunteerInscriptionLayout;
