import React, { useEffect, useState } from "react";
import "./HomeVolunteerLayout.css"
import { GetAllVolunteerings } from "../../services/volunteering/VolunteeringService";
import VolunteeringCard from "../../components/VolunteeringCard/VolunteeringCard";
import VolunteeringMapLayout from "../VolunteeringMapLayout/VolunteeringMapLayout";

function HomeVolunteerLayout(){
    const [volunteerings, setVolunteerings] = useState([]);
    useEffect (() => {
        fetchVolunteerings();
    }, []);
    const fetchVolunteerings = async ()  => {
        const data = await GetAllVolunteerings();
        console.log(data);
        setVolunteerings(data);
    }

    return(
        <div className="home-volunteer-layout">
            <h1 className="home-volunteer-layout-title">Ubica los próximos eventos y elige dónde quieres aportar tu tiempo.</h1>
            <VolunteeringMapLayout 
            volunteerings={volunteerings}
            />
            <h1 className="home-volunteer-layout-title">Eventos disponibles</h1>
            {volunteerings.map((volunteering) => (
                <VolunteeringCard 
                    key={volunteering.id_voluntariado}
                    volunteering={volunteering}
                />
            ))}
        </div>
    )
}

export default HomeVolunteerLayout; 