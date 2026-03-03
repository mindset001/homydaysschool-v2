import React from "react";
import { Paper, TriangleFadeVector } from "../assets/images";
import AdminSVG from "../components/svg/AdminSVG";
import StaffSVG from "../components/svg/StaffSVG";
import GuardianSVG from "../components/svg/GuardianSVG";
import { NavLink, Outlet } from "react-router-dom";
import { setRole } from "../utils/authTokens";

const LoginLayout: React.FC = () => {
  return (
    <div className=" flex flex-col justify-center items-center bg-white md:bg-transparent min-h-screen">
      {/* lg:min-h-[65vh] xl:min-h-[70vh] 2xl:min-h-[75vh] */}
      <div className="min-h-[70vh] md:min-h-0 min-w-full md:min-w-[67%] lg:min-w-[57%] 2xl:min-w-[43.055%] flex flex-col justify-center items-center my-[30px] md:my-[20px]">
        <div className="mx-auto size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] md:size-[68px] lg:size-[75px] 2xl:size-[82px] md:bg-[#ECFEFF] rounded-full flex justify-center items-center mb-[75px] lg:mb-[50px]">
          <img
            src={Paper}
            alt="logo"
            className="w-[21.7px] h-[26.14px] md:w-[27px] md:h-[36px] 2xl:w-[38.49px] 2xl:h-[46.35px]"
          />
        </div>
        {/* md:min-h-[calc(70vh-68px)] lg:min-h-[calc(65vh-75px)] xl:min-h-[calc(70vh-75px)] 2xl:min-h-[calc(75vh-82px)] */}
        <div className="flex flex-col justify-center min-h-[calc(70vh-60px)] md:min-h-0  w-full rounded-[20px] bg-white relative md:py-[26px] xl:py-[32px] 2xl:py-[40px]">
          <div className="absolute -z-[0] top-[20px] bottom-[20px] left-[20px] md:min-w-[235px] lg:max-w-[354px] hidden md:block">
            <img
              src={TriangleFadeVector}
              alt="TriangleFadeVector"
              className="object-cover object-left size-[100%]"
            />
          </div>
          <div className=" w-full flex flex-col justify-start md:justify-between items-center z-10">
            <div className="">
              <h2 className="text-center text-[28px] font-Lora xl:text-[30px] font-bold leading-[35.84px] mb-[10px]">
                Login
              </h2>
              <p className="hidden md:block text-[13px] font-Poppins md:text-[16px] leading-[19.5px] font-[400px] text-center mx-[20px]">
                Select an option below to login
              </p>
            </div>
            <div className="md:flex-grow flex flex-row justify-around md:justify-evenly 2xl:justify-around text-[15px] font-Poppins leading-[18px] w-full mt-[20px] md:mt-[20px] md:mb-0 px-[30px] sm:px-[50px] md:px-[80px] xl:px-[100px] 2xl:px-[130px]">
              <NavLink
                to={"/login/admin"}
                onClick={() => {
                  setRole("admin");
                }}
                className={({ isActive }) => (isActive ? "loginActiveNav" : "")}
              >
                <div className="text-center m-auto mb-[5px]">Admin</div>
                <div className="svg-size m-auto size-[50px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[20px] h-[20px]">
                    <AdminSVG />
                  </div>
                </div>
              </NavLink>
              <NavLink
                to={"/login/staff"}
                onClick={() => {
                  setRole("staff");
                }}
                className={({ isActive }) => (isActive ? "loginActiveNav" : "")}
              >
                <div className="text-center m-auto mb-[5px]">Staff</div>
                <div className="svg-size m-auto size-[50px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[20px] h-[20px]">
                    <StaffSVG />
                  </div>
                </div>
              </NavLink>
              <NavLink
                to={"/login/guardian"}
                onClick={() => {
                  setRole("guardian");
                }}
                className={({ isActive }) => (isActive ? "loginActiveNav" : "")}
              >
                <div className="text-center m-auto mb-[5px]">Guardian</div>
                <div className="svg-size-guardian m-auto size-[50px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[30px] h-[20px]">
                    <GuardianSVG />
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
          <>
            <Outlet />
          </>
        </div>
      </div>
    </div>
  );
};

export default LoginLayout;
