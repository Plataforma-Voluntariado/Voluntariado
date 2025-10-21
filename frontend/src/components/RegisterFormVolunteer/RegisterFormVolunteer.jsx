import React, { useState, useEffect } from "react";
import "./RegisterFormVolunteer.css";
import WrongAlert from "../alerts/WrongAlert.jsx";
import RedirectAlert from "../alerts/RedirectAlert.jsx";
import { register } from "../../services/auth/AuthService.jsx";
import { useNavigate } from "react-router";
import { GetDepartments,GetCities } from "../../services/auth/LocationService.jsx";
import { ValidatePasswordFormat } from "../../services/validators/ValidatePasswordFormat.jsx";
import { customSelectStyles } from "../../styles/selectStyles.js";
import Select from "react-select";

// Configuración inicial del formulario
const initialFormData = {
  correo: "",
  contrasena: "",
  confirmarContrasena: "",
  nombre: "",
  apellido: "",
  telefono: "",
  fechaNacimiento: "",
  idCiudad: "",
  rol: "VOLUNTARIO",
};

function RegisterFormVolunteer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Cargar departamentos al montar el componente
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

  // Cargar ciudades cuando se selecciona un departamento
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

  // Manejadores de cambios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (selected) => {
    const deptId = selected ? selected.value : "";
    setSelectedDepartment(deptId);
    setCities([]);
    setFormData(prev => ({ ...prev, idCiudad: "" }));
  };

  const handleCityChange = (selected) => {
    setFormData(prev => ({ ...prev, idCiudad: selected ? selected.value : "" }));
  };

  // Utilidades de alertas
  const showError = async (error) => {
    let message = "Ocurrió un problema. Por favor intenta de nuevo.";
    
    if (Array.isArray(error)) message = error.join("\n");
    else if (typeof error === "string") message = error;
    else if (error?.response?.data?.message) message = error.response.data.message;
    
    await WrongAlert({ title: "Error al registrar", message });
  };

  const validateForm = () => {
    if (formData.contrasena !== formData.confirmarContrasena) {
      WrongAlert({
        title: "Contraseñas no coinciden",
        message: "Por favor asegúrate de que ambas contraseñas sean iguales.",
      });
      return false;
    }

    const passwordFormat = ValidatePasswordFormat(formData.contrasena);
    if (!passwordFormat.valid) {
      WrongAlert({
        title: "Contraseña insegura",
        message: `
          Tu contraseña debe cumplir con:
          • Mínimo 8 caracteres
          • Mayúscula, minúscula, número y carácter especial
        `,
        timer: 4000,
      });
      return false;
    }

    return true;
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
      const response = await register(userData);
      if (response?.status === 201 || response?.statusCode === 201) {
        await RedirectAlert({
          title: "¡Registro exitoso!",
          message: "Voluntario creado correctamente.",
        });
        navigate("/login");
      } else {
        await showError("Ocurrió un problema al intentar registrar al voluntario.");
      }
    } catch (error) {
      await showError(error);
    }
  };

  // Configuración de selects
  const departmentOptions = departments.map(dep => ({ 
    value: dep.id_departamento, 
    label: dep.departamento 
  }));

  const cityOptions = cities.map(city => ({ 
    value: city.id_ciudad, 
    label: city.ciudad 
  }));

  const selectedDeptValue = selectedDepartment ? { 
    value: selectedDepartment, 
    label: departments.find(dep => dep.id_departamento === selectedDepartment)?.departamento 
  } : null;

  const selectedCityValue = formData.idCiudad ? { 
    value: formData.idCiudad, 
    label: cities.find(city => city.id_ciudad === formData.idCiudad)?.ciudad 
  } : null;

  // Campos del formulario para hacerlo más mantenible
  const formFields = [
    { label: "Nombres", name: "nombre", type: "text", placeholder: "Juan" },
    { label: "Apellidos", name: "apellido", type: "text", placeholder: "Pérez" },
    { label: "Correo", name: "correo", type: "email", placeholder: "ejemplo@ejemplo.com" },
    { label: "Teléfono", name: "telefono", type: "text", placeholder: "Número de 10 dígitos" },
  ];

  return (
    <form className="register-form-volunteer" onSubmit={handleSubmit}>
      {/* Campos de texto normales */}
      {formFields.map(field => (
        <div key={field.name} className="register-form-input-container">
          <label className="register-form-label">{field.label}</label>
          <input 
            className="register-form-input" 
            type={field.type} 
            name={field.name} 
            value={formData[field.name]} 
            onChange={handleInputChange} 
            placeholder={field.placeholder} 
            required 
          />
        </div>
      ))}

      {/* Selects de ubicación */}
      <div className="register-form-select-container">
        <label className="register-form-label">Departamento</label>
        <Select
          className="register-form-react-select"
          options={departmentOptions}
          value={selectedDeptValue}
          onChange={handleDepartmentChange}
          placeholder="Departamento de ubicación"
          isClearable
          styles={customSelectStyles}
        />
      </div>

      <div className="register-form-select-container">
        <label className="register-form-label">Ciudad</label>
        <Select
          className="register-form-react-select"
          options={cityOptions}
          value={selectedCityValue}
          onChange={handleCityChange}
          placeholder={selectedDepartment ? "Ciudad de ubicación" : "Seleccione un departamento"}
          isDisabled={!selectedDepartment}
          isClearable
          styles={customSelectStyles}
        />
      </div>

      {/* Campos restantes */}
      <div className="register-form-text-area-container">
        <label className="register-form-label">Fecha de nacimiento</label>
        <input 
          className="register-form-input" 
          type="date" 
          name="fechaNacimiento" 
          value={formData.fechaNacimiento} 
          onChange={handleInputChange} 
          required 
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Contraseña</label>
        <input 
          className="register-form-input" 
          type="password" 
          name="contrasena" 
          value={formData.contrasena} 
          onChange={handleInputChange} 
          placeholder="Contraseña" 
          required 
        />
      </div>

      <div className="register-form-input-container">
        <label className="register-form-label">Confirmar Contraseña</label>
        <input 
          className="register-form-input" 
          type="password" 
          name="confirmarContrasena" 
          value={formData.confirmarContrasena} 
          onChange={handleInputChange} 
          placeholder="Contraseña" 
          required 
        />
      </div>

      <button className="register-form-button" type="submit">
        Registrarse
      </button>
    </form>
  );
}

export default RegisterFormVolunteer;