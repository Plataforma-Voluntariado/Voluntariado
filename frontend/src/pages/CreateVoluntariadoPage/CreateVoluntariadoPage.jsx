import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import CreateVoluntariadoLayout from "../../layouts/Creador/CreateVoluntariadoLayout/CreateVoluntariadoLayout";
import "./CreateVoluntariadoPage.css";

function CreateVoluntariadoPage() {
    const { user, loading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="create-voluntariado-loading">
                <div className="loading-spinner"></div>
                <p>Verificando permisos...</p>
            </div>
        );
    }

    // Redirigir si no está autenticado
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirigir si no es creador
    if (user.rol !== "CREADOR") {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="create-voluntariado-page">
            <CreateVoluntariadoLayout />
        </div>
    );
}

export default CreateVoluntariadoPage;