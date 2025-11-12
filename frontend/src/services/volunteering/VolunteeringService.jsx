import api from "../../config/AxiosConfig";

const handleError = (error) => {
  console.error("Error obteniendo voluntariados:", error);
  return [];
};

export const GetVolunteerings = async (filters = {}) => {
  try {
    const resp = await api.get("/voluntariados");
    let list = Array.isArray(resp.data) ? resp.data : [];

    // Si no hay filtros, devolver todo
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
    return handleError(error);
  }
};

export const GetAllVolunteerings = async () => {
  return await GetVolunteerings();
};

export const InscribeIntoVolunteering = async (id_voluntariado) =>{
  try{
    const response = await api.post("/inscripciones/"+id_voluntariado);
    console.log(response)
    return response.data;
  }catch(error){
    return error;
  }
}