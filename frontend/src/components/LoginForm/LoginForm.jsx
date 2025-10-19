import React, { useState } from "react";
import "./LoginForm.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import { getUserData, login } from "../../services/auth/AuthService";
import RedirectAlert from "../alerts/RedirectAlert";

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

      // Si el backend devuelve un objeto con 'status' o 'message', se valida:
      if (response?.status === 401 || response?.response?.status === 401) {
        WrongAlert({
          title: "Credenciales inválidas",
          message: "El correo o la contraseña no son correctos.",
        });
        return;
      }

      if (response?.status >= 500 || response?.response?.status >= 500) {
        WrongAlert({
          title: "Error del servidor",
          message: "Hubo un problema interno. Intenta más tarde.",
        });
        return;
      }

      if (!response || response?.response) {
        WrongAlert({
          title: "Error de conexión",
          message: "No se pudo conectar con el servidor.",
        });
        return;
      }
      const confirmed = await RedirectAlert({
        title: "¡Inicio de sesión exitoso!",
        message: "Serás redirigido al inicio.",
      });
      if (confirmed) {
        Navigate("/home"); // 👈 redirige solo si el usuario confirma
      }
    } catch (error) {
      console.error("Error en login:", error);
      WrongAlert({
        title: "Error inesperado",
        message: "Ocurrió un problema. Por favor, intenta de nuevo.",
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

      <div className="login-form-recovery-link">
        <p>¿Olvidaste tu contraseña? <a href="/recuperar-contrasena">Recupérala aquí</a></p>
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

      <img
        className="login-form-logo-img"
        src={VoluntariadoLogo}
        alt="Voluntariado Logo"
      />
    </form>
  );
}

export default LoginForm;
