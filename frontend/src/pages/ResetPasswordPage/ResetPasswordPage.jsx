import React, { useState, useEffect } from "react";
import "./ResetPasswordPage.css";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import { resetPassword } from "../../services/auth/authResetPasswordService";
import VoluntariadoLogo from "../../assets/photos/logo.png";

function ResetPasswordPage() {
  const [form, setForm] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  //Extrae el token desde la URL solo una vez
  useEffect(() => {
    const tokenParam = new URLSearchParams(location.search).get("token");
    if (tokenParam) {
      setToken(tokenParam);
      window.history.replaceState({}, document.title, "/reset-password");
    }
  }, [location]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "code") {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    }

    setForm((prev) => ({ ...prev, [id]: newValue }));
  };

  const validateForm = () => {
    const { code, password, confirmPassword } = form;

    if (!code || code.length !== 6)
      return "El código debe tener exactamente 6 caracteres alfanuméricos.";

    if (!password || password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres.";

    if (password !== confirmPassword)
      return "Las contraseñas no coinciden.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return WrongAlert({ title: "Error", message: error });

    setLoading(true);
    try {
      await resetPassword(token, form.code, form.password);
      await SuccessAlert({
        title: "¡Éxito!",
        message: "Contraseña actualizada correctamente.",
      });
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? "Código de verificación inválido o expirado."
          : "Error al actualizar la contraseña. Inténtalo de nuevo más tarde.");
      WrongAlert({ title: "Error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-background">
        <img src={ImgHandsBackground} alt="Manos voluntariado" />
      </div>

      <div className="reset-password-container">
        <h2 className="reset-password-title">Restablecer Contraseña</h2>
        <p className="reset-password-description">
          Ingresa el código de verificación que recibiste por correo electrónico
          y tu nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="code">Código de verificación</label>
            <input
              type="text"
              id="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Código de 6 caracteres"
              maxLength={6}
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Nueva contraseña</label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresa tu nueva contraseña"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu nueva contraseña"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Cambiar Contraseña"}
          </button>
        </form>

        <div className="reset-password-back-link">
          <p>
            <a href="/login">Volver al inicio de sesión</a>
          </p>
        </div>

        <div className="login-form-logo-container" onClick={() => navigate("/")}>
          <img
            className="login-form-logo-img"
            src={VoluntariadoLogo}
            alt="Voluntariado Logo"
          />
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
