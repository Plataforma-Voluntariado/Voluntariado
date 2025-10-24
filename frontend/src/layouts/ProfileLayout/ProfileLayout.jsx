import React from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import ProfileInfo from "../../components/ProfileInfo/ProfileInfo";
import ProfileStats from "../../components/ProfileStats/ProfileStats";
import ProfileLogout from "../../components/ProfileLogout/ProfileLogout";

function ProfileLayout() {
  const { user } = useAuth();

  if (!user) return null;
  console.log(user)

  return (
    <div className="profile-layout">
      <div className="profile-glass-container">
        <ProfileHeader user={user} />
        <ProfileInfo user={user} />
        <ProfileStats user={user} />
        <ProfileLogout />
      </div>
    </div>
  );
}

export default ProfileLayout;
