import api from "../../config/AxiosConfig";

/**
 * Restablece la contraseña del usuario
 * @param {string} token - Token JWT de recuperación
 * @param {string} code - Código de verificación
 * @param {string} nuevaContrasena - Nueva contraseña del usuario
 * @returns {Promise} - Respuesta del servidor
 */
export const resetPassword = async (token, code, nuevaContrasena) => {
  try {
    const response = await api.post(
      "/auth/restablecer",
      { 
        token: code,
        nuevaContrasena
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};