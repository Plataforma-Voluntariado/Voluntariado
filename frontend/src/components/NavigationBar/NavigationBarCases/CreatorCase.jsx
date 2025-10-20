import React from "react";

import { MdNotifications } from "react-icons/md";
import { useNavigate } from "react-router";
function CreatorCase({ userPhoto }) {
  const Navigate = useNavigate();
  return (
    <>
      <li
        className="navigation-bar-list-item"
        onClick={() => Navigate("/profile-creator")}
      >
        PERFIL EMPRESARIAL
      </li>
      <li
        className="navigation-bar-list-item"
        onClick={() => Navigate("/manage-events")}
      >
        GESTIONAR EVENTOS
      </li>
      <li
        className="navigation-bar-list-item navigation-bar-create-event-button"
        onClick={() => Navigate("/create-event")}
      >
        CREAR EVENTO
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

export default CreatorCase;
