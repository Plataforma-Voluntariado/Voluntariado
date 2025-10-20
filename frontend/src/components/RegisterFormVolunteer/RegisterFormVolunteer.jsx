import React, { useState, useEffect } from "react";
import "./RegisterFormVolunteer.css";
import WrongAlert from "../alerts/WrongAlert.jsx";
import { ValidatePasswordFormat } from "../../services/validators/ValidatePasswordFormat.jsx";
import SuccessAlert from "../alerts/SuccessAlert.jsx";
import { register } from "../../services/auth/AuthService.jsx";
import { useNavigate } from "react-router";
import { GetDepartments } from "../../services/DepartmentService.jsx";
import { GetCities } from "../../services/CityService.jsx";

function RegisterFormVolunteer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    idCiudad: "",
    rol: "VOLUNTARIO",
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

    const userData = {
      correo: formData.correo,
      contrasena: formData.contrasena,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      fecha_nacimiento: formData.fechaNacimiento,
      id_ciudad: parseInt(formData.idCiudad),
      rol: "VOLUNTARIO",
    };

    try {
      await register(userData);
      SuccessAlert({
        title: "¡Bien hecho!",
        message: "Te has registrado correctamente",
      });
      navigate("login");
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
      if (data[key].toString().trim() === "") {
        return false;
      }
    }
    return true;
  }

  return (
    <form className="register-form-volunteer" onSubmit={handleSubmit}>
      <div className="register-form-input-container">
        <label className="register-form-label">Nombres</label>
        <input
          className="register-form-input"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Juan"
        />
      </div>
      <div className="register-form-input-container">
        <label className="register-form-label">Apellidos</label>
        <input
          className="register-form-input"
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Pérez"
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

      <div className="register-form-text-area-container">
        <label className="register-form-label">Fecha de nacimiento</label>
        <input
          className="register-form-input"
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleChange}
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
        <label className="register-form-label">Confirmar Contraseña</label>
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

export default RegisterFormVolunteer;
