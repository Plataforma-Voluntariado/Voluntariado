import React, { useEffect, useState } from "react";
import "./ProfileLayout.css";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../../services/auth/AuthService";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import ProfileInfo from "../../components/ProfileInfo/ProfileInfo";
import ProfileStats from "../../components/ProfileStats/ProfileStats";
import ProfileLogout from "../../components/ProfileLogout/ProfileLogout";

function ProfileLayout() {
  const Navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserData();
      if (!data) return Navigate("/login");
      setUserData(data);
    };
    fetchUser();
  }, [Navigate]);

  if (!userData) return null;

  return (
    <div className="profile-layout">
      <div className="profile-glass-container">
        <ProfileHeader user={userData} />
        <ProfileInfo user={userData} />
        <ProfileStats user={userData} />
        <ProfileLogout />
      </div>
    </div>
  );
}

export default ProfileLayout;

