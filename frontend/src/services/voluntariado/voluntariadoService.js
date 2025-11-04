import api from "../../config/AxiosConfig";

// Verificar autenticación antes de crear voluntariado
export const verifyAuth = async () => {
    try {
        const response = await api.get("/auth/perfil");
        console.log("Perfil de usuario:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error verificando autenticación:", error);
        throw error;
    }
};

// Obtener todas las categorías disponibles
export const getCategorias = async () => {
    try {
        const response = await api.get("/categorias");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo categorías: ", error);
        throw error.response?.data?.message || "Error al obtener categorías";
    }
};

// Crear un nuevo voluntariado
export const createVoluntariado = async (voluntariadoData, fotos = []) => {
    try {
        const formData = new FormData();
        
        // Calcular fechaHoraFin basándose en fechaHoraInicio + horas
        const fechaInicio = new Date(voluntariadoData.fechaHoraInicio);
        const fechaFin = new Date(fechaInicio.getTime() + (voluntariadoData.horas * 60 * 60 * 1000));
        
        console.log("Datos a enviar:", {
            titulo: voluntariadoData.titulo,
            descripcion: voluntariadoData.descripcion,
            fechaHoraInicio: fechaInicio.toISOString(),
            horas: voluntariadoData.horas,
            maxParticipantes: voluntariadoData.maxParticipantes,
            categoria_id: voluntariadoData.categoria_id,
            ubicacion: JSON.stringify(voluntariadoData.ubicacion)
        });
        
        console.log("Cookies disponibles:", document.cookie);
        
        // Agregar datos del voluntariado
        formData.append("titulo", voluntariadoData.titulo);
        formData.append("descripcion", voluntariadoData.descripcion);
        formData.append("fechaHoraInicio", fechaInicio.toISOString());
        // NO enviar fechaHoraFin - el backend la calcula automáticamente
        formData.append("horas", voluntariadoData.horas.toString());
        formData.append("maxParticipantes", voluntariadoData.maxParticipantes.toString());
        formData.append("categoria_id", voluntariadoData.categoria_id.toString());
        
        // Agregar ubicación como JSON string (requerido por el backend)
        formData.append("ubicacion", JSON.stringify(voluntariadoData.ubicacion));
        
        // Agregar fotos si existen
        fotos.forEach((foto, index) => {
            formData.append("fotos", foto);
        });
        
        const response = await api.post("/voluntariados", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error("Error creando voluntariado: ", error);
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        
        if (error.response?.status === 401) {
            throw "No tienes permisos para crear voluntariados. Verifica que tengas el rol de CREADOR.";
        }
        if (error.response?.status === 403) {
            throw "Acceso denegado. Solo los usuarios CREADOR pueden crear voluntariados.";
        }
        
        throw error.response?.data?.message || "Error al crear voluntariado";
    }
};

// Obtener voluntariados del usuario creador
export const getMyVoluntariados = async () => {
    try {
        const response = await api.get("/voluntariados/owns");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo mis voluntariados: ", error);
        throw error.response?.data?.message || "Error al obtener voluntariados";
    }
};

// Obtener un voluntariado específico
export const getVoluntariadoById = async (id) => {
    try {
        const response = await api.get(`/voluntariados/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo voluntariado: ", error);
        throw error.response?.data?.message || "Error al obtener voluntariado";
    }
};