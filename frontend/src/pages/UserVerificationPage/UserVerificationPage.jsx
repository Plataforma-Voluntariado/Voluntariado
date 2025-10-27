import React from "react";
import "./UserVerificationPage.css";
import { useParams } from "react-router";
import UserVerificationLayout from "../../layouts/Admin/UserVerificationLayout/UserVerificationLayout";

function UserVerificationPage() {
    const params = useParams();
    const verificationId = params.id;
    return (
        <section className="user-verification-page">
            <h1 className="user-verification-page-title">Archivos de la verificación #{verificationId}</h1>
            <UserVerificationLayout verificationId={verificationId} />
        </section>
    );
}

export default UserVerificationPage;