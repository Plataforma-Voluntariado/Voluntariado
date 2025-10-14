import api from "../../config/AxiosConfig";

export const isAuthenticated = async () => {
    try {
        const response = await api.get("/auth/perfil");
        return response.status === 200;
    } catch (error) {
        if(error.response?.status === 401) await logout();
        console.error("Error comprobando autenticación: ",error);
        return false;
    }
};

export const getUserData = async () => {
    try{
        const response = await api.get("/auth/perfil");
        return response.data;
    }catch(error){
        if(error.response?.status === 401) await logout();
        console.error("Error obteniendo datos del usuario: ", error);
        return null;
    }
}

export const register = async(data) => {
    try{
        const response = await api.post("/usuarios/registro", data);
        return response.data;
    } catch( error ){
        throw error;
    }
}

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.status === 200;
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    return false;
  }
};

export const login = async (correo, contrasena) => {
    try {
        const response = await api.post("/auth/login",{
            correo, contrasena,
        });
        return response.data;
    } catch (error) {
        return error;
    }
}

// ✅ Inicio de sesión con Google
export const loginWithGoogle = async (credential) => {
  try {
    const response = await api.post("/auth/google-login", { credential });
    return response.data;
  } catch (error) {
    throw error;
  }
};