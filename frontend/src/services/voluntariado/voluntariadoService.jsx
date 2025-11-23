import api from "../../config/AxiosConfig";

const handleError = (error, defaultMsg = "Ocurrió un error") => {
  // eslint-disable-next-line no-console
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

// obtener mis voluntariados
export const getEventsByCreatorId = async () => {
  try {
    const { data } = await api.get("/voluntariados/owns");
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener los voluntariados del creador"));
  }
};


// Actualizar voluntariado
export const updateVoluntariado = async (id, voluntariadoData, fotos = [], fotosMantener = null) => {
  try {
    const formData = new FormData();

    // Agregar campos básicos
    if (voluntariadoData.titulo) formData.append("titulo", voluntariadoData.titulo);
    if (voluntariadoData.descripcion) formData.append("descripcion", voluntariadoData.descripcion);
    if (voluntariadoData.horas) formData.append("horas", voluntariadoData.horas.toString());
    if (voluntariadoData.maxParticipantes) formData.append("maxParticipantes", voluntariadoData.maxParticipantes.toString());
    if (voluntariadoData.categoria_id) formData.append("categoria_id", voluntariadoData.categoria_id.toString());
    if (voluntariadoData.fechaHoraInicio) formData.append("fechaHoraInicio", new Date(voluntariadoData.fechaHoraInicio).toISOString());
    if (voluntariadoData.ubicacion) formData.append("ubicacion", JSON.stringify(voluntariadoData.ubicacion));

    // Agregar fotosMantener SOLO si tiene elementos
    if (Array.isArray(fotosMantener) && fotosMantener.length > 0) {
      formData.append("fotosMantener", JSON.stringify(fotosMantener));
    }
    // Agregar fotos nuevas
    fotos.forEach(foto => formData.append("nuevasFotos", foto));

    for (let pair of formData.entries()) {
      // eslint-disable-next-line no-console
      console.log(pair[0] + ':', pair[1]);
    }

    const { data } = await api.put(`/voluntariados/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (error) {
    if (error.response?.status === 403)
      throw new Error("No tienes permisos para editar este voluntariado.");
    throw new Error(handleError(error, "Error al actualizar voluntariado"));
  }
};

// Cancelar voluntariado (soft delete)
export const cancelarVoluntariado = async (id) => {
  try {
    const { data } = await api.delete(`/voluntariados/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error("No tienes permisos para cancelar este voluntariado.");
    }
    throw new Error(handleError(error, "Error al cancelar voluntariado"));
  }
};

export const getVoluntariadosByCreatorId = async (creatorId) => {
  try {
    const { data } = await api.get(`/voluntariados/voluntariado-creator/${creatorId}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error, "Error al obtener los voluntariados del creador"));
  }
};

export const GetVolunteerings = async (filters = {}) => {
  try {
    const resp = await api.get("/voluntariados");
    let list = Array.isArray(resp.data) ? resp.data : [];

    if (!filters || Object.keys(filters).length === 0) return list;

    const { search, categoria_id } = filters;
    let result = list;

    if (search && String(search).trim() !== "") {
      const q = String(search).toLowerCase().trim();
      result = result.filter((v) => {
        const titulo = v.titulo?.toLowerCase() ?? "";
        const descripcion = v.descripcion?.toLowerCase() ?? "";
        const categoriaNombre = v.categoria?.nombre?.toLowerCase() ?? "";
        return (
          titulo.includes(q) ||
          descripcion.includes(q) ||
          categoriaNombre.includes(q)
        );
      });
    }

    if (categoria_id !== undefined && categoria_id !== null && String(categoria_id) !== "") {
      const catStr = String(categoria_id);
      result = result.filter((v) => String(v.categoria?.id_categoria) === catStr);
    }

    return result;
  } catch (error) {
    return error;
  }
};

export const GetAllVolunteerings = async () => {
  return await GetVolunteerings();
};

export const InscribeIntoVolunteering = async (id_voluntariado) => {
  try {
    const response = await api.post("/inscripciones/" + id_voluntariado);
    return response.data;
  } catch (error) {
    return error;
  }
}

export const GetVoluntarioById = async (id) => {
  try {
    const response = await api.get(`/voluntario/${id}`);
    return response.data;
  } catch (error) {
    return error;
  }
};