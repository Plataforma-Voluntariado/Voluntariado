import React from "react";
import { useNavigate } from "react-router-dom";
import { MdNotifications } from "react-icons/md";

function VolunteerCase({ userPhoto }) {
  const navigate = useNavigate(); 

  return (
    <>
      <li
        className="navigation-bar-list-item"
        onClick={() => navigate("/about-us")}
      >
        ACERCA DE NOSOTROS
      </li>
      <li>
        <MdNotifications className="navigation-bar-list-item navigation-bar-notifications-button" />
      </li>
      <li className="navigation-bar-list-item">
        <img
          className="navigation-bar-user-photo"
          src={userPhoto}
          alt="Foto de perfil"
          onClick={() => navigate("/profile")}
        />
      </li>
    </>
  );
}

export default VolunteerCase;

