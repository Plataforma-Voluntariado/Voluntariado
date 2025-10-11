import React from "react";
import "./RegisterPage.css";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";
import RegisterForm from "../../layouts/RegisterFormLayout/RegisterFormLayout";
function RegisterPage(){
    return(
        <section className="register-page">
                  <div className="register-page-image-wrapper">
                    <img
                      className="register-page-background-image"
                      src={ImgHandsBackground}
                      alt="Voluntariado manos"
                    />
                  </div>
            <RegisterForm />
        </section>
    )
}

export default RegisterPage;