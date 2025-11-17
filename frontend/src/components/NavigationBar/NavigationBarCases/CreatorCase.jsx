// CreatorCase.jsx
import { useNavigate } from "react-router";
import "../NavigationBar.css";

function CreatorCase() {
  const Navigate = useNavigate();
  return (
    <>
      <li className="navigation-bar-list-item role-item" onClick={() => Navigate("/manage-events")}>
        GESTIONAR EVENTOS
      </li>
      <li className="navigation-bar-list-item navigation-bar-create-event-button" onClick={() => Navigate("/crear-voluntariado")}>
        CREAR VOLUNTARIADO
      </li>
    </>
  );
}

export default CreatorCase;
