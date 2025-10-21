import React from "react";
import "./EmailVerificationPage.css";

function EmailVerificationPage() {
  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <h1>Verificación de Correo</h1>
        <p>Esta página está en desarrollo. La funcionalidad de verificación de correo se implementará próximamente.</p>
        <div className="placeholder-content">
          <div className="placeholder-card">
            <h3>Funcionalidades pendientes:</h3>
            <ul>
              <li>Envío de correo de verificación</li>
              <li>Validación de código de verificación</li>
              <li>Actualización del estado de verificación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;

