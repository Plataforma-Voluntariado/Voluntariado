import React from "react";
import "./NavigationBar.css";
import VoluntariadoLogo from "../../assets/photos/logo.png";
function NavigationBar(){
    return(
        <nav className="navigation-bar">
            <div className="navigation-bar-left">
                <img src={VoluntariadoLogo}/>
            </div>
            <div className="navigation-bar-right">
                <ul className="navigation-bar-list">
                    <li className="navigation-bar-list-item">PERFIL EMPRESARIAL</li>
                    <li className="navigation-bar-list-item">GESTIONAR EVENTOS</li>
                    <li className="navigation-bar-list-item create-event-button">CREAR EVENTO</li>
                </ul>
            </div>
        </nav>
    );
}

export default NavigationBar;