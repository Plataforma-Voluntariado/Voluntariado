import api from "../../config/AxiosConfig";

/**
 * Solicita la recuperación de contraseña enviando un correo al usuario
 * @param {string} correo - Correo electrónico del usuario
 * @returns {Promise} - Respuesta del servidor
 */
export const requestPasswordRecovery = async (correo) => {
  try {
    const response = await api.post("/auth/recuperar", { correo });
    return response;
  } catch (error) {
    throw error;
  }
};