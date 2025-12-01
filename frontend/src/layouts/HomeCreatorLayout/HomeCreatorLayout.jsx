import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeCreatorLayout.css";
import { getMyVoluntariados } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import VolunteeringCard from "../../components/VolunteeringCard/VolunteeringCard";
import { FaPlus, FaCalendarAlt, FaUsers, FaChartLine, FaQuestionCircle } from "react-icons/fa";
import introJs from 'intro.js';
import 'intro.js/introjs.css';

function HomeCreatorLayout() {
  const [voluntariados, setVoluntariados] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadMisVoluntariados = async () => {
    try {
      setLoading(true);
      const data = await getMyVoluntariados();
      setVoluntariados(data || {});
      setError(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error cargando voluntariados:", err);
      setError("Error al cargar los voluntariados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMisVoluntariados();
  }, []);

  useEffect(() => {
    const handler = () => {
      loadMisVoluntariados();
    };

    window.addEventListener("inscripcion.changed", handler);
    return () => window.removeEventListener("inscripcion.changed", handler);
  }, []);

  // Estado para controlar si el tour está activo
  const [isTourActive, setIsTourActive] = useState(false);

  // Función auxiliar para inicializar el tour
  const initTour = (isMobileWithSidebar) => {
    setIsTourActive(true);
    const tourInstance = introJs();
    
    // Configurar los pasos según si es móvil o no
    let steps = [];
    
    if (isMobileWithSidebar) {
      steps = [
        {
          element: '.sidebar-list-item:nth-child(1)',
          intro: 'Aquí puedes gestionar todos tus eventos y ver las inscripciones pendientes.',
          position: 'right'
        },
        {
          element: '.sidebar-user-profile',
          intro: 'Accede a tu perfil para editar tu información y ver tus estadísticas.',
          position: 'right'
        }
      ];
    } else {
      // Recolectar pasos de data-intro para escritorio
      const elements = document.querySelectorAll('*[data-intro]');
      const domSteps = Array.from(elements).map(el => ({
        element: el,
        intro: el.getAttribute('data-intro'),
        position: el.getAttribute('data-position') || 'bottom',
        step: parseInt(el.getAttribute('data-step') || '0')
      })).sort((a, b) => a.step - b.step);
      
      steps = domSteps;
    }

    // Agregar paso del video al final
    steps.push({
      tooltipClass: 'modern-gray-tooltip video-tour-tooltip',
      intro: '<div class="video-tour-content"><h4>Conoce más sobre nosotros</h4><div class="video-tour-iframe-container"><iframe src="https://www.youtube.com/embed/t418TsJEjf8" title="Video introductorio" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p>Puedes ver el video o finalizar el tour.</p></div>'
    });

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
      steps: steps
    });
    
    tourInstance.onbeforechange(() => {
      return true;
    });
    
    tourInstance.oncomplete(() => {
      setIsTourActive(false);
      // Cerrar sidebar si está abierto
      const closeSidebarBtn = document.querySelector('.sidebar-close');
      if (closeSidebarBtn) {
        closeSidebarBtn.click();
      }
    });
    
    tourInstance.onexit(() => {
      setIsTourActive(false);
      // Cerrar sidebar si está abierto
      const closeSidebarBtn = document.querySelector('.sidebar-close');
      if (closeSidebarBtn) {
        closeSidebarBtn.click();
      }
    });
    
    tourInstance.start();
  };

  // Función para iniciar el tour manualmente
  const startTour = () => {
    // Detectar si es móvil
    const isMobile = window.innerWidth <= 768;
    
    // Si es móvil, abrir el sidebar primero
    if (isMobile) {
      const hamburgerButton = document.querySelector('.hamburger-button');
      if (hamburgerButton) {
        hamburgerButton.click();
        // Esperar a que se abra el sidebar
        setTimeout(() => {
          initTour(true);
        }, 300);
        return;
      }
    }
    
    // Si no es móvil o no se encontró el botón, iniciar tour normal
    const homeCreatorContainer = document.querySelector('.home-creator-container');
    if (homeCreatorContainer) {
      homeCreatorContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    setTimeout(() => {
      initTour(false);
    }, 700);
  };

  const handleCreateNew = () => {
    navigate("/crear-voluntariado");
  };

  // Memoizar los voluntariados combinados para evitar renders innecesarios
  const allVoluntariados = useMemo(() => {
    return [
      ...(voluntariados.pendientes || []),
      ...(voluntariados.en_proceso || []),
      ...(voluntariados.terminados || []),
      ...(voluntariados.cancelados || []),
    ];
  }, [voluntariados]);

  // Memoizar las estadísticas para evitar cálculos innecesarios
  const stats = useMemo(() => {
    if (!voluntariados || typeof voluntariados !== "object") {
      return { total: 0, pendientes: 0, enProceso: 0, terminados: 0, cancelados: 0, totalInscripciones: 0 };
    }

    const pendientes = voluntariados.pendientes?.length || 0;
    const enProceso = voluntariados.en_proceso?.length || 0;
    const terminados = voluntariados.terminados?.length || 0;
    const cancelados = voluntariados.cancelados?.length || 0;

    const total = pendientes + enProceso + terminados + cancelados;

    const totalInscripciones = Object.values(voluntariados)
      .flat()
      .reduce(
        (sum, v) => sum + (v.inscripciones?.filter(i => i.estado_inscripcion === "PENDIENTE").length || 0),
        0
      );

    return { total, pendientes, enProceso, terminados, cancelados, totalInscripciones };
  }, [voluntariados]);

  // Verificar si es la primera vez del usuario (después de definir allVoluntariados)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('creatorTourCompleted');
    if (!hasSeenTour && !loading && user && allVoluntariados.length >= 0) {
      // Mostrar el tour después de que todo esté cargado y estable
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
          scrollTo: 'tooltip'
        });
        
        tourInstance.onbeforechange(() => {
          return true;
        });
        
        tourInstance.oncomplete(() => {
          localStorage.setItem('creatorTourCompleted', 'true');
          setIsTourActive(false);
        });
        
        tourInstance.onexit(() => {
          localStorage.setItem('creatorTourCompleted', 'true');
          setIsTourActive(false);
        });
        
        tourInstance.start();
      }, 1500);
    }
  }, [loading, user, allVoluntariados]);

  if (loading) {
    return (
      <div className="home-creator-container">
        <div className="home-creator-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tus voluntariados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-creator-container">
      {/* Botón flotante del tour en la esquina inferior izquierda */}
      <button 
        className={`floating-tour-btn ${isTourActive ? 'tour-active' : ''}`}
        onClick={startTour}
        title="Iniciar tour guiado"
        disabled={isTourActive}
      >
        <FaQuestionCircle />
      </button>

      <div className="home-creator-layout">
        {/* Header Section */}
        <div className="creator-header">
          <div className="welcome-section">
            <h1>¡Bienvenido, {user?.nombres}!</h1>
            <p>Gestiona tus voluntariados y conecta con la comunidad</p>
          </div>

          <button 
            className="create-new-btn" 
            onClick={handleCreateNew}
            data-intro="Haz clic aquí para crear un nuevo voluntariado. Podrás agregar título, descripción, ubicación, fechas y toda la información necesaria." 
            data-step="4"
          >
            <FaPlus />
            <span>Crear Nuevo Voluntariado</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div 
          className="stats-section" 
          data-intro="Aquí puedes ver las estadísticas generales de tus voluntariados: total creados, voluntariados activos en proceso, e inscripciones pendientes por revisar." 
          data-step="5"
        >
          <div className="stat-card">
            <div className="stat-icon total">
              <FaCalendarAlt />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Voluntariados Creados</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>{stats.enProceso}</h3>
              <p>Voluntariados en Proceso</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inscriptions">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.totalInscripciones}</h3>
              <p>Total Inscripciones Pendientes</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div 
          className="creator-content" 
          data-intro="Esta es la lista de todos tus voluntariados. Puedes hacer clic en cualquier tarjeta para ver los detalles, gestionar inscripciones y realizar otras acciones." 
          data-step="6"
        >
          <div className="content-header">
            <h2>Mis Voluntariados</h2>
            {allVoluntariados.length > 0 && (
              <p>
                {allVoluntariados.length} voluntariado
                {allVoluntariados.length !== 1 ? "s" : ""} encontrado
                {allVoluntariados.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadMisVoluntariados}>Reintentar</button>
            </div>
          )}

          {!error && allVoluntariados.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FaCalendarAlt />
              </div>
              <h3>¡Comienza tu primer voluntariado!</h3>
              <p>
                Aún no has creado ningún voluntariado. Crea uno ahora y comienza
                a conectar con voluntarios.
              </p>
              <button className="create-first-btn" onClick={handleCreateNew}>
                <FaPlus />
                <span>Crear Mi Primer Voluntariado</span>
              </button>
            </div>
          )}

          {!error && allVoluntariados.length > 0 && (
            <div className="voluntariados-grid">
              {allVoluntariados.map((voluntariado, index) => (
                <VolunteeringCard
                  key={voluntariado.id_voluntariado}
                  volunteering={voluntariado}
                  data-intro={index === 0 ? "Haz clic en cualquier voluntariado para ver los detalles completos, gestionar inscripciones de voluntarios, editar información o realizar otras acciones." : ""}
                  data-step={index === 0 ? "7" : ""}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeCreatorLayout;
