import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../../services/auth/AuthService";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileInfo from "../../components/Profile/ProfileInfo/ProfileInfo";
import ProfileStats from "../../components/Profile/ProfileStats/ProfileStats";
import ProfileLogout from "../../components/Profile/ProfileLogout/ProfileLogout";
import ProfileVerificationLayout from "../ProfileVerificationLayout/ProfileVerificationLayout";

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
        <ProfileVerificationLayout />
        <ProfileStats user={userData} />
        <ProfileLogout />
      </div>
    </div>
  );
}

export default ProfileLayout;
