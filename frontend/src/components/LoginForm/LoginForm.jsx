import React, { useState } from "react";
import "./LoginForm.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router-dom";
import WrongAlert from "../../components/alerts/WrongAlert";
import RedirectAlert from "../alerts/RedirectAlert";
import { login } from "../../services/auth/AuthService";

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: "", contrasena: "" });
  
  //obtener datos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  //Manejo de errores
  const showError = async (error) => {
    if (Array.isArray(error)) {
      await WrongAlert({ title: "Error en inicio de sesión", message: error.join("\n") });
    } else if (typeof error === "string") {
      await WrongAlert({ title: "Error en inicio de sesión", message: error });
    } else {
      await WrongAlert({ title: "Error inesperado", message: "Ocurrió un problema. Por favor, intenta de nuevo." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData.correo, formData.contrasena);

      // Login exitoso
      if (response?.status === 200) {
        await RedirectAlert({
          title: "¡Inicio de sesión exitoso!",
          message: "Serás redirigido al inicio.",
          timer: 1500,
          position: "top-end",
        });
        navigate("/home");
        return;
      }

      // Si status no es 200, error genérico
      await showError("Ocurrió un problema al iniciar sesión.");

    } catch (error) {
      await showError(error); // muestra error según tipo (array, string, otro)
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1 className="login-form-title">Inicia Sesión</h1>

      <label className="login-form-label">Correo</label>
      <input
        className="login-form-input"
        type="email"
        name="correo"
        value={formData.correo}
        onChange={handleChange}
        placeholder="ejemplo@ejemplo.com"
        required
      />

      <label className="login-form-label">Contraseña</label>
      <input
        className="login-form-input"
        type="password"
        name="contrasena"
        value={formData.contrasena}
        onChange={handleChange}
        placeholder="Contraseña"
        required
      />

      <div className="login-form-recovery-link">
        <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
      </div>

      <button className="login-form-button" type="submit">
        Iniciar Sesión
      </button>

      <p className="login-form-no-account">
        ¿No tienes una cuenta?{" "}
        <a href="/register" className="login-form-no-account-link">
          Regístrate
        </a>
      </p>

      <img className="login-form-logo-img" src={VoluntariadoLogo} alt="Voluntariado Logo" />
    </form>
  );
}

export default LoginForm;
