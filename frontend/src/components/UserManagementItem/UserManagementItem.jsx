import React from "react";
import "./UserManagementItem.css";
import { useNavigate } from "react-router";

function UserManagementItem({ data }) {
  const Navigate = useNavigate();
  return (
    <div className="user-management-item">
      <div className="user-management-item-info">
        <h3>{data.nombre}</h3>
        <p>{data.rol}</p>
        <p>ID de verificación: {data.idVerificacion}</p>
      </div>
      <button
        className="user-management-button"
        onClick={() =>
          Navigate("/user-management/verification/" + data.idVerificacion)
        }
      >
        Ver archivos
      </button>
    </div>
  );
}

export default UserManagementItem;
