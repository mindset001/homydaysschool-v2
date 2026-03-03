import React from "react";
import { PathRight } from "../../../assets/images/dashboard/students";
import { Link, useOutletContext } from "react-router-dom";
import { profileImage } from "../../../assets/images/users";
import Loader from "../../../shared/Loader";
import { AxiosResponse } from "axios";

const StudentAdminNamesOverviewMobile: React.FC = () => {
  // interface classStudentIdI {
  //   id: number;
  //   student_class: string;
  //   guardian_email: string;
  //   first_name: string;
  //   last_name: string;
  //   middle_name: string;
  //   image: string;
  //   date_of_birth: string;
  //   gender: string;
  //   fathers_name: string;
  //   mothers_name: string;
  //   fathers_contact: string;
  //   mothers_contact: string;
  //   fathers_occupation: string;
  //   mothers_occupation: string;
  //   home_address: string;
  //   state_of_origin: string;
  //   home_town: string;
  //   country: string;
  //   starter_pack_collected: boolean;
  //   religion: string;
  //   total_tuition_paid: number;
  //   schoolclass: number;
  //   guardian: number;
  // }
  interface Student {
    fathers_contact: string;
    guardian_email: string;
    starter_pack: string;
    gender: string;
    age: number;
    id: number;
    image: string;
    full_name: string;
    class: string;
  }
  interface StudentContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    classStudentsIdData: AxiosResponse<any, any> | undefined;
    studentData: Student[];
    isClassLoading: boolean;
    isClassStudentsIdLoading: boolean;
    isClassError: boolean;
    isClassStudentsIdError: boolean;
  }
  const {
    classStudentsIdData,
    studentData,
    isClassLoading,
    isClassStudentsIdLoading,
    isClassError,
    isClassStudentsIdError,
  } = useOutletContext<StudentContext>();
  return (
    // Mobile view contd, because it routes between student database.
    <div className="mt-[50px]">
      {isClassLoading || isClassStudentsIdLoading ? (
        <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center md:items-start w-full">
          <Loader />
        </div>
      ) : isClassError || isClassStudentsIdError ? (
        <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center md:items-start">
          <span>Error fetching data</span>
        </div>
      ) : classStudentsIdData &&
        Array.isArray(classStudentsIdData.data.students) ? (
        studentData?.map((data, index) => (
          <Link
            to={data.id.toString()}
            key={index}
            className=" w-full p-[5px] shadow-[0px_8px_26px_0px_#046A7E2B] bg-white mb-[40px] ml:mb-[50px] rounded-[20px] flex flex-row justify-between items-center"
          >
            <div className="max-w-[50px] size-[50px] max-h-[50px] rounded-full overflow-hidden">
              <img
                src={data.image || profileImage}
                alt="student image"
                className="size-full object-cover object-center"
                onError={(e) => (e.currentTarget.src = profileImage)}
              />
            </div>
            <div className="font-Lora text-base leading-[20.48px] font-bold text-black mx-2">
              {/* {window.matchMedia("(min-width: 425px)").matches &&
              data.name.length > 25
                ? data.name.slice(0, 22) + "..."
                : window.matchMedia("(max-width: 425px)").matches &&
                  data.name.length > 15
                ? data.name.slice(0, 15) + "..."
                : data.name} */}
              <div className="max-w-[150px] ml:max-w-[100%] whitespace-nowrap overflow-hidden text-ellipsis">
                {data.full_name}
              </div>
            </div>
            <div className="max-w-[8.17px] h-[15px] mr-[17px]">
              <img
                src={PathRight}
                alt="arrow right"
                className="block md:hidden size-full object-contain object-center"
              />
            </div>
          </Link>
        ))
      ) : (
        <div className="font-Lora text-center font-bold my-[10px] lg:my-[15px]">
          Data Not Available
        </div>
      )}
    </div>
  );
};

export default StudentAdminNamesOverviewMobile;
