import React from "react";
import "./AdministratorPanelLayout.css";
import AdministratorPanelItem from "../../../components/Admin/AdministratorPanelItem/AdministratorPanelItem";
import volunteersOption from "../../../assets/photos/volunteers_option.jpg";
import creatorsOption from "../../../assets/photos/creators_option.jpg";
function AdministratorPanelLayout() {
    return(
        <div className="administrator-panel-layout">
            <h1 className="administrator-panel-title">Panel de administrador</h1>
            <AdministratorPanelItem
            type="VOLUNTARIO" 
            title="Gestionar Voluntarios"
            image={volunteersOption}
            />
            <AdministratorPanelItem 
            title="Gestionar Creadores"
            image={creatorsOption}
            type="CREADOR"
            />
        </div>
    )
}

export default AdministratorPanelLayout;