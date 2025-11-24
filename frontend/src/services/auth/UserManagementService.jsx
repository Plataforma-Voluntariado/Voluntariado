import api from "../../config/AxiosConfig";


export const GetUserById = async (userId) => {
  try{
    const response = await api.get(`/voluntario/${userId}`);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error obteniendo el usuario por ID.", error);
    return error;
  }
}
export const GetUsersByRole = async (rol) => {
  try {
    const response = await api.get("/verificacion/pendientes");
    const filteredUsers = response.data.filter(
      (user) => user.rol && user.rol.toUpperCase() === rol.toUpperCase()
    );
    return filteredUsers;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error obteniendo los usuarios por rol.", error);
    return error;
  }
};

export const GetUserByVerificationId = async (idVerificacion) => {
  try {
    const response = await api.get(
      "verificacion/archivos-pendientes/" + idVerificacion
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error obteniendo el usuario por ID de verificación.", error);
    return [];
  }
};

export const GetUserFile = async (idVerificacionArchivo) => {
  try {
    const response = await api.get(
      "verificacion-archivo/ver/" + idVerificacionArchivo
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error obteniendo el archivo PDF del usuario.", error);
    return error;
  }
};

export const RejectUserFile = async (idVerificacionArchivo, observacion) => {
  try {
    const response = await api.post(
      `verificacion-archivo/rechazar/${idVerificacionArchivo}`,
      {
        observaciones: observacion,
      }
    );
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error rechazando el archivo del usuario.", error);
    return error;
  }
};

export const AcceptUserFile = async (idVerificacionArchivo) => {
  try {
    const response = await api.post(
      "verificacion-archivo/aceptar/" + idVerificacionArchivo
    );
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error aceptando el archivo del usuario.", error);
    return error;
  }
};

export const GetUserFilesArray = async () => {
  try {
    const response = await api.get("verificacion/mis-archivos");
    return response.data.archivos;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error obteniendo los archivos del usuario.", error);
    return error;
  }
};

export const UploadUserFile = async (fileData, fileType) => {
  try {
    if (!fileData) {
      return { ok: false, status: 0, message: "No se seleccionó ningún archivo." };
    }

    // Validación rápida en frontend antes de enviar
    if (fileData.type !== "application/pdf") {
      return { ok: false, status: 0, message: "El archivo debe ser un PDF (application/pdf)." };
    }
    if (fileData.size > 1024 * 1024) { // 1MB
      return { ok: false, status: 0, message: "El PDF excede el límite de 1MB." };
    }

    const normalizedType = (fileType || "").toLowerCase();
    const formData = new FormData();
    formData.append("archivo", fileData, fileData.name || "documento.pdf");

    const response = await api.post(`/verificacion-archivo/subir/${normalizedType}`, formData);
    return { ok: true, status: response.status, data: response.data };
  } catch (error) {
    const serverDetail = error?.response?.data?.message || error?.response?.data?.detail || error?.response?.data || error.message;
    // eslint-disable-next-line no-console
    console.error("Error subiendo el archivo del usuario:", serverDetail);
    return { ok: false, status: error?.response?.status || 500, message: serverDetail };
  }
};

export const UploadProfilePhoto = async (photoFile) => {
  try {
    const formData = new FormData();
    formData.append("imagen", photoFile);
    const response = await api.post("/usuarios/imagen-perfil", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error subiendo la foto de perfil:", error);
    return error || { error: "Error al subir foto de perfil" };
  }
};

export const DeleteProfilePhoto = async () => {
  try {
    const response = await api.delete("/usuarios/imagen-perfil");
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error eliminando la foto de perfil:", error);
    return error || { error: "Error al eliminar foto de perfil" };
  }
}