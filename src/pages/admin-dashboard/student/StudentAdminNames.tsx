import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import useClasses from "../../../hooks/useClasses";
import { getClassStudentsId, getPaymentsByClass, getBaseClass, getStaff } from "../../../services/api/calls/getApis";
import { calculateAge } from "../../../utils/regex";
import {
  Add,
  Filter,
  FilterMobile,
} from "../../../assets/images/dashboard/students";
import { profileImage } from "../../../assets/images/users";
import AddButton from "../../../components/admin-dashboard/AddButton";
import CallSVG from "../../../components/svg/student/CallSVG";
import MessageSVG from "../../../components/svg/student/MessageSVG";
import Loader from "../../../shared/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPayment } from "../../../services/api/calls/postApis";
import { getUser, getRole } from "../../../utils/authTokens";

// import useClasses from "../../hooks/useClasses";
// import { getClassStudentsId } from "../../services/api/calls/getApis";
// import { calculateAge } from "../../utils/regex";

const tableHeader: string[] = [
  "Name",
  // "ID",
  "Age",
  "Gender",
  "Tuition Paid",
  "Balance",
  "Starter's Pack",
  "Contact",
];

interface classStudentIdI {
  id: number;
  student_class: string;
  guardian_email: string;
  first_name: string;
  last_name: string;
  middle_name: string;
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

interface studentDataI {
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
  tuition_paid: number;
  tuition_balance: number;
}

const StudentAdminNames: React.FC = () => {
  // Error Go Back
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };

