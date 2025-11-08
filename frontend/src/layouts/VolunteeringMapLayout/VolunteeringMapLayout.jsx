import React from "react";
import "./VolunteeringMapLayout.css"
import VolunteeringMap from "../../components/Map/VolunteeringMap/VolunteeringMap";
import VolunteeringMapInfo from "../../components/Map/VolunteeringMapInfo/VolunteeringMapInfo";

function VolunteeringMapLayout({volunteerings}){
    console.log(volunteerings)
    return(
        <div className="volunteering-map-layout">
            <VolunteeringMap volunteerings={volunteerings} />
            <VolunteeringMapInfo />
        </div>
    )
}

export default VolunteeringMapLayout;