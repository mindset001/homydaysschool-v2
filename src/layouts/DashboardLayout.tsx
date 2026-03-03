import React, { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import data from "../services/api/db.json";
import SideNav from "../components/dashboard/SideNav";
import SearchSVG from "../components/svg/dashboard navbar svg/SearchSVG";
import CalendarSVG from "../components/svg/dashboard navbar svg/CalendarSVG";
import ChatSVG from "../components/svg/dashboard navbar svg/ChatSVG";
import TimetableSVG from "../components/svg/dashboard navbar svg/TimetableSVG";
import DropdownSVG from "../components/svg/dashboard navbar svg/DropdownSVG";
import { profileImage } from "../assets/images/users";
import { MenuIcon } from "../assets/images";
import HomeSVG from "../components/svg/dashboard navbar svg/HomeSVG";
import { getRole, getUser } from "../utils/authTokens";
import UserProfile from "../components/dashboard/UserProfile";
import useGuardianWard from "../hooks/useGuardianWard";

const DashboardLayout: React.FC = () => {
  const [mobileToggle, setMobileToggle] = useState<boolean>(false);
  const [toggleProfile, setToggleProfile] = useState<boolean>(false);
  const mobileFooters: { tab: ReactNode; route: string }[] = [
    { tab: <HomeSVG />, route: "" },
    { tab: <CalendarSVG />, route: "calendar" },
    { tab: <TimetableSVG />, route: "timetable" },
    { tab: <ChatSVG />, route: "chat" },
  ];
  const role = getRole() as string;
  useEffect(() => {
    console.log(data);
  }, []);

  // USER
  const user = getUser();

  useEffect(() => {
    console.log("User", user);
  }, [user]);

  const {
    guardianWard,
    isGuardianWardLoading,
    // guadianWardError,
    isGuardianWardError,
  } = useGuardianWard();
  console.log("guardianWardddddd", guardianWard);

  return (
    <div className="dashboard">
      {/* Sidenav Background */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-full min-h-screen bg-[rgba(0,0,0,0.5)] z-[55] ${
          mobileToggle ? "block md:hidden" : "hidden md:hidden"
        }`}
      ></div>

      <>
        <SideNav
          mobileToggle={mobileToggle}
          setMobileToggle={setMobileToggle}
        />
      </>
      <div>
        {/* <div className="dashboard-header-mobile"></div> */}
        {/* Dashboard Mobile Header */}
        <div className="fixed top-0 z-50 flex md:hidden flex-row justify-between items-center w-full px-[30px] pt-[44.5px] ml:pt-[46px]">
          <button
            onClick={() => setMobileToggle(true)}
            className="max-w-[22px] max-h-[20px] ml:max-w-[24px] ml:max-h-[22px]"
          >
            <img
              src={MenuIcon}
              alt="logo"
              className="size-full object-center object-contain"
            />
          </button>

          {/* <div className="size-[55px] ml:size-[60px] py-[11px] px-[12.5px] bg-white md:bg-[#ECFEFF] rounded-full flex justify-center items-center">
					<img
						src={Paper}
						alt="logo"
						className="max-w-[21.7px] max-h-[26.14px] object-center"
					/>
				</div> */}
          <div className="rounded-full relative flex justify-center items-center">
            <button
              className="size-[30px] ml:size-[32px] rounded-full border-[white] border-[2px] border-solid overflow-hidden"
              onClick={() => {
                setToggleProfile(!toggleProfile);
              }}
            >
              {/* use authenticated user profile image; guardianWard no longer
                  contains the guardian's own info */}
              <img
                src={user.profileImage || profileImage}
                alt={`${user.lastName} ${user.firstName}`}
                onError={(e) => (e.currentTarget.src = profileImage)}
              />
            </button>
            <>
              <UserProfile
                user={user}
                setToggleProfile={setToggleProfile}
                guardianWard={guardianWard}
                isGuardianWardLoading={isGuardianWardLoading}
                // guadianWardError,
                isGuardianWardError={isGuardianWardError}
                toggleProfile={toggleProfile}
                profileImage={profileImage}
                role={role}
              />
            </>
          </div>
        </div>
        {/* Dashboard Mobile Footer */}
        <div className="dashboard-mobile-footer-container">
          {mobileFooters.map((tab, index) => {
            return (
              <NavLink
                to={tab.route}
                end
                key={index}
                className={({ isActive }) =>
                  isActive
                    ? "dashboard-mobile-footer-active"
                    : "dashboard-mobile-footer"
                }
              >
                {tab.tab}
              </NavLink>
            );
          })}
        </div>
        {/* Dashboard Desktop Header */}
        <div className="dashboard-header-desktop">
          <div className="basis-[44.76%] size-[44px] 2xl:size-[55px] relative mr-[10px] lg:mr-[15px] xl:mr-[20px]">
            <div className="dashboard-header-desktop-search-svg max-w-[24px] h-auto absolute top-0 bottom-0 left-[15px] lg:left-[20px] 2xl:left-[25px] flex items-center">
              <SearchSVG />
            </div>
            <input
              type="search"
              name="search"
              id="search"
              placeholder="Search"
              className="bg-[#F1F0F0] rounded-[20px] w-[calc(100%-20px)] lg:min-w-full min-h-full pl-[45px] lg:pl-[56px] 2xl:pl-[69px] pr-[17px] xl:pr-[25px] py-[8px] 2xl:py-[13px] text-lg font-medium"
            />
          </div>
          <div className="basis-[55.24%] flex flex-row justify-between">
            <div className="flex flex-row">
              <Link
                to={"calendar"}
                className="rounded-full bg-[#F1F0F0] size-[44px] 2xl:size-[55px] flex justify-center items-center mx-[4px] lg:mx-[6px] xl:mx-[8px] 2xl:mx-[10px]"
              >
                <div className="max-w-[22px] max-h-[22px] 2xl:max-w-[24px] 2xl:max-h-[24px] dashboard-header-desktop-svg">
                  <CalendarSVG />
                </div>
              </Link>
              <Link
                to={"chat"}
                className="rounded-full bg-[#F1F0F0] size-[44px] 2xl:size-[55px] flex justify-center items-center mx-[4px] lg:mx-[6px] xl:mx-[8px] 2xl:mx-[10px]"
              >
                <div className="max-w-[22px] max-h-[22px] 2xl:max-w-[24px] 2xl:max-h-[24px] dashboard-header-desktop-svg">
                  <ChatSVG />
                </div>
              </Link>
              <Link
                to={"timetable"}
                className="rounded-full bg-[#F1F0F0] size-[44px] 2xl:size-[55px] flex justify-center items-center mx-[4px] lg:mx-[6px] xl:mx-[8px] 2xl:mx-[10px]"
              >
                <div className="max-w-[22px] max-h-[22px] 2xl:max-w-[24px] 2xl:max-h-[24px] dashboard-header-desktop-svg">
                  <TimetableSVG />
                </div>
              </Link>
            </div>
            <div className="bg-[#F1F0F0] rounded-[20px] ml-[4px] lg:ml-[6px] xl:ml-[8px] 2xl:ml-[10px] relative">
              <button
                onClick={() => {
                  setToggleProfile(!toggleProfile);
                }}
                className="flex flex-row items-center rounded-[20px]"
              >
                <div className="rounded-full border-[#05878F] border-[3px] border-solid size-[44px] 2xl:size-[55px] overflow-hidden">
                  <img
                    src={user.profileImage || profileImage}
                    alt={`${user.lastName} ${user.firstName}`}
                    onError={(e) => (e.currentTarget.src = profileImage)}
                  />
                </div>
                <div className="hidden lg:block font-medium text-[14.5px] xl:text-[15px] leading-[18px] 2xl:leading-[22.5px] font-Poppins ml-2">
                  <div className=" text-black">
                    <span className="mr-[4px]">{user.lastName}</span>
                    <span>{user.firstName}</span>
                  </div>
                  <div className="text-[#C4C4C4]">
                    {typeof role === "string"
                      ? role.charAt(0).toUpperCase() +
                        role.slice(1).toLowerCase()
                      : "No role"}
                  </div>
                </div>
                <div
                  className={`header-dropdown-icon ml-5 mr-5 ${
                    toggleProfile
                      ? "rotate-180 duration-300"
                      : "rotate-0 duration-300"
                  }`}
                >
                  <DropdownSVG />
                </div>
              </button>
              <>
                <UserProfile
                  user={user}
                  setToggleProfile={setToggleProfile}
                  guardianWard={guardianWard}
                  isGuardianWardLoading={isGuardianWardLoading}
                  // guadianWardError,
                  isGuardianWardError={isGuardianWardError}
                  toggleProfile={toggleProfile}
                  profileImage={profileImage}
                  role={role}
                />
              </>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
