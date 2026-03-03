/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getAllTimetables } from "../services/api/calls/getApis";
import { useData } from "./UseUserContext";
// import { getAllTimetables } from "../../services/api/calls/getApis";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timePeriods: string[] = [
  "8:20 am -9:00 am",
  "9:00 am -9:40 am",
  "9:40 am -10:20 am",
  "10:20 am -10:50 am", // Optional breaks can be added manually
  "10:50 am -11:30 am",
  "11:30 am -12:10 pm",
  "12:10 pm -12:50 pm",
  "12:50 pm -1:00 pm", // Optional breaks can be added manually
  "1:00 pm -1:40 pm",
  "1:40 pm -2:20 pm",
];

interface Timetable {
  id: number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timetable: any[]; // This should be more specific based on your API response
}

interface ApiResponse {
  data: {
    data: Timetable[];
  };
}
export interface useTimeTableSectionOverviewI {
  timeTablebyClass: any[];
  timeTables: any[];
  //   setActiveClassID: React.Dispatch<React.SetStateAction<number>>;
  //   activeClassID: number;
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
}
// return [timeTablebyClass, activeClassID, setActiveClassID, isLoading, isError, error]
const useTimeTableSectionOverview = (): useTimeTableSectionOverviewI => {
  //   const [activeClassID, setActiveClassID] = useState<number>(45);
  const { guardianActiveClassID } = useData();
  const { data, isLoading, isError, error } = useQuery<ApiResponse, Error>({
    queryKey: ["calender"],
    queryFn: () => getAllTimetables(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformTimetable = useCallback((backendData: any): ClassPeriod[] => {
    console.log("Fetched data", backendData);
    const classPeriods: ClassPeriod[] =
      backendData &&
      timePeriods.map((timePeriod, index) => {
        const periodObject: ClassPeriod = {}; // Initialize as ClassPeriod type
        periodObject[timePeriod] =
          daysOfWeek &&
          daysOfWeek.map((day) => {
            // Find the relevant data for the current day
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dayData = backendData.find((item: any) => item.days === day);

            // Based on the index, return the correct period (first_period, second_period, etc.)
            switch (index) {
              case 0:
                return dayData?.first_period || null;
              case 1:
                return dayData?.second_period || null;
              case 2:
                return dayData?.third_period || null;
              case 3:
                return "LUNCH";
              case 4:
                return dayData?.fourth_period || null;
              case 5:
                return dayData?.fifth_period || null;
              case 6:
                return dayData?.eight_period || null;
              case 7:
                return "LUNCH";
              case 8:
                return dayData?.nineth_period || null;
              case 9:
                return dayData?.tenth_period || null;
              default:
                return null;
            }
          });
        // console.log("Period Object...", periodObject);
        return periodObject;
      });
    console.log("Class Period...", classPeriods);
    return classPeriods;
  }, []);

  const timeTables: any[] = useMemo(
    () =>
      (data &&
        data.data.data.map((timeTable: any) => ({
          ...timeTable,
          timetable: transformTimetable(timeTable.timetable), // Format the date string
        }))) ||
      [],
    [data, transformTimetable]
  );
  console.log(
    "Time Table by classIddddddddddd..........",
    guardianActiveClassID
  );
  const timeTablebyClass = useMemo(() => {
    return timeTables.filter(
      (timetable: any) => timetable.id === guardianActiveClassID
    );
  }, [guardianActiveClassID, timeTables]);
  //   console.log("Time Table by class..........", timeTablebyClass);

  return {
    timeTablebyClass,
    timeTables,
    // activeClassID,
    // setActiveClassID,
    isLoading,
    isError,
    error,
  };
};

export default useTimeTableSectionOverview;
