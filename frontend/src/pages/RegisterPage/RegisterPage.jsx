import "./RegisterPage.css";
import RegisterForm from "../../layouts/RegisterFormLayout/RegisterFormLayout";
import ImgHandsBackground from "../../assets/photos/manos-voluntariado-bg.jpg";

function RegisterPage() {
  return (
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
  );
}

export default RegisterPage;
