import React from "react";
import "./UserVerificationPage.css";
import { useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import UserVerificationLayout from "../../layouts/Admin/UserVerificationLayout/UserVerificationLayout";

function UserVerificationPage() {
    const { user } = useAuth();
    const params = useParams();
    const verificationId = params.id;
    return (
        <section className="user-verification-page">
            <h1 className="user-verification-page-title">Archivos de la verificación #{verificationId}</h1>
            <UserVerificationLayout verificationId={verificationId} admin={user} />
        </section>
    );
}

export default UserVerificationPage;