// VolunteerCase.jsx
import { useNavigate } from "react-router";
import "../NavigationBar.css";

function VolunteerCase() {
  const Navigate = useNavigate();
  return (
    <>
      <li className="navigation-bar-list-item role-item" onClick={() => Navigate("/manage-inscripciones")}>
        GESTIONAR INSCRIPCIONES
      </li>
    </>
  )
}

export default VolunteerCase;
