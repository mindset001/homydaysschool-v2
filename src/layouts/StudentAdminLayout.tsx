import React from "react";
import { Outlet } from "react-router-dom";
import { getRole } from "../utils/authTokens";
import StudentStaff from "../pages/staff-dashboard/StudentStaff";

const StudentAdminLayout: React.FC = () => {
  // CHANGE ROLE
  // const [role] = useState("admin");
  const role = getRole();
  return role === "admin" ? (
    <>
      <Outlet />
    </>
  ) : role === "staff" ? (
    <StudentStaff />
  ) : null;
};

export default StudentAdminLayout;
