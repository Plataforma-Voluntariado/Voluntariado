// Sidebar.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import SidebarNotificationWrapper from "./SidebarNotificationWrapper";
import "./Sidebar.css";
import "./SidebarNotificationWrapper.css";
import { FaTimes,FaCog, FaUsers, FaCalendarPlus, FaHome, FaCertificate, FaSignOutAlt} from "react-icons/fa";
import { logout } from "../../services/auth/AuthService";
import { SuccessAlert, WrongAlert } from "../../utils/ToastAlerts";
import ConfirmAlert from "../alerts/ConfirmAlert";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    // Confirmación antes de cerrar sesión
    const confirm = await ConfirmAlert({
      title: "¿Estás seguro de cerrar sesión?",
      message: "",
      confirmText: "Sí, confirmar",
      cancelText: "No, cancelar",
      zIndex: 10000,
    });

    if (!confirm) return;

    try {
      const success = await logout();
      onClose();
      
      await SuccessAlert({
        title: success ? "Has cerrado sesión" : "Error al cerrar sesión",
        message: success ? "Esperamos que vuelvas pronto" : "No se pudo finalizar tu sesión correctamente",
        timer: 2000,
      });

      navigate("/");
    } catch (err) {
      console.error("Error en handleLogout:", err);
      await WrongAlert({
        title: "Error inesperado",
        message: "Ocurrió un problema al cerrar sesión.",
      });
      onClose();
      navigate("/");
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) sidebar.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const renderRoleSpecificItems = () => {
    if (!user) return null;

    switch (user.rol) {
      case "CREADOR":
        return (
          <>
            <li
              className="sidebar-item"
              onClick={() => handleNavigate("/manage-events")}
              role="menuitem"
              tabIndex="0"
            >
              <FaCog className="sidebar-icon" />
              <span>GESTIONAR EVENTOS</span>
            </li>
            <li
              className="sidebar-item sidebar-create-button"
              onClick={() => handleNavigate("/crear-voluntariado")}
              role="menuitem"
              tabIndex="0"
            >
              <FaCalendarPlus className="sidebar-icon" />
              <span>CREAR EVENTO</span>
            </li>
          </>
        );
      case "VOLUNTARIO":
        return (
          <>
            <li
              className="sidebar-item"
              onClick={() => handleNavigate("/home")}
              role="menuitem"
              tabIndex="0"
            >
              <FaHome className="sidebar-icon" />
              <span>INICIO</span>
            </li>
            <li
              className="sidebar-item"
              onClick={() => handleNavigate("/manage-inscripciones")}
              role="menuitem"
              tabIndex="0"
            >
              <FaCog className="sidebar-icon" />
              <span>GESTIONAR INSCRIPCIONES</span>
            </li>
            <li
              className="sidebar-item"
              onClick={() => handleNavigate("/mis-certificados")}
              role="menuitem"
              tabIndex="0"
            >
              <FaCertificate className="sidebar-icon" />
              <span>MIS CERTIFICADOS</span>
            </li>

          </>
        );
      case "ADMIN":
        return (
          <>
            <li
              className="sidebar-item"
              onClick={() => handleNavigate("/user-management/VOLUNTARIO")}
              role="menuitem"
              tabIndex="0"
            >
              <FaUsers className="sidebar-icon" />
              <span>GESTIONAR USUARIOS</span>
            </li>
            <li
              className="sidebar-item"
              onClick={() => handleNavigate("/user-management/CREADOR")}
              role="menuitem"
              tabIndex="0"
            >
              <FaCog className="sidebar-icon" />
              <span>GESTIONAR CREADORES</span>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'sidebar-overlay-open' : ''}`} onClick={onClose} />

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        role="menu"
        aria-hidden={!isOpen}
        tabIndex="-1"
      >
        <div className="sidebar-header">
          <h3 className="sidebar-title">Menú</h3>
          <button
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-list" role="none">
            {/* Perfil de usuario */}
            {user && (
              <li
                className="sidebar-item sidebar-profile"
                onClick={() => handleNavigate("/profile")}
                role="menuitem"
                tabIndex="0"
              >
                <img
                  className="sidebar-user-photo"
                  src={user.urlImage}
                  alt="Foto de perfil"
                />
                <span className="sidebar-user-name">
                  {user.nombre || "Mi Perfil"}
                </span>
              </li>
            )}

            {renderRoleSpecificItems()}

            <li className="sidebar-item sidebar-notifications" role="menuitem" tabIndex="0">
              <SidebarNotificationWrapper />
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-logout-button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt className="sidebar-icon-close" />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;