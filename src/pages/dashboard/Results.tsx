import React, { useEffect } from "react";
import useClasses from "../../hooks/useClasses";
import { useNavigate } from "react-router-dom";
import Loader from "../../shared/Loader";
import { PathRight } from "../../assets/images/dashboard/students";
import { getRole } from "../../utils/authTokens";

const Results: React.FC = () => {
  const role = getRole();
  const isStaff = role === "staff";

  // Staff only manage results for the class(es) assigned to them
  const { classNameData, isClassError, isClassLoading } = useClasses(
    isStaff ? { mine: true } : undefined
  );
  const navigate = useNavigate();

  // A teacher with exactly one assigned class can skip straight to it
  useEffect(() => {
    if (isStaff && !isClassLoading && !isClassError && classNameData.length === 1) {
      navigate(classNameData[0].name.toLowerCase(), { replace: true });
    }
  }, [isStaff, isClassLoading, isClassError, classNameData, navigate]);

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
        ) : isStaff && classNameData.length === 0 ? (
          <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center ">
            <span>No class has been assigned to you yet</span>
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
