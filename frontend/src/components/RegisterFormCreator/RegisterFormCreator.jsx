import React, { useState, useEffect } from "react";
import "./RegisterFormCreator.css";
import WrongAlert from "../alerts/WrongAlert.jsx";
import { ValidatePasswordFormat } from "../../services/validators/ValidatePasswordFormat.jsx";
import SuccessAlert from "../alerts/SuccessAlert.jsx";
import { register } from "../../services/auth/AuthService.jsx";
import { useNavigate } from "react-router";
import { GetDepartments } from "../../services/DepartmentService.jsx";
import { GetCities } from "../../services/CityService.jsx";

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

  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await GetDepartments();
        setDepartments(data.data);
      } catch (error) {
        console.error("Error al obtener departamentos:", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedDepartment) return;
      try {
        const data = await GetCities(selectedDepartment);
        setCities(data.data);
      } catch (error) {
        console.error("Error al obtener ciudades:", error);
      }
    };
    fetchCities();
  }, [selectedDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    setCities([]);
    setFormData({ ...formData, idCiudad: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFields = validateFields(formData);
    if (!allFields) {
      return WrongAlert({
        title: "No se pudo registrar",
        message: "Por favor completa todos los campos.",
      });
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      return WrongAlert({
        title: "Contraseñas no coinciden",
        message: "Por favor asegúrate de que ambas contraseñas sean iguales.",
      });
    }

    const passwordFormat = ValidatePasswordFormat(formData.contrasena);
    if (!passwordFormat.valid) {
      return WrongAlert({
        title: "Contraseña insegura",
        message: `
          Tu contraseña debe cumplir con los siguientes requisitos:
          • Mínimo 8 caracteres
          • Al menos una letra mayúscula y una minúscula
          • Al menos un número
          • Al menos un carácter especial (!, @, #, $, %, etc.)
        `,
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

      await register(userData);

      SuccessAlert({
        title: "¡Bien Hecho!",
        message: "Te has registrado correctamente.",
      });

      navigate("login");
    } catch (error) {
      console.error("Error al registrar creador:", error);
      WrongAlert({
        title: "Error al registrar",
        message: "Ocurrió un problema al intentar registrar la entidad.",
      });
    }
  };

  function validateFields(data) {
    for (const key in data) {
      if (data[key].toString().trim() === "") {
        return false;
      }
    }
    return true;
  }

  return (
    <form className="register-form-volunteer" onSubmit={handleSubmit}>
      <div className="register-form-input-container">
        <label className="register-form-label">Nombre entidad</label>
        <input
          className="register-form-input"
          type="text"
          name="nombreEntidad"
          value={formData.nombreEntidad}
          onChange={handleChange}
          placeholder="Nombre de la entidad"
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Tipo entidad</label>
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
      </div>

      <div className="register-form-text-area-container">
        <label className="register-form-label">Descripción</label>
        <textarea
          className="register-form-text-area"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción de la entidad"
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Correo</label>
        <input
          className="register-form-input"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="ejemplo@ejemplo.com"
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Teléfono</label>
        <input
          className="register-form-input"
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Número de 10 dígitos"
        />
      </div>
      <div className="register-form-input-container">
        <label className="register-form-label">Departamento</label>
        <select
          className="register-form-select"
          name="departamento"
          value={selectedDepartment}
          onChange={handleDepartmentChange}
        >
          <option value="" disabled hidden>
            Departamento de ubicación
          </option>
          {departments.map((dep) => (
            <option key={dep.id_departamento} value={dep.id_departamento}>
              {dep.departamento}
            </option>
          ))}
        </select>
      </div>
      <div className="register-form-input-container">
        <label className="register-form-label">Ciudad</label>
        <select
          className="register-form-select"
          name="idCiudad"
          value={formData.idCiudad}
          onChange={handleChange}
          disabled={!selectedDepartment}
        >
          <option value="" disabled hidden>
            {selectedDepartment
              ? "Ciudad de ubicación"
              : "Seleccione un departamento"}
          </option>
          {cities.map((city) => (
            <option key={city.id_ciudad} value={city.id_ciudad}>
              {city.ciudad}
            </option>
          ))}
        </select>
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Dirección</label>
        <input
          className="register-form-input"
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Carrera #. No #"
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Sitio web</label>
        <input
          className="register-form-input"
          type="text"
          name="sitioWeb"
          value={formData.sitioWeb}
          onChange={handleChange}
          placeholder="www.tusitioweb.com"
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Contraseña</label>
        <input
          className="register-form-input"
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Contraseña"
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Confirmar contraseña</label>
        <input
          className="register-form-input"
          type="password"
          name="confirmarContrasena"
          value={formData.confirmarContrasena}
          onChange={handleChange}
          placeholder="Contraseña"
        />
      </div>

      <button className="register-form-button" type="submit">
        Registrarse
      </button>
    </form>
  );
}

export default RegisterFormCreator;
