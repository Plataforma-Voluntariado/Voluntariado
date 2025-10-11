import React from "react";
import "./LoginPage.css";
import LoginForm from "../../components/LoginForm/LoginForm";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";

function LoginPage() {
  return (
    <section className="login-page">
      <div className="login-page-image-wrapper">
        <img
          className="login-page-background-image"
          src={ImgHandsBackground}
          alt="Voluntariado manos"
        />
      </div>
      <LoginForm />
    </section>
  );
}

export default LoginPage;
