import "./NavigationBar.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import VolunteerCase from "./NavigationBarCases/VolunteerCase";
import AdministratorCase from "./NavigationBarCases/AdministratorCase";
import CreatorCase from "./NavigationBarCases/CreatorCase";

function NavigationBar() {
  const Navigate = useNavigate();
  const { user } = useAuth(); 

  const renderMenuItems = () => {
    if (!user) return null;

    switch (user.rol) {
      case "CREADOR":
        return <CreatorCase userPhoto={user.urlImage} />;
      case "VOLUNTARIO":
        return <VolunteerCase userPhoto={user.urlImage} />;
      case "ADMIN":
        return <AdministratorCase userPhoto={user.urlImage} />;
      default:
        return null;
    }
  };

  return (
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
        <ul className="navigation-bar-list">{renderMenuItems()}</ul>
      </div>
    </nav>
  );
}

export default NavigationBar;
