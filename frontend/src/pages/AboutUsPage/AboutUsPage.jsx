import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AboutUsPage.css";
import "../LandingPage/LandingPage.css"; // Importar estilos del header
import "../../components/NavigationBar/NavigationBar.css"; // Estilos para NavigationBar
import misionImage from "../../assets/photos/mision.png";
import visionImage from "../../assets/photos/vision.png";
import valoresImage from "../../assets/photos/valores.png";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import Footer from "../../components/Footer/Footer";
import NavigationBar from "../../components/NavigationBar/NavigationBar";

function AboutUsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Verificar si hay un usuario logueado
  useEffect(() => {
    // Verificar si hay cookies de autenticación o llamar al endpoint de perfil
    const checkAuth = async () => {
      try {
        // Hacer una llamada simple para verificar si hay sesión activa
        const response = await fetch(`${process.env.REACT_APP_URL_SERVER_VOLUNTARIADO}/auth/perfil`, {
          credentials: 'include',
          method: 'GET'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        // Si falla, el usuario no está logueado
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleStartHelping = () => {
    if (!user) {
      navigate("/register");
    }
  };

  const handleLogoClick = () => {
    if (user) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  return (
    <div className={`about-us-page ${user ? 'with-navbar' : ''}`}>
      {user ? (
        <NavigationBar />
      ) : (
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
      )}

      <div className="about-us-hero">
        <div className="about-us-hero-content">
          <h1>Conectando Corazones Voluntarios</h1>
          <p>Construyendo un futuro mejor a través del servicio comunitario</p>
        </div>
      </div>

        <div className="about-us-sections">
          <section className="about-us-section mission-section glass-effect">
            <div className="section-content">
              <h2>Nuestra Misión</h2>
              <p>
                Diseñar y desarrollar una plataforma web accesible donde los voluntarios puedan 
                encontrar oportunidades de servicio comunitario y las organizaciones puedan gestionar 
                sus convocatorias de manera centralizada. Nuestro objetivo es mejorar la comunicación, 
                aumentar la participación ciudadana y facilitar la trazabilidad de cada proceso, mientras 
                aprendemos y aplicamos buenas prácticas de desarrollo de software dentro del diplomado.
              </p>
            </div>
            <div className="section-image">
              <img src={misionImage} alt="Nuestra Misión" />
            </div>
          </section>

          <section className="about-us-section vision-section glass-effect">
            <div className="section-image">
              <img src={visionImage} alt="Nuestra Visión" />
            </div>
            <div className="section-content">
              <h2>Nuestra Visión</h2>
              <p>
                Convertirnos en una plataforma digital que facilite y fortalezca 
                la participación comunitaria, conectando de manera transparente y sencilla a 
                voluntarios con organizaciones locales. Buscamos impulsar la cultura del servicio social y
                demostrar, desde el ámbito académico, que la tecnología puede ayudar a cerrar brechas de 
                información y fomentar el apoyo mutuo en nuestra comunidad.
              </p>
            </div>
          </section>

          <section className="about-us-section values-section glass-effect">
            <div className="section-content values-content">
              <h2>Nuestros Valores</h2>
              <div className="values-grid">
                <div className="value-item">
                  <h3>Compromiso</h3>
                  <p>Dedicación total a las causas sociales y a nuestros voluntarios.</p>
                </div>
                <div className="value-item">
                  <h3>Transparencia</h3>
                  <p>Claridad en nuestros procesos y comunicación abierta.</p>
                </div>
                <div className="value-item">
                  <h3>Impacto</h3>
                  <p>Búsqueda constante de resultados significativos en la comunidad.</p>
                </div>
                <div className="value-item">
                  <h3>Colaboración</h3>
                  <p>Trabajo en equipo para multiplicar nuestro alcance.</p>
                </div>
              </div>
            </div>
            <div className="section-image values-image">
              <img src={valoresImage} alt="Nuestros Valores" />
            </div>
          </section>

          <section className="about-us-impact glass-effect">
            <h2>Nuestro Impacto</h2>
            <div className="impact-stats">
              <div className="stat-item">
                <h3>1000+</h3>
                <p>Voluntarios Activos</p>
              </div>
              <div className="stat-item">
                <h3>500+</h3>
                <p>Proyectos Realizados</p>
              </div>
              <div className="stat-item">
                <h3>50+</h3>
                <p>Organizaciones Aliadas</p>
              </div>
            </div>
          </section>

          {!user && (
            <section className="about-us-join glass-effect">
              <h2>Únete a Nuestra Comunidad</h2>
              <p>
                Sé parte de una red de personas comprometidas con el cambio social.
                Juntos podemos hacer la diferencia.
              </p>
              <button className="primary-button" onClick={handleStartHelping}>
                Comienza a Ayudar
              </button>
            </section>
          )}
        </div>
        
        <Footer showUserLinks={!!user} showAuthLinks={!user} />
    </div>
  );
}

export default AboutUsPage;