import React, { useEffect, useState } from "react";
import "./NavigationBar.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { getUserData } from "../../services/auth/AuthService";
import { useNavigate } from "react-router";
import VolunteerCase from "./NavigationBarCases/VolunteerCase";
import AdministratorCase from "./NavigationBarCases/AdministratorCase";
import CreatorCase from "./NavigationBarCases/CreatorCase";

function NavigationBar() {
  const Navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [userPhoto, setUserPhoto] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (!userData) {
        return Navigate("/login");
      }
      setUserRole(userData.rol);
      setUserPhoto(userData.url_imagen);
    };
    fetchUserData();
  }, [Navigate]);

  const renderMenuItems = () => {
    switch (userRole) {
      case "CREADOR":
        return <CreatorCase userPhoto={userPhoto} />;

      case "VOLUNTARIO":
        return <VolunteerCase userPhoto={userPhoto} />;

      case "ADMIN":
        return <AdministratorCase userPhoto={userPhoto} />;

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
