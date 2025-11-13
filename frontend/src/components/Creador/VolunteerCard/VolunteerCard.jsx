// src/components/VolunteerCard.jsx
import { useNavigate } from "react-router-dom";
import { FaClock, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaTimesCircle, } from "react-icons/fa";
import { cancelarVoluntariado } from "../../../services/voluntariado/voluntariadoService";
import ConfirmAlert from "../../../components/alerts/ConfirmAlert";
import { SuccessAlert, WrongAlert } from "../../../utils/ToastAlerts";
import "./VolunteerCard.css";

const VolunteerCard = ({ voluntariado, onCancelar, highlightAsistencia = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/manage-events/${voluntariado.id_voluntariado}`, {
      state: { estadoVoluntariado: voluntariado.estado },
    });
  };

  const handleCancelar = async (e) => {
    e.stopPropagation();
    const confirmar = await ConfirmAlert({
      title: "¿Cancelar voluntariado?",
      message: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      confirmText: "Sí, cancelar",
      cancelText: "No, mantenerlo",
    });

    if (!confirmar) return;

    try {
      await cancelarVoluntariado(voluntariado.id_voluntariado);
      SuccessAlert({title:"Cancelacion Exitosa", message:"Has cancelado con exito el Voluntariado"})
      if (onCancelar) onCancelar(voluntariado.id_voluntariado);
    } catch (error) {
      WrongAlert({message:error.message})
    }
  };
  const cardClassName = [
    "volunteer-card-horizontal",
    highlightAsistencia ? "highlight-asistencia" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClassName}
      onClick={handleClick}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <span className={`status ${voluntariado.estado}`}>
        {voluntariado.estado.replace("_", " ")}
      </span>

      <img
        src={
          voluntariado.fotos?.[0]?.url ||
          "https://via.placeholder.com/250x180"
        }
        alt={voluntariado.titulo}
        className="volunteer-card-horizontal-image"
      />

      <div className="volunteer-card-horizontal-info">
        <h3 className="volunteer-card-title">{voluntariado.titulo}</h3>
        {highlightAsistencia && (
          <span className="volunteer-card-alert-badge">
            Pendiente por marcar asistencia
          </span>
        )}
        <p className="volunteer-card-description">
          {voluntariado.descripcion.length > 150
            ? voluntariado.descripcion.slice(0, 150) + "..."
            : voluntariado.descripcion}
        </p>
        <div className="volunteer-card-meta">
          <span className="category-label">
            {voluntariado.categoria.nombre}
          </span>
        </div>
        <div className="volunteer-card-details">
          <p>
            <FaCalendarAlt />{" "}
            {new Date(voluntariado.fechaHoraInicio).toLocaleDateString()} -{" "}
            {new Date(voluntariado.fechaHoraFin).toLocaleDateString()}
          </p>
          <p>
            <FaClock /> {voluntariado.horas} horas
          </p>
          <p>
            <FaUsers /> {voluntariado.participantesAceptados}/
            {voluntariado.maxParticipantes}
          </p>
          <p>
            <FaMapMarkerAlt /> {voluntariado.ubicacion?.nombre_sector},{" "}
            {voluntariado.ubicacion?.ciudad?.ciudad}
          </p>
        </div>
      </div>

      {voluntariado.estado.toUpperCase() === "PENDIENTE" && (
        <FaTimesCircle
          className="cancel-icon"
          onClick={handleCancelar}
          title="Cancelar voluntariado"
        />
      )}
    </div>
  );
};

export default VolunteerCard;
