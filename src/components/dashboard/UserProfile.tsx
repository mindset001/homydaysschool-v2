import React, { useEffect } from "react";
import { userGuardWardDataI, UserInterface } from "../../types/user.type";
import Loader from "../../shared/Loader";
import { useData } from "../../hooks/UseUserContext";
interface Props {
  user: UserInterface;
  toggleProfile: boolean;
  setToggleProfile: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string;
  role: string;
  guardianWard: userGuardWardDataI;
  isGuardianWardLoading: boolean;
  // guadianWardError: string;
  isGuardianWardError: boolean;
}

const UserProfile: React.FC<Props> = ({
  user,
  guardianWard,
  isGuardianWardLoading,
  setToggleProfile,
  // guadianWardError,
  isGuardianWardError,
  role,
  toggleProfile,
  profileImage,
}) => {
  // const {
  //   activeClassID,
  //   setActiveClassID,
  // } = useTimeTableSectionOverview();

  const { setGuardianActiveClassID, setGuardianActiveStudentID } = useData();
  useEffect(() => {
    if (
      role.toLowerCase() === "guardian" &&
      !isGuardianWardLoading &&
      !isGuardianWardError &&
      guardianWard &&
      guardianWard.students &&
      guardianWard.students.length > 0
    ) {
      const { student_class_id, id } = guardianWard.students[0];
      // guard against undefined by defaulting to 0
      setGuardianActiveClassID(student_class_id ?? 0);
      setGuardianActiveStudentID((prev) => ({
        ...prev,
        id: id,
        isUserLoading: isGuardianWardError ? false : true,
      }));
    }

    setGuardianActiveStudentID((prev) => ({
      ...prev,
      isUserLoading: isGuardianWardLoading ? true : false,
    }));
  }, [guardianWard, guardianWard.students, isGuardianWardError, isGuardianWardLoading, role, setGuardianActiveClassID, setGuardianActiveStudentID]);
  return (
    <div
      className={`text-[14px] absolute top-[50px] md:top-[60px] xl:top-[70px] 2xl:top-[75px] bg-white shadow-shadow1 rounded-lg -right-2 w-[240px] md:w-[250px] lg:w-[300px] overflow-hidden ${
        toggleProfile ? "block" : "hidden"
      }`}
    >
      <div className="flex flex-row gap-2 bg-[#05878F]/90 text-white items-center p-3">
        <div className="rounded-full border-[white] border-[3px] border-solid size-[44px] 2xl:size-[55px] overflow-hidden">
          <img src={profileImage} alt={`${user.lastName} ${user.firstName}`} />
        </div>
        <div>
          <div className="my-1 text-base leading-[15px] font-bold">{`${user.lastName} ${user.firstName}`}</div>
          <div className="flex flex-row items-center gap-2">
            <div
              className={`rounded-full size-[10px] ${
                user.is_active ? "bg-green-400" : "bg-red-500"
              }`}
            ></div>
            <div>{user.is_active ? "Active" : "Inactive"}</div>
          </div>
        </div>
      </div>
      <div className="m-3">
        <div>
          <span className="font-medium mr-1 ">Email Addr.: </span>
          <span>{user.email}</span>
        </div>
        <div>
          <span className="font-medium mr-1 ">Phone No: </span>
          <span>{user.phoneNumber}</span>
        </div>
        <div>
          <span className="font-medium mr-1 ">Role: </span>
          <span>
            {user.role.charAt(0).toUpperCase() +
              user.role.slice(1).toLowerCase()}
          </span>
        </div>
      </div>
      {role.toLowerCase() === "guardian" && (
        <div className="mx-4 my-3">
          <hr className="" />
          <div className="mt-3">
            <div className="font-bold text-center text-[16px] mb-2">
              List of Wards
            </div>
            <div className="flex flex-col w-full overflow-y-auto max-h-36">
              {isGuardianWardLoading ? (
                <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center md:items-start w-full">
                  <Loader />
                </div>
              ) : isGuardianWardError ? (
                <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center">
                  <span>Error fetching data</span>
                </div>
              ) : (
                // normalize to array in case hook ever returns undefined
                (Array.isArray(guardianWard.students) ? guardianWard.students : []).length > 0 ? (
                  (guardianWard.students || []).map((wards, index) => {
                    const first = wards.firstName || wards.first_name || '';
                    const last = wards.lastName || wards.last_name || '';
                    const middle = wards.middleName || wards.middle_name || '';
                    const classId = wards.student_class_id ?? wards.studentClassId;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setGuardianActiveClassID(classId ?? 0);
                          setGuardianActiveStudentID((prev) => ({
                            ...prev,
                            id: wards.id,
                            isUserLoading: isGuardianWardLoading ? true : false,
                          }));
                          setToggleProfile(false);
                        }}
                        className="border-solid border-black p-[6px] border rounded-md my-1 hover:bg-slate-500 hover:text-white hover:border-slate-500"
                      >{`${last} ${first} ${middle}`}</button>
                    );
                  })
                ) : (
                  <div className="font-Lora text-center my-[10px] lg:my-[15px] text-[15px] md:text-base">
                    Data Not Available
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
