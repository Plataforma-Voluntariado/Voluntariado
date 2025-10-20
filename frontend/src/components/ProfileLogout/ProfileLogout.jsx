import React from "react";
import "./ProfileLogout.css";
import { TbLogout2 } from "react-icons/tb";
import { logout } from "../../services/auth/AuthService";
import WrongAlert from "../alerts/WrongAlert";
import RedirectAlert from "../alerts/RedirectAlert";
import ConfirmAlert from "../alerts/ConfirmAlert";
import { useNavigate } from "react-router-dom";

function ProfileLogout() {
  const Navigate = useNavigate();

  async function handleLogout() {
    const confirmLogout = await ConfirmAlert({
      title: "¿Estás seguro de cerrar sesión?",
      message: "",
      confirmText: "Sí, confirmar",
      cancelText: "No, cancelar",
    });

    if (!confirmLogout) return;

    try {
      const response = await logout();

      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";

      if (response) {
        const confirmed = await RedirectAlert({
          title: "Has cerrado sesión",
          message: "Esperamos que vuelvas pronto",
        });

        if (confirmed) Navigate("/login");
      } else {
        WrongAlert({
          title: "Error al cerrar sesión",
          message: "No se pudo finalizar tu sesión correctamente.",
        });
      }
    } catch (error) {
      console.error("Error en handleLogout:", error);
      WrongAlert({
        title: "Error inesperado",
        message: "Ocurrió un problema al cerrar sesión.",
      });
    }
  }

  return (
    <div className="profile-logout">
      <button onClick={handleLogout} className="profile-logout-button">
        <TbLogout2 /> Cerrar Sesión
      </button>
    </div>
  );
}

export default ProfileLogout;
