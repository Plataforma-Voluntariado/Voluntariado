import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
import VoluntariadoLogo from "../../assets/photos/logo.png";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { FaXTwitter, FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa6";

function Footer({ showUserLinks = false }) {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <img 
            src={VoluntariadoLogo} 
            alt="Logo Voluntariado" 
            className="footer-logo"
            onClick={() => navigate("/home")}
          />
          <p>Conectando corazones voluntarios para construir un futuro mejor</p>
          <div className="social-icons">
            <a href="https://twitter.com/voluntariado" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaXTwitter />
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaWhatsapp />
            </a>
            <a href="https://facebook.com/voluntariado" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com/voluntariado" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li onClick={() => navigate("/about-us")}>Acerca de Nosotros</li>
            {showUserLinks && <li onClick={() => navigate("/home")}>Inicio</li>}
            {showUserLinks && <li onClick={() => navigate("/profile")}>Perfil</li>}
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contacto</h3>
          <ul className="contact-list">
            <li className="contact-item">
              <MdEmail className="contact-icon"/>
              contacto@voluntariado.com
            </li>
            <li className="contact-item">
              <MdPhone className="contact-icon"/>
              (123) 456-7890
            </li>
            <li className="contact-item">
              <MdLocationOn className="contact-icon"/>
              Carrera 48 # 37-12
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Plataforma de Voluntariado. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;