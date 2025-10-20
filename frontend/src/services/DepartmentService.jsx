import axios from "axios";

const url = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

export const GetDepartments = async () => {
  try {
    const response = await axios.get(url + "/departamentos");
    return response;
  } catch (error) {
    console.error("Error obteniendo los departamentos.");
    return false;
  }
};
