import api from "../../config/AxiosConfig";

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

export const InscribeIntoVolunteering = async (id_voluntariado) =>{
  try{
    const response = await api.post("/inscripciones/"+id_voluntariado);
    return response.data;
  }catch(error){
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