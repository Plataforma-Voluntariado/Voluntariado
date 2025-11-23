// NotificationsModal.jsx
import { useState } from "react";
import { MdInfo, MdWarning, MdMessage, MdEventNote, MdClose } from "react-icons/md";
import { MarkNotificationAsSeen, DeleteNotification } from "../../../services/notificaciones/notificacionesService";
import "./NotificationsModal.css";

function NotificationsModal({ vistas, noVistas }) {
  const [activeTab, setActiveTab] = useState("noVistas");

  const iconMap = {
    INFO: <MdInfo />,
    ALERTA: <MdWarning />,
    MENSAJE: <MdMessage />,
    RECORDATORIO: <MdEventNote />,
  };

  const formatDateTime = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClickNotification = async (notificacion) => {
    if (!notificacion.visto) {
      try {
        await MarkNotificationAsSeen(notificacion.id_notificacion);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error al marcar notificación como vista:", err);
        return;
      }
    }

    if (notificacion.url_redireccion) {
      window.location.href = notificacion.url_redireccion;
    }
  };

  const handleDeleteNotification = async (notificacionId, e) => {
    e.stopPropagation();
    try {
      await DeleteNotification(notificacionId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error al eliminar notificación:", err);
    }
  };

  const renderList = () => {
    const list = activeTab === "noVistas" ? noVistas : vistas;
    if (!list || list.length === 0) {
      return <p className="no-notifications">No hay notificaciones {activeTab === "noVistas" ? "nuevas" : "vistas"}</p>;
    }

    return (
      <ul>
        {list.map((n) => (
          <li
            key={n.id_notificacion}
            className={`notification-item tipo-${(n.tipo || "").toLowerCase()} ${n.visto ? "visto" : "nuevo"}`}
            onClick={() => handleClickNotification(n)}
            style={{ cursor: n.visto ? "default" : "pointer" }}
          >
            <span className="notification-icon">{iconMap[n.tipo]}</span>
            <div className="notification-content">
              <strong className="notification-title">{n.titulo}</strong>
              <p className="notification-message">{n.mensaje}</p>
              <span className="notification-date">{formatDateTime(n.fecha)}</span>
            </div>
            {activeTab === "vistas" && (
              <span
                className="notification-delete"
                onClick={(e) => handleDeleteNotification(n.id_notificacion, e)}
              >
                <MdClose />
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="notifications-modal">
      <div className="notifications-modal-tabs">
        <button
          className={activeTab === "noVistas" ? "active" : ""}
          onClick={() => setActiveTab("noVistas")}
        >
          No Vistas
        </button>
        <button
          className={activeTab === "vistas" ? "active" : ""}
          onClick={() => setActiveTab("vistas")}
        >
          Vistas
        </button>
      </div>

      <div className="notifications-modal-list">{renderList()}</div>
    </div>
  );
}

export default NotificationsModal;
