import api from "../../config/AxiosConfig";

// Obtener todas las categorías
export const getCategorias = async () => {
    try {
        const response = await api.get("/categorias");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo categorías: ", error);
        throw error.response?.data?.message || "Error al obtener categorías";
    }
};