import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { WrongAlert } from "../../utils/ToastAlerts";
import { login } from "../../services/auth/AuthService";
import "./LoginForm.css";
import { SuccessAlert } from "../../utils/ToastAlerts";

function LoginForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const response = await login(correo, contrasena);

      if (response?.status === 200) {
        await SuccessAlert({
          title: "¡Inicio de sesión exitoso!",
          message: "Serás redirigido al inicio.",
          timer: 1500,
          position: "top-right",
        });
        navigate("/home");
      } else {
        await WrongAlert({
          title: "Error",
          message: "Ocurrió un problema al iniciar sesión.",
        });
      }
    } catch (error) {
      const message = Array.isArray(error)
        ? error.join("\n")
        : typeof error === "string"
        ? error
        : "Ocurrió un problema. Intenta nuevamente.";

      await WrongAlert({
        title: "Error en inicio de sesión",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form-logo-container" onClick={() => navigate("/")}>
        <img
          className="login-form-logo-img"
          src={VoluntariadoLogo}
          alt="Voluntariado Logo"
          loading="lazy"
        />
      </div>

      <h1 className="login-form-title">Inicia Sesión</h1>

      <label className="login-form-label" htmlFor="correo">
        Correo
      </label>
      <input
        id="correo"
        className="login-form-input"
        type="email"
        name="correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="ejemplo@ejemplo.com"
        required
      />

      <label className="login-form-label" htmlFor="contrasena">
        Contraseña
      </label>
      <input
        id="contrasena"
        className="login-form-input"
        type="password"
        name="contrasena"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        placeholder="Contraseña"
        required
      />

      <div className="login-form-recovery-link">
        <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
      </div>

      <button
        className="login-form-button"
        type="submit"
        disabled={loading}
      >
        {loading ? "Iniciando..." : "Iniciar Sesión"}
      </button>

      <p className="login-form-no-account">
        ¿No tienes una cuenta?{" "}
        <Link to="/register" className="login-form-no-account-link">
          Regístrate
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
