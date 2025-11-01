// SidebarNotificationWrapper.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import NotificationsModal from "../NotificacionButton/NotificationModal/NotificationsModal";

function SidebarNotificationWrapper() {
  const { unreadCount, notifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el click fue fuera del botón Y fuera del modal
      const isClickInsideButton = buttonRef.current && buttonRef.current.contains(event.target);
      const isClickInsideModal = modalRef.current && modalRef.current.contains(event.target);
      
      if (!isClickInsideButton && !isClickInsideModal) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <div 
        ref={buttonRef} 
        onClick={handleToggle} 
        className={`sidebar-notification-content ${isOpen ? 'active' : ''}`}
      >
        <FaBell className="sidebar-notification-icon" />
        <span className="sidebar-notification-text">Notificaciones</span>
        {unreadCount > 0 && (
          <span className="sidebar-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      
      {isOpen && createPortal(
        <>
          <div 
            className="notification-overlay" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            ref={modalRef}
            className="notification-modal-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <NotificationsModal 
              vistas={notifications.vistas} 
              noVistas={notifications.noVistas} 
            />
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default SidebarNotificationWrapper;