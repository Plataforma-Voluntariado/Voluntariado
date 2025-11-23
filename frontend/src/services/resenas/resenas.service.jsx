import api from "../../config/AxiosConfig";

const handleError = (error, defaultMsg = "Ocurrió un error") => {
  // eslint-disable-next-line no-console
  console.error(error);
  return error.response?.data?.message || defaultMsg;
};

export const crearResenaVoluntariado = async (voluntariadoId, reseñaData) => {
  try {
    const { data } = await api.post(`/resenas-voluntariado/${voluntariadoId}`, reseñaData);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al crear la reseña del voluntariado"));
  }
};

export const obtenerResenasPorVoluntariado = async (voluntariadoId) => {
  try {
    const { data } = await api.get(`/resenas-voluntariado/${voluntariadoId}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener las reseñas del voluntariado"));
  }
};
