import React, { useCallback, useEffect, useMemo, useState } from "react";
import CircularProgressBar from "../../../components/dashboard/CircularProgressBar";
import {
  PathDown,
  PathRight,
  PathUp,
} from "../../../assets/images/dashboard/students";
import GuardianSVG from "../../../components/svg/GuardianSVG";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClassStatId, getStaff, getClassStudentsId } from "../../../services/api/calls/getApis";
import Loader from "../../../shared/Loader";
import useClasses from "../../../hooks/useClasses";
import { getRole } from "../../../utils/authTokens";

// interface classesInterface {
//   id: number;
//   name: string;
//   abbreviation: string;
//   base_class: number;
// }
interface classTuitionPercentInterface {
  id: number;
  class: string;
  completed: number;
  total: number;
  incomplete: number;
  void: number;
}
const StudentAdminOverview: React.FC = () => {
  // keep the id as a string since the backend expects a Mongo ObjectId
  const [studentDropDown, setStudentDropDown] = useState<{
    class: string;
    id: string;
  }>({ class: "", id: "" });
  // const [studentDropDownId, setStudentDropDownId] = useState<number>(0);
  // const [classNameData, setClassNameData] = useState<classesInterface[]>([]);
  const [classTuitionPercent, setClassTuitionPercent] =
    useState<classTuitionPercentInterface>({
      id: 0,
      class: "",
      completed: 0,
      total: 0,
      incomplete: 0,
      void: 0,
    });
  // GETTING CLASS Data
  const { classNameData, isClassError, isClassLoading } = useClasses();

  // if the logged in user is a teacher, fetch their staff profile to
  // determine assigned class(es)
  const role = getRole() as string;
  const navigate = useNavigate();

  const { data: staffData } = useQuery({
    queryKey: ["myStaff"],
    queryFn: getStaff,
    enabled: role.toLowerCase() === "staff",
    retry: 2,
  });

  // if teacher has classes, pre-select first one; no redirect needed
  useEffect(() => {
    if (
      role.toLowerCase() === "staff" &&
      !studentDropDown.id &&
      staffData?.data?.staff?.classes?.length &&
      classNameData.length > 0
    ) {
      const className = staffData.data.staff.classes[0];
      const cls = classNameData.find((c) => c.name === className);
      if (cls) {
        setStudentDropDown({ class: cls.name, id: cls.id });
      }
    }
  }, [role, staffData, classNameData, studentDropDown.id]);
  // const {
  //   data: classData,
  //   isError: isClassError,
  //   error: classError,
  //   isLoading: isClassLoading,
  // } = useQuery({
  //   queryKey: ["class"],
  //   queryFn: () => getClass(),
  // });
  // const classes: classesInterface[] = useMemo(() => {
  //   return (classData && classData.data.data) || [];
  // }, [classData]);
  useEffect(() => {
    // classes.length > 0 && setClassNameData(classes);
    console.log(
      "Class Data:",
      // classNameData,
      studentDropDown.class,
      studentDropDown.id
      // isClassError,
      // classError,
      // isClassLoading
    );
  }, [
    // classes,
    // classError,
    // isClassError,
    // isClassLoading,
    // classNameData,
    studentDropDown.class,
    studentDropDown.id,
  ]);

  // GETTING CLASS STATS STUDENT SECTION Data by ID
  const {
    data: classStatData,
    isError: isClassStatError,
    error: classStatError,
    isLoading: isClassStatLoading,
  } = useQuery({
    queryKey: ["classStat", studentDropDown.id],
    queryFn: () => getClassStatId(studentDropDown.id),
    enabled: studentDropDown.id !== "",
  });

  // optional: fetch list of students in current class
  const {
    data: classStudentsData,
    isError: isClassStudentsError,
    isLoading: isClassStudentsLoading,
  } = useQuery({
    queryKey: ["classStudents", studentDropDown.id],
    queryFn: () => getClassStudentsId(studentDropDown.id),
    enabled: studentDropDown.id !== "",
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });

  interface classStudentIdI {
    id: number;
    student_class: string;
    guardian_email: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    // optional camelCase variants
    firstName?: string;
    lastName?: string;
    middleName?: string;
    image: string;
    date_of_birth: string;
    gender: string;
    tuition_paid: number;
    tuition_balance: number;
    fathers_name: string;
    mothers_name: string;
    fathers_contact: string;
    mothers_contact: string;
    fathers_occupation: string;
    mothers_occupation: string;
    home_address: string;
    state_of_origin: string;
    home_town: string;
    country: string;
    starter_pack_collected: boolean;
    religion: string;
    total_tuition_paid: number;
    schoolclass: number;
    guardian: number;
  }

  const classStudents: classStudentIdI[] = useMemo(() => {
    if (
      !classStudentsData ||
      !classStudentsData.data ||
      !Array.isArray(classStudentsData.data.students)
    ) {
      return [];
    }
    return classStudentsData.data.students;
  }, [classStudentsData]);
  interface classStatsInterface {
    id: number;
    class: string;
    paid: number;
    total: number;
    paid_half: number;
    paid_nothing: number;
    starterpack_collected: number;
  }

  const classStats: classStatsInterface = useMemo(() => {
    if (!classStatData || !classStatData.data) {
      return {
        id: 0,
        class: '',
        paid: 0,
        total: 0,
        paid_half: 0,
        paid_nothing: 0,
        starterpack_collected: 0,
      };
    }
    // Backend returns { classStat: {...} }
    return classStatData.data.classStat || {};
  }, [classStatData]);

  const {
    id,
    class: className,
    paid,
    total,
    paid_half,
    paid_nothing,
  } = classStats;
  const calculatePercentage = useCallback(
    (value: number) => {
      if (!total) return 0;
      const percentage = (value / total) * 100;
      return Number(percentage.toFixed(2)) || 0;
    },
    [total]
  );
  useEffect(() => {
    classStats &&
      setClassTuitionPercent({
        id: id,
        class: className,
        completed: calculatePercentage(paid),
        total: total,
        incomplete: calculatePercentage(paid_half),
        void: calculatePercentage(paid_nothing),
      });
    console.log(
      "Class Stats Total:",
      classStats,
      isClassStatError,
      classStatError,
      isClassStatLoading
    );
    isClassStatError && console.error(classStatError);
  }, [
    calculatePercentage,
    className,
    classStatError,
    classStats,
    id,
    isClassStatError,
    isClassStatLoading,
    paid,
    paid_half,
    paid_nothing,
    total,
  ]);

  // navigate is used above for staff redirect
  // const navigate = useNavigate();
  return (
    <div className="student-overview">
      <div className="student-overview-header">Students</div>
      <div className="student-overview-class-container flex-grow">
        {role.toLowerCase() === "staff" &&
          staffData?.data?.staff &&
          Array.isArray(staffData.data.staff.classes) &&
          staffData.data.staff.classes.length === 0 && (
            <div className="text-center text-gray-500 w-full py-4">
              Teacher is not a class teacher
            </div>
          )}
        {/* if staff, hide class tiles and instead show student list for pre-selected class */}
        {role.toLowerCase() === "staff" &&
        staffData?.data?.staff?.classes?.length > 0 ? (
          // we rely on studentDropDown being set via effect above
          <div className="w-full">
            {isClassStudentsLoading ? (
              <Loader />
            ) : isClassStudentsError ? (
              <div className="text-center text-red-500">Error loading students</div>
            ) : classStudents.length === 0 ? (
              <div className="text-center">No students in your class.</div>
            ) : (
              <ul className="divide-y">
                {classStudents.map((s, idx) => (
                  <li key={idx} className="py-2">
                    {s.last_name || ""} {s.first_name || ""} {s.middle_name || ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : isClassLoading ? (
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
              <div
                key={index}
                className={`student-overview-class ${
                  studentDropDown.class === classdata.name
                    ? "max-h-[72px] md:max-h-full"
                    : "max-h-[72px]"
                }`}
              >
                <button
                  onClick={() => {
                    setStudentDropDown({
                      id: classdata.id, // already a string/objectId
                      class:
                        studentDropDown.class === classdata.name
                          ? ""
                          : classdata.name,
                    });
                    !window.matchMedia("(min-width: 768px)").matches &&
                      navigate(classdata.name.toLowerCase());
                  }}
                  className="min-w-full flex flex-row justify-between items-center cursor-pointer"
                >
                  <div
                    className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                      studentDropDown.class === classdata.name
                        ? "text-black md:text-[#05878F]"
                        : "text-black"
                    }`}
                  >
                    {classdata.name}
                  </div>
                  <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                    <img
                      src={
                        studentDropDown.class === classdata.name
                          ? PathUp
                          : PathDown
                      }
                      alt={`${
                        studentDropDown.class === classdata.name
                          ? "arrow up"
                          : "arrow down"
                      }`}
                      className="hidden md:block size-full object-contain object-center"
                    />
                    <img
                      src={PathRight}
                      alt="arrow right"
                      className="block md:hidden size-full object-contain object-center"
                    />
                  </div>
                </button>

                <div
                  className={`mt-[25px]  static md:relative ${
                    studentDropDown.class === classdata.name
                      ? "hidden md:block"
                      : "hidden"
                  }`}
                >
                  {isClassStatLoading ? (
                    <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center w-full">
                      <Loader />
                    </div>
                  ) : isClassStatError ? (
                    <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center ">
                      <span>Error fetching data</span>
                    </div>
                  ) : (
                    <>
                      <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                        <div>TOTAL</div>
                        <div>{classTuitionPercent.total}</div>
                      </div>
                      {classTuitionPercent.total === 0 ? (
                        <div className="text-center font-Poppins text-sm text-gray-500 py-4">
                          No students in this class yet.
                          <br />
                          <span className="text-xs">Add students to see payment statistics.</span>
                        </div>
                      ) : (
                        <div className="flex flex-row justify-between">
                          <div>
                            <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                              COMPLETED
                            </div>
                            <div className="font-Poppins">
                              <CircularProgressBar
                                style={{
                                  percentage: classTuitionPercent.completed,
                                  textSize: 9.21,
                                  textColor: "rgba(41,204,151,1)",
                                  fontWeight: 600,
                                  pathColor: "rgba(41,204,151,1)",
                                  trailColor: "rgba(234,250,245)",
                                  weight: 7,
                                  size: 61.39,
                                }}
                              />
                            </div>
                          </div>
                          <div className="mx-[30px]">
                            <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                              INCOMPLETE
                            </div>
                            <div className="font-Poppins">
                              <CircularProgressBar
                                style={{
                                  percentage: classTuitionPercent.incomplete,
                                  textSize: 9.21,
                                  textColor: "#98654F",
                                  fontWeight: 600,
                                  pathColor: "#98654F",
                                  trailColor: "#F5F0ED",
                                  weight: 7,
                                  size: 61.39,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                              VOID
                            </div>
                            <div className="font-Poppins">
                              <CircularProgressBar
                                style={{
                                  percentage: classTuitionPercent.void,
                                  textSize: 9.21,
                                  textColor: "#FF2E2E",
                                  fontWeight: 600,
                                  pathColor: "#FF2E2E",
                                  trailColor: "#FFEAEA",
                                  weight: 7,
                                  size: 61.39,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {/* show student list below stats when a class is selected */}
                      {studentDropDown.id && (
                        <div className="mt-4">
                          {isClassStudentsLoading ? (
                            <div className="font-Lora text-center">
                              <Loader />
                            </div>
                          ) : isClassStudentsError ? (
                            <div className="font-Lora text-center text-red-500">
                              Error loading students
                            </div>
                          ) : classStudents.length > 0 ? (
                            <div>
                              <div className="font-bold mb-2">Students</div>
                              <ul className="list-disc list-inside text-sm max-h-[120px] overflow-y-auto">
                                {classStudents.map((s) => (
                                  <li key={s.id} className="py-1">
                                    {s.last_name || s['lastName'] || ""} {s.first_name || s['firstName'] || ""} {s.middle_name || s['middleName'] || ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 text-sm">
                              No students in this class.
                            </div>
                          )}
                        </div>
                      )}

                      <Link
                        to={classdata.name.toLowerCase()}
                        className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
                      >
                        <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                          <GuardianSVG />
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentAdminOverview;
