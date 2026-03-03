import React from "react";
import { Paper } from "../assets/images";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="text-white  flex flex-col justify-center items-center min-h-screen">
      <div className="min-h-[70vh] lg:min-h-[65vh] flex flex-col justify-between items-center">
        <div className="flex flex-col items-center">
          <div className="mx-auto size-[60px] md:size-[68px] lg:size-[75px] xl:size-[82px] bg-[#ECFEFF] rounded-full flex justify-center items-center">
            <img
              src={Paper}
              alt="logo"
              className="w-[21.7px] h-[26.14px] md:w-[27px] md:h-[36px] xl:w-[38.49px] xl:h-[46.35px]"
            />
          </div>

          <div className="flex flex-col items-center mt-[40px] lg:mt-[50px] w-[90%] sm:w-[70%] xl:w-[60%]">
            <h1 className="text-center text-[28px] font-Lora md:text-[36px] xl:text-[48px] font-bold leading-[35.84px] md:leading-[49px] xl:leading-[61.44px] mb-[10px]">
              School Master
            </h1>
            <p className="text-[13px] font-Poppins xl:text-[24px] leading-[19.5px] md:leading-[27px] xl:leading-[36px] font-[400px] lg:font-[500px] text-center mx-[30px]">
              Welcome to school master, a software application that keeps
              your records absolutely safe.
            </p>
          </div>
        </div>

        <Link to={'/login'} className="font-Lora text-[#05878F] bg-[#ECFEFF] border-2 border-[#ECFEFF] border-solid hover:bg-transparent hover:text-white rounded-[20px] inline-block text-xl lg:text-2xl xl:text-[28px] font-bold lg:font-semibold py-[13px] px-[95px] w-auto sm:min-w-[284px] text-center mx-[30px] md:mx-0 duration-150">
          Login
        </Link>
      </div>
      <div className="font-Poppins text-xs md:text-lg fixed bottom-[11px] md:bottom-[17px] xl:bottom-[22px] 2xl:bottom-[30px]">Powered by DEMLINKS</div>
    </div>
  );
};

export default LandingPage;
