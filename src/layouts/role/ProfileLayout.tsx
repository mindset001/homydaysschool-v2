import React from "react";
import { getRole } from "../../utils/authTokens";
import ProfileStaff from "../../pages/staff-dashboard/ProfileStaff";
import ProfileGuardian from "../../pages/guardian-dashboard/ProfileGuardian";

const ProfileLayout: React.FC = () => {
  // CHANGE ROLE
  // const [role] = useState("admin");
  const role = getRole();
  return role === "staff" ? (
    <ProfileStaff />
  ) : role === "guardian" ? (
    <ProfileGuardian />
  ) : null;
};

export default ProfileLayout;
