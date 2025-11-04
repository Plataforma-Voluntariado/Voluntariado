import React from "react";
import "./HomePage.css";
import { useAuth } from "../../context/AuthContext";
import AdministratorPanelLayout from "../../layouts/Admin/AdministratorPanelLayout/AdministratorPanelLayout";
import FooterWithAuth from "../../components/Footer/FooterWithAuth";
import HomeVolunteerLayout from "../../layouts/HomeVolunteerLayout/HomeVolunteerLayout";
import HomeCreatorLayout from "../../layouts/HomeCreatorLayout/HomeCreatorLayout";
function HomePage(){
    const { user } = useAuth();
    const renderLayout = () => {
        if (!user) return null;
        switch (user.rol) {
            case "CREADOR":
                return <HomeCreatorLayout />;
            case "VOLUNTARIO":
                return <HomeVolunteerLayout />;
            case "ADMIN":
                return <AdministratorPanelLayout />;
            default:
                return null;
        }
    }
    return(
        <>
            <section className="home-page">
                {renderLayout()}
            </section>
            <FooterWithAuth />
            
        </>
    )
}

export default HomePage;