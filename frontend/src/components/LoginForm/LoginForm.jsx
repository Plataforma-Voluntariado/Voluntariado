import React, { useState } from "react";
import "./LoginForm.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

    if (!formData.correo || !formData.contrasena) {
      return WrongAlert({
        title: "Campos incompletos",
        message: "Por favor ingresa tu correo y contraseña",
      });
    }

    try {
      const res = await fetch("http://localhost:5560/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.access_token) {
        return WrongAlert({
          title: "Error al iniciar sesión",
          message: data.message || "Credenciales inválidas o error en el servidor",
        });
      }

      // ✅ Obtener el perfil con el token
      const perfilRes = await fetch("http://localhost:5560/auth/perfil", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const perfilData = await perfilRes.json();

      if (!perfilRes.ok) {
        return WrongAlert({
          title: "Error al obtener perfil",
          message: perfilData.message || "No se pudo cargar la información del usuario",
        });
      }

      // ✅ Guardar datos en el contexto
      login(perfilData, data.access_token);

      await SuccessAlert({
        title: "Inicio de sesión exitoso",
        message: "Bienvenido de nuevo 👋",
      });

      navigate("/home");

    } catch (error) {
      console.error(error);
      WrongAlert({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor. Intenta de nuevo más tarde.",
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