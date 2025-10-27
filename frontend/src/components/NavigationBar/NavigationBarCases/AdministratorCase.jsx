// AdministratorCase.jsx
import { useNavigate } from "react-router";
import "../NavigationBar.css";

function AdministratorCase() {
  const Navigate = useNavigate();
  return (
    <>
      <li className="navigation-bar-list-item role-item" onClick={() => Navigate("/user-management/VOLUNTARIO")}>
        GESTIONAR USUARIOS
      </li>
      <li className="navigation-bar-list-item role-item" onClick={() => Navigate("/user-management/CREADOR")}>
        GESTIONAR CREADORES
      </li>
    </>
  );
}

export default AdministratorCase;
