import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailVerificationPage.css";
import { useAuth } from "../../context/AuthContext";
import { verifyEmail } from "../../services/auth/authEmailVerificationService";
import SuccessAlert from "../../components/alerts/SuccessAlert";
import WrongAlert from "../../components/alerts/WrongAlert";

function EmailVerificationPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está verificado, redirigir al perfil
    if (user?.correo_verificado) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.userId) {
        throw new Error('No se encontró información del usuario. Por favor, inicia sesión de nuevo.');
      }

      // Convertir userId a número (el backend espera un entero)
      const userIdNum = Number(user.userId);
      if (!Number.isInteger(userIdNum)) {
        throw new Error('El identificador de usuario no es un número válido');
      }

      // Log payload for debugging
      console.debug('Verificando email - payload:', { token: verificationCode, userId: userIdNum });

      const response = await verifyEmail(verificationCode.trim(), userIdNum);
      if (response && (response.message || response.success)) {
        SuccessAlert(response.message || "¡Correo verificado exitosamente!");
        // Actualizar el estado del usuario
        if (user) setUser({ ...user, correo_verificado: 1 });
        // Redirigir al perfil
        navigate("/profile");
      } else {
        WrongAlert(response.message || "Error al verificar el código");
      }
    } catch (error) {
      // Mejora del logging para Axios
      console.error("Error al verificar el código:", error);
      if (error?.response) {
        console.error('Axios response status:', error.response.status);
        console.error('Axios response data:', error.response.data);
        // Mostrar mensaje detallado stringificado para capturar arrays u objetos
        const respMsg = error.response.data?.message;
        let friendly = '';
        if (Array.isArray(respMsg) && respMsg.length) {
          friendly = respMsg[0];
        } else if (typeof respMsg === 'string') {
          friendly = respMsg;
        } else {
          friendly = JSON.stringify(error.response.data);
        }
        WrongAlert(`Error ${error.response.status}: ${friendly}`);
      } else {
        WrongAlert(error.message || "Error al verificar el código. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <div className="email-verification-box">
          <h2>Verificación de Correo Electrónico</h2>
          <p>
            Ingresa el código de 6 dígitos que enviamos a tu correo electrónico para verificar tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={loading || !verificationCode}
            >
              {loading ? "Verificando..." : "Verificar Código"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;

