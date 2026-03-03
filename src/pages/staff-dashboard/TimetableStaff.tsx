// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useQuery } from "@tanstack/react-query";
// import Loader from "../../shared/Loader";
// import { MobileHeader } from "../guardian-dashboard/Profile";
// import { getAllTimetables } from "../../services/api/calls/getApis";

// interface ClassPeriod {
//   [key: string]: string[]; // Dynamic string keys, with the value being an array of strings
// }

// const daysOfWeek: string[] = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
// ];

// const timePeriods: string[] = [
//   "8:20 am -9:00 am",
//   "9:00 am -9:40 am",
//   "9:40 am -10:20 am",
//   "10:20 am -10:50 am", // Optional breaks can be added manually
//   "10:50 am -11:30 am",
//   "11:30 am -12:10 pm",
//   "12:10 pm -12:50 pm",
//   "12:50 pm -1:00 pm", // Optional breaks can be added manually
//   "1:00 pm -1:40 pm",
//   "1:40 pm -2:20 pm",
// ];

// // Function to map periods for each day

// export const Timetable = ({
//   daysOfWeek,
//   timeTable,
// }: {
//   daysOfWeek: DaysOfWeek;
//   timeTable: { id: string; name: string; timetable: any };
// }) => {
//   return (
//     <div className="timetable-section-1">
//       <div className="timetable">
//         <div className="flex flex-col items-center justify-center gap-0.5 md:gap-3">
//           <h4 className="text-clr1 timetable-header block md:hidden">
//             First Term
//           </h4>

//           <div className="timetable-header-1-box">
//             <h4 className="timetable-header-1">{timeTable.name} Timetable</h4>
//           </div>

//           <div className="timetable-wrapper-1">
//             <table className="w-full bg-white">
//               <thead>
//                 <tr>
//                   <th className="table-header">Time</th>
//                   {daysOfWeek.map((day, index) => (
//                     <th key={index} className="table-header">
//                       {day}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {timeTable.timetable.map(
//                   (period: ClassPeriod, index: number) => {
//                     const [time] = Object.keys(period);
//                     const [subjects] = Object.values(period);

//                     return (
//                       <tr key={index}>
//                         <td className="table-data border-[0.1px] border-black">
//                           {time}
//                         </td>
//                         {subjects ? (
//                           subjects.map(
//                             (subject: string | null, index: number) => (
//                               <td
//                                 key={index}
//                                 className={`table-data ${
//                                   subject && !subject.includes("LUNCH")
//                                     ? "border-[0.1px] border-black"
//                                     : "font-bold"
//                                 }`}
//                               >
//                                 {subject}
//                               </td>
//                             )
//                           )
//                         ) : (
//                           <div className="w-6/6 text-center mt-[20%]">
//                             No subject(s) available at the moment
//                           </div>
//                         )}
//                       </tr>
//                     );
//                   }
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TimetablesStaff = () => {
//   function transformTimetable(backendData: any): ClassPeriod[] {
//     const classPeriods: ClassPeriod[] = timePeriods.map((timePeriod, index) => {
//       const periodObject: ClassPeriod = {}; // Initialize as ClassPeriod type
//       periodObject[timePeriod] = daysOfWeek.map((day) => {
//         // Find the relevant data for the current day
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const dayData = backendData.find((item: any) => item.days === day);

//         // Based on the index, return the correct period (first_period, second_period, etc.)
//         switch (index) {
//           case 0:
//             return dayData?.first_period || null;
//           case 1:
//             return dayData?.second_period || null;
//           case 2:
//             return dayData?.third_period || null;
//           case 3:
//             return "LUNCH";
//           case 4:
//             return dayData?.fourth_period || null;
//           case 5:
//             return dayData?.fifth_period || null;
//           case 6:
//             return dayData?.eight_period || null;
//           case 7:
//             return "LUNCH";
//           case 8:
//             return dayData?.nineth_period || null;
//           case 9:
//             return dayData?.tenth_period || null;
//           default:
//             return null;
//         }
//       });
//       return periodObject;
//     });

//     return classPeriods;
//   }

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ["calender"],
//     queryFn: () => getAllTimetables(),
//   });
//   const timeTables: [] =
//     !isLoading &&
//     !isError &&
//     data &&
//     data.data.data.map((timeTable: any) => ({
//       ...timeTable,
//       timetable: transformTimetable(timeTable.timetable), // Format the date string
//     }));
//   isError && console.log(error);
//   console.log(timeTables);
//   if (isLoading) {
//     <Loader />;
//   }
//   if (isError) {
//     <div className="w-6/6 text-center mt-[20%]">{error.message}</div>;
//   }
//   return (
//     <section className=" bg-[linear-gradient(259.46deg,_#05878F_10.76%,_rgba(5,_135,_143,_1)_107.57%)] md:bg-none">
//       <MobileHeader title="Timetable" subtitle="JSS 1A" />

//       <div className="rounded-t-[30px] flex flex-col gap-0 md:gap-5 pt-[20px] md:pt-0 md:mt-[30px] md:px-[30px] bg-white">
//         {timeTables.length ? (
//           timeTables.map((item, index) => (
//             <Timetable key={index} daysOfWeek={daysOfWeek} timeTable={item} />
//           ))
//         ) : (
//           <div className="w-6/6 text-center mt-[20%]">
//             Timetable is not available at the moment
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default TimetablesStaff;
