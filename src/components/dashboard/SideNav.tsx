import React, { memo, ReactNode } from "react";
import { BookNav, Logout, Paper } from "../../assets/images";
import { NavLink, useNavigate } from "react-router-dom";
import OverviewSVG from "../svg/dashboard navbar svg/OverviewSVG";
import GuardianSVG from "../svg/GuardianSVG";
import StaffSVG from "../svg/StaffSVG";
import CalendarSVG from "../svg/dashboard navbar svg/CalendarSVG";
import TuitionSVG from "../svg/dashboard navbar svg/TuitionSVG";
import TimetableSVG from "../svg/dashboard navbar svg/TimetableSVG";
import SubjectsSVG from "../svg/dashboard navbar svg/SubjectsSVG";
// import AttendanceSVG from "../svg/dashboard navbar svg/AttendanceSVG";
import ResultsSVG from "../svg/dashboard navbar svg/ResultsSVG";
import ChatSVG from "../svg/dashboard navbar svg/ChatSVG";
// import CertsAwardsSVG from "../svg/dashboard navbar svg/CertsAwardsSVG";
import DropdownSVG from "../svg/dashboard navbar svg/DropdownSVG";
import {
  clearRole,
  clearTokens,
  clearUser,
  getRole,
} from "../../utils/authTokens";
interface SideNavProps {
  mobileToggle: boolean;
  setMobileToggle: React.Dispatch<React.SetStateAction<boolean>>;
}
const SideNav: React.FC<SideNavProps> = ({ mobileToggle, setMobileToggle }) => {
  const navigate = useNavigate();
  // determine user role early so it can influence navigation items
  const role = getRole();

  const navs: {
    item: ReactNode;
    to: string;
    text: string;
    roles: string[];
  }[] = [
    {
      item: <OverviewSVG />,
      to: "",
      text: "Dashboard",
      roles: ["admin", "staff", "guardian"],
    },
    {
      item: <StaffSVG />,
      to: "profile",
      text: "Profile",
      roles: ["staff", "guardian"],
    },
    {
      item: <GuardianSVG />,
      // for staff users the “Student” nav should actually point at results
      to: role === "staff" ? "results" : "student",
      text: "Student",
      roles: ["admin", "staff"],
    },
    {
      item: <StaffSVG />,
      to: "staff",
      text: "Staff",
      roles: ["admin"],
    },
    {
      item: <SubjectsSVG />,
      to: "subjects",
      text: "Subjects",
      // only admins should see subject management
      roles: ["admin"],
    },
    {
      item: <CalendarSVG />,
      to: "calendar",
      text: "Calendar",
      roles: ["admin", "staff", "guardian"],
    },
    {
      item: <ChatSVG />, // chat icon already imported earlier if needed
      to: "chat",
      text: "Chat",
      roles: ["admin", "staff", "guardian"],
    },
    {
      item: <TuitionSVG />,
      to: "tuition",
      text: "Tuition",
      roles: ["admin"], //Removed staff and guardian
    },
    {
      item: <TimetableSVG />,
      to: "timetable",
      text: "Timetable",
      roles: ["admin", "staff", "guardian"],
    },
    // {
    //   item: <AttendanceSVG />,
    //   to: "attendance",
    //   text: "Attendance",
    //   roles: ["admin", "staff", "guardian"],
    // },
    {
      item: <ResultsSVG />,
      to: "results",
      text: "Results",
      roles: ["admin"], // only admins should see results link now
    },
    // {
    //   item: <ChatSVG />,
    //   to: "chat",
    //   text: "Chat",
    //   roles: ["admin", "staff", "guardian"],
    // },
    // {
    //   item: <CertsAwardsSVG />,
    //   to: "certificates",
    //   text: "Certificates",
    //   roles: ["admin", "staff", "guardian"],
    // },
  ];

  console.log(role);
  return (
    <div
      className={`dashboard-sidenav ${
        mobileToggle
          ? "flex flex-col md:flex md:flex-col"
          : "hidden md:flex md:flex-col"
      }`}
    >
      <div className="ml-[30px] md:ml-4 lg:ml-7 xl:ml-10 mb-[34px] md:mb-[38px] flex flex-row items-center font-Lora">
        <div className=" size-[40px] py-[11px] px-[12.5px] bg-white md:bg-[#ECFEFF] rounded-full mr-[18px] md:mr-[10px]">
          <img src={Paper} alt="logo" className="size-full object-center" />
        </div>
        <div className="text-lg leading-[23.04px] font-bold text-white">
          School
          <br />
          Master
        </div>
      </div>
      <div className="bg-[#ECFEFF] hidden md:flex flex-row justify-center items-center font-Lora py-[14px]">
        <div className="text-base text-center leading-[20.48px] font-semibold 2xl:font-bold mr-[11px] text-[#05878F]">
          2024/2025 <br className="hidden md:block xl:hidden" />
          Academic Session
        </div>
        <div className="max-w-[13.17px] max-h-[7.59px]">
          <DropdownSVG />
        </div>
      </div>
      <div className="block md:hidden font-Lora font-bold text-white ml-[57px]">
        Main Menu
      </div>
      <div className="navbar-route">
        {navs
          .filter((nav) => nav.roles.includes(role as string))
          .map((nav, index) => (
            <NavLink
              end={nav.to === "" ? true : false}
              to={nav.to}
              key={index}
              onClick={() => setMobileToggle(false)}
              className={({ isActive }) =>
                isActive
                  ? "active-nav navbar-route-child before:block text-[#05878F] bg-[#ECFEFF]"
                  : "inactive-nav navbar-route-child before:hidden"
              }
            >
              <div className="max-w-5 max-h-5 mr-[15.5px] md:mr-[13.5px] lg:mr-[15.5px]">
                {nav.item}
              </div>
              <div>{nav.text}</div>
            </NavLink>
          ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-end">
        <div className="max-w-[213px] md:max-w-[183px] lg:max-w-[213px] h-auto">
          <img
            src={BookNav}
            alt="book nav icon"
            className="size-full object-contain object-center"
          />
        </div>
        <button
          onClick={() => (
            setMobileToggle(false),
            clearRole(),
            clearUser(),
            clearTokens(),
            navigate("/login")
          )}
          className="bg-[#ECFEFF] flex flex-row items-center rounded-r-3xl md:rounded-[20px] py-[11.5px] px-[22.5px] mt-[10px] md:mt-[18.5px]"
        >
          <div className="max-w-[28.42px] max-h-[22.21px] mr-[10.58px] ">
            <img
              src={Logout}
              alt="logout icon"
              className="size-full object-contain object-center"
            />
          </div>
          <div className="text-[15px] leading-[22.5px] md:text-lg font-medium font-Poppins text-[#05878F]">
            Logout
          </div>
        </button>
      </div>
    </div>
  );
};

export default memo(SideNav);
