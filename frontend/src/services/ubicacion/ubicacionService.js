import api from "../../config/AxiosConfig";

// Obtener todos los departamentos
export const getDepartamentos = async () => {
    try {
        const response = await api.get("/departamentos");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener departamentos";
    }
};

// Obtener ciudades por departamento
export const getCiudadesByDepartamento = async (departamentoId) => {
    try {
        const response = await api.get(`/ciudades/por-departamento/${departamentoId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener ciudades";
    }
};

// Obtener todas las ciudades
export const getCiudades = async () => {
    try {
        const response = await api.get("/ciudades");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Error al obtener ciudades";
    }
};