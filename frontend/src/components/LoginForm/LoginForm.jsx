import React, { useState } from "react";
import "./LoginForm.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import { getUserData, login } from "../../services/auth/AuthService";

function LoginForm() {
  const Navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
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
    try {
      const response = await login(formData.correo, formData.contrasena);
      console.log(response)
      if(response)
      Navigate("/home")
    } catch (error) {
      console.error(error);
      WrongAlert({
        title: "Error de conexión",
        message:
          "No se pudo conectar con el servidor. Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1 className="login-form-title">Inicia Sesión</h1>

      <label className="login-form-label">Correo</label>
      <input
        className="login-form-input"
        type="text"
        name="correo"
        value={formData.correo}
        onChange={handleChange}
        placeholder="ejemplo@ejemplo.com"
      />

      <label className="login-form-label">Contraseña</label>
      <input
        className="login-form-input"
        type="password"
        name="contrasena"
        value={formData.contrasena}
        onChange={handleChange}
        placeholder="Contraseña"
      />

      <button className="login-form-button" type="submit">
        Iniciar Sesión
      </button>

      <p className="login-form-no-account">
        ¿No tienes una cuenta?{" "}
        <a href="/register" className="login-form-no-account-link">
          Regístrate
        </a>
      </p>

      <img
        className="login-form-logo-img"
        src={VoluntariadoLogo}
        alt="Voluntariado Logo"
      />
    </form>
  );
}

export default LoginForm;
