import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileInfo from "../../components/Profile/ProfileInfo/ProfileInfo";
import ProfileStats from "../../components/Profile/ProfileStats/ProfileStats";
import ProfileLogout from "../../components/Profile/ProfileLogout/ProfileLogout";
import ProfileVerificationLayout from "../ProfileVerificationLayout/ProfileVerificationLayout";
import "./ProfileLayout.css";
function ProfileLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="profile-layout">
        <ProfileHeader user={user} />
        <ProfileInfo user={user} />
        <ProfileVerificationLayout user = {user}/>
        <ProfileStats user={user} />
        <ProfileLogout />
    </div>
  );
}

export default ProfileLayout;
