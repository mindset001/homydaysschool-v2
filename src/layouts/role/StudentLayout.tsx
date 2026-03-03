// import React from "react";
// import StudentStaff from "../../pages/staff-dashboard/StudentStaff";
// import { getRole } from "../../utils/authTokens";
// import { Route, Routes } from "react-router-dom";
// import StudentAdminDatabase from "../../pages/admin-dashboard/student/StudentAdminDatabase";
// import StudentAdminNames from "../../pages/admin-dashboard/student/StudentAdminNames";
// import StudentAdminNamesOverviewMobile from "../../pages/admin-dashboard/student/StudentAdminNamesOverviewMobile";
// import StudentAdminOverview from "../../pages/admin-dashboard/student/StudentAdminOverview";
// import StudentAdminLayout from "../StudentAdminLayout";

// const StudentLayout: React.FC = () => {
//   // CHANGE ROLE
//   // const [role] = useState("admin");
//   const role = getRole();
//   return role === "admin" ? (
//     <Routes>
//       <Route path="" element={<StudentAdminLayout />}>
//         <Route index element={<StudentAdminOverview />} />
//         <Route path=":id" element={<StudentAdminNames />}>
//           <Route index element={<StudentAdminNamesOverviewMobile />} />
//           <Route path=":id" element={<StudentAdminDatabase />} />
//         </Route>
//       </Route>
//     </Routes>
//   ) : role === "staff" ? (
//     <Routes>
//       <Route index element={<StudentStaff />} />
//     </Routes>
//   ) : null;
// };
// {
//   /* ROLE INTERCHANGING FOR STUDENT*/
// }
// {
//   /* {role === "admin" ? ( */
// }

// {
//   /* ) : role === "staff" ? ( */
// }
// {
//   /* <Route path="student"  /> */
// }
// {
//   /* ) : role === "guardian" ? null : null} */
// }
// {
//   /* ENDS */
// }

// export default StudentLayout;
