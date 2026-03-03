/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useQuery } from "@tanstack/react-query";
import React, { memo } from "react";
// import { getAllTimetables } from "../../services/api/calls/getApis";
import Loader from "../../shared/Loader";
import useTimeTableSectionOverview from "../../hooks/useTimeTableSectionOverview";
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const TimetableSection: React.FC = () => {
  const {
    timeTablebyClass,
    timeTables,
    // activeClassID,
    // setActiveClassID,
    isLoading,
    isError,
    error,
  } = useTimeTableSectionOverview();
  //....................................................
  if (isLoading) {
    return <Loader />;
  }
  if (isError) {
    return <div className="w-6/6 text-center mt-[20%]">{error?.message}</div>;
  }
  return (
    <div className="rounded-t-[30px] flex flex-col gap-0 md:gap-5 pt-[20px] md:pt-0 md:mt-[30px] md:px-[30px] bg-white">
      {!isLoading && !isError && timeTables && timeTables.length > 0 ? (
        timeTablebyClass.map((timeTable, index) => (
          <div key={index} className="timetable-section">
            <div className="timetable">
              <h3 className="timetable-header">
                <span className="hidden md:inline-block">Class</span> Timetable
              </h3>

              <div className="flex flex-col gap-3">
                <h4 className="text-clr1 timetable-header block md:hidden">
                  CLASS
                </h4>

                <div className="timetable-wrapper">
                  <table className="w-full bg-white">
                    <thead>
                      <tr>
                        <th className="table-header">Time</th>
                        {daysOfWeek.map((day, index) => (
                          <th key={index} className="table-header">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {timeTable &&
                        timeTable.timetable.map(
                          (period: ClassPeriod, index: number) => {
                            const [time] = Object.keys(period);
                            const [subjects] = Object.values(period);

                            return (
                              <tr key={index}>
                                <td className="table-data border-[0.1px] border-black">
                                  {time}
                                </td>
                                {subjects.map(
                                  (subject: string | null, index: number) => (
                                    <td
                                      key={index}
                                      className={`table-data ${
                                        subject && !subject.includes("BREAK")
                                          ? "border-[0.1px] border-black"
                                          : "font-bold"
                                      }`}
                                    >
                                      {subject}
                                    </td>
                                  )
                                )}
                              </tr>
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="w-6/6 text-center mt-[20%]">
          Timetable is not available at the moment
        </div>
      )}
    </div>
  );
};

export default memo(TimetableSection);
