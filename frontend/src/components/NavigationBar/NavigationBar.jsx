// NavigationBar.jsx
import "./NavigationBar.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import VolunteerCase from "./NavigationBarCases/VolunteerCase";
import AdministratorCase from "./NavigationBarCases/AdministratorCase";
import CreatorCase from "./NavigationBarCases/CreatorCase";
import NotificationButton from "../NotificacionButton/NotificationButton";
import Sidebar from "./Sidebar";
import { useSidebar } from "../../hooks/useSidebar";
import { FaBars } from "react-icons/fa";

function NavigationBar() {
  const Navigate = useNavigate();
  const { user } = useAuth();
  const { isSidebarOpen, isMobile, openSidebar, closeSidebar } = useSidebar();

  const renderRoleSpecificItems = () => {
    if (!user) return null;

    switch (user.rol) {
      case "CREADOR":
        return <CreatorCase />;
      case "VOLUNTARIO":
        return <VolunteerCase />;
      case "ADMIN":
        return <AdministratorCase />;
      default:
        return null;
    }
  };

  return (
    <>
      <nav className="navigation-bar">
        <div className="navigation-bar-left">
          <img
            src={VoluntariadoLogo}
            alt="Logo-Voluntariado"
            onClick={() => Navigate("/home")}
            className="navigation-bar-logo"
          />
        </div>

        <div className="navigation-bar-right">
          {isMobile && (
            <button 
              className="hamburger-button"
              onClick={openSidebar}
              aria-label="Abrir menú"
            >
              <FaBars />
            </button>
          )}

          {!isMobile && (
            <ul className="navigation-bar-list">
              {renderRoleSpecificItems()}
              <li>
                <NotificationButton />
              </li>
              {user && (
                <li className="navigation-bar-list-item">
                  <img
                    className="navigation-bar-user-photo"
                    src={user.urlImage}
                    alt="Foto de perfil"
                    onClick={() => Navigate("/profile")}
                  />
                </li>
              )}
            </ul>
          )}
        </div>
      </nav>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
}

export default NavigationBar;
