import React from "react";
import "./AdministratorPanelItem.css";
import { useNavigate } from "react-router";

function AdministratorPanelItem({ title, image, type }) {
    const Navigate = useNavigate()
  return (
    <div className="administrator-panel-item" onClick={()=>Navigate("/user-management/"+type)}>
      <img src={image} alt={title} className="administrator-panel-item-image" />
      <div className="administrator-panel-item-title-container">
        <h2 className="administrator-panel-item-title">{title}</h2>
      </div>
    </div>
  );
}

export default AdministratorPanelItem;
