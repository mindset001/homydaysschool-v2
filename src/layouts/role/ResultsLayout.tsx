import React from "react";
import { getRole } from "../../utils/authTokens";
// import Results from "../../pages/dashboard/Results";
// import ResultGuardian from "../../pages/guardian-dashboard/ResultGuardian";
import { Outlet } from "react-router-dom";

const ResultsLayout: React.FC = () => {
  const role = getRole();

  return role === "admin" || role === "staff" || role === "guardian" ? (
    <Outlet />
  ) : null;
};

export default ResultsLayout;
