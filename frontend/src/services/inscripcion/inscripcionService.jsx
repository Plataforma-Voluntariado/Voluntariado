import api from "../../config/AxiosConfig";

const handleError = (error, defaultMsg = "Ocurrió un error") => {
  // eslint-disable-next-line no-console
  console.error(error);
  return error.response?.data?.message || defaultMsg;
};


export const getInscripcionesByVoluntariado = async (voluntariadoId) => {
  try {
    const { data } = await api.get(`/inscripciones/voluntariado/${voluntariadoId}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener las inscripciones del voluntariado"));
  }
};


export const aceptarInscripcion = async (id) => {
  try {
    const { data } = await api.put(`/inscripciones/aceptar/${id}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al aceptar la inscripción"));
  }
};


export const rechazarInscripcion = async (id) => {
  try {
    const { data } = await api.put(`/inscripciones/rechazar/${id}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al rechazar la inscripción"));
  }
};


export const marcarAsistencia = async (id, asistencia) => {
  try {
    const { data } = await api.put(`/inscripciones/asistencia/${id}`, { asistencia });
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al marcar la asistencia"));
  }
};

export const getMisInscripciones = async () => {
  try {
    const { data } = await api.get(`/inscripciones/mis-inscripciones`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener tus inscripciones"));
  }
};

export const cancelarInscripcion = async (id) => {
  try {
    const { data } = await api.put(`/inscripciones/cancelar/${id}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al cancelar la inscripción"));
  }
};