  const [studentData, setStudentData] = useState<studentDataI[]>([]);
  // const [tableActive, setTableActive] = useState<number | null>(null);
  // const { id } = useParams();
  // const navigate = useNavigate();
  const [editable, setEditable] = useState<boolean>(false);
  const [addToggle, setAddToggle] = useState<boolean>(false);
  
  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<studentDataI | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    academicYear: '2026/2027',
    term: 'First Term',
    paymentType: 'School Fee',
    amount: 0,
    amountDue: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: '',
    remarks: '',
  });
  
  const queryClient = useQueryClient();
  const currentUser = getUser();
  
  // Payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (response) => {
      console.log('Payment mutation successful!');
      console.log('Response:', response);
      console.log('Invalidating queries for classNameID:', classNameID[0]);
      console.log('Payment recorded successfully! Refreshing data...');
      
      queryClient.invalidateQueries({ queryKey: ['classPayments', classNameID[0]] });
      queryClient.invalidateQueries({ queryKey: ['classStudents', classNameID[0]] });
      
      // Force immediate refetch
      setTimeout(() => {
        console.log('Forcing refetch of payment data...');
        refetchPayments();
      }, 500);
      
      setPaymentModalOpen(false);
      setSelectedStudent(null);
      toast.success('Payment recorded successfully!');
      // Reset form
      setPaymentFormData({
        academicYear: '2026/2027',
        term: 'First Term',
        paymentType: 'School Fee',
        amount: 0,
        amountDue: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        referenceNumber: '',
        remarks: '',
      });
    },
    onError: (error: any) => {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    },
  });
  
  const handleOpenPaymentModal = (student: studentDataI) => {
    console.log('Opening payment modal for student:', student);
    console.log('Student ID:', student.id);
    setSelectedStudent(student);
    setPaymentFormData({
      ...paymentFormData,
      amountDue: student.tuition_balance || 0,
      amount: 0,
    });
    setPaymentModalOpen(true);
  };
  
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('No student selected');
      return;
    }
    
    if (paymentFormData.amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    const paymentData = {
      studentId: selectedStudent.id,
      academicYear: paymentFormData.academicYear,
      term: paymentFormData.term,
      paymentType: paymentFormData.paymentType,
      amount: Number(paymentFormData.amount),
      amountDue: Number(paymentFormData.amountDue),
      paymentDate: paymentFormData.paymentDate,
      paymentMethod: paymentFormData.paymentMethod,
      referenceNumber: paymentFormData.referenceNumber,
      receivedBy: currentUser.id,
      remarks: paymentFormData.remarks,
    };
    
    console.log('Submitting payment data:', paymentData);
    createPaymentMutation.mutate(paymentData);
  };
  
  // const [classes] = useState<string[]>([
  //   "creche",
  //   "k.g 1",
  //   "k.g 2",
  //   "nursery 1",
  //   "nursery 2",
  //   "primary 1",
  //   "primary 2",
  //   "primary 3",
  //   "primary 4",
  //   "primary 5",
  // ]);
  // GETTING CLASS Data
  const { classNameData: allClasses, isClassLoading, isClassError } = useClasses();

  // if the current user is a staff teacher we will restrict classes to those they belong to
  const { data: myStaffData } = useQuery({
    queryKey: ['myStaff'],
    queryFn: () => getStaff(),
    enabled: getRole() === 'staff',
  });

  const teacherClassIds: string[] = useMemo(() => {
    if (getRole() !== 'staff' || !myStaffData?.data?.staff) return [];
    const s: any = myStaffData.data.staff;
    return Array.isArray(s.classes) ? s.classes : [];
  }, [myStaffData]);

  const classes = useMemo(() => {
    if (getRole() === 'staff' && teacherClassIds.length > 0) {
      return allClasses.filter((c) => teacherClassIds.includes(c.id));
    }
    return allClasses;
  }, [allClasses, teacherClassIds]);

  //Ends
  const { id } = useParams();
  // const ID: number = Number(id);
  // Classname from URL and compare
  useEffect(() => {
    console.log("className Dataaa", isClassLoading, classes);
  }, [classes, isClassLoading]);
  const location = useLocation();
  const className = useMemo(() => {
    const decodedPaths = location.pathname
      .split("/")
      .map((decodeURI) => decodeURIComponent(decodeURI));

    return (
      (classes &&
        decodedPaths.find((pathname) =>
          classes
            .map((classes) => classes.name.toLowerCase())
            .includes(pathname)
        )) ||
      ""
    );
  }, [classes, location.pathname]);

  // if staff and only one class, automatically navigate there when not already on it
  useEffect(() => {
    if (
      getRole() === 'staff' &&
      classes.length === 1 &&
      className === '' &&
      classes[0].name
    ) {
      navigate(`/student/${encodeURIComponent(classes[0].name.toLowerCase())}`);
    }
  }, [classes, className, navigate]);

  // const className = useLocation()
  //   .pathname.split("/")
  //   .map((decodeURI) => decodeURIComponent(decodeURI))
  //   .find((pathname) => classes
  //           .map((classes) => classes.name.toLowerCase())
  //           .includes(pathname));
  useEffect(() => {
    console.log("classNameActive Dataaa :", className);
  }, [className]);
  //Get class id with filter of classes and classnames
  const classNameID: string[] = useMemo(() => {
    return classes
      .filter((classes) => {
        return classes.name.toLowerCase() === className;
      })
      .map((classArr) => {
        return classArr.id;
      });
  }, [className, classes]);
  useEffect(() => {
    console.log("classNameActiveID :", classNameID[0]);
  }, [classNameID]);
  
  // FETCH CLASS FEE INFORMATION
  const {
    data: classFeeData,
    isLoading: _isClassFeeLoading,
  } = useQuery({
    queryKey: ["baseClassFee", classNameID[0]],
    queryFn: () => getBaseClass(),
    enabled: classNameID.length > 0,
  });
  
  // FETCH PAYMENT DATA FOR THIS CLASS
  const {
    data: classPaymentsData,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["classPayments", classNameID[0]],
    queryFn: () => getPaymentsByClass(classNameID[0]),
    enabled: classNameID.length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });
  
  useEffect(() => {
    console.log('=== Payment Data Debug ===');
    console.log('Class Payments Data:', classPaymentsData);
    console.log('Payments Loading:', isPaymentsLoading);
    if (classPaymentsData?.data?.payments) {
      console.log('Number of payments:', classPaymentsData.data.payments.length);
      console.log('Payment details:', classPaymentsData.data.payments);
    }
    console.log('========================');
  }, [classPaymentsData, isPaymentsLoading]);
  
  // Calculate total fee for a class
  const totalClassFee = useMemo(() => {
    if (!classFeeData?.data?.classes) return 0;
    
    const classInfo = classFeeData.data.classes.find((c: any) => c._id === classNameID[0] || c.id === classNameID[0]);
    if (!classInfo) return 0;
    
    const schoolFee = classInfo.schoolFee || 0;
    const uniform = classInfo.uniform || 0;
    const sportWear = classInfo.sportWear || 0;
    const schoolBus = classInfo.schoolBus || 0;
    const snack = classInfo.snack || 0;
    const science = classInfo.science || 0;
    const games = classInfo.games || 0;
    const libraryFee = classInfo.libraryFee || 0;
    const extraActivities = classInfo.extraActivities || 0;
    
    return schoolFee + uniform + sportWear + schoolBus + snack + science + games + libraryFee + extraActivities;
  }, [classFeeData, classNameID]);
  
  // Create payment map by student ID
  const studentPaymentMap = useMemo(() => {
    if (!classPaymentsData?.data?.payments) return new Map();
    
    const paymentMap = new Map<string, number>();
    classPaymentsData.data.payments.forEach((payment: any) => {
      const studentId = payment.studentId?._id || payment.studentId;
      const currentTotal = paymentMap.get(studentId) || 0;
      paymentMap.set(studentId, currentTotal + (payment.amount || 0));
      
      console.log('Processing payment:', {
        paymentId: payment._id,
        studentId: studentId,
        amount: payment.amount,
        newTotal: currentTotal + (payment.amount || 0)
      });
    });
    
    console.log('=== Student Payment Map ===');
    console.log('Payment Map:', Array.from(paymentMap.entries()));
    console.log('===========================');
    
    return paymentMap;
  }, [classPaymentsData]);
  
  // GETTING CLASS Students Data by ID
  const {
    data: classStudentsIdData,
    isError: isClassStudentsIdError,
    // error: classStudentsIdError,
    isLoading: isClassStudentsIdLoading,
  } = useQuery({
    queryKey: ["classStudents", classNameID[0]],
    queryFn: () => getClassStudentsId(classNameID[0]),
    enabled: classNameID.length > 0,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
  });

  useEffect(() => {
    console.log(
      "classStudentID Data:",
      classStudentsIdData,
      "isError:", isClassStudentsIdError,
      "isLoading:", isClassStudentsIdLoading
    );
    if (classStudentsIdData?.data?.students) {
      console.log("Backend returned", classStudentsIdData.data.students.length, "students");
    }
  }, [classStudentsIdData, isClassStudentsIdError, isClassStudentsIdLoading]);
  const classStudentsId: classStudentIdI[] = useMemo(() => {
    if (
      !classStudentsIdData ||
      !classStudentsIdData.data ||
      !classStudentsIdData.data.students ||
      !Array.isArray(classStudentsIdData.data.students)
    ) {
      return [];
    }
    
    // Backend returns { students: [...] }
    // Map backend structure to frontend structure
    const mappedStudents = classStudentsIdData.data.students.map((student: any) => {
      const studentId = student._id || '';
      const tuitionPaid = studentPaymentMap.get(studentId) || 0;
      const tuitionBalance = totalClassFee - tuitionPaid;
      
      console.log(`Student ${student.userId?.firstName} ${student.userId?.lastName} (${studentId}):`, {
        tuitionPaid,
        tuitionBalance,
        totalClassFee
      });
      
      return {
        id: studentId,
        student_class: student.class || '',
        guardian_email: student.guardianId?.userId?.email || '',
        first_name: student.userId?.firstName || '',
        last_name: student.userId?.lastName || '',
        middle_name: '',
        image: student.userId?.profileImage || '',
        date_of_birth: student.dateOfBirth || '',
        gender: student.gender || '',
        tuition_paid: tuitionPaid,
        tuition_balance: tuitionBalance,
        fathers_name: student.fathersName || '',
        mothers_name: student.mothersName || '',
        fathers_contact: student.fathersContact || student.userId?.phoneNumber || '',
        mothers_contact: student.mothersContact || '',
        fathers_occupation: student.fathersOccupation || '',
        mothers_occupation: student.mothersOccupation || '',
        home_address: student.address || '',
        state_of_origin: student.stateOfOrigin || '',
        home_town: student.homeTown || '',
        country: student.country || '',
        starter_pack_collected: false,
        religion: student.religion || '',
        total_tuition_paid: tuitionPaid,
        schoolclass: 0,
        guardian: 0,
      };
    });
    
    console.log('=== Mapped Students ===');
    console.log('Total students:', mappedStudents.length);
    console.log('Students with payments:', mappedStudents.filter((s: any) => s.tuition_paid > 0).length);
    console.log('=======================');
    
    return mappedStudents;
  }, [classStudentsIdData, studentPaymentMap, totalClassFee]);

  const filteredClassStudentId: studentDataI[] = useMemo(() => {
    return classStudentsId.map((student) => ({
      ...student,
      // id: student.id,
      full_name: `${student.last_name} ${student.first_name} ${student.middle_name}`,
      image: student.image,
      // gender: student.gender,
      age: calculateAge(student.date_of_birth),
      // fathers_contact: student.fathers_contact,
      class: student.student_class || className || "-",
      // guardian_email: student.guardian_email,
      starter_pack: student.starter_pack_collected
        ? "Collected"
        : "Not Collected",
      tuition_paid: student.tuition_paid || 0,
      tuition_balance: student.tuition_balance || 0,
    }));
  }, [className, classStudentsId]);
  useEffect(() => {
    if (filteredClassStudentId.length > 0) {
      setStudentData(filteredClassStudentId);
      console.log("Student Data Updated:", filteredClassStudentId.length, "students");
    } else {
      console.log("No students found in filteredClassStudentId");
    }
    console.log("Class Students ID Data:", classStudentsId.length);
    console.log("Filtered Class Student ID:", filteredClassStudentId);
  }, [filteredClassStudentId, classStudentsId]);
  const studentIDs: number[] = useMemo(() => {
    return studentData.map((student) => student.id);
  }, [studentData]);
  // console.log("Ohhhh", studentIDs);
  return (
    <div className="student-names">
      <ToastContainer />
      <div className="student-names-list">
        <div className="student-names-list-header">
          <div className="student-names-list-header1">
            Students <span className="hidden md:inline-block">Database</span>
          </div>
          <div className="student-names-list-header2">
            {isClassLoading || isClassStudentsIdLoading ? (
              <div className=" font-Lora text-center w-full">Loading...</div>
            ) : isClassError ? (
              <div className=" font-Lora text-center w-full font-bold">
                <span>Error fetching data</span>
              </div>
            ) : className &&
              classes
                .map((classes) => classes.name.toLowerCase())
                .includes(className) ? (
              className?.toUpperCase()
            ) : (
              "Error"
            )}
          </div>
          {isClassLoading || isClassStudentsIdLoading ? (
            <div className=" font-Lora text-center w-full hidden md:flex md:flex-row md:justify-center md:items-center">
              <span>Loading...</span>
            </div>
          ) : isClassError ? (
            <div className=" font-Lora text-center w-full hidden md:block font-bold">
              <span>Error fetching data</span>
            </div>
          ) : className &&
            classes
              .map((classes) => classes.name.toLowerCase())
              .includes(className) ? (
            <div className="student-names-list-header3">
              <button
                className={`mr-[10px] lg:mr-[15px] xl:mr-[20px] ${
                  addToggle
                    ? "opacity-30 cursor-not-allowed"
                    : "opacity-100 cursor-pointer"
                }`}
                disabled={addToggle ? true : false}
              >
                <div className="max-w-2 max-h-2 mr-[5px]">
                  <img
                    src={Filter}
                    alt="filter"
                    className="object-contain object-center size-full"
                  />
                </div>
                <div>Filter</div>
              </button>
              <button
                onClick={() => setAddToggle(true)}
                className={
                  editable
                    ? `opacity-30 cursor-not-allowed`
                    : "opacity-100 cursor-pointer"
                }
                disabled={editable ? true : false}
              >
                <div className="max-w-2 max-h-2 mr-[5px]">
                  <img
                    src={Add}
                    alt="add"
                    className="object-contain object-center size-full"
                  />
                </div>
                <div>Add</div>
              </button>
            </div>
          ) : null}
        </div>
        <div className="student-names-list-container">
          <>
            {/* Mobile view */}
            {isClassLoading || isClassStudentsIdLoading ? (
              <div className=" font-Lora text-center w-full min-h-[152px] flex flex-row justify-center items-center">
                <Loader />
              </div>
            ) : isClassError ? (
              <div className=" font-Lora text-center w-full min-h-[152px] font-bold flex flex-row justify-center items-center">
                <span>Error fetching data</span>
              </div>
            ) : className &&
              classes.length > 0 &&
              classes
                .map((classes) => classes.name.toLowerCase())
                .includes(className) ? (
              <>
                <div className="block md:hidden grow">
                  <div className="student-names-list-container-mheader">
                    <div className="font-Lora font-bold mr-5">
                      <div className="text-[15px] leading-[19.2px] text-[#05878F]">
                        TOTAL
                      </div>
                      <div className="text-lg text-center leading-[23.04px]">
                        {studentData.length || 0}
                      </div>
                    </div>
                    <div className="flex flex-row student-names-list-container-mheader-button">
                      <button
                        className={`mr-[10px] lg:mr-[15px] xl:mr-[20px]  ${
                          addToggle
                            ? "opacity-30 cursor-not-allowed"
                            : "opacity-100 cursor-pointer"
                        }`}
                        disabled={addToggle ? true : false}
                      >
                        <div className="w-[19.54px] h-auto mr-[5px] my-auto">
                          <img
                            src={FilterMobile}
                            alt="filter"
                            className="object-contain object-center size-full"
                          />
                        </div>
                        <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                          Filter
                        </div>
                      </button>
                      <button
                        onClick={() => setAddToggle(true)}
                        className={
                          editable
                            ? `opacity-30 cursor-not-allowed`
                            : "opacity-100 cursor-pointer"
                        }
                        disabled={editable ? true : false}
                      >
                        <div className="max-w-[15px] h-auto mr-[5px]">
                          <img
                            src={Add}
                            alt="add"
                            className="object-contain object-center size-full"
                          />
                        </div>
                        <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                          Add
                        </div>
                      </button>
                    </div>
                  </div>
                  {addToggle ? (
                    <AddButton
                      toast={toast}
                      classNameID={classNameID[0]}
                      studentIDs={studentIDs}
                      className={className}
                      setAddToggle={setAddToggle}
                      addToggle={addToggle}
                    />
                  ) : (
                    <Outlet
                      context={{
                        toast,
                        classStudentsIdData,
                        studentData,
                        className,
                        classNameID: classNameID[0],
                        editable,
                        setEditable,
                        isClassLoading,
                        isClassStudentsIdLoading,
                        isClassError,
                        isClassStudentsIdError,
                      }}
                    />
                  )}
                </div>
                {/* Desktop view */}
                <table className="w-full border-collapse border-none hidden md:table rounded-[20px] shadow-[0px_1px_25px_0px_#389FA61A]">
                  <thead>
                    <tr className="table-row-header">
                      {tableHeader.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  {isClassLoading ||
                  isClassStudentsIdLoading ||
                  classNameID.length <= 0 ? (
                    <tbody>
                      <tr>
                        <td
                          className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%] min-h-[152px]"
                          colSpan={8}
                        >
                          <Loader />
                        </td>
                      </tr>
                    </tbody>
                  ) : isClassError ||
                    isClassStudentsIdError ||
                    classNameID.length <= 0 ? (
                    <tbody>
                      <tr>
                        <td
                          className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%] min-h-[152px]"
                          colSpan={8}
                        >
                          <span>Error fetching data</span>
                        </td>
                      </tr>
                    </tbody>
                  ) : classStudentsIdData &&
                    classStudentsIdData.data &&
                    classStudentsIdData.data.students &&
                    Array.isArray(classStudentsIdData.data.students) ? (
                    <tbody>
                      {studentData?.map((data, index) => (
                        <tr
                          key={index}
                          className={
                            id === data.id.toString()
                              ? "table-row-details-active table-row-details"
                              : "table-row-details"
                          }
                          onClick={
                            () => (
                              navigate(
                                id === data.id?.toString()
                                  ? ""
                                  : data.id.toString()
                              ),
                              toast.success("Testing")
                            )
                            // setTableActive(tableActive === index ? null : index),
                          }
                        >
                          <td>
                            <div className="flex flex-row items-center">
                              <input
                                type="checkbox"
                                name="name"
                                autoComplete="false"
                                id={data.id.toString()}
                                className=" size-[14px] checked:bg-black accent-[#05878F] appearance-auto hover:accent-[#05878F] border-[#05878F] cursor-pointer"
                                onChange={() => {}}
                                checked={
                                  id === data.id.toString() ? true : false
                                }
                              />
                              <div className="max-w-[20px] size-[20px] h-[20px] rounded-full overflow-hidden mr-[5px] ml-[10px]">
                                <img
                                  src={data.image || profileImage}
                                  alt="student image"
                                  className="size-full object-cover object-center"
                                  onError={(e) =>
                                    (e.currentTarget.src = profileImage)
                                  }
                                />
                              </div>
                              <div className="md:max-w-[130px] lg:max-w-[170px] whitespace-nowrap overflow-hidden text-ellipsis">
                                {data.full_name}
                              </div>
                            </div>
                          </td>
                          {/* <td className="">{data.id}</td> */}
                          <td className="">{data.age}</td>
                          <td className="">{data.gender}</td>
                          <td 
                            className="text-right pr-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPaymentModal(data);
                            }}
                            title="Click to record payment"
                          >
                            <div className="flex items-center justify-end gap-2">
                              <span>₦{data.tuition_paid?.toLocaleString() || 0}</span>
                              <svg className="w-4 h-4 text-[#05878F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          </td>
                          <td className={`text-right pr-4 ${data.tuition_balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                            ₦{data.tuition_balance?.toLocaleString() || 0}
                          </td>
                          <td className="">{data.starter_pack}</td>
                          <td className="text-center">
                            <div className="flex flex-row justify-center">
                              <Link
                                to={`tel:${data.fathers_contact}`}
                                className={`mr-[15px] size-[20px] rounded-full flex justify-center items-center ${
                                  id === data.id.toString()
                                    ? "active-call-contact bg-[#05878F]"
                                    : "bg-[white]"
                                }`}
                              >
                                <div className="max-w-[10px] size-[10px]">
                                  <CallSVG />
                                </div>
                              </Link>
                              <Link
                                to={`mailto:${data.guardian_email}`}
                                className={`size-[20px] rounded-full flex justify-center items-center ${
                                  id === data.id.toString()
                                    ? "active-message-contact bg-[#05878F]"
                                    : "bg-[white]"
                                }`}
                              >
                                <div className="max-w-[10px] size-[10px]">
                                  <MessageSVG />
                                </div>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    classStudentsIdData && (
                      <tbody>
                        <tr>
                          <td
                            className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%]"
                            colSpan={8}
                          >
                            Data Not Available
                          </td>
                        </tr>
                      </tbody>
                    )
                  )}
                </table>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px-145.53px-40px)] ml:min-h-[calc(100vh-80px-148.03px-40px)] md:min-h-full">
                <div className="font-bold text-[30px] md:text-[23px]">
                  404 Not Found
                </div>
                <div className="text-xl mt-2">This class does not exist</div>
                <button
                  onClick={goBack}
                  className="text-base border py-2 px-4 border-solid rounded-lg text-nowrap border-[#05878F] text-white bg-[#05878F] mt-5"
                >
                  Go Back
                </button>
              </div>
            )}
          </>
        </div>
      </div>
      <div className="student-names-database">
        {addToggle ? (
          <AddButton
            toast={toast}
            classNameID={classNameID[0]}
            studentIDs={studentIDs}
            className={className}
            setAddToggle={setAddToggle}
            addToggle={addToggle}
          />
        ) : id &&
          classes.map((classes) => classes.name.toLowerCase()).includes(id) ? (
          <div className="flex justify-center items-center pt-[40px] md:pt-[39px] min-h-[calc(100%-40px)] px-10">
            <div className="text-center">
              Please click on a student to display their details.
            </div>
          </div>
        ) : (
          <Outlet
            context={{
              toast,
              classStudentsIdData,
              studentData,
              className,
              classNameID: classNameID[0],
              editable,
              setEditable,
              isClassLoading,
              isClassStudentsIdLoading,
              isClassError,
              isClassStudentsIdError,
            }}
          />
        )}
        {/* Nothing to show yet */}
      </div>
      
      {/* Payment Modal */}
      {paymentModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#05878F]">
                Record Payment - {selectedStudent.full_name}
              </h2>
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Student Info Display */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">Student ID:</span> {selectedStudent.id}
                    </div>
                    <div>
                      <span className="font-semibold">Class:</span> {selectedStudent.class}
                    </div>
                    <div>
                      <span className="font-semibold">Total Paid:</span> ₦{selectedStudent.tuition_paid?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Balance:</span> ₦{selectedStudent.tuition_balance?.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.academicYear}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, academicYear: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    required
                  />
                </div>
                
                {/* Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentFormData.term}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, term: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    required
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                
                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentFormData.paymentType}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    required
                  >
                    <option value="School Fee">School Fee</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Sport Wear">Sport Wear</option>
                    <option value="School Bus">School Bus</option>
                    <option value="Snack">Snack</option>
                    <option value="Science">Science</option>
                    <option value="Games">Games</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Extra Activities">Extra Activities</option>
                    <option value="Starter Pack">Starter Pack</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentFormData.paymentMethod}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                {/* Amount Due */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Due (₦)
                  </label>
                  <input
                    type="number"
                    value={paymentFormData.amountDue}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amountDue: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F] bg-gray-50"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    required
                  />
                </div>
                
                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.referenceNumber}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    placeholder="Transaction/Receipt #"
                  />
                </div>
                
                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={paymentFormData.remarks}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, remarks: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    rows={3}
                    placeholder="Additional notes about this payment..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPaymentMutation.isPending}
                  className="px-6 py-2 bg-[#05878F] text-white rounded-lg hover:bg-[#046970] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAdminNames;