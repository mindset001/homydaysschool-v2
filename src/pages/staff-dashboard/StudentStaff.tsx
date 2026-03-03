import React from "react";
import StudentAdminOverview from "../admin-dashboard/student/StudentAdminOverview";

const StudentStaff: React.FC = () => {
  // delegate entirely to admin view; it already handles staff behavior
  return <StudentAdminOverview />;
};

export default StudentStaff;
