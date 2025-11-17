import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetVoluntarioById } from '../../services/volunteering/VolunteeringService';
import { MdEmail, MdDateRange } from 'react-icons/md';
import { FaCheckCircle, FaPhone, FaChevronDown, FaChevronUp, FaClock, FaUsers, FaPercent } from 'react-icons/fa';
import './VolunteerProfile.css';

const formatDate = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
};

export default function VolunteerProfile({ volunteerId: propId }) {
  const { id: paramId } = useParams() || {};
  const id = propId ?? paramId;
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    GetVoluntarioById(id)
      .then((res) => {
        if (!mounted) return;
        setVolunteer(res);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || 'Error al cargar');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) return <div className="volunteer-profile-empty">No se indicó el id del voluntario.</div>;
  if (loading) return <div className="volunteer-profile-loading">Cargando perfil del voluntario...</div>;
  if (error) return <div className="volunteer-profile-error">Error: {String(error)}</div>;
  if (!volunteer) return <div className="volunteer-profile-empty">Sin datos del voluntario.</div>;

  const { usuario, estadisticas } = volunteer;

  return (
    <div className="volunteer-profile-container">
      <div className="volunteer-profile-card restored">
        <div className="volunteer-profile-grid-restored">
          <aside className="volunteer-profile-aside">
            <div className="volunteer-profile-avatar-wrap restored">
              <img className="volunteer-profile-avatar" src={usuario?.url_imagen || '/placeholder-user.png'} alt={`${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`} />
            </div>

            <h1 className="volunteer-profile-name">{`${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`}</h1>
            <p className="volunteer-profile-sub">{usuario?.correo}</p>

            <div className="volunteer-profile-contact">
              <div className="volunteer-profile-contact-row"><MdEmail className="volunteer-profile-ic" /><span>{usuario?.correo}</span></div>
              <div className="volunteer-profile-contact-row"><FaPhone className="volunteer-profile-ic" /><span>{usuario?.telefono || '-'}</span></div>
              <div className="volunteer-profile-contact-row"><MdDateRange className="volunteer-profile-ic" /><span>{formatDate(usuario?.fecha_nacimiento) || '-'}</span></div>
            </div>


          </aside>

          <main className="volunteer-profile-main-restored">
            <section className="volunteer-profile-section volunteer-profile-card-anim">
              <h3 className="volunteer-profile-section-title">Resumen</h3>
              <div className="volunteer-profile-row-info">
                <div><strong>Correo:</strong> <span>{usuario?.correo}</span></div>
                <div><strong>Teléfono:</strong> <span>{usuario?.telefono || '-'}</span></div>
                <div><strong>Fecha nacimiento:</strong> <span>{formatDate(usuario?.fecha_nacimiento) || '-'}</span></div>
              </div>
            </section>

            <section className="volunteer-profile-section volunteer-profile-card-anim">
              <h3 className="volunteer-profile-section-title">Estadísticas</h3>
              <div className="volunteer-profile-stats-grid">
                <div className="volunteer-profile-stat-card" role="group" aria-label={`Horas: ${estadisticas?.horas_trabajadas ?? 0}`}>
                  <FaClock className="volunteer-profile-stat-icon icon-hours" aria-hidden={true} />
                  <div className="volunteer-profile-stat-number">{estadisticas?.horas_trabajadas ?? 0}</div>
                  <div className="volunteer-profile-stat-label">Horas</div>
                </div>
                <div className="volunteer-profile-stat-card" role="group" aria-label={`Participaciones: ${estadisticas?.participaciones ?? 0}`}>
                  <FaUsers className="volunteer-profile-stat-icon icon-participations" aria-hidden={true} />
                  <div className="volunteer-profile-stat-number">{estadisticas?.participaciones ?? 0}</div>
                  <div className="volunteer-profile-stat-label">Participaciones</div>
                </div>
                <div className="volunteer-profile-stat-card" role="group" aria-label={`Porcentaje de asistencia: ${estadisticas?.porcentaje_asistencia ?? 0}%`}>
                  <FaPercent className="volunteer-profile-stat-icon icon-attendance" aria-hidden={true} />
                  <div className="volunteer-profile-stat-number">{estadisticas?.porcentaje_asistencia ?? 0}%</div>
                  <div className="volunteer-profile-stat-label">Asistencia</div>
                </div>
              </div>
            </section>

            <section className="volunteer-profile-section volunteer-profile-card-anim volunteer-profile-verification-panel">
              <button
                type="button"
                className="volunteer-profile-verification-toggle"
                onClick={() => setShowVerification((s) => !s)}
              >
                <div className="volunteer-profile-verification-left">
                  <FaCheckCircle className={`volunteer-profile-verify-icon ${usuario?.verificado ? 'ok' : 'no'}`} />
                  <div>
                    <div className="volunteer-profile-section-title">Verificación</div>
                    <div className="volunteer-profile-verify-sub">{usuario?.verificado ? 'Cuenta verificada' : 'Sin verificación'}</div>
                  </div>
                </div>
                <div className="volunteer-profile-verification-caret">
                  {showVerification ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              <div className={`volunteer-profile-verification-collapse ${showVerification ? 'open' : ''}`}>
                <p className="volunteer-profile-verify-detail">
                  {usuario?.verificado
                    ? 'El voluntario completó la verificación de identidad exitosamente. Documentos revisados y aprobados.'
                    : 'El voluntario no ha completado la verificación de identidad o los documentos están pendientes.'}
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
