import React from "react";
import { useNavigate } from "react-router-dom";
import "./CreateVoluntariadoLayout.css";
import CreateVoluntariadoForm from "../../../components/CreateVoluntariadoForm/CreateVoluntariadoForm";
import { IoArrowBack } from "react-icons/io5";

function CreateVoluntariadoLayout() {
    const navigate = useNavigate();

    const handleSuccess = (voluntariado) => {
        // Redirigir a la vista de gestión de voluntariados o home
        navigate("/home", { 
            state: { 
                message: "Voluntariado creado exitosamente",
                voluntariado: voluntariado 
            }
        });
    };

    const handleCancel = () => {
        navigate("/home");
    };

    return (
        <div className="create-voluntariado-layout">
            <div className="create-voluntariado-header">
                <div className="header-left">
                    <button 
                        onClick={() => navigate("/home")} 
                        className="back-button"
                        aria-label="Volver al inicio"
                    >
                        <IoArrowBack />
                        <span>Volver</span>
                    </button>
                </div>
                
                <div className="header-center">
                    <h1>Crear Nuevo Voluntariado</h1>
                    <p>Comparte tu proyecto con la comunidad de voluntarios</p>
                </div>


            </div>

            <div className="create-voluntariado-content">
                <CreateVoluntariadoForm 
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>

            <div className="create-voluntariado-tips">
                <div className="tips-container">
                    <h3>💡 Consejos para crear un buen voluntariado</h3>
                    <ul>
                        <li><strong>Título claro:</strong> Usa un título descriptivo que capture la esencia del proyecto</li>
                        <li><strong>Descripción detallada:</strong> Explica claramente los objetivos, actividades y beneficios</li>
                        <li><strong>Ubicación precisa:</strong> Proporciona direcciones claras y puntos de referencia</li>
                        <li><strong>Fotos atractivas:</strong> Incluye imágenes que muestren el impacto del voluntariado</li>
                        <li><strong>Tiempo realista:</strong> Calcula bien la duración y el número de participantes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default CreateVoluntariadoLayout;