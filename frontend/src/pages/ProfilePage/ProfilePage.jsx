import React from "react";
import "./ProfilePage.css";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import ProfileLayout from "../../layouts/ProfileLayout/ProfileLayout";

function ProfilePage() {
  return (
    <section className="profile-page">
      <NavigationBar />
      <ProfileLayout />
    </section>
  );
}

export default ProfilePage;
