// NotificationButton.jsx (MODIFICADO)
import React, { useEffect, useState, useCallback } from "react"; 
import { MdNotifications } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { GetNotifications } from "../../services/notificaciones/notificacionesService";
import { useNotificacionesSocket } from "../../hooks/useNotificacionesSocket"; 
import "./NotificationButton.css";


const fetchNotifications = async (setCount) => {
    try {
        const response = await GetNotifications();

        if (response && Array.isArray(response)) {
            const sinLeer = response.filter(n => n.visto === false).length;
            setCount(sinLeer);
        }
    } catch (err) {
        console.error("Error al obtener notificaciones:", err);
    }
};


function NotificationButton() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshCount = useCallback(() => {
        fetchNotifications(setUnreadCount); 
    }, []); 

    useNotificacionesSocket(user?.userId, refreshCount);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0); 
            return;
        }
        
        refreshCount(); 

    }, [user, refreshCount]);

    return (
        <div className="navigation-bar-notifications-wrapper">
            <MdNotifications className="navigation-bar-notifications-button" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>
    );
}

export default NotificationButton;