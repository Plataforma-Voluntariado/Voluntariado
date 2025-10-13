import React, { useState } from "react";
import "./RegisterFormCreator.css";
import WrongAlert from "../alerts/WrongAlert.jsx";
import { ValidatePasswordFormat } from "../../services/validators/ValidatePasswordFormat.jsx";
import axios from "axios";
import SuccessAlert from "../alerts/SuccessAlert.jsx";
import { register } from "../../services/auth/AuthService.jsx";
import { useNavigate } from "react-router";
function RegisterFormCreator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
    nombreEntidad: "",
    telefono: "",
    idCiudad: "",
    rol: "CREADOR",
    tipoEntidad: "",
    direccion: "",
    descripcion: "",
    sitioWeb: "",
    confirmarContrasena: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFields = validateFields(formData);
    if (!allFields) {
      return WrongAlert({
        title: "No se pudo registrar",
        message: "No has rellenado todos los campos",
      });
    }
    const passwordsMatch = formData.contrasena == formData.confirmarContrasena;
    if (!passwordsMatch) {
      return WrongAlert({
        title: "Contraseñas no coinciden",
        message: "Por favor, asegúrate de que ambas contraseñas sean iguales.",
      });
    }
    const passwordFormat = ValidatePasswordFormat(formData.contrasena);
    if (!passwordFormat.valid) {
      return WrongAlert({
        title: "Contraseña insegura",
        message: `Tu contraseña debe cumplir con los siguientes requisitos: • Mínimo 8 caracteres • Al menos una letra mayúscula y una minúscula • Al menos un número • Al menos un carácter especial (como !, @, #, $, %, etc.)`,
      });
    }
    try {
      const userData = {
        correo: formData.correo,
        contrasena: formData.contrasena,
        nombre_entidad: formData.nombreEntidad,
        telefono: formData.telefono,
        id_ciudad: parseInt(formData.idCiudad),
        rol: "CREADOR",
        tipo_entidad: formData.tipoEntidad,
        direccion: formData.direccion,
        descripcion: formData.descripcion,
        sitio_web: formData.sitioWeb,
      };
      const response = await register(userData);
      SuccessAlert({
        title: "Bien Hecho!!",
        message: "Te has registrado correctamente",
      });
      navigate("login")
    } catch (error) {
      console.error("Error al registrar voluntario:", error);
      WrongAlert({
        title: "Error al registrar",
        message: "Ocurrió un problema al intentar registrar al voluntario.",
      });
    }
  };

  function validateFields(data) {
    for (const key in data) {
      if (data[key].trim() === "") {
        return false;
      }
    }
    return true;
  }

  return (
    <form className="register-form-volunteer" onSubmit={handleSubmit}>
      <section className="register-form-left">
        <label className="register-form-label">Nombre entidad</label>
        <input
          className="register-form-input"
          type="text"
          name="nombreEntidad"
          value={formData.nombreEntidad}
          onChange={handleChange}
          placeholder="Nombre de la entidad"
        />

        <label className="register-form-label">Tipo Entidad</label>
        <select
          className="register-form-select"
          name="tipoEntidad"
          value={formData.tipoEntidad}
          onChange={handleChange}
        >
          <option value="" disabled hidden>
            Privada / Pública
          </option>
          <option value="PRIVADA">Privada</option>
          <option value="PUBLICA">Pública</option>
        </select>

        <label className="register-form-label">Correo</label>
        <input
          className="register-form-input"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="ejemplo@ejemplo.com"
        />

        <label className="register-form-label">Ciudad</label>
        <select
          className="register-form-select"
          name="idCiudad"
          value={formData.idCiudad}
          onChange={handleChange}
        >
          <option value="" disabled hidden>
            Ciudad de ubicación
          </option>
          <option value="1">Mocoa</option>
          <option value="2">Colón</option>
          <option value="3">Orito</option>
          <option value="4">Puerto Asís</option>
          <option value="5">Puerto Caicedo</option>
          <option value="6">Puerto Guzmán</option>
          <option value="7">Puerto Leguízamo</option>
          <option value="8">San Francisco</option>
          <option value="9">San Miguel</option>
          <option value="10">Santiago</option>
          <option value="11">Sibundoy</option>
          <option value="12">Valle del Guamuez</option>
          <option value="13">Villagarzón</option>
        </select>

        <label className="register-form-label">Contraseña</label>
        <input
          className="register-form-input"
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Contraseña"
        />
      </section>

      <section className="register-form-right">
        <label className="register-form-label">Descripción</label>
        <input
          className="register-form-input"
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción de la entidad"
        />

        <label className="register-form-label">Sitio Web</label>
        <input
          className="register-form-input"
          type="text"
          name="sitioWeb"
          value={formData.sitioWeb}
          onChange={handleChange}
          placeholder="www.tusitioweb.com"
        />

        <label className="register-form-label">Teléfono</label>
        <input
          className="register-form-input"
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Número de 10 dígitos"
        />

        <label className="register-form-label">Dirección</label>
        <input
          className="register-form-input"
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Carrera #. No #"
        />

        <label className="register-form-label">Confirmar Contraseña</label>
        <input
          className="register-form-input"
          type="password"
          name="confirmarContrasena"
          value={formData.confirmarContrasena}
          onChange={handleChange}
          placeholder="Contraseña"
        />
      </section>

      <button className="register-form-button" type="submit">
        Registrarse
      </button>
    </form>
  );
}

export default RegisterFormCreator;
