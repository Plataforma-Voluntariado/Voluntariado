import React from "react";
import "./ProfileLogout.css";
import { TbLogout2 } from "react-icons/tb";
import { logout } from "../../../services/auth/AuthService";
import { WrongAlert } from "../../../utils/ToastAlerts";
import ConfirmAlert from "../../alerts/ConfirmAlert";
import { useNavigate } from "react-router-dom";
import { SuccessAlert } from "../../../utils/ToastAlerts";

function ProfileLogout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Confirmación
    const confirm = await ConfirmAlert({
      title: "¿Estás seguro de cerrar sesión?",
      message: "",
      confirmText: "Sí, confirmar",
      cancelText: "No, cancelar",
    });

    if (!confirm) return;

    try {
      const success = await logout();

      await SuccessAlert({
        title: success ? "Has cerrado sesión" : "Error al cerrar sesión",
        message: success
          ? "Esperamos que vuelvas pronto"
          : "No se pudo finalizar tu sesión correctamente",
      });

      navigate("/");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error en handleLogout:", err);
      await WrongAlert({
        title: "Error inesperado",
        message: "Ocurrió un problema al cerrar sesión.",
      });
    }
  };

  return (
    <div className="profile-logout">
      <button onClick={handleLogout} className="profile-logout-button">
        <TbLogout2 /> Cerrar Sesión
      </button>
    </div>
  );
}

export default ProfileLogout;
