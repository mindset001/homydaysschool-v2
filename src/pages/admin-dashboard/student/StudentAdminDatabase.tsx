import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { profileImage } from "../../../assets/images/users";
import CallSVG from "../../../components/svg/student/CallSVG";
import MessageSVG from "../../../components/svg/student/MessageSVG";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../../../shared/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteData } from "../../../services/api/calls/deleteApis";
import { getStudentsId } from "../../../services/api/calls/getApis";
import { calculateAge, capitaliseCase } from "../../../utils/regex";
import { updateStudent } from "../../../services/api/calls/updateApis";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const StudentAdminDatabase: React.FC = () => {
  const [imageFile, setImageFile] = useState<string>("");
  const { id } = useParams();

  const navigate = useNavigate();
  const [disablePagination, setDisablePagination] = useState({
    prev: false,
    next: false,
  });
  // const textAreaRef = useRef<HTMLTextAreaElement>(null);

  interface StudentI {
    fathers_contact: string;
    guardian_email: string;
    starter_pack: string;
    gender: string;
    age: number;
    id: number;
    image: string;
    full_name: string;
    class: string;
    date_of_birth: string;
    fathers_name: string;
    mothers_name: string;
    mothers_contact: string;
    fathers_occupation: string;
    mothers_occupation: string;
    home_address: string;
    state_of_origin: string;
    home_town: string;
    country: string;
    religion: string;
    total_tuition_paid: number;
  }
  interface studentDataInterface {
    id: string | number;
    // id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    image: string | File | null;
    student_class: string;
    schoolclass: number;
    date_of_birth: Date | null;
    gender: string;
    fathers_name: string;
    fathers_occupation: string;
    fathers_contact: string;
    mothers_name: string;
    mothers_occupation: string;
    mothers_contact: string;
    home_address: string;
    guardian_email: string;
    home_town: string;
    state_of_origin: string;
    country: string;
    religion: string;
    starter_pack_collected: boolean | null;
  }

  interface StudentContext {
    toast: typeof toast;
    studentData: StudentI[];
    className: string;
    classNameID: number;
    editable: boolean;
    setEditable: React.Dispatch<React.SetStateAction<boolean>>;
    isClassLoading: boolean;
    isClassStudentsIdLoading: boolean;
    isClassError: boolean;
    isClassStudentsIdError: boolean;
  }
  const {
    toast: contextToast,
    studentData,
    className,
    classNameID,
    editable,
    setEditable,
    isClassLoading,
    isClassStudentsIdLoading,
    isClassError,
    isClassStudentsIdError,
  } = useOutletContext<StudentContext>();
  // const [filteredStudent, setFilteredStudent] = useState<StudentI[]>([]);
  const [newStudentData, setNewStudentData] = useState<studentDataInterface>({
    id: 0,
    last_name: "",
    first_name: "",
    middle_name: "",
    image: null,
    student_class: "",
    schoolclass: 0,
    date_of_birth: null,
    gender: "",
    fathers_name: "",
    fathers_occupation: "",
    fathers_contact: "",
    mothers_name: "",
    mothers_occupation: "",
    mothers_contact: "",
    home_address: "",
    guardian_email: "",
    home_town: "",
    state_of_origin: "",
    country: "",
    religion: "",
    starter_pack_collected: null,
  });
  const [currentID, setCurrentID] = useState<string | number>('');

  const filteredID = useMemo(() => {
    return (
      (className &&
        id &&
        studentData.filter(
          (student) =>
            student.class?.toUpperCase() === className.toUpperCase() &&
            student.id.toString() === id
        )) ||
      []
    );
  }, [className, id, studentData]);
  const currentIDObj: StudentI | null = useMemo(() => {
    return (
      (id &&
        studentData.find(
          (student) =>
            // student.class?.toUpperCase() === className.toUpperCase() &&
            student.id.toString() === id
        )) ||
      null
    );
  }, [id, studentData]);

  useEffect(() => {
    // filteredID.length > 0 && setFilteredStudent(filteredID);
    currentIDObj && setCurrentID(currentIDObj.id);
    // Pagination disable function
    const allStudentsInClass = studentData.filter(
      (student) => student.class?.toUpperCase() === className?.toUpperCase()
    );
    const currentIndex = allStudentsInClass.findIndex(
      (student) => student.id.toString() === id
    );
    setDisablePagination({
      prev: currentIndex <= 0,
      next: currentIndex >= allStudentsInClass.length - 1,
    });

    // console.log("Student filtered data", filteredStudent)
    console.log("IDsss", currentID);
  }, [className, filteredID, id, studentData, currentIDObj, currentID]);
  const {
    data: studentsIdData,
    isError: isStudentsIdError,
    // error: studentsIdError,
    isLoading: isStudentsIdLoading,
  } = useQuery({
    queryKey: ["classStudents", currentID],
    queryFn: () => getStudentsId(currentID),
    enabled: currentID ? true : false,
    // enabled: classNameID.length > 0 ? true : false,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatStudentData = (data: any): studentDataInterface => {
    // Backend returns { student: { userId: {...}, class, ... } }
    return {
      id: data._id || '',
      last_name: data.userId?.lastName || "",
      first_name: data.userId?.firstName || "",
      middle_name: "",
      image: data.userId?.profileImage ? data.userId.profileImage : null,
      student_class: data.class || "",
      schoolclass: 0,
      date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || "",
      fathers_name: data.fathersName || "",
      fathers_occupation: data.fathersOccupation || "",
      fathers_contact: data.fathersContact || data.userId?.phoneNumber || "",
      mothers_name: data.mothersName || "",
      mothers_occupation: data.mothersOccupation || "",
      mothers_contact: data.mothersContact || "",
      home_address: data.address || "",
      guardian_email: data.guardianId?.userId?.email || "",
      home_town: data.homeTown || "",
      state_of_origin: data.stateOfOrigin || "",
      country: data.country || "",
      religion: data.religion || "",
      starter_pack_collected: null,
    };
  };

  useEffect(() => {
    // Backend returns { student: {...} }
    if (studentsIdData && studentsIdData.data && studentsIdData.data.student) {
      const student = studentsIdData.data.student;
      setNewStudentData(formatStudentData(student));
      setImageFile(student.userId?.profileImage || '');
    }
    console.log(
      "classStudentID Dataaaaaaaaa :",
      newStudentData,
      studentsIdData,
      isStudentsIdError,
      isStudentsIdLoading
    );
  }, [studentsIdData, isStudentsIdError, isStudentsIdLoading]);

  const handlePrev = () => {
    const filteredStudent =
      (className &&
        studentData.filter(
          (student) => student.class?.toUpperCase() === className?.toUpperCase()
        )) ||
      [];
    const currentIndex = filteredStudent.findIndex(
      (student) => student.id.toString() === id
    );
    currentIndex > 0 &&
      navigate(
        `/dashboard/student/${className}/${
          filteredStudent[currentIndex - 1].id
        }`
      );
  };
  const handleNext = () => {
    const filteredStudent = studentData.filter(
      (student) => student.class?.toUpperCase() === className.toUpperCase()
    );
    const currentIndex = filteredStudent.findIndex(
      (student) => student.id.toString() === id
    );
    currentIndex < filteredStudent.length - 1 &&
      navigate(
        `/dashboard/student/${className}/${
          filteredStudent[currentIndex + 1].id
        }`
      );
  };

  /////////////////////////
  //DELETE REQUEST
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (variables: { id: number; studentid: number }) =>
      deleteData(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classStudents"] });
      contextToast.success("Student deleted successfully!");
      // console.log("Student deleted successfully!");
      // setAddToggle(false); // Close the form after successful submission
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error deleting student: ", error);
      contextToast.error("Error deleting student: " + error.message);
    },
  });
  // const mutation = useMutation({
  //   mutationFn: (variables: { id: number; studentid: object }) =>
  //     deleteData(variables),
  // });
  const { isPending: isDeleting } = deleteMutation;

  ////////////////////////////////////////////////////////
  // UPDATE QUERY
  const updateMutation = useMutation({
    mutationFn: (variables: { id: string | number; updateData: object }) =>
      updateStudent(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classStudents"] });
      contextToast.success("Student updated successfully!");
      setEditable(false);
    },
    onError: (error) => {
      console.error("Error updating student: ", error);
      contextToast.error("Error updating student: " + error.message);
    },
  });
  const { isPending: isUpdating } = updateMutation;
  //////////////////////////////////////////////
  // const {
  //   data: AddButtonData,
  //   isError: AddButtonError,
  //   // error: classStudentsIdError,
  //   isLoading: AddButtonLoading,
  // } = useQuery({
  //   queryKey: ["addbutton"],
  //   queryFn: () => addStudent,
  //   // enabled: classNameID.length > 0,
  // });

  // useEffect(() => {
  //   console.log(
  //     "classStudentID Data :",
  //     AddButtonData,
  //     AddButtonError,
  //     // error: classStudentsIdError,
  //     AddButtonLoading
  //   );
  // }, [AddButtonData, AddButtonError, AddButtonLoading]);

  ////////////////////////////////////////////////
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (
      value.trimStart() === newStudentData[name as keyof studentDataInterface]
    ) {
      return;
    }
    setNewStudentData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleDateChange = (date: Date | null) => {
    const today = new Date();
    const normalizedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    if (date && date?.getTime() > normalizedToday.getTime()) {
      setNewStudentData((prevState) => ({
        ...prevState,
        date_of_birth: null,
      }));
      // console.log("Future");
      return true;
    }
    setNewStudentData((prevState) => ({
      ...prevState,
      date_of_birth: date,
    }));
  };
  /////////////////////////
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  ///////////////////////////////////////////////////
  //HANDLE SUBMIT

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    let hasChanges = false;

    console.log('=== handleSubmit Debug ===');
    console.log('studentsIdData:', studentsIdData);
    console.log('currentID:', currentID);
    console.log('newStudentData:', newStudentData);

    if (studentsIdData?.data?.student) {
      const serverData = formatStudentData(studentsIdData.data.student);
      console.log('serverData:', serverData);

      Object.entries(newStudentData).forEach(([key, value]) => {
        const serverValue = serverData[key as keyof studentDataInterface];
        
        // Map frontend field names to backend field names
        let backendFieldName = key;
        if (key === "student_class") backendFieldName = "class";
        if (key === "schoolclass") return; // Skip this field
        
        if (key === "image" && value instanceof File) {
          data.append(backendFieldName, value);
          hasChanges = true;
          console.log(`Added image file to FormData`);
        } else if (key === "date_of_birth") {
          const newDate = value as Date | null;
          const serverDate = serverValue as Date | null;
          if (formatDate(newDate) !== formatDate(serverDate)) {
            data.append(backendFieldName, formatDate(newDate));
            hasChanges = true;
            console.log(`Changed ${key}: ${formatDate(serverDate)} -> ${formatDate(newDate)}`);
          }
        } else if (key === "id") {
          // Skip id field
          return;
        } else if (value !== serverValue && value !== null && value !== undefined) {
          data.append(backendFieldName, value as string);
          hasChanges = true;
          console.log(`Changed ${key}: ${serverValue} -> ${value}`);
        }
      });

      console.log('hasChanges:', hasChanges);
      console.log('FormData contents:');
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }

      if (hasChanges) {
        console.log('Calling updateMutation with ID:', currentID);
        updateMutation.mutate({ id: currentID, updateData: data });
      } else {
        contextToast.info("No changes detected.");
      }
    } else {
      console.error('studentsIdData.data.student is not available');
      contextToast.error("Student data not loaded.");
    }
  };
  return (
    <>
      {/* <div className="fixed top-0 right-0 z-[9999]"> */}
      {/* <ToastContainer autoClose={false} closeOnClick={false}/> */}
      {/* </div> */}
      {isClassLoading ||
      isClassStudentsIdLoading ||
      isStudentsIdLoading ||
      !currentID ? (
        <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center md:items-start w-full">
          <Loader />
        </div>
      ) : isClassError ||
        isClassStudentsIdError ||
        isStudentsIdError ||
        !currentID ? (
        <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center">
          <span>Error fetching data</span>
        </div>
      ) : // filteredStudent.length > 0 ? (
      //   filteredStudent.map((data, index) => (

      newStudentData ? (
        <div>
          <form
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            className=" my-[40px] md:my-[39px] md:mx-[10px] lg:mx-[20px]"
          >
            <div
              className={` mb-[25px] md:ml-[10px] font-Poppins font-medium text-lg ${
                editable ? "hidden" : "hidden md:block"
              }`}
            >
              <span>ID: </span>
              <span>
                <input
                  readOnly
                  type="number"
                  name="id"
                  id="id"
                  value={newStudentData.id || 0}
                  // disabled={editable ? false : true}
                  className={`bg-white inline w-[75px] outline-none`}
                />
              </span>
            </div>
            {editable ? (
              <div className="flex flex-col items-center justify-center mb-[40px] md:mb-[15px]">
                <div className="relative max-w-[200px] size-[200px] md:max-w-[150px] md:size-[150px]  rounded-full overflow-hidden mr-[5px] ml-[10px] border-2 border-solid border-[#05878F] md:border-[#ECFEFF] mb-[15px] md:mb-[5px]">
                  <img
                    src={imageFile}
                    alt=""
                    className="size-full scale-105 object-cover object-center border rounded-full"
                  />

                  {/* <AdvancedImage cldImg={img} /> */}
                </div>
                <input
                  required={newStudentData.image ? false : true}
                  onChange={(e) => {
                    if (e.target.files) {
                      const selectedFile = e.target.files[0];
                      setImageFile(URL.createObjectURL(selectedFile));
                      // setImage(selectedFile); // Set the image file
                      setNewStudentData((prev) => ({
                        ...prev,
                        image: selectedFile,
                      }));
                      // e.target.value = "";
                    }
                  }}
                  type="file"
                  accept="image/*"
                  className="size-full scale-90 mx-auto"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center mb-[40px] md:mb-[15px]">
                <div className="max-w-[200px] size-[200px] md:max-w-[150px] md:size-[150px]  rounded-full overflow-hidden mr-[5px] ml-[10px] border-2 border-solid border-[#05878F] md:border-[#ECFEFF] mb-[15px] md:mb-[5px]">
                  <img
                    src={imageFile}
                    alt={`${newStudentData.last_name} ${newStudentData.first_name} ${newStudentData.middle_name}`}
                    className="size-full object-cover object-center"
                    onError={(e) => (e.currentTarget.src = profileImage)}
                  />
                </div>
                <div className="hidden md:block font-Poppins font-medium">
                  <div className="text-xl leading-[30px]">
                    <input
                      readOnly
                      type="text"
                      name="name"
                      id="name"
                      value={
                        `${newStudentData.last_name} ${newStudentData.first_name} ${newStudentData.middle_name}` ||
                        ""
                      }
                      disabled
                      // disabled={editable ? false : true}
                      // ref={textAreaRef}
                      className={`bg-white text-center text-ellipsis text-nowrap whitespace-nowrap overflow-hidden w-full mb-[2px] outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border px-[5px]"
                          : "border-none"
                      }`}
                    />
                  </div>

                  <div className="text-[15px] leading-[22.5px] text-center">
                    <input
                      readOnly
                      type="text"
                      name="class"
                      id="class"
                      value={newStudentData.student_class?.toUpperCase() || ""}
                      disabled={editable ? false : true}
                      className={`bg-white text-center outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border px-[5px]"
                          : "border-none"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-around md:justify-normal w-full md:w-auto">
                  <Link
                    to={`tel:${newStudentData.fathers_contact}`}
                    className="student-db-call mr-[10px]"
                  >
                    <div className="max-w-[18.47px] h-auto">
                      <CallSVG />
                    </div>
                  </Link>
                  <Link
                    to={`mailto:${newStudentData.guardian_email}`}
                    className="student-db-email"
                  >
                    <div className="max-w-[18.47px] h-auto ml-[1px]">
                      <MessageSVG />
                    </div>
                  </Link>
                </div>
              </div>
            )}
            <div>
              <div
                className={`student-db-details-edit ${
                  editable ? "hidden" : "flex md:hidden "
                }`}
              >
                <div className="student-db-details-key">
                  <label htmlFor="name">Name:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    readOnly
                    type="text"
                    name="name"
                    id="name"
                    value={
                      capitaliseCase(
                        `${newStudentData.last_name} ${newStudentData.first_name} ${newStudentData.middle_name}`
                      ) || ""
                    }
                    disabled
                    // disabled={editable true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "hidden" : "border-none block"
                    }`}
                  />
                </div>
              </div>

              {/* EDITABLE */}
              <div
                className={` student-db-details-edit ${
                  editable ? "flex" : "hidden"
                }`}
              >
                <div className="student-addbutton-db-details-key">
                  <label htmlFor="last_name">Surname:</label>
                </div>
                <div className="student-addbutton-db-details-property">
                  <input
                    required
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={newStudentData.last_name || ""}
                    onChange={handleInputChange}
                    // value={data.name}

                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                  />
                </div>
              </div>
              <div
                className={` student-db-details-edit ${
                  editable ? "flex" : "hidden"
                }`}
              >
                <div className="student-addbutton-db-details-key">
                  <label htmlFor="first_name">First Name:</label>
                </div>
                <div className="student-addbutton-db-details-property">
                  <input
                    required
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={newStudentData.first_name || ""}
                    onChange={handleInputChange}
                    // value={data.name}

                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                  />
                </div>
              </div>
              <div
                className={` student-db-details-edit ${
                  editable ? "flex" : "hidden"
                }`}
              >
                <div className="student-addbutton-db-details-key">
                  <label htmlFor="middle_name">Middle Name:</label>
                </div>
                <div className="student-addbutton-db-details-property">
                  <input
                    required
                    type="text"
                    name="middle_name"
                    id="middle_name"
                    value={newStudentData.middle_name || ""}
                    onChange={handleInputChange}
                    // value={data.name}

                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                  />
                </div>
              </div>

              <div
                className={` student-db-details-edit ${
                  editable ? "flex" : "hidden"
                }`}
              >
                <div className="student-addbutton-db-details-key">
                  <label htmlFor="student_class">Class:</label>
                </div>
                <div className="student-addbutton-db-details-property">
                  <input
                    disabled
                    readOnly
                    type="text"
                    name="student_class"
                    id="student_class"
                    value={newStudentData.student_class || ""}
                    // onChange={() => {setNewStudentData({...newStudentData, class : className})}}
                    // value={data.age}

                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border cursor-not-allowed`}
                  />
                </div>
              </div>
              <div
                className={` student-db-details-edit ${
                  editable ? "flex" : "hidden"
                }`}
              >
                <div className="student-addbutton-db-details-key">
                  <label htmlFor="student_class">Class ID:</label>
                </div>
                <div className="student-addbutton-db-details-property">
                  <input
                    disabled
                    readOnly
                    type="text"
                    name="student_class"
                    id="student_class"
                    value={newStudentData.schoolclass || ""}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border cursor-not-allowed`}
                  />
                </div>
              </div>
              {/* Ends */}

              <div
                className={`student-db-details-edit ${
                  editable ? "hidden" : "border-none flex"
                }`}
              >
                <div className="student-db-details-key">
                  <label htmlFor="age">Age:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    readOnly
                    type="number"
                    name="age"
                    id="age"
                    disabled
                    value={
                      newStudentData.date_of_birth
                        ? calculateAge(newStudentData.date_of_birth?.toString())
                        : ""
                    }
                    // disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none flex`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="date_of_birth">DOB:</label>
                </div>
                <div className="student-db-details-property">
                  {/* <DatePicker
                      selected={newStudentData.date_of_birth ? new Date(newStudentData.date_of_birth) : undefined}
                      onChange={() => {}}
                      disabled={editable ? false : true}
                      dateFormat="dd MMMM yyyy" // Format: "05 June 2011"
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    /> */}
                  <DatePicker
                    required
                    // selected={data.date_of_birth}
                    selected={newStudentData.date_of_birth}
                    onChange={handleDateChange}
                    disabled={editable ? false : true}
                    // onChange={() => {}}
                    dateFormat="yyyy MM dd" // Format: "05 June 2011"
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="gender">Gender:</label>
                </div>
                <div className="student-db-details-property">
                  {editable ? (
                    <select
                      required
                      value={newStudentData.gender || ""}
                      onChange={handleInputChange}
                      disabled={editable ? false : true}
                      // onChange={(e) =>
                      //   setFormData({
                      //     ...formData,
                      //     gender: e.target.value,
                      //   })
                      // }
                      name="gender"
                      id="gender"
                      // className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    >
                      <option value={""}>Select Gender:</option>
                      <option value={"Male"}>Male</option>
                      <option value={"Female"}>Female</option>
                    </select>
                  ) : (
                    <input
                      readOnly
                      type="text"
                      name="gender"
                      id="gender"
                      value={newStudentData.gender || ""}
                      // disabled={editable ? false : true}
                      disabled
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    />
                  )}
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="fathers_name">Father's Name:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="fathers_name"
                    id="fathers_name"
                    value={newStudentData.fathers_name || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="fathers_occupation">
                    Father's Occupation:
                  </label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="fathers_occupation"
                    id="fathers_occupation"
                    value={newStudentData.fathers_occupation || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="fathers_contact">Father's Contact:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="tel"
                    name="fathers_contact"
                    id="fathers_contact"
                    value={newStudentData.fathers_contact || 0}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="mothers_name">Mother's Name:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="mothers_name"
                    id="mothers_name"
                    value={newStudentData.mothers_name || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="mothers_occupation">
                    Mother's Occupation:
                  </label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="mothers_occupation"
                    id="mothers_occupation"
                    value={newStudentData.mothers_occupation || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="mothers_contact">Mother's Contact:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="tel"
                    name="mothers_contact"
                    id="mothers_contact"
                    value={newStudentData.mothers_contact || 0}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details mb-[5px]">
                <div className="student-db-details-key">
                  <label htmlFor="home_address">Home Address:</label>
                </div>
                <div className="student-db-details-property">
                  <textarea
                    // type="text"
                    required
                    name="home_address"
                    id="home_address"
                    value={newStudentData.home_address || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full inline md:w-full whitespace-pre-wrap outline-none text-left resize-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              {/* <div className="student-addbutton-db-details">
                <div className="student-addbutton-db-details-key">
                  <label htmlFor="guardian">Guardian:</label>
                </div>
                <div className="student-addbutton-db-details-property">
                  <select
                    required
                    value={formData.guardian}
                    onChange={handleInputChange}
                    // onChange={(e) =>
                    //   setFormData({
                    //     ...formData,
                    //     gender: e.target.value,
                    //   })
                    // }
                    name="guardian"
                    id="guardian"
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                  >
                    <option value={""}>Select Guardian:</option>
                    <option value={formData.fathers_name}>Father</option>
                    <option value={formData.mothers_name}>Mother</option>
                  </select>
                </div>
              </div> */}
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="guardian_email">Guardian's Email:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="email"
                    name="guardian_email"
                    id="guardian_email"
                    value={newStudentData.guardian_email || ""}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      setNewStudentData((prevState) => ({
                        ...prevState,
                        guardian_email: e.target.value.toLowerCase(),
                      }));
                    }}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="home_town">Hometown:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="home_town"
                    id="home_town"
                    value={newStudentData.home_town || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="state_of_origin">State of Origin:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="state_of_origin"
                    id="state_of_origin"
                    value={newStudentData.state_of_origin || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="country">Country:</label>
                </div>
                <div className="student-db-details-property">
                  <input
                    required
                    type="text"
                    name="country"
                    id="country"
                    value={newStudentData.country || ""}
                    onChange={handleInputChange}
                    disabled={editable ? false : true}
                    className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                      editable ? "border-[rgb(16,16,16)] border" : "border-none"
                    }`}
                  />
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="religion">Religion:</label>
                </div>
                <div className="student-db-details-property">
                  {editable ? (
                    <select
                      required
                      value={newStudentData.religion || ""}
                      onChange={handleInputChange}
                      // onChange={(e) =>
                      //   setFormData({
                      //     ...formData,
                      //     gender: e.target.value,
                      //   })
                      // }
                      // disabled={editable ? false : true}
                      name="religion"
                      id="religion"
                      // className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    >
                      <option value={""}>Select Religion:</option>
                      <option value={"Christianity"}>Christianity</option>
                      <option value={"Islam"}>Islam</option>
                      <option value={"Traditional"}>Traditional</option>
                    </select>
                  ) : (
                    <input
                      readOnly
                      type="text"
                      name="religion"
                      id="religion"
                      value={newStudentData.religion || ""}
                      disabled
                      // disabled={editable ? false : true}
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    />
                  )}
                </div>
              </div>
              <div className="student-db-details">
                <div className="student-db-details-key">
                  <label htmlFor="starter_pack">Starter's Pack:</label>
                </div>
                {editable ? (
                  <div className="student-db-details-property">
                    <select
                      required
                      disabled={editable ? false : true}
                      value={
                        newStudentData.starter_pack_collected
                          ? "collected"
                          : "not_collected"
                        // : ""
                      }
                      onChange={(e) =>
                        setNewStudentData({
                          ...newStudentData,
                          starter_pack_collected:
                            e.target.value === "collected"
                              ? true
                              : e.target.value === "not_collected"
                              ? false
                              : null,
                        })
                      }
                      name="starter_pack_collected"
                      id="starter_pack_collected"
                      // className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    >
                      <option value={""}>Select:</option>
                      <option value={"collected"}>Collected</option>
                      <option value={"not_collected"}>Not Collected</option>
                    </select>
                  </div>
                ) : (
                  <div className="student-db-details-property">
                    <input
                      readOnly
                      type="text"
                      name="starter_pack"
                      id="starter_pack"
                      value={
                        newStudentData.starter_pack_collected
                          ? "Collected"
                          : "Not Collected"
                      }
                      // disabled={editable ? false : true}
                      disabled
                      className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none ${
                        editable
                          ? "border-[rgb(16,16,16)] border"
                          : "border-none"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row justify-end text-white font-Poppins text-[15px] md:text-[12px] xl:text-[13px]">
              <input
                type={"button"}
                onClick={() => setEditable(true)}
                className={`mr-[8px] rounded-[15px] bg-[#05878F] py-[2px] px-[12px] ${
                  editable ? "hidden" : "block"
                }`}
                value={"Edit"}
              />
              <input
                type={"submit"}
                disabled={isUpdating}
                // onClick={() => (setEditable(true))}
                className={`mr-[8px] rounded-[15px] bg-[#05878F] py-[2px] px-[12px] ${
                  editable ? "block" : "hidden"
                } ${isUpdating ? "cursor-not-allowed" : "cursor-auto"}`}
                value={isUpdating ? "Updating..." : "Update"}
              />
              <input
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  deleteMutation.mutate({
                    id: classNameID,
                    studentid: Number(newStudentData.id),
                  });
                  // if (isSuccess) {
                  //   alert("Deleted");
                  // }
                }}
                className={`mr-[8px] rounded-[15px] bg-[red] py-[2px] px-[12px] ${
                  editable ? "hidden" : "block"
                } ${isDeleting ? "cursor-not-allowed" : "cursor-default"}`}
                value={isDeleting ? "Deleting..." : "Delete"}
              />
              <input
                type="button"
                onClick={() =>
                  editable ? setEditable(false) : navigate("/dashboard/results")
                }
                className="rounded-[15px] bg-[#05878F] py-[2px] px-[12px]"
                value={editable ? "Cancel" : "Result"}
              />
            </div>
          </form>
          <hr className="max-w-[198px] h-[1px] block mx-auto md:hidden bg-[#C4C4C4] border-none font-extrabold" />
          {/* Pagination */}
          <div className="student-db-pagination">
            <button onClick={handlePrev} disabled={disablePagination.prev}>
              <span className="text-[#374957]">«</span>
              <span className="ml-[5px]">Prev</span>
            </button>
            <button onClick={handleNext} disabled={disablePagination.next}>
              <span className="mr-[5px]">Next</span>
              <span className="text-[#374957]">»</span>
            </button>
          </div>
        </div>
      ) : (
        // ))
        <div className="flex justify-center items-center pt-[40px] md:pt-[39px] min-h-[calc(100%-40px)]">
          <div>Student details not found</div>
        </div>
      )}
    </>
  );
};

export default StudentAdminDatabase;
