import React from "react";
import useClasses from "../../hooks/useClasses";
import { useNavigate } from "react-router-dom";
import Loader from "../../shared/Loader";
import { PathRight } from "../../assets/images/dashboard/students";

const Results: React.FC = () => {
  // GETTING CLASS Data
  const { classNameData, isClassError, isClassLoading } = useClasses();
  const navigate = useNavigate();
  return (
    <div className="results">
      <div className="results-header">Results</div>
      <div className="results-class-container flex-grow">
        {isClassLoading ? (
          <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center w-full">
            <Loader />
          </div>
        ) : isClassError ? (
          <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center ">
            <span>Error fetching data</span>
          </div>
        ) : (
          classNameData.map((classdata, index) => {
            return (
              <div className="results-class" key={index}>
                <button
                  onClick={() => navigate(classdata.name.toLowerCase())}
                  className="min-w-full flex flex-row justify-between items-center cursor-pointer"
                >
                  {classdata.name}
                  <div className=" max-w-[8.24px] md:max-w-[25px] h-[15px] md:max-h-[15px]">
                    <img
                      src={PathRight}
                      alt="arrow right"
                      className="block size-full object-contain object-center"
                    />
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Results;
