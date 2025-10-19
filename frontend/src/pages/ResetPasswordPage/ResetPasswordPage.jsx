import React, { useState, useEffect } from "react";
import "./ResetPasswordPage.css";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import WrongAlert from "../../components/alerts/WrongAlert";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import { resetPassword } from "../../services/auth/authResetPassword";

function ResetPasswordPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Ya no necesitamos estados para los mensajes de error y éxito
  // porque ahora usamos las funciones de alerta directamente
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");

  useEffect(() => {
    // Extraer el token de la URL
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      // Ocultar el token de la URL reemplazándolo con una URL limpia
      window.history.replaceState({}, document.title, "/reset-password");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!code.trim()) {
      WrongAlert({
        title: "Error",
        message: "Por favor ingresa el código de verificación"
      });
      return;
    }
    
    if (!password.trim()) {
      WrongAlert({
        title: "Error",
        message: "Por favor ingresa una nueva contraseña"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      WrongAlert({
        title: "Error",
        message: "Las contraseñas no coinciden"
      });
      return;
    }
    
    if (password.length < 6) {
      WrongAlert({
        title: "Error",
        message: "La contraseña debe tener al menos 6 caracteres"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Usar el servicio de restablecimiento de contraseña
      const response = await resetPassword(token, code, password);
      
      // Mostrar alerta de éxito usando la función directamente
      SuccessAlert({
        title: "¡Éxito!",
        message: "Contraseña actualizada correctamente"
      }).then(() => {
        // Redirigir al login después de que el usu
        // ario cierre la alerta
        setToken("")
        navigate("/login");
      });
      
    } catch (err) {
      let errorMessage = "Error al actualizar la contraseña. Inténtalo de nuevo más tarde.";
      
      if (err.response && err.response.status === 404) {
        errorMessage = "Código de verificación inválido o expirado";
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      // Mostrar alerta de error usando la función directamente
      WrongAlert({
        title: "Error",
        message: errorMessage
      });
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
          Ingresa el código de verificación que recibiste por correo electrónico y tu nueva contraseña.
        </p>
        
        {/* Las alertas se mostrarán mediante llamadas a funciones, no como componentes */}
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="code">Código de verificación</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa el código de 6 dígitos"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Nueva contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
      </div>
    </div>
  );
}

export default ResetPasswordPage;