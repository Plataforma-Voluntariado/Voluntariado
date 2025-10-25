import React from "react";
import { useNavigate } from "react-router";
import { MdNotifications } from "react-icons/md";
function AdministratorCase({ userPhoto }) {
  const Navigate = useNavigate();
  return (
    <>
      <li
        className="navigation-bar-list-item"
        onClick={() => Navigate("/user-management/VOLUNTARIO")}
      >
        GESTIONAR USUARIOS
      </li>
      <li
        className="navigation-bar-list-item"
        onClick={() => Navigate("/user-management/CREADOR")}
      >
        GESTIONAR CREADORES
      </li>
      <li>
        <MdNotifications className="navigation-bar-list-item navigation-bar-notifications-button" />
      </li>
      <li className="navigation-bar-list-item">
        <img
          className="navigation-bar-user-photo"
          src={userPhoto}
          alt="Foto de perfil"
          onClick={() => Navigate("/profile")}
        />
      </li>
    </>
  );
}

export default AdministratorCase;
