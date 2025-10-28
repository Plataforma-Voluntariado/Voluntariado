import React from "react";
import "./UserManagementPage.css";
import { useParams } from "react-router";
import UserManagementLayout from "../../layouts/Admin/UserManagementLayout/UserManagementLayout";
import { useAuth } from "../../context/AuthContext";

function UserManagementPage() {
    const { user } = useAuth();
    let params = useParams();
    if(!params.role || (params.role !== "CREADOR" && params.role !== "VOLUNTARIO")){ 
        return(
            <div className="user-management-page">
                <h1>No correct role specified</h1>
                <h2>Redirecting to Home</h2>
            </div>
        );
    };
    let title = params.role === "CREADOR" ? "Creadores pendientes" : "Voluntarios pendientes";
    return(
        <div className="user-management-page">
            <h1 className="user-management-page-title">{title}</h1>
            <UserManagementLayout rol={params.role} admin={user} />
        </div>
    )
}

export default UserManagementPage;