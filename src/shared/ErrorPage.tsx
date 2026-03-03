import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen pt-0 md:pt-[68px] lg:pt-[72px] xl:pt-[78px] 2xl:pt-[89px]">
      <div className="font-bold text-[30px] sm:text-[39px] md:text-[50px] lg:text-[56px] xl:text-[74px]">
        404 Not Found
      </div>
      <div className="text-xl md:text-2xl mt-2">This page does not exist</div>
      <button
        onClick={goBack}
        className="text-lg md:text-xl border py-2 px-4 border-solid rounded-lg text-nowrap border-[#05878F] text-white bg-[#05878F] mt-5 md:mt-12"
      >
        Go Back
      </button>
    </div>
  );
};

export default ErrorPage;
