import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Footer from "../../components/Footer/Footer";
import { MdVolunteerActivism, MdVerifiedUser, MdPublic, MdGroups } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";
import VoluntariadoLogo from "../../assets/photos/logo.png";

const LandingPage = () => {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo logo-clickable" onClick={handleLogoClick}>
            <img 
              src={VoluntariadoLogo} 
              alt="Logo Voluntariado" 
              className="header-logo"
            />
          </div>
          <nav className="nav-buttons">
            <Link to="/login" className="btn btn-outline">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn btn-primary">
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Conecta con oportunidades de{" "}
              <span className="highlight">voluntariado</span>
            </h1>
            <p className="hero-description">
              Únete a nuestra plataforma y encuentra actividades de voluntariado
              que se adapten a tus intereses y disponibilidad. Haz la diferencia
              en tu comunidad mientras creces personal y profesionalmente.
            </p>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">
              <MdVolunteerActivism className="hero-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">¿Por qué elegir nuestra plataforma?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <HiDocumentText className="feature-icon-svg" />
              </div>
              <h3>Fácil inscripción</h3>
              <p>
                Proceso simple y rápido para registrarte e inscribirte en
                actividades de voluntariado.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MdVerifiedUser className="feature-icon-svg" />
              </div>
              <h3>Certificación</h3>
              <p>
                Obtén certificados por tu participación y horas de voluntariado
                completadas.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MdPublic className="feature-icon-svg" />
              </div>
              <h3>Impacto social</h3>
              <p>
                Contribuye al desarrollo de tu comunidad y genera un impacto
                positivo real.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MdGroups className="feature-icon-svg" />
              </div>
              <h3>Comunidad</h3>
              <p>
                Conecta con otros voluntarios y organizaciones comprometidas con
                el cambio social.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para hacer la diferencia?</h2>
            <p>
              Únete a miles de voluntarios que ya están transformando sus
              comunidades.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Crear cuenta gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer showAuthLinks={true} />
    </div>
  );
};

export default LandingPage;
