import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginLayout from "./layouts/LoginLayout";
// import LoginLayout from "./layouts/LoginLayout";
// import Student from "./pages/dashboard/student/StudentOverview";
// import Tuition from "./pages/dashboard/Tuition";
// import Timetable from "./pages/dashboard/Timetable";
// import Profile from "./pages/guardian-dashboard/ProfileGuardian";
// import StudentLayout from "./layouts/StudentAdminLayout";
// import StudentOverview from "./pages/admin-dashboard/student/StudentAdminOverview";
// import StudentNames from "./pages/admin-dashboard/student/StudentAdminNames";
// import Login from "./pages/Login";

// STYLES/CSS
import "./style/profile.css";
import "./style/staff.css";
import "./style/student.css";
import "./style/results.css";
import "./style/calendar.css";
import "./style/tuition.css";
// STYLES/CSS ENDS

// import Student from "./pages/staff-dashboard/StudentStaff";
// import Profile from "./pages/staff-dashboard/ProfileStaff";
// import { useState } from "react";
// import StudentAdminNamesOverview from "./pages/admin-dashboard/student/StudentAdminNamesOverviewMobile";
// import { useState } from "react";
// import { useUser } from "./hooks/UseUserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import Loader from "./shared/Loader";
// import { getRole } from "./utils/authTokens";

import ProfileLayout from "./layouts/role/ProfileLayout";
import StaffLayout from "./layouts/role/StaffLayout";
import TuitionLayout from "./layouts/role/TuitionLayout";
import ToastNotification from "./shared/ToastNotification";
import UserProvider from "./hooks/UseUserContext";
import Results from "./pages/dashboard/Results";
import ResultNames from "./pages/dashboard/ResultNames";
import ResultNamesMobile from "./pages/dashboard/ResultNamesMobile";
import ResultGuardian from "./pages/guardian-dashboard/ResultGuardian";
import ProtectedRoute from "./pages/ProtectedRoute";
// import ResultsLayout from "./layouts/role/ResultsLayout";
// import { getRole } from "./utils/authTokens";
// import StudentOverview from "./pages/dashboard/student/StudentOverview";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const ForgotPassword = lazy(() => import("./pages/login/ForgotPassword"));
const Login = lazy(() => import("./pages/login/Login"));
const AdminLogin = lazy(() => import("./pages/login/AdminLogin"));
const StaffLogin = lazy(() => import("./pages/login/StaffLogin"));
const GuardianLogin = lazy(() => import("./pages/login/GuardianLogin"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const Calendar = lazy(() => import("./pages/dashboard/Calendar"));
const Subjects = lazy(() => import("./pages/dashboard/Subjects"));
// const Attendance = lazy(() => import("./pages/dashboard/Attendance"));
const ResultsLayout = lazy(() => import("./layouts/role/ResultsLayout"));
const Chat = lazy(() => import("./pages/dashboard/Chat"));
// const Certificates = lazy(() => import("./pages/dashboard/Certificates"));
const ErrorPage = lazy(() => import("./shared/ErrorPage"));
const StudentAdminLayout = lazy(() => import("./layouts/StudentAdminLayout"));
const StudentAdminOverview = lazy(
  () => import("./pages/admin-dashboard/student/StudentAdminOverview")
);
const StudentAdminNames = lazy(
  () => import("./pages/admin-dashboard/student/StudentAdminNames")
);
const StudentAdminNamesOverviewMobile = lazy(
  () =>
    import("./pages/admin-dashboard/student/StudentAdminNamesOverviewMobile")
);
const StudentAdminDatabase = lazy(
  () => import("./pages/admin-dashboard/student/StudentAdminDatabase")
);
const TimetablesGuardian = lazy(
  () => import("./pages/guardian-dashboard/TimetableGuardian")
);
function App() {
  // CHANGE ROLE
  // const [role] = useState("admin");
  // const role = getRole();
  const queryClient = new QueryClient();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route element={<LoginLayout />}>
            <Route path="login/admin" element={<AdminLogin />} />
            <Route path="login/staff" element={<StaffLogin />} />
            <Route path="login/guardian" element={<GuardianLogin />} />
          </Route>
          <Route path={`forgot-password/:id`} element={<ForgotPassword />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            {/* ROLE INTERCHANGING FOR STUDENT*/}
            {/* {role === "admin" ? ( */}
            <Route path="student" element={<StudentAdminLayout />}>
              <Route index element={<StudentAdminOverview />} />
              <Route path=":id" element={<StudentAdminNames />}>
                <Route index element={<StudentAdminNamesOverviewMobile />} />
                <Route path=":id" element={<StudentAdminDatabase />} />
              </Route>
            </Route>
            {/* ) : role === "staff" ? ( */}
            {/* <Route path="student"  /> */}
            {/* ) : role === "guardian" ? null : null} */}
            {/* ENDS */}

            {/* ROLE INTERCHANGING FOR PROFILE*/}
            <Route path="profile" element={<ProfileLayout />} />
            {/* {role === "admin" ? null : role === "staff" ? (
            <Route path="profile" element={<ProfileStaff />} />
          ) : role === "guardian" ? (
            <Route path="profile" element={<ProfileGuardian />} />
          ) : null} */}
            {/* ENDS */}

            {/* ROLE INTERCHANGING FOR STAFF*/}
            <Route path="staff" element={<StaffLayout />} />
            {/* {role === "admin" || role === "guardian" ? (
            <Route path="staff" element={<Staff />} />
          ) : role === "staff" ? null : null} */}
            {/* ENDS */}
            <Route path="subjects" element={<Subjects />} />
            <Route path="calendar" element={<Calendar />} />
            {/* ROLE INTERCHANGING FOR TUITION*/}
            <Route path="tuition" element={<TuitionLayout />} />
            {/* {role === "admin" ? (
            <Route path="tuition" element={<Tuition />} />
          ) : null} */}
            {/* ENDS */}
            <Route path="timetable" element={<TimetablesGuardian />} />
            <Route path="guardian-result/:id" element={<ResultGuardian />} />
            {/* <Route path="attendance" element={<Attendance />} /> */}
            {/* {role === "admin" || role === "guardian" ? (
            <Route path="staff" element={<Staff />} />
          ) : role === "staff" ? null : null} */}
            <Route path="results" element={<ResultsLayout />}>
              <Route index element={<Results />} />
              <Route path=":id" element={<ResultNames />}>
                <Route index element={<ResultNamesMobile />} />
              </Route>
            </Route>
            <Route path="chat" element={<Chat />} />
            {/* <Route path="certificates" element={<Certificates />} /> */}
          </Route>
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Route>
    )
  );
  return (
    <div className="min-h-screen">
      <ToastNotification />
      {/* <h1 className="text-purple-700 text-2xl">Hello World</h1> */}
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
          </Suspense>
        </UserProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
