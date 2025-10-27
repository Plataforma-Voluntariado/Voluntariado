import api from "../../config/AxiosConfig";

export const requestPasswordRecovery = async (correo) => {
  try {
    const response = await api.post("/auth/recuperar", { correo });
    return response;
  } catch (error) {
    throw error;
  }
};