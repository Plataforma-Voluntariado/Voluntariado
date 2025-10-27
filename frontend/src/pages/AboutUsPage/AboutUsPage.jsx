import React from "react";
import "./AboutUsPage.css";
import misionImage from "../../assets/photos/mision.png";
import visionImage from "../../assets/photos/vision.png";
import valoresImage from "../../assets/photos/valores.png";

function AboutUsPage() {
  return (
    <div className="about-us-page">
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

          <section className="about-us-join glass-effect">
            <h2>Únete a Nuestra Comunidad</h2>
            <p>
              Sé parte de una red de personas comprometidas con el cambio social.
              Juntos podemos hacer la diferencia.
            </p>
            <button className="primary-button">Comienza a Ayudar</button>
          </section>
        </div>
    </div>
  );
}

export default AboutUsPage;