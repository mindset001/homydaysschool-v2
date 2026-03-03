import React, { memo } from "react";
import CircularProgressBar from "../dashboard/CircularProgressBar";
import StudentChat from "../dashboard/StudentChart";
import useTotalPercentageValue from "../../hooks/useTotalPercentageValue";

const OverviewFinance: React.FC = () => {
  const totalPercentageValue = useTotalPercentageValue();
  return (
    <div className="overview-finance">
      <div className="mx-[0px] md:mx-[15px] lg:mx-[20px] xl:mx-[25px] 2xl:mx-[30px] font-Lora font-bold text-[15px] leading-[19.2px] md:text-lg md:leading-[23.04px] text-center md:text-left">
        <span className="hidden md:block">Finance</span>
        <span className="block md:hidden">Tuition</span>
      </div>
      <div className="overview-finance-status">
        <div className="overview-finance-status-one">
          <div className="text-center text-[15px] leading-[22.5px] font-Poppins font-medium mr-[15px]">
            <div className="mb-[15px] md:mb-[20px] text-[rgba(41,204,151,1)]">
              Completed
            </div>
            <div>
              <CircularProgressBar
                style={{
                  percentage: totalPercentageValue.completed,
                  textSize: 18,
                  textColor: "rgba(41,204,151,1)",
                  fontWeight: 600,
                  pathColor: "rgba(41,204,151,1)",
                  trailColor: "rgba(234,250,245)",
                  weight: 13,
                  size: 120,
                }}
              />
            </div>
          </div>
          <div className="text-center text-[15px] leading-[22.5px] font-Poppins font-medium mx-[15px]">
            <div className="text-center mb-[15px] md:mb-[20px] text-[#98654F]">
              Incomplete
            </div>
            <div>
              <CircularProgressBar
                style={{
                  percentage: totalPercentageValue.incomplete,
                  textSize: 18,
                  textColor: "#98654F",
                  fontWeight: 600,
                  pathColor: "#98654F",
                  trailColor: "#F5F0ED",
                  weight: 13,
                  size: 120,
                }}
              />
            </div>
          </div>

          <div className="text-center text-[15px] leading-[22.5px] font-Poppins font-medium ml-[15px]">
            <div className="text-center mb-[15px] md:mb-[20px] text-[#FF2E2E]">
              Void
            </div>
            <div>
              <CircularProgressBar
                style={{
                  percentage: totalPercentageValue.void,
                  textSize: 18,
                  textColor: "#FF2E2E",
                  fontWeight: 600,
                  pathColor: "#FF2E2E",
                  trailColor: "#FFEAEA",
                  weight: 13,
                  size: 120,
                }}
              />
            </div>
          </div>
        </div>
        <div className="overview-finance-status-two">
          <div className="w-[56.11%] flex-1 flex flex-col justify-end mr-[10px] pt-[16px] pb-0 px-[15px] md:pt-[42px] md:pb-[34px] md:px-[30px] shadow-none md:shadow-[0px_1px_25px_0px_rgba(56,_159,_166,_0.1)] rounded-[15px] shrink-0">
            <div className="capitalize md:uppercase text-center text-[15px] leading-[19.2px] font-Lora font-bold text-black mb-[15px] md:mb-[17px] whitespace-nowrap">
              Number Of Students
            </div>

            <StudentChat
              value={{
                total_students: totalPercentageValue.total_students,
                paid: totalPercentageValue.paid,
                paid_half: totalPercentageValue.paid_half,
                paid_nothing: totalPercentageValue.paid_nothing,
              }}
            />
          </div>
          <div className="flex flex-col items-center w-[40.54%] ml-[10px] pt-[16px] pb-0 px-[15px] md:py-[42px] md:px-[41px] shadow-none md:shadow-[0px_1px_25px_0px_rgba(56,_159,_166,_0.1)] rounded-[15px]">
            <div className="capitalize md:uppercase mb-[15px] md:mb-[42px] text-center text-[15px] leading-[19.2px] font-Lora font-bold text-black">
              Started Pack
            </div>
            <div>
              <CircularProgressBar
                style={{
                  percentage: totalPercentageValue.starter_pack_collected,
                  textSize: 18,
                  textColor: "rgba(2,73,182,1)",
                  fontWeight: 600,
                  pathColor: "rgba(2,73,182,1)",
                  trailColor: "rgba(199,212,255,1)",
                  weight: 20,
                  size: 120,
                }}
              />
            </div>
            <div className="flex flex-row justify-between mt-[10px] md:mt-[26px] text-[13px] leading-[19.5px] font-Poppins font-medium text-black">
              <div className="flex flex-row justify-between mr-[6.5px]">
                <div className="rounded-full bg-[rgba(2,73,182,1)] size-[14px] mr-[5px]"></div>
                <div>Collected</div>
              </div>
              <div className="flex flex-row justify-between ml-[6.5px]">
                <div className="rounded-full bg-[rgba(199,212,255,1)] size-[14px] mr-[5px]"></div>
                <div>Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(OverviewFinance);
