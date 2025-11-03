import api from "../../config/AxiosConfig";

export const GetAllVolunteerings = async () => {
    try {
        const response = await api.get("/voluntariados");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo los voluntariados:", error);
        return error;
    }
}