import "./VolunteeringCard.css"

function VolunteeringCard({ volunteering }) {
  const {
    id_voluntariado,
    titulo,
    descripcion,
    fechaHoraInicio,
    fechaHoraFin,
    horas,
    maxParticipantes,
    estado,
    creador,
    categoria,
    fotos,
    ubicacion,
    nombre_entidad,
  } = volunteering

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pendiente":
        return "pending"
      case "activo":
        return "active"
      case "completado":
        return "completed"
      case "cancelado":
        return "cancelled"
      default:
        return "pending"
    }
  }

  const truncateText = (text, maxLength) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const photoUrl = fotos && fotos.length > 0 ? fotos[0].url : "/volunteering.jpg"

  return (
    <div className="volunteering-card">
      <div className="volunteering-card-image">
        <img src={photoUrl || "/placeholder.svg"} alt={titulo} />
        <div className="volunteering-card-category-badge">{categoria?.nombre}</div>
      </div>

      <div className="volunteering-card-content">
        <div className="volunteering-card-header">
          <h3 className="volunteering-card-title">{titulo}</h3>
          <span className={`volunteering-card-status volunteering-card-status-${getStatusColor(estado)}`}>
            {estado?.charAt(0).toUpperCase() + estado?.slice(1).toLowerCase()}
          </span>
        </div>

        <p className="volunteering-card-description">{truncateText(descripcion, 100)}</p>

        <div className="volunteering-card-creator">
          <img
            src={creador?.url_imagen || "/placeholder.svg"}
            alt={creador?.nombre || creador?.correo}
            className="volunteering-card-creator-avatar"
          />
          <div className="volunteering-card-creator-info">
            <span className="volunteering-card-creator-label">Creador</span>
            <p className="volunteering-card-creator-name">
              {nombre_entidad ||
                (creador?.nombre && creador?.apellido ? `${creador.nombre} ${creador.apellido}` : creador?.correo)}
            </p>
          </div>
        </div>

        <div className="volunteering-card-meta">
          <div className="volunteering-card-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{formatDate(fechaHoraInicio)}</span>
          </div>

          <div className="volunteering-card-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{formatTime(fechaHoraInicio)}</span>
          </div>

          <div className="volunteering-card-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
              <text x="12" y="16" textAnchor="middle" fontSize="10">
                {horas}h
              </text>
            </svg>
            <span>{horas} horas</span>
          </div>
        </div>

        <div className="volunteering-card-footer">
          <button className="volunteering-card-location-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {ubicacion?.nombre_sector || ubicacion?.direccion}
          </button>
          <span className="volunteering-card-participants">{maxParticipantes} participantes</span>
        </div>
      </div>
    </div>
  )
}

export default VolunteeringCard
