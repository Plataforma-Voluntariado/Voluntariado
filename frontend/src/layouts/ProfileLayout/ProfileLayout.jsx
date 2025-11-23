import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileInfo from "../../components/Profile/ProfileInfo/ProfileInfo";
import ProfileStats from "../../components/Profile/ProfileStats/ProfileStats";
import ProfileLogout from "../../components/Profile/ProfileLogout/ProfileLogout";
import ProfileVerificationLayout from "../ProfileVerificationLayout/ProfileVerificationLayout";
import "./ProfileLayout.css";
import { useEffect } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { FaQuestionCircle } from "react-icons/fa";
function ProfileLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Función auxiliar para inicializar el tour
  const initTour = () => {
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
      scrollToElement: false,
      scrollPadding: 300,
      overlayOpacity: 0.8,
      tooltipClass: 'modern-gray-tooltip',
      helperElementPadding: 10,
      highlightClass: 'modern-gray-highlight'
    });
    
    tourInstance.onbeforechange(function(targetElement) {
      if (targetElement) {
        // El scroll está en #root
        const scrollContainer = document.getElementById('root');
        
        if (scrollContainer) {
          const elementRect = targetElement.getBoundingClientRect();
          const elementTopRelativeToContainer = elementRect.top + scrollContainer.scrollTop;
          const containerHeight = scrollContainer.clientHeight;
          const elementHeight = elementRect.height;
          const targetScroll = elementTopRelativeToContainer - (containerHeight / 2) + (elementHeight / 2);
          
          scrollContainer.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth'
          });
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 600);
          });
        }
      }
      return true;
    });
    
    tourInstance.oncomplete(() => {
      localStorage.setItem('profilePageTourCompleted', 'true');
    });
    
    tourInstance.onexit(() => {
      localStorage.setItem('profilePageTourCompleted', 'true');
    });
    
    tourInstance.start();
  };

  // Función para iniciar el tour manualmente
  const startTour = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      initTour();
    }, 700);
  };

  // Auto-iniciar el tour en la primera visita
  useEffect(() => {
    const tourCompleted = localStorage.getItem('profilePageTourCompleted');
    if (!tourCompleted && user) {
      setTimeout(() => {
        startTour();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <div className="profile-layout">
          <ProfileHeader user={user} />
          <ProfileInfo user={user} />
          <ProfileVerificationLayout user = {user}/>
          <ProfileStats user={user} />
          <ProfileLogout />
      </div>

      {/* Botón flotante para iniciar el tour */}
      <button 
        className="floating-tour-btn"
        onClick={startTour}
        title="Iniciar tour guiado"
        aria-label="Iniciar tour guiado"
      >
        <FaQuestionCircle />
      </button>
    </>
  );
}

export default ProfileLayout;
