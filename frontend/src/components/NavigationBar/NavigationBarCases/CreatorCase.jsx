// CreatorCase.jsx
import { useNavigate } from "react-router";
import "../NavigationBar.css";

function CreatorCase() {
  const Navigate = useNavigate();
  return (
    <>
      <li 
        className="navigation-bar-list-item role-item" 
        onClick={() => Navigate("/manage-events")}
        data-intro="Aquí puedes gestionar todos tus eventos y revisar las inscripciones de voluntarios."
        data-step="1"
      >
        GESTIONAR EVENTOS
      </li>
      <li 
        className="navigation-bar-list-item navigation-bar-create-event-button" 
        onClick={() => Navigate("/crear-voluntariado")}
      >
        CREAR VOLUNTARIADO
      </li>
    </>
  );
}

export default CreatorCase;
