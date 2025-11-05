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

                <button
                    onClick={() => navigate("/home")}
                    className="back-button"
                    aria-label="Volver al inicio"
                >
                    <IoArrowBack />
                    <span>Volver</span>
                </button>

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

        </div>
    );
}

export default CreateVoluntariadoLayout;