import api from "../../config/AxiosConfig";

export const isAuthenticated = async () => {
    try {
        const response = await api.get("/auth/perfil");
        return response.status === 200;
    } catch (error) {
        if (error.response?.status === 401) {
        }
        // eslint-disable-next-line no-console
        console.error("Error comprobando autenticación: ", error);
        return false;
    }
};

export const getUserData = async () => {
    try {
        const response = await api.get("/auth/perfil");
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            // eslint-disable-next-line no-console
            console.log("Usuario no autenticado");
        }
        // eslint-disable-next-line no-console
        console.error("Error obteniendo datos del usuario: ", error);
        return null;
    }
}

//Servicio de Registro de usuarios
export const register = async (data) => {
    try {
        const response = await api.post("/usuarios/registro", data);
        return response.data;
    } catch (error) {
        throw error.response.data.message;
    }
}

//Servicio de Logout Usuario
export const logout = async () => {
    try {
        const response = await api.post("/auth/logout");
        return response.status === 200;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error cerrando sesión:", error);
        return false;
    }
};

//Servicio de Login
export const login = async (correo, contrasena) => {
    try {
        const response = await api.post("/auth/login", {
            correo, contrasena,
        });
        return response;
    } catch (error) {
        throw error.response.data.message;
    }
}

export const getUserProfileById = async (id) => {
    try {
        const response = await api.get(`/auth/perfil/${id}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
        }
        return null;
    }
};
