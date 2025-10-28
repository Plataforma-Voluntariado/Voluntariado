import { MdNotifications } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import "./NotificationButton.css";

function NotificationButton() {
  const { unreadCount } = useAuth();

  return (
    <div className="navigation-bar-notifications-wrapper">
      <MdNotifications className="navigation-bar-notifications-button" />
      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
    </div>
  );
}

export default NotificationButton;
