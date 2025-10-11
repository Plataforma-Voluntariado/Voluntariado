import React, { useEffect, useState } from "react";
import "./RegisterFormLayout.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import RegisterFormVolunteer from "../../components/RegisterFormVolunteer/RegisterFormVolunteer";
import RegisterFormCreator from "../../components/RegisterFormCreator/RegisterFormCreator";
function RegisterForm() {
  const [userType, setUserType] = useState(true);
  const handleSwitchType = (type) => {
    setUserType(type);
  };
  return (
    <section className="register-form">
      <h1 className="register-form-title">Regístrate</h1>
      <div className="register-form-switch-buttons">
        <button
          className={`register-form-switch-btn "+ ${userType?"active":""}`}
          onClick={() => handleSwitchType(true)}
        >
          Como Usuario
        </button>
        <button
          className={`register-form-switch-btn "+ ${!userType?"active":""}`}
          onClick={() => handleSwitchType(false)}
        >
          Como Empresa
        </button>
      </div>
      {userType?<RegisterFormVolunteer />:<RegisterFormCreator />}
      <p className="register-form-had-account">
        Ya tienes una cuenta?{" "}
        <a href="/login" className="register-form-had-account-link">
          Inicia Sesión
        </a>
      </p>
      <img
        className="register-form-logo-img"
        src={VoluntariadoLogo}
        alt="Voluntariado Logo"
      />
    </section>
  );
}
export default RegisterForm;
