import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCertificate } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import "./HomeVolunteerLayout.css";
import VolunteeringMapLayout from "../VolunteeringMapLayout/VolunteeringMapLayout";
import SearchVolunteerings from "../../components/SearchVolunteerings/SearchVolunteerings";
import VolunteeringCardLayout from "../VolunteeringCardLayout/VolunteeringCardLayout";
import introJs from 'intro.js';
import 'intro.js/introjs.css';

function HomeVolunteerLayout() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [volunteeringsForMap, setVolunteeringsForMap] = useState([]);
  const mapApiRef = useRef(null);

  // Estado para controlar si el tour está activo
  const [isTourActive, setIsTourActive] = useState(false);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters || {});
  };

  const handleVolunteeringsChange = useCallback((list) => {
    setVolunteeringsForMap(Array.isArray(list) ? list : []);
  }, []);

  // Función para iniciar el tour manualmente
  const startTour = () => {
    setIsTourActive(true);
    const tourInstance = introJs();
    tourInstance.setOptions({
      prevLabel: 'Anterior',
      nextLabel: 'Siguiente',
      skipLabel: 'Salir',
      doneLabel: 'Finalizar',
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      disableInteraction: true,
      scrollToElement: true,
      scrollPadding: 80,
      overlayOpacity: 0.8,
      tooltipClass: 'modern-gray-tooltip',
      helperElementPadding: 10,
      highlightClass: 'modern-gray-highlight',
      scrollTo: 'tooltip',
      steps: [
        {
          element: '.navigation-bar-list-item.role-item',
          intro: 'Gestiona tus inscripciones a eventos de voluntariado.',
          position: 'right'
        },
        {
          element: '.navigation-bar-notifications-wrapper',
          intro: 'Revisa tus notificaciones importantes.',
          position: 'left'
        },
        {
          element: '.navigation-bar-user-photo',
          intro: 'Haz clic en tu foto de perfil para acceder a tu información personal y configuración.',
          position: 'left'
        },
        {
          element: '.home-volunteer-certificates-btn',
          intro: 'Accede a tus certificados obtenidos por tu participación en voluntariados.',
          position: 'left'
        }
      ]
    });
    tourInstance.onbeforechange(() => true);
    tourInstance.oncomplete(() => setIsTourActive(false));
    tourInstance.onexit(() => setIsTourActive(false));
    tourInstance.start();
  };

  // Mostrar el tour automáticamente la primera vez
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('volunteerTourCompleted');
    if (!hasSeenTour) {
      setTimeout(() => {
        setIsTourActive(true);
        const tourInstance = introJs();
        tourInstance.setOptions({
          prevLabel: 'Anterior',
          nextLabel: 'Siguiente',
          skipLabel: 'Salir',
          doneLabel: 'Finalizar',
          showProgress: true,
          showBullets: true,
          exitOnOverlayClick: false,
          exitOnEsc: true,
          disableInteraction: true,
          scrollToElement: true,
          scrollPadding: 80,
          overlayOpacity: 0.8,
          tooltipClass: 'modern-gray-tooltip',
          helperElementPadding: 10,
          highlightClass: 'modern-gray-highlight',
          scrollTo: 'tooltip',
          steps: [
            {
              element: '.navigation-bar-list-item.role-item',
              intro: 'Gestiona tus inscripciones a eventos de voluntariado.',
              position: 'right'
            },
            {
              element: '.navigation-bar-notifications-wrapper',
              intro: 'Revisa tus notificaciones importantes.',
              position: 'left'
            },
            {
              element: '.navigation-bar-user-photo',
              intro: 'Haz clic en tu foto de perfil para acceder a tu información personal y configuración.',
              position: 'left'
            },
            {
              element: '.home-volunteer-certificates-btn',
              intro: 'Accede a tus certificados obtenidos por tu participación en voluntariados.',
              position: 'left'
            }
          ]
        });
        tourInstance.onbeforechange(() => true);
        tourInstance.oncomplete(() => {
          localStorage.setItem('volunteerTourCompleted', 'true');
          setIsTourActive(false);
        });
        tourInstance.onexit(() => {
          localStorage.setItem('volunteerTourCompleted', 'true');
          setIsTourActive(false);
        });
        tourInstance.start();
      }, 1500);
    }
  }, []);

  return (
    <div className="home-volunteer-layout">
      {/* Botón flotante del tour en la esquina inferior izquierda */}
      <button 
        className={`floating-tour-btn ${isTourActive ? 'tour-active' : ''}`}
        onClick={startTour}
        title="Iniciar tour guiado"
        disabled={isTourActive}
        style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 1000 }}
      >
        <FaQuestionCircle />
      </button>
      <div className="home-volunteer-header">
        <div className="home-volunteer-layout-title-container">
          <h1 className="home-volunteer-layout-title">
            Ubica los próximos eventos y elige dónde quieres aportar tu tiempo.
          </h1>
        </div>

        <button
          className="home-volunteer-certificates-btn"
          onClick={() => navigate("/mis-certificados")}
          title="Ver mis certificados"
        >
          <FaCertificate /> Mis Certificados
        </button>
      </div>

      <VolunteeringMapLayout
        volunteerings={volunteeringsForMap}
        mapApiRef={mapApiRef}
      />
      <div className="home-volunteer-layout-title-container">
        <h1 className="home-volunteer-layout-title">Filtrar eventos</h1>
      </div>
      <SearchVolunteerings onApplyFilters={handleApplyFilters} />
      <div className="home-volunteer-layout-title-container">
        <h1 className="home-volunteer-layout-title">Eventos disponibles</h1>
      </div>


      <VolunteeringCardLayout
        filters={filters}
        mapApiRef={mapApiRef}
        onVolunteeringsChange={handleVolunteeringsChange}
      />
    </div>
  );
}

export default HomeVolunteerLayout;
