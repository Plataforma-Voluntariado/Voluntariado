import React, { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { message, success } = await verifyEmail(verificationCode.trim());

      if (success || message) {
        await SuccessAlert({ message });
        setUser?.({ ...user, correo_verificado: 1 });
        return navigate("/profile");
      }

      await WrongAlert({ title: "Error en la verificación", message: message || "Error al verificar el código." });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Ocurrió un error inesperado";
      await WrongAlert({ title: "Error en la verificación", message: Array.isArray(msg) ? msg.join("\n") : msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <div className="email-verification-box">
          <h2>Verificación de Correo Electrónico</h2>
          <p>Ingresa el código de 6 caracteres que enviamos a tu correo electrónico</p>

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Ej: A1B2C3"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={loading || verificationCode.length !== 6}
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
