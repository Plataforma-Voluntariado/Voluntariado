import React, { useState, useEffect } from 'react';
import {
  obtenerMisCertificados,
  obtenerInscripcionesElegibles,
  generarCertificado,
  descargarCertificadoPDF,
} from '../../../services/certificados/certificadosService';
import { SuccessAlert, WrongAlert } from '../../../utils/ToastAlerts';
import './CertificadosVoluntario.css';

const CertificadosVoluntario = () => {
  const [certificados, setCertificados] = useState([]);
  const [elegibles, setElegibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [certData, elegiblesData] = await Promise.all([
        obtenerMisCertificados(),
        obtenerInscripcionesElegibles(),
      ]);
      setCertificados(certData);
      setElegibles(elegiblesData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error cargando datos de certificados:', error);
      WrongAlert({ message: 'Error cargando certificados' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGenerarCertificado = async (inscripcionId) => {
    setGenerando(inscripcionId);

    try {
      const nuevoCertificado = await generarCertificado(inscripcionId);
      SuccessAlert({ message: '¡Certificado generado exitosamente!' });
      
      // Actualizar las listas
      setCertificados((prev) => [nuevoCertificado, ...prev]);
      setElegibles((prev) => prev.filter((e) => e.id_inscripcion !== inscripcionId));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generando certificado:', error);
      const mensaje = error.response?.data?.message || 'Error generando el certificado';
      WrongAlert({ message: mensaje });
    } finally {
      setGenerando(null);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="certificados-loading">
        <div className="spinner"></div>
        <p>Cargando certificados...</p>
      </div>
    );
  }

  return (
    <div className="certificados-container">
      <h2 className="certificados-titulo">Mis Certificados</h2>

      {/* Sección de certificados disponibles para generar */}
      {elegibles.length > 0 && (
        <div className="certificados-section">
          <h3 className="section-titulo">Certificados Disponibles</h3>
          <p className="section-descripcion">
            Voluntariados completados donde puedes generar tu certificado
          </p>
          <div className="certificados-grid">
            {elegibles.map((item) => (
              <div key={item.id_inscripcion} className="certificado-card elegible">
                <div className="card-header">
                  <h4>{item.voluntariado.titulo}</h4>
                  <span className="badge badge-pending">Pendiente</span>
                </div>
                <div className="card-body">
                  <p className="card-info">
                    <strong>Horas:</strong> {item.voluntariado.horas}h
                  </p>
                  <p className="card-info">
                    <strong>Fecha:</strong> {formatearFecha(item.voluntariado.fechaHoraInicio)}
                  </p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-generar"
                    onClick={() => handleGenerarCertificado(item.id_inscripcion)}
                    disabled={generando === item.id_inscripcion}
                  >
                    {generando === item.id_inscripcion ? (
                      <>
                        <span className="spinner-small"></span> Generando...
                      </>
                    ) : (
                      'Generar Certificado'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de certificados ya generados */}
      {certificados.length > 0 && (
        <div className="certificados-section">
          <h3 className="section-titulo">Certificados Emitidos</h3>
          <div className="certificados-grid">
            {certificados.map((cert) => (
              <div key={cert.id_certificado} className="certificado-card emitido">
                <div className="card-header">
                  <h4>{cert.voluntariado.titulo}</h4>
                  <span className="badge badge-success">✓ Emitido</span>
                </div>
                <div className="card-body">
                  <p className="card-info">
                    <strong>Horas:</strong> {cert.voluntariado.horas}h
                  </p>
                  <p className="card-info">
                    <strong>Emitido:</strong> {formatearFecha(cert.emitido_en)}
                  </p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-descargar"
                    onClick={() => descargarCertificadoPDF(
                      cert.url_pdf, 
                      `certificado_${cert.voluntariado.titulo.replace(/\s+/g, '_')}`
                    )}
                  >
                    📥 Descargar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay certificados */}
      {certificados.length === 0 && elegibles.length === 0 && (
        <div className="certificados-empty">
          <div className="empty-icon">🎓</div>
          <h3>No tienes certificados aún</h3>
          <p>
            Los certificados estarán disponibles una vez completes voluntariados y el creador
            confirme tu asistencia.
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificadosVoluntario;
