import api from '../../config/AxiosConfig';

/**
 * Obtiene las inscripciones elegibles para generar certificado
 */
export const obtenerInscripcionesElegibles = async () => {
  try {
    const response = await api.get('/certificados/elegibles');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo inscripciones elegibles:', error);
    throw error;
  }
};

/**
 * Obtiene todos los certificados del voluntario autenticado
 */
export const obtenerMisCertificados = async () => {
  try {
    const response = await api.get('/certificados/mis-certificados');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo certificados:', error);
    throw error;
  }
};

/**
 * Genera un certificado para una inscripción específica
 */
export const generarCertificado = async (inscripcionId) => {
  try {
    const response = await api.post(`/certificados/generar/${inscripcionId}`);
    return response.data;
  } catch (error) {
    console.error('Error generando certificado:', error);
    throw error;
  }
};

/**
 * Verifica un certificado por su hash (público)
 */
export const verificarCertificado = async (hash) => {
  try {
    const response = await api.get(`/certificados/verificar/${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error verificando certificado:', error);
    throw error;
  }
};

/**
 * Descarga un certificado PDF desde Cloudinary con extensión correcta
 */
export const descargarCertificadoPDF = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error descargando certificado:', error);
    throw error;
  }
};
