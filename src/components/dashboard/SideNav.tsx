import React, { memo, ReactNode, useEffect, useRef, useState } from "react";
import { BookNav, Logout, Paper } from "../../assets/images";
import { NavLink, useNavigate } from "react-router-dom";
import OverviewSVG from "../svg/dashboard navbar svg/OverviewSVG";
import ClassSVG from "../svg/dashboard navbar svg/ClassSVG";
import GuardianSVG from "../svg/GuardianSVG";
import StaffSVG from "../svg/StaffSVG";
import CalendarSVG from "../svg/dashboard navbar svg/CalendarSVG";
import TuitionSVG from "../svg/dashboard navbar svg/TuitionSVG";
import TimetableSVG from "../svg/dashboard navbar svg/TimetableSVG";
import SubjectsSVG from "../svg/dashboard navbar svg/SubjectsSVG";
import ResultsSVG from "../svg/dashboard navbar svg/ResultsSVG";
import ChatSVG from "../svg/dashboard navbar svg/ChatSVG";
import SessionSVG from "../svg/dashboard navbar svg/SessionSVG";
import PromotionSVG from "../svg/dashboard navbar svg/PromotionSVG";
import DropdownSVG from "../svg/dashboard navbar svg/DropdownSVG";
import AttendanceSVG from "../svg/dashboard navbar svg/AttendanceSVG";
import {
  clearRole,
  clearTokens,
  clearUser,
  getRole,
} from "../../utils/authTokens";
import useActiveSession, { ISession } from "../../hooks/useActiveSession";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/api/apiClient";

const fetchAllSessions = (): Promise<ISession[]> =>
  apiClient.get("academic-sessions").then((r) => r.data?.data ?? r.data ?? []);
const apiActivate = (id: string) =>
  apiClient.patch(`academic-sessions/${id}/activate`);

interface SideNavProps {
  mobileToggle: boolean;
  setMobileToggle: React.Dispatch<React.SetStateAction<boolean>>;
}
const SideNav: React.FC<SideNavProps> = ({ mobileToggle, setMobileToggle }) => {
  const navigate = useNavigate();
  const role = getRole();
  const { activeSession } = useActiveSession();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: allSessions = [] } = useQuery<ISession[]>({
    queryKey: ["allAcademicSessions"],
    queryFn: fetchAllSessions,
    enabled: dropdownOpen,
    staleTime: 60 * 1000,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiActivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAcademicSessions"] });
      queryClient.invalidateQueries({ queryKey: ["activeAcademicSession"] });
      queryClient.invalidateQueries({ queryKey: ["home-analytic"] });
      queryClient.invalidateQueries({ queryKey: ["classPayments"] });
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
      setDropdownOpen(false);
    },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

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
    {      item: <ClassSVG />,
      to: "staff",
      text: "My Classes",
      roles: ["staff"],
    },
    {      item: <ClassSVG />, 
      to: "classes",
      text: "Class",
      roles: ["admin"],
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
    {
      item: <AttendanceSVG />,
      to: "attendance",
      text: "Attendance",
      roles: ["admin", "staff"],
    },
    {
      item: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
      to: "assignments",
      text: "Assignments",
      roles: ["admin", "staff", "guardian"],
    },
    {
      item: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      to: "quizzes",
      text: "Quizzes",
      roles: ["admin", "staff", "guardian"],
    },
    {
      item: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      to: role === "guardian" ? "weekly-reviews-guardian" : "weekly-reviews",
      text: "Weekly Reviews",
      roles: ["admin", "staff", "guardian"],
    },
    {
      item: <ResultsSVG />,
      to: "results",
      text: "Results",
      roles: ["admin"],
    },
    {
      item: <SessionSVG />,
      to: "academic-session",
      text: "Session",
      roles: ["admin"],
    },
    {
      item: <PromotionSVG />,
      to: "student-promotion",
      text: "Promote",
      roles: ["admin"],
    },
    {
      item: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      to: "change-password",
      text: "Password",
      roles: ["admin", "staff", "guardian"],
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
        <div className=" size-[40px] py-[11px] px-[12.5px] bg-white md:bg-[#FFF7ED] rounded-full mr-[18px] md:mr-[10px]">
          <img src={Paper} alt="logo" className="size-full object-center" />
        </div>
        <div className="text-lg leading-[23.04px] font-bold text-white">
          School
          <br />
          Master
        </div>
      </div>
      <div className="relative hidden md:block font-Lora" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-full bg-[#FFF7ED] flex flex-row justify-center items-center py-[14px] hover:bg-[#d9f5f7] transition-colors"
        >
          <div className="text-base text-center leading-[20.48px] font-semibold 2xl:font-bold mr-[11px] text-[#F97316]">
            {activeSession
              ? <>{activeSession.academicYear}<br className="hidden md:block xl:hidden" />{" "}{activeSession.term}</>
              : <>No Active<br className="hidden md:block xl:hidden" />Session</>}
          </div>
          <div className={`max-w-[13.17px] max-h-[7.59px] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
            <DropdownSVG />
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full z-50 bg-white shadow-lg border border-gray-100 rounded-b-xl overflow-hidden">
            {allSessions.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-3">Loading…</div>
            ) : (
              allSessions
                .slice()
                .sort((a, b) =>
                  a.academicYear !== b.academicYear
                    ? a.academicYear.localeCompare(b.academicYear)
                    : ["First Term","Second Term","Third Term"].indexOf(a.term) -
                      ["First Term","Second Term","Third Term"].indexOf(b.term)
                )
                .map((session) => (
                  <button
                    key={session._id}
                    onClick={() => {
                      if (!session.isActive && role === "admin") {
                        activateMutation.mutate(session._id);
                      } else {
                        setDropdownOpen(false);
                      }
                    }}
                    disabled={activateMutation.isPending}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      session.isActive
                        ? "bg-[#FFF7ED] text-[#F97316] font-semibold cursor-default"
                        : role === "admin"
                        ? "text-gray-700 hover:bg-gray-50 cursor-pointer"
                        : "text-gray-500 cursor-default"
                    }`}
                  >
                    <span>{session.academicYear} · {session.term}</span>
                    {session.isActive && (
                      <span className="text-[10px] bg-[#F97316] text-white rounded-full px-2 py-0.5 ml-2">Active</span>
                    )}
                  </button>
                ))
            )}
          </div>
        )}
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
                  ? "active-nav navbar-route-child before:block text-[#F97316] bg-[#FFF7ED]"
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
          className="bg-[#FFF7ED] flex flex-row items-center rounded-r-3xl md:rounded-[20px] py-[11.5px] px-[22.5px] mt-[10px] md:mt-[18.5px]"
        >
          <div className="max-w-[28.42px] max-h-[22.21px] mr-[10.58px] ">
            <img
              src={Logout}
              alt="logout icon"
              className="size-full object-contain object-center"
            />
          </div>
          <div className="text-[15px] leading-[22.5px] md:text-lg font-medium font-Poppins text-[#F97316]">
            Logout
          </div>
        </button>
      </div>
    </div>
  );
};

export default memo(SideNav);
