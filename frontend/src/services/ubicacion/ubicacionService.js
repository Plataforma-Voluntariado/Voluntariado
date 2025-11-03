import api from "../../config/AxiosConfig";

// Obtener todos los departamentos
export const getDepartamentos = async () => {
    try {
        console.log("Llamando a API departamentos...");
        const response = await api.get("/departamentos");
        console.log("Respuesta de departamentos:", response);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo departamentos: ", error);
        console.error("Error completo:", error.response);
        throw error.response?.data?.message || "Error al obtener departamentos";
    }
};

// Obtener ciudades por departamento
export const getCiudadesByDepartamento = async (departamentoId) => {
    try {
        const response = await api.get(`/ciudades/por-departamento/${departamentoId}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo ciudades: ", error);
        throw error.response?.data?.message || "Error al obtener ciudades";
    }
};

// Obtener todas las ciudades
export const getCiudades = async () => {
    try {
        const response = await api.get("/ciudades");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo ciudades: ", error);
        throw error.response?.data?.message || "Error al obtener ciudades";
    }
};