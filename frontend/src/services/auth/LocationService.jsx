import axios from "axios";

const url = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

export const GetCities = async (id) => {
  try {
    const response = axios.get(url + "/ciudades/por-departamento/" + id);
    return response;
  } catch (error) {
    console.error("Error al obtener las ciudades", error);
    return false;
  }
};

export const GetDepartments = async () => {
  try {
    const response = await axios.get(url + "/departamentos");
    return response;
  } catch (error) {
    console.error("Error obteniendo los departamentos.");
    return false;
  }
};
