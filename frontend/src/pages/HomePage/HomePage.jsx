import React from "react";
import "./HomePage.css";
import { useAuth } from "../../context/AuthContext";
import AdministratorPanelLayout from "../../layouts/AdministratorPanelLayout/AdministratorPanelLayout";
function HomePage(){
    const { user } = useAuth();
    const renderLayout = () => {
        if (!user) return null;
        switch (user.rol) {
            case "CREADOR":
                return <div className="home-page-creator-layout"></div>;
            case "VOLUNTARIO":
                return <div className="home-page-volunteer-layout"></div>;
            case "ADMIN":
                return <AdministratorPanelLayout />;
            default:
                return null;
        }
    }
    return(
        <section className="home-page">
            {renderLayout()}
        </section>

    )
}

export default HomePage;