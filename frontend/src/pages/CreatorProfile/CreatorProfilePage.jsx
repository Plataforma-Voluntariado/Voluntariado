import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getUserProfileById } from "../../services/auth/AuthService";
import { getVoluntariadosByCreatorId } from "../../services/voluntariado/voluntariadoService";
import { FaWhatsapp, FaStar } from "react-icons/fa";
import "./CreatorProfilePage.css";
function ExpandableDescription({ text, maxLength = 180 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > maxLength;
  const shownText = expanded || !isLong ? text : text.substring(0, maxLength) + "...";
  return (
    <div className="creator-profile-page-entity-desc-expandable">
      <span>{shownText}</span>
      {isLong && (
        <button
          className="creator-profile-page-desc-toggle-btn"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

function CreatorProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [terminados, setTerminados] = useState([]);
  const [volRes, setVolRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getUserProfileById(id);
        setCreator(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error cargando perfil: ", e);
      }

      try {
        const res = await getVoluntariadosByCreatorId(id);
        setVolRes(res || {});
        const terminadosList = res?.terminados || [];
        setTerminados(terminadosList);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error cargando voluntariados del creador: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="creator-profile-page-creator-page-container">Cargando...</div>;
  if (!creator) return <div className="creator-profile-page-creator-page-container">Perfil no encontrado.</div>;

  const entidad = creator.creador || {};
  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return null;
    let digits = phone.toString().replace(/\D/g, "");
    digits = digits.replace(/^0+/, "");
    if (digits.length <= 10) digits = `57${digits}`;
    return digits;
  };

  const waNumber = formatPhoneForWhatsApp(creator.telefono || entidad.telefono);
  const waMessage = encodeURIComponent(`Hola, estoy interesado en obtener información sobre ${entidad.nombre_entidad || creator.nombre || creator.correo}`);
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

  const counts = {
    pendientes: (volRes?.pendientes || []).length,
    en_proceso: (volRes?.en_proceso || []).length,
    terminados: (volRes?.terminados || []).length,
    cancelados: (volRes?.cancelados || []).length,
  };

  // Calcular promedio de calificaciones de voluntariados terminados
  const promedioCreador = terminados.length > 0
    ? terminados.reduce((sum, v) => sum + (v.promedioCalificacion || 0), 0) / terminados.length
    : 0;

  return (
    <div className="creator-profile-page-creator-page-container">
      <div className="creator-profile-page-creator-card">
        <div className="creator-profile-page-creator-header-1">
          <div className="creator-profile-page-creator-header-left">
            <div className="creator-profile-page-avatar-wrap">
              <img
                className="creator-profile-page-creator-avatar"
                src={creator.url_imagen || "/placeholder.svg"}
                alt={creator.nombre || creator.correo}
                loading="lazy"
              />
              {entidad.tipo_entidad && (
                <span className="creator-profile-page-entity-badge">{entidad.tipo_entidad}</span>
              )}
            </div>
          </div>

          <div className="creator-profile-page-creator-header-center">
            <h2 className="creator-profile-page-creator-name">{entidad.nombre_entidad || `${creator.nombre || ""} ${creator.apellido || ""}`}</h2>
            <div className="creator-profile-page-creator-meta-row">
              <span className="creator-profile-page-creator-role">{creator.rol || "Creador"}</span>
              <span className="creator-profile-page-dot-sep">•</span>
              <span className="creator-profile-page-creator-location">{entidad.direccion || "Dirección no disponible"}</span>
              {creator.verificado && <span className="creator-profile-page-verified-badge">Verificado</span>}
            </div>

            {entidad.descripcion && entidad.descripcion.length > 180 ? (
              <ExpandableDescription text={entidad.descripcion} maxLength={180} />
            ) : (
              <p className="creator-profile-page-entity-desc-short">{entidad.descripcion || "Sin descripción disponible."}</p>
            )}

            <div className="creator-profile-page-creator-contact">
              <span className="creator-profile-page-pill creator-profile-page-pill-info">{creator.correo}</span>
              {entidad.sitio_web && (
                <a
                  className="creator-profile-page-pill creator-profile-page-pill-link"
                  href={/^https?:\/\//.test(entidad.sitio_web) ? entidad.sitio_web : `https://${entidad.sitio_web}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={entidad.sitio_web}
                >
                  Sitio web ↗
                </a>
              )}
            </div>
          </div>

          <div className="creator-profile-page-creator-header-right">
            <div className="creator-profile-page-creator-stats-summary">
              <div className="creator-profile-page-stat-item">
                <div className="creator-profile-page-stat-number">{counts.terminados}</div>
                <div className="creator-profile-page-stat-label">Terminados</div>
              </div>
              <div className="creator-profile-page-stat-item">
                <div className="creator-profile-page-stat-number">{counts.pendientes}</div>
                <div className="creator-profile-page-stat-label">Disponibles</div>
              </div>
              <div className="creator-profile-page-stat-item">
                <div className="creator-profile-page-stat-number">{counts.en_proceso}</div>
                <div className="creator-profile-page-stat-label">En proceso</div>
              </div>
            </div>

            {terminados.length > 0 && (
              <div className="creator-profile-page-creator-rating">
                <span className="creator-profile-page-rating-number">{promedioCreador.toFixed(1)}</span>
                <div className="creator-profile-page-rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={16}
                      color={i < Math.round(promedioCreador) ? "#fbbf24" : "#e5e7eb"}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="creator-profile-page-creator-actions">
              {waLink && (
                <a
                  className="creator-profile-page-btn creator-profile-page-btn-whatsapp creator-profile-page-clean"
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Enviar mensaje por WhatsApp"
                >
                  <FaWhatsapp size={18} style={{ marginRight: 6, color: "var(--color-success)" }} />
                  <span>Contáctame</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="creator-profile-page-creator-body">
          <section className="creator-profile-page-creator-stats">
            <h3 className="creator-profile-page-creator-stats-title">Eventos finalizados</h3>
            {terminados.length === 0 ? (
              <p className="creator-profile-page-no-events">Este creador no tiene ningún evento finalizado.</p>
            ) : (
              <div className="creator-profile-page-events-grid">
                {terminados.map((v) => (
                  <article
                    key={v.id_voluntariado}
                    className="creator-profile-page-event-card"
                    onClick={() => navigate(`/voluntariado/resenas/${v.id_voluntariado}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={v.fotos?.[0]?.url || "/volunteering.jpg"} alt={v.titulo} />
                    <div className="creator-profile-page-event-content">
                      <h4>{v.titulo}</h4>
                      <p className="creator-profile-page-event-desc">
                        {v.descripcion?.substring(0, 120)}
                        {v.descripcion && v.descripcion.length > 120 ? "..." : ""}
                      </p>
                      <div className="creator-profile-page-event-meta">
                        <span>{new Date(v.fechaHoraInicio).toLocaleDateString("es-ES")}</span>
                        <span>{v.horas} hrs</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CreatorProfilePage;
