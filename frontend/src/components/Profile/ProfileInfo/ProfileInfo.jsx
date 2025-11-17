import React, { useEffect, useState } from "react";
import "./ProfileInfo.css";
import { FaBuilding, FaCalendar, FaPhoneSquareAlt } from "react-icons/fa";

function ProfileInfo({ user }) {
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    if (user?.fecha_nacimiento) {
      const fechaNacimiento = new Date(user.fecha_nacimiento);
      if (!isNaN(fechaNacimiento)) {
        const fechaFormateada = fechaNacimiento.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        setFecha(fechaFormateada);
      } else {
        setFecha("Fecha no válida");
      }
    } else {
      setFecha("No especificada");
    }
  }, [user]);

  return (
    <div className="profile-info">
      <div className="profile-info-item">
        <FaBuilding className="profile-info-icon" />
        <h4>Ciudad</h4>
        <p>{user?.ciudad || "No especificada"}</p>
      </div>

      {user?.rol !== "CREADOR" && (
        <div className="profile-info-item profile-info-item-centered">
          <FaCalendar
            className="profile-info-icon"
          />
          <h4>Fecha de Nacimiento</h4>
          <p>{fecha}</p>
        </div>
      )}

      <div className="profile-info-item">
        <FaPhoneSquareAlt className="profile-info-icon" />
        <h4>Teléfono</h4>
        <p>{user?.telefono || "No disponible"}</p>
      </div>
    </div>
  );
}

export default ProfileInfo;
