import api from "../../config/AxiosConfig";

const handleError = (error, defaultMsg = "Ocurrió un error") => {
  console.error(error);
  return error.response?.data?.message || defaultMsg;
};

// Obtener todas las categorías disponibles
export const getCategorias = async () => {
  try {
    const { data } = await api.get("/categorias");
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener categorías"));
  }
};

// Crear un nuevo voluntariado
export const createVoluntariado = async (voluntariadoData, fotos = []) => {
  try {
    const formData = new FormData();

    ["titulo", "descripcion", "horas", "maxParticipantes", "categoria_id"].forEach(key => {
      formData.append(key, voluntariadoData[key].toString());
    });

    formData.append("fechaHoraInicio", new Date(voluntariadoData.fechaHoraInicio).toISOString());
    formData.append("ubicacion", JSON.stringify(voluntariadoData.ubicacion));

    fotos.forEach(foto => formData.append("fotos", foto));

    const { data } = await api.post("/voluntariados", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log(data);
    return data;
  } catch (error) {
    if (error.response?.status === 401)
      throw new Error("No tienes permisos para crear voluntariados. Verifica que tengas el rol de CREADOR.");
    if (error.response?.status === 403)
      throw new Error("Acceso denegado. Solo los usuarios CREADOR pueden crear voluntariados.");
    throw new Error(handleError(error, "Error al crear voluntariado"));
  }
};

// Obtener mis voluntariados
export const getMyVoluntariados = async () => {
  try {
    const { data } = await api.get("/voluntariados/owns");
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener voluntariados"));
  }
};

// Obtener voluntariado por ID
export const getVoluntariadoById = async (id) => {
  try {
    const { data } = await api.get(`/voluntariados/${id}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener voluntariado"));
  }
};
