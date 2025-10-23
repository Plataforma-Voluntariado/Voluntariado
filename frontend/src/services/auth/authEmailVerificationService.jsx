import axios from '../../config/AxiosConfig';

export const sendVerificationEmail = async (correo) => {
  try {
    const response = await axios.post('/usuarios/solicitud-verificacion-correo', {
      correo,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await axios.post('/usuarios/verificacion-correo', {
      token
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};