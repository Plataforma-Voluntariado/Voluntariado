import React, { useState, useEffect } from "react";
import "./RegisterFormCreator.css";
import { WrongAlert } from "../../utils/ToastAlerts.js";
import { SuccessAlert } from "../../utils/ToastAlerts.js";
import { register } from "../../services/auth/AuthService.jsx";
import { useNavigate } from "react-router";
import { GetDepartments, GetCities } from "../../services/auth/LocationService.jsx";
import { ValidatePasswordFormat } from "../../services/validators/ValidatePasswordFormat.jsx";
import { customSelectStyles } from "../../styles/selectStyles.js";
import Select from "react-select";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

// Configuración inicial del formulario
const initialFormData = {
  correo: "",
  contrasena: "",
  confirmarContrasena: "",
  nombreEntidad: "",
  telefono: "",
  idCiudad: "",
  rol: "CREADOR",
  tipoEntidad: "",
  direccion: "",
  descripcion: "",
  sitioWeb: "",
};

function RegisterFormCreator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await GetDepartments();
        setDepartments(data.data);
      } catch (error) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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

  // Validación del formulario
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
      nombre_entidad: formData.nombreEntidad,
      telefono: formData.telefono,
      id_ciudad: parseInt(formData.idCiudad),
      rol: "CREADOR",
      tipo_entidad: formData.tipoEntidad,
      direccion: formData.direccion,
      descripcion: formData.descripcion,
      sitio_web: formData.sitioWeb || null,
    };

    try {
      const response = await register(userData);
      if (response?.status === 201 || response?.statusCode === 201) {
        await SuccessAlert({
          title: "¡Registro exitoso!",
          message: "Entidad creada correctamente.",
        });
        navigate("/login");
      } else {
        await showError("Ocurrió un problema al intentar registrar la entidad.");
      }
    } catch (error) {
      await showError(error);
    }
  };

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

  const inputFields = [
    { label: "Nombre entidad", name: "nombreEntidad", type: "text", placeholder: "Nombre de la entidad", required: true },
    { label: "Correo", name: "correo", type: "email", placeholder: "ejemplo@ejemplo.com", required: true },
    { label: "Teléfono", name: "telefono", type: "text", placeholder: "Número de 10 dígitos", required: true },
    { label: "Dirección", name: "direccion", type: "text", placeholder: "Carrera #. No #", required: true },
    {
      label: "Sitio web",
      name: "sitioWeb",
      type: "text",
      placeholder: "www.tusitioweb.com",
      required: false,
      optional: true
    },
  ];

  const passwordFields = [
    { label: "Contraseña", name: "contrasena", placeholder: "Contraseña" },
    { label: "Confirmar contraseña", name: "confirmarContrasena", placeholder: "Contraseña" },
  ];

  return (
    <form className="register-form-volunteer" onSubmit={handleSubmit}>
      {inputFields.map(field => (
        <div key={field.name} className="register-form-input-container">
          <label className="register-form-label">
            {field.label}
            {field.optional && (
              <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#555" }}>
                {" "}(Opcional)
              </span>
            )}
          </label>
          <input
            className="register-form-input"
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
          />
        </div>
      ))}

      <div className="register-form-input-container">
        <label className="register-form-label">Tipo entidad</label>
        <select
          className="register-form-select"
          name="tipoEntidad"
          value={formData.tipoEntidad}
          onChange={handleInputChange}
          required
        >
          <option value="" disabled hidden>Privada / Pública</option>
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
          onChange={handleInputChange}
          placeholder="Descripción de la entidad"
          required
        />
      </div>

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

      {passwordFields.map((field) => (
        <div key={field.name} className="register-form-input-container">
          <label className="register-form-label">{field.label}</label>
          <div className="password-wrapper">
            <input
              className="register-form-input"
              type={showPassword ? "text" : "password"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              required
            />

            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar u ocultar contraseñas"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>

          </div>
        </div>
      ))}

      <button className="register-form-button" type="submit">
        Registrarse
      </button>
    </form>
  );
}

export default RegisterFormCreator;