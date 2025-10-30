import { MdNotifications } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import NotificationsModal from "./NotificationModal/NotificationsModal";
import "./NotificationButton.css";

function NotificationButton() {
  const { unreadCount, notifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navigation-bar-notifications-wrapper" ref={wrapperRef}>
      <MdNotifications
        className="navigation-bar-notifications-button"
        onClick={() => setIsOpen((prev) => !prev)}
      />
      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

      {isOpen && <NotificationsModal vistas={notifications.vistas} noVistas={notifications.noVistas} />}
    </div>
  );
}

export default NotificationButton;
