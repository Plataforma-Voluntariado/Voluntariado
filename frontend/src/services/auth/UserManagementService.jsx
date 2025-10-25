import api from "../../config/AxiosConfig";

export const GetUsersByRole = async (rol) => {
  try {
    const response = await api.get("/verificacion/pendientes");
    const filteredUsers = response.data.filter(
      (user) => user.rol && user.rol.toUpperCase() === rol.toUpperCase()
    );
    return filteredUsers;
  } catch (error) {
    console.error("Error obteniendo los usuarios por rol.", error);
    return error;
  }
};

export const GetUserByVerificationId = async (idVerificacion) => {
    try {
        const response = await api.get("verificacion/archivos-pendientes/"+idVerificacion);
        return response.data;
    }catch (error) {
        console.error("Error obteniendo el usuario por ID de verificación.", error);
        return error;
      }
}

export const GetUserFile = async (idVerificacionArchivo) =>{
    try{
        const response = await api.get("verificacion-archivo/ver/"+idVerificacionArchivo)
        return response.data;
    }catch(error){
        console.error("Error obteniendo el archivo PDF del usuario.", error);
        return error;
    }
}

export const RejectUserFile = async (idVerificacionArchivo) =>{
    try{
        const response = await api.post("verificacion-archivo/rechazar/"+idVerificacionArchivo);
        return response.data;
    }catch(error){
        console.error("Error rechazando el archivo del usuario.", error);
        return error;
    }
}

export const AcceptUserFile = async (idVerificacionArchivo) =>{
    try{
        const response = await api.post("verificacion-archivo/aceptar/"+idVerificacionArchivo);
        console.log("verificacion-archivo/aceptar/"+idVerificacionArchivo)
        return response.data;
    }catch(error){
        console.error("Error aceptando el archivo del usuario.", error);
        return error;
    }
}
