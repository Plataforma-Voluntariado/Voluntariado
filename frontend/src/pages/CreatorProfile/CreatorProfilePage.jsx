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
  const shownText = expanded || !isLong ? text : text.substring(0, maxLength) + '...';
  return (
    <div className="entity-desc-expandable">
      <span>{shownText}</span>
      {isLong && (
        <button className="desc-toggle-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Ver menos' : 'Ver más'}
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
        console.error("Error cargando perfil: ", e);
      }

      try {
        const res = await getVoluntariadosByCreatorId(id);
        console.log(res)
        setVolRes(res || {});
        const terminadosList = res?.terminados || [];
        setTerminados(terminadosList);
      } catch (e) {
        console.error("Error cargando voluntariados del creador: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="creator-page-container">Cargando...</div>;
  if (!creator) return <div className="creator-page-container">Perfil no encontrado.</div>;

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
    <div className="creator-page-container">
      <div className="creator-card">
        <div className="creator-header">
          <div className="creator-header-left">
            <div className="avatar-wrap">
              <img
                className="creator-avatar"
                src={creator.url_imagen || "/placeholder.svg"}
                alt={creator.nombre || creator.correo}
                loading="lazy"
              />
              {entidad.tipo_entidad && (
                <span className="entity-badge">{entidad.tipo_entidad}</span>
              )}
            </div>
          </div>

          <div className="creator-header-center">
            <h2 className="creator-name">{entidad.nombre_entidad || `${creator.nombre || ""} ${creator.apellido || ""}`}</h2>
            <div className="creator-meta-row">
              <span className="creator-role">{creator.rol || "Creador"}</span>
              <span className="dot-sep">•</span>
              <span className="creator-location">{entidad.direccion || "Dirección no disponible"}</span>
              {creator.verificado && <span className="verified-badge">Verificado</span>}
            </div>

            {entidad.descripcion && entidad.descripcion.length > 180 ? (
              <ExpandableDescription text={entidad.descripcion} maxLength={180} />
            ) : (
              <p className="entity-desc-short">{entidad.descripcion || 'Sin descripción disponible.'}</p>
            )}

            <div className="creator-contact">
              <span className="pill pill-info">{creator.correo}</span>
              {entidad.sitio_web && (
                <a
                  className="pill pill-link"
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

          <div className="creator-header-right">
            <div className="creator-stats-summary">
              <div className="stat-item">
                <div className="stat-number">{counts.terminados}</div>
                <div className="stat-label">Terminados</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{counts.pendientes}</div>
                <div className="stat-label">Disponibles</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{counts.en_proceso}</div>
                <div className="stat-label">En proceso</div>
              </div>
            </div>

            {terminados.length > 0 && (
              <div className="creator-rating">
                <span className="rating-number">{promedioCreador.toFixed(1)}</span>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={16} color={i < Math.round(promedioCreador) ? '#fbbf24' : '#e5e7eb'} />
                  ))}
                </div>
              </div>
            )}

            <div className="creator-actions">
              {waLink && (
                <a className="btn btn-whatsapp clean" href={waLink} target="_blank" rel="noreferrer" aria-label="Enviar mensaje por WhatsApp">
                  <FaWhatsapp size={18} style={{ marginRight: 6, color: '#25D366' }} />
                  <span>Contáctame</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="creator-body">
          <section className="creator-stats">
            <h3>Voluntariados terminados</h3>
            {terminados.length === 0 ? (
              <p className="no-events">No hay voluntariados terminados para este creador.</p>
            ) : (
              <div className="events-grid">
                {terminados.map((v) => (
                  <article key={v.id_voluntariado} className="event-card" onClick={() => navigate(`/voluntariado/${v.id_voluntariado}`)} style={{cursor: 'pointer'}}>
                    <img src={v.fotos?.[0]?.url || "/volunteering.jpg"} alt={v.titulo} />
                    <div className="event-content">
                      <h4>{v.titulo}</h4>
                      <p className="event-desc">{v.descripcion?.substring(0, 120)}{v.descripcion && v.descripcion.length > 120 ? '...' : ''}</p>
                      <div className="event-meta">
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
