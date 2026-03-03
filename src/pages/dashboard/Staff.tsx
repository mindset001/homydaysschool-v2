import React, { useEffect, useMemo, useState } from "react";
import { IProfile } from "../../types/user.type";
import { Add, FilterMobile } from "../../assets/images/dashboard/students";
import UserDetails from "../../shared/UserDetails";
import useClasses from "../../hooks/useClasses";
import Pagination from "../../shared/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCreateStaff } from "../../services/api/staffApis";
import Loader from "../../shared/Loader";
import SlidePanel from "../../shared/SlidePanel";
import AddStaffForm, { AddStaff } from "./AddStaffForm";
import { getStaffs } from "../../services/api/calls/getApis";
import { showErrorToast, showSuccessToast } from "../../shared/ToastNotification";
import { getRole } from "../../utils/authTokens";
import { profileImage } from "../../assets/images/users";

const Staff: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["staffs"],
    queryFn: () => getStaffs(),
  });
  
  const { classNameData: classOptions } = useClasses();

  const staffs: IProfile[] = useMemo(() => {
    if (!data || !data.data) {
      console.log('No staff data available');
      return [];
    }
    
    console.log('Staff data received:', data.data);
    
    // Backend returns { staff: [...] }
    const staffList = data.data.staff;
    if (!Array.isArray(staffList)) {
      console.log('Staff is not an array:', staffList);
      return [];
    }
    
    // Map backend staff structure to frontend structure
    return staffList.map((staff: any) => {
      let classesString = '';
      if (Array.isArray(staff.classes) && staff.classes.length > 0) {
        classesString = staff.classes
          .map((cid: string) => {
            const cls = classOptions.find((c) => c.id === cid);
            return cls ? cls.name : cid;
          })
          .join(', ');
      }
      return {
        id: staff._id || staff.id,
        first_name: staff.userId?.firstName || '',
        last_name: staff.userId?.lastName || '',
        middle_name: staff.middleName || '',
        age: staff.age || '0',
        image: staff.userId?.profileImage || profileImage,
        subject: staff.subjects?.join(', ') || staff.department || '',
        date_of_birth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : '',
        gender: staff.gender || '',
        phone_number: staff.userId?.phoneNumber || '',
        homeAddress: staff.address || '',
        email: staff.userId?.email || '',
        homeTown: '',
        stateOfOrigin: '',
        classTeacher: classesString,
        qualification: staff.qualification?.join(', ') || '',
      };
    });
  }, [data, classOptions]);
  
  // CONSOLE LOGGING ERROR IF REQUEST FAILS
  isError && console.log('Error fetching staff:', error);
  // const [selectedGender, setSelectedGender] = useState('');
  const [staffProfile, setStaffProfile] = useState<IProfile>({
    first_name: "",
    last_name: "",
    age: "",
    image: "",
    subject: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    homeAddress: "",
    email: "",
    homeTown: "",
    stateOfOrigin: "",
    classTeacher: "",
    qualification: "",
  });
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<IProfile[]>(
    staffs ? staffs : []
  );

  // Use useEffect to set the first staff profile once data is available
  useEffect(() => {
    setFilteredData(staffs);

    if (staffs.length > 0) {
      setStaffProfile(staffs[0]);
    }
  }, [staffs]);

  const filterByGender = (gender: string) => {
    if (gender === "") {
      setFilteredData(staffs);
      setIsFiltering(false);
    } else {
      setFilteredData(staffs.filter((item) => item.gender === gender));
      setIsFiltering(false);
    }
  };

  const handleNext = () => {
    filteredData.forEach((element: IProfile, index: number) => {
      element.first_name === staffProfile.first_name &&
        index <= staffs.length &&
        setStaffProfile({ ...staffs[index + 1] });
    });
  };
  const handlePrev = () => {
    filteredData.forEach((element: IProfile, index: number) => {
      element.first_name === staffProfile.first_name &&
        index >= 1 &&
        setStaffProfile({ ...staffs[index - 1] });
    });
  };
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);
  const { mutate, isPending: isCreatingUser } = useCreateStaff();

  const handleAddStaff = (newStaff: Partial<AddStaff>) => {
    mutate(newStaff, {
      onSuccess: (response: { data: AddStaff }) => {
        queryClient.invalidateQueries({ queryKey: ["staffs"] });
        const userdata = response.data;
        if (userdata) {
          console.log(userdata);
        }
        showSuccessToast("Staff created successfully!")
      },
      onError: (error: Error) => {
        showErrorToast(`Error creating user ${error.message}`);
        // alert(`Error creating user ${error.message}` );
        console.error("Error creating user", error);
      },
    });
    setIsSliderOpen(false);
    console.log(newStaff);
  };
  if (isLoading || isCreatingUser) {
    return <Loader />;
  }
  return (
    <>
      <div className="staff">
        <div className="staff-header">Staff</div>
        <div className="staff-sub-header">
          <p>Staff Database</p>
        </div>

        <div className="staff-container">
          <div className="staffs">
            <div className="staffs-header">
              <h1 className="staff-heading">Staff</h1>
              {filteredData.length && (
                <h2 className="total">
                  TOTAL :- <span>{filteredData.length}</span>
                </h2>
              )}
              <div className="flex items-center gap-[20px]">
                {staffs.length && (
                  <div className="filter">
                    <button
                      onClick={() => setIsFiltering(!isFiltering)}
                      className="mr-[10px] flex items-center lg:mr-[15px] xl:mr-[20px]"
                    >
                      <img
                        src={FilterMobile}
                        alt="filter"
                        className="object-contain object-center size-full w-[19.54px] h-auto mr-[5px] my-auto"
                      />
                      <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                        Filter
                      </div>
                    </button>
                    <div
                      className={`genders ${
                        isFiltering ? "flex flex-col" : "hidden"
                      }`}
                    >
                      <button onClick={() => filterByGender("")}>All</button>
                      <button onClick={() => filterByGender("male")}>
                        Male
                      </button>
                      <button onClick={() => filterByGender("female")}>
                        Female
                      </button>
                    </div>
                  </div>
                )}
                {getRole() === "admin" && (
                  <button
                    className="add-btn flex items-center"
                    onClick={() => setIsSliderOpen(true)}
                  >
                    <img
                      src={Add}
                      alt="add"
                      className="object-contain object-center size-full max-w-[15px]  h-auto mr-[5px]"
                    />

                    <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                      Add
                    </div>
                  </button>
                )}
              </div>
            </div>
            {filteredData.length ? (
              <>
                <div className="cards">
                  {filteredData &&
                    filteredData.map((staff: IProfile, index: number) => (
                      <div key={index} className="staff-card hsm-normal-btn">
                        <img
                          src={staff?.image || profileImage}
                          onError={(e) =>
                            (e.currentTarget.src = profileImage)
                          }
                          alt={staff?.first_name}
                          className="rounded-full scale-[1.1] w-[50px] h-[50px] "
                        />
                        <div
                          className={`staff-card-details ${
                            staff?.first_name === staffProfile?.first_name
                              ? "text-[#05878F]"
                              : ""
                          }`}
                        >
                          <h3 className="staff-card-name">
                            {staff?.first_name} {staff?.last_name}
                          </h3>
                          <h5 className="staff-card-subject">
                            {staff?.subject}
                          </h5>
                          <button
                            className="staff-card-btn"
                            onClick={() => {
                              setStaffProfile(staff);
                              console.log(staffProfile);
                            }}
                          >
                            View profile
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="staffs-pagination">
                  <Pagination next={handleNext} prev={handlePrev} />
                </div>
              </>
            ) : (
              <div className="w-6/6 text-center mt-[20%]">
                No staff(s) available at the moment
              </div>
            )}
          </div>
          {filteredData.length && (
            <>
              <div className="staff-details">
                <h1 className="staff-profile">Staffs Profile</h1>
                <UserDetails user={staffProfile} />
              </div>
              <div className="pagination w-full flex md:hidden justify-between px-[50px] pb-[20px]">
                <Pagination next={handleNext} prev={handlePrev} />
              </div>
            </>
          )}
        </div>
      </div>

      <SlidePanel isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)}>
        <h2 className="my-[20px] text-center text-[#05878F] font-Poppins text-[15px]">
          Add New Staff
        </h2>
        <AddStaffForm
          onSubmit={handleAddStaff}
          // onClose={() => setIsSliderOpen(false)}
        />
      </SlidePanel>
    </>
  );
};

export default Staff;
