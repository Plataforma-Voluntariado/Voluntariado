import React from "react";
import "./HomePage.css";
import { useAuth } from "../../context/AuthContext";
import AdministratorPanelLayout from "../../layouts/Admin/AdministratorPanelLayout/AdministratorPanelLayout";
import Footer from "../../components/Footer/Footer";
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
        <>
            <section className="home-page">
                {renderLayout()}
            </section>
            <Footer />
            
        </>
    )
}

export default HomePage;