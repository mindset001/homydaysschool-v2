import React, { useState } from "react";
import { DotVector, Paper, TriangleVector } from "../../assets/images";
import AdminSVG from "../../components/svg/AdminSVG";
import StaffSVG from "../../components/svg/StaffSVG";
import GuardianSVG from "../../components/svg/GuardianSVG";
import { useNavigate } from "react-router-dom";
import { setRole } from "../../utils/authTokens";

const Login: React.FC = () => {
  const [loginNavLink, setLoginNavLink] = useState<string>("");
  // const role = getRole();
  // const [loginActiveClick, setLoginActiveClick] = useState<string>("");
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate(loginNavLink);
  };

  return (
    // <div className="text-black  flex flex-col justify-center items-center min-h-screen bg-[#FFFFFF] md:bg-transparent">
    //   <div className="min-h-[70vh] lg:min-h-[65vh] flex flex-col justify-start md:min-w-[78.5%] lg:min-w-[72.5%] 2xl:min-w-[62.5%]">
    //     <div className="mx-auto size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] md:size-[68px] lg:size-[75px] 2xl:size-[82px] md:bg-[#ECFEFF] rounded-full flex justify-center items-center mb-[40px] lg:mb-[50px] 2xl:mb-[60px]">
    //       <img
    //         src={Paper}
    //         alt="logo"
    //         className="w-[21.7px] h-[26.14px] md:w-[27px] md:h-[36px] 2xl:w-[38.49px] 2xl:h-[46.35px]"
    //       />
    //     </div>
    //     <div className="min-h-[calc(70vh-60px)] md:min-h-[calc(70vh-68px)] lg:min-h-[calc(65vh-75px)] 2xl:min-h-[calc(65vh-82px)] flex flex-col justify-between md:bg-[#FFFFFF] md:shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] p-0 md:p-5 relative">
    //       <div className="absolute top-[0px] bottom-[20px] left-[20px] max-w-[354px] hidden md:block">
    //         <img src={TriangleVector} alt="TriangleVector" className="object-contain size-[100%]"/>
    //       </div>
    //       <div className="flex flex-col justify-between mb-[180px] md:mb-[80px] xl:mb-[90px] 2xl:mb-[100px] md:mt-[56px] 2xl:mt-[86px]">
    //         <div className="mb-[64px] md:mb-[80px] lg:mb-[80px] 2xl:mb-[107px]  ">
    //           <h1 className="text-center text-[28px] font-Lora md:text-[36px] xl:text-[38px] 2xl:text-[48px] font-bold leading-[35.84px] md:leading-[49px] xl:leading-[61.44px] mb-[10px]">
    //             Login
    //           </h1>
    //           <p className="text-[13px] font-Poppins md:text-[14px] xl:text-[20px] 2xl:text-[24px] leading-[19.5px] md:leading-[27px] xl:leading-[36px] font-[400px] lg:font-[500px] text-center mx-[20px]">
    //             Select an option below to login
    //           </p>
    //         </div>
    //         <div className="flex flex-row justify-between md:justify-evenly text-[13px] md:text-[14px] font-Poppins leading-[19.5px] mx-[5px] md:mx-0">
    //           <button className="">
    //             <div className="mb-[10px]">Admin</div>
    //             <div className="size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
    //               <img
    //                 src={AdminIcon}
    //                 alt="Admin"
    //                 className="object-center object-cover max-w-[20px] h-[30px]"
    //               />
    //             </div>
    //           </button>
    //           <button className="mx-[15px] md:mx-[5px]">
    //             <div className="mb-[10px]">Staff</div>
    //             <div className="size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
    //               <img
    //                 src={StaffIcon}
    //                 alt="Staff"
    //                 className="object-center object-cover max-w-[30px] h-[30px]"
    //               />
    //             </div>
    //           </button>
    //           <button className="">
    //             <div className="mb-[10px]">Guardian</div>
    //             <div className="size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
    //               <img
    //                 src={GuardianIcon}
    //                 alt="Guardian"
    //                 className="object-center object-cover max-w-[40px] h-[30px]"
    //               />
    //             </div>
    //           </button>
    //         </div>
    //       </div>
    //       <button className="font-Lora text-white bg-[#05878F]/50 self-center border-2 border-[rgba(5,135,143,0.01)] border-solid hover:bg-[#05878F] rounded-[25px] inline-block text-xl lg:text-2xl xl:text-[28px] font-bold lg:font-semibold py-[13px] px-[95px] min-w-[284px] md:mb-[16px] xl:mb-[32px]">
    //         Login
    //       </button>
    //     </div>
    //   </div>
    //   {/* <div className="font-Poppins text-xs md:text-lg fixed bottom-[11px] md:bottom-[17px] xl:bottom-[22px] 2xl:bottom-[30px]">Powered by DEMLINKS</div> */}
    // </div>
    <div className=" flex flex-col justify-center items-center bg-white md:bg-transparent min-h-screen">
      {/* min-h-[70vh] lg:min-h-[65vh] xl:min-h-[70vh] 2xl:min-h-[75vh] */}
      <div className="min-h-[70vh] md:min-h-full min-w-full md:min-w-[72.5%] lg:min-w-[62.5%] 2xl:min-w-[62.5%] flex flex-col justify-center items-center my-[30px] md:my-[25px]">
        <div className="mx-auto size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] md:size-[68px] lg:size-[75px] 2xl:size-[82px] md:bg-[#ECFEFF] rounded-full flex justify-center items-center mb-[40px] lg:mb-[50px]">
          <img
            src={Paper}
            alt="logo"
            className="w-[21.7px] h-[26.14px] md:w-[27px] md:h-[36px] 2xl:w-[38.49px] 2xl:h-[46.35px]"
          />
        </div>
        {/*  min-h-[calc(70vh-60px)] md:min-h-[calc(70vh-68px)] lg:min-h-[calc(65vh-75px)] xl:min-h-[calc(70vh-75px)] 2xl:min-h-[calc(75vh-82px)] */}
        <div className="flex flex-col justify-evenly md:justify-center items-center w-full rounded-[20px] bg-white static md:relative min-h-[calc(70vh-60px)] md:min-h-0">
          <div className="absolute -z-[0] top-[20px] bottom-[20px] left-[20px] md:max-w-[235px] lg:max-w-[354px] hidden md:block">
            <img
              src={TriangleVector}
              alt="TriangleVector"
              className="object-contain object-left-top size-[100%]"
            />
          </div>
          <div className="absolute -z-[0] top-[40px] left-[40px] max-w-[158px] hidden md:block">
            <img
              src={DotVector}
              alt="DotVector"
              className="object-contain object-left-top size-[100%]"
            />
          </div>
          <div className=" w-full flex flex-col justify-start md:justify-between items-center z-10">
            <div className=" md:mt-[86px] xl:mt-[86px] 2xl:mt-[136px]">
              <h2 className="text-center text-[28px] font-Lora md:text-[30px] xl:text-[38px] font-bold leading-[35.84px] md:leading-[46.08px] mb-[10px]">
                Login
              </h2>
              <p className="text-[13px] font-Poppins md:text-[14px] xl:text-base leading-[19.5px] md:leading-[27px] xl:leading-[36px] font-[400px] lg:font-[500px] text-center mx-[20px]">
                Select an option below to login
              </p>
            </div>
            <div className="  flex flex-row justify-around md:justify-evenly 2xl:justify-evenly  text-[13px] md:text-[14px] font-Poppins leading-[19.5px] w-full my-[64px] md:my-[50px] xl:my-[94px] 2xl:my-[108px] px-[30px] sm:px-[50px] md:px-[100px] xl:px-[130px]">
              <button
                className={` hover:scale-125 duration-150 ${
                  loginNavLink.split("/").includes("admin") ? "scale-125 loginActiveNav" : "scale-100"
                }`}
                onClick={() => {
                  setRole("admin");
                  setLoginNavLink("/login/admin");
                }}
              >
                <div className="mb-[10px]">Admin</div>
                <div className="svg-size-admin-login size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[20px] h-[30px]">
                    <AdminSVG />
                  </div>
                </div>
              </button>
              <button
                className={`mx-[15px] md:mx-[5px] hover:scale-125 duration-150 ${
                  loginNavLink.split("/").includes("staff") ? "scale-125 loginActiveNav" : "scale-100"
                }`}
                onClick={() => {
                  setRole("staff");
                  setLoginNavLink("/login/staff");
                }}
              >
                <div className="mb-[10px]">Staff</div>
                <div className="svg-size-staff-login size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[30px] h-[30px]">
                    <StaffSVG />
                  </div>
                </div>
              </button>
              <button
                className={` hover:scale-125 duration-150 ${
                  loginNavLink.split("/").includes("guardian") ? "scale-125 loginActiveNav" : "scale-100"
                }`}
                onClick={() => {
                  setRole("guardian");
                  setLoginNavLink("/login/guardian");
                }}
              >
                <div className="mb-[10px]">Guardian</div>
                <div className="svg-size-guardian-login size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[40px] h-[30px]">
                    <GuardianSVG />
                  </div>
                </div>
              </button>
            </div>
          </div>
          <button
            className={`font-Lora text-white self-center border-2 border-[rgba(5,135,143,0.01)] border-solid rounded-[25px] inline-block text-xl font-bold lg:font-semibold py-[12px] px-[94px] w-auto sm:min-w-[284px] text-center mx-[30px] md:mx-0 md:mb-[32px] xl:mb-[42px] 2xl:mb-[52px]  ${
              loginNavLink
                ? "bg-[#05878F] cursor-pointer"
                : "bg-[#05878F]/50 cursor-not-allowed"
            }`}
            onClick={handleLogin}
            disabled={loginNavLink ? false : true}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
