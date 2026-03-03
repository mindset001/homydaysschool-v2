import React, { memo, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { profileImage } from "../../assets/images/users";
import "../../style/addbutton.css";
import useClasses from "../../hooks/useClasses";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStudent } from "../../services/api/calls/postApis";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface AddButtonProps {
  toast: typeof toast;
  addToggle: boolean;
  setAddToggle: (toggle: boolean) => void;
  className: string;
  classNameID: number | string;
  studentIDs: number[];
}

interface FormInterface {
  guardian: string;
  // id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  image: File | null;
  student_class: string;
  schoolclass: number | string;
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

const AddButton: React.FC<AddButtonProps> = ({
  toast,
  addToggle,
  setAddToggle,
  className: classNameLowerCase,
  // studentIDs,
  classNameID,
}) => {
  // GETTING CLASS Data
  const { classNameData: classes } = useClasses();
  //Ends
  const className = useMemo(() => {
    return (
      (classes &&
        classes.filter((classes) =>
          classes.name.toLowerCase().includes(classNameLowerCase)
        )) ||
      ""
    );
  }, [classNameLowerCase, classes]);

  const [formData, setFormData] = useState<FormInterface>({
    // id: 0,
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
    guardian: "",
    guardian_email: "",
    home_town: "",
    state_of_origin: "",
    country: "",
    religion: "",
    starter_pack_collected: null,
  });
  useEffect(() => {
    // className.length > 0 && console.log("ClasssName", className[0].name);
    className.length > 0 &&
      setFormData((prev) => ({ ...prev, student_class: className[0].name }));
    classNameID &&
      setFormData((prev) => ({ ...prev, schoolclass: classNameID }));
  }, [className, classNameID, classes]);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (value.trimStart() === formData[name as keyof FormInterface]) {
      return;
    }
    setFormData((prevState) => ({
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
      setFormData((prevState) => ({
        ...prevState,
        date_of_birth: null,
      }));
      // console.log("Future");
      return true;
    }
    setFormData((prevState) => ({
      ...prevState,
      date_of_birth: date,
    }));
  };
  //

  // ADD STUDENT
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // alert("Submitted : " + JSON.stringify(formData));

    const data = new FormData();

    // Append image if it exists
    if (formData.image) {
      data.append("image", formData.image);
    }
    // const data = new FormData();

    // // Append image if it exists
    // if (imageFile) {
    //   data.append("image", imageFile);
    // }
    const formatDate = (date: Date | null) => {
      if (!date) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // formData && setFormData({...formData, date_of_birth : })
    // Loop through formData and append each field
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "date_of_birth") {
        data.append(key, formatDate(value as Date | null));
      } else if (key !== "image") {
        data.append(key, value as string);
      }
    });

    // mutation.mutate(formData)
    mutation.mutate(data);
    // isSuccess && alert("Student added successfully");
    // setFormData({
    //   id: 0,
    //   last_name: "",
    //   first_name: "",
    //   middle_name: "",
    //   image: "",
    //   student_class: "",
    //   date_of_birth: null,
    //   gender: "",
    //   fathers_name: "",
    //   fathers_occupation: "",
    //   fathers_contact: "",
    //   mothers_name: "",
    //   mothers_occupation: "",
    //   mothers_contact: "",
    //   home_address: "",
    //   guardian_email: "",
    //   home_town: "",
    //   state_of_origin: "",
    //   country: "",
    //   religion: "",
    //   starter_pack_collected: false,
    // });
  };
  // ///////////////////////
  // POST Request
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newData: object) => addStudent(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classStudents"] });
      // alert("Student added successfully!");
      toast.success("Student added successfully!");
      // console.log("Student added successfully!");
      setAddToggle(false); // Close the form after successful submission
    },
    onError: (error) => {
      console.error("Error adding student: ", error);
      toast.error("Error adding student: " + error.message);
    },
  });
  const { isPending: isAdding } = mutation;

  const [imageFile, setImageFile] = useState<string>("");
  return (
    <>
      {/* <ToastContainer /> */}
      <div className={` ${addToggle ? "block" : "hidden"}`}>
        <form
          encType="multipart/form-data"
          onSubmit={handleSubmit}
          className=" my-[40px] md:my-[39px] md:mx-[10px] lg:mx-[20px]"
        >
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
              required={formData.image ? false : true}
              onChange={(e) => {
                if (e.target.files) {
                  const selectedFile = e.target.files[0];
                  setImageFile(URL.createObjectURL(selectedFile));
                  // setImage(selectedFile); // Set the image file
                  setFormData((prev) => ({ ...prev, image: selectedFile }));
                  // e.target.value = "";
                }
              }}
              type="file"
              accept="image/*"
              className="size-full scale-90 mx-auto"
            />
          </div>
          <div>
            <div className="flex student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="last_name">Surname:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="last_name"
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  // value={data.name}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="flex student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="first_name">First Name:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  // value={data.name}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="flex student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="middle_name">Middle Name:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="middle_name"
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  // value={data.name}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>

            <div className="student-addbutton-db-details">
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
                  value={formData.student_class}
                  // onChange={() => {setFormData({...formData, class : className})}}
                  // value={data.age}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border cursor-not-allowed`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
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
                  value={formData.schoolclass}
                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border cursor-not-allowed`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="date_of_birth">DOB:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <DatePicker
                  required
                  // selected={data.date_of_birth}
                  selected={formData.date_of_birth}
                  onChange={handleDateChange}
                  // onChange={() => {}}
                  dateFormat="yyyy MM dd" // Format: "05 June 2011"
                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border datepicker`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="gender">Gender:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <select
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  // onChange={(e) =>
                  //   setFormData({
                  //     ...formData,
                  //     gender: e.target.value,
                  //   })
                  // }
                  name="gender"
                  id="gender"
                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                >
                  <option value={""}>Select Gender:</option>
                  <option value={"Male"}>Male</option>
                  <option value={"Female"}>Female</option>
                </select>
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="fathers_name">Father's Name:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="fathers_name"
                  id="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleInputChange}
                  // value={data.fathers_name}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="fathers_occupation">Father's Occupation:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="fathers_occupation"
                  id="fathers_occupation"
                  value={formData.fathers_occupation}
                  onChange={handleInputChange}
                  // value={data.fathers_occupation}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="fathers_contact">Father's Contact:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="tel"
                  name="fathers_contact"
                  id="fathers_contact"
                  value={formData.fathers_contact}
                  onChange={handleInputChange}
                  pattern="^\+?\d{0,4}?\s?-?\(?\d{1,4}?\)?\s?-?\d{1,4}\s?-?\d{1,9}$"
                  title="Please enter a valid phone number"
                  placeholder="+234 012 345 6789"
                  // value={data.fathers_contact}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="mothers_name">Mother's Name:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="mothers_name"
                  id="mothers_name"
                  value={formData.mothers_name}
                  onChange={handleInputChange}
                  // value={data.mothers_name}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="mothers_occupation">Mother's Occupation:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="mothers_occupation"
                  id="mothers_occupation"
                  value={formData.mothers_occupation}
                  onChange={handleInputChange}
                  // value={data.mothers_occupation}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="mothers_contact">Mother's Contact:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="tel"
                  name="mothers_contact"
                  id="mothers_contact"
                  value={formData.mothers_contact}
                  onChange={handleInputChange}
                  pattern="^\+?\d{0,4}?\s?-?\(?\d{1,4}?\)?\s?-?\d{1,4}\s?-?\d{1,9}$"
                  title="Please enter a valid phone number"
                  placeholder="+234 012 345 6789"
                  // value={data.mothers_contact}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details mb-[5px]">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="home_address">Home Address:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <textarea
                  required
                  // type="text"
                  name="home_address"
                  id="home_address"
                  value={formData.home_address}
                  onChange={handleInputChange}
                  // value={data.home_address}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full inline md:w-full whitespace-pre-wrap  outline-none md:text-left resize-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
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
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="guardian_email">Guardian's Email:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="email"
                  name="guardian_email"
                  id="guardian_email"
                  value={formData.guardian_email}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    setFormData((prevState) => ({
                      ...prevState,
                      guardian_email: e.target.value.toLowerCase(),
                    }));
                  }}
                  // value={data.guardian_email}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="home_town">Hometown:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="home_town"
                  id="home_town"
                  value={formData.home_town}
                  onChange={handleInputChange}
                  // value={data.home_town}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="state_of_origin">State of Origin:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="state_of_origin"
                  id="state_of_origin"
                  value={formData.state_of_origin}
                  onChange={handleInputChange}
                  // value={data.state_of_origin}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="country">Country:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <input
                  required
                  type="text"
                  name="country"
                  id="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  // value={data.country}

                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                />
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="religion">Religion:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                {/* <input
                required
                type="text"
                name="religion"
                id="religion"
                value={formData.religion}
                onChange={handleInputChange}
                // value={data.religion}

                className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
              /> */}
                <select
                  required
                  value={formData.religion}
                  onChange={handleInputChange}
                  // onChange={(e) =>
                  //   setFormData({
                  //     ...formData,
                  //     gender: e.target.value,
                  //   })
                  // }
                  name="religion"
                  id="religion"
                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                >
                  <option value={""}>Select Religion:</option>
                  <option value={"Christianity"}>Christianity</option>
                  <option value={"Islam"}>Islam</option>
                  <option value={"Traditional"}>Traditional</option>
                </select>
              </div>
            </div>
            <div className="student-addbutton-db-details">
              <div className="student-addbutton-db-details-key">
                <label htmlFor="starter_pack_collected">Starter's Pack:</label>
              </div>
              <div className="student-addbutton-db-details-property">
                <select
                  required
                  value={
                    formData.starter_pack_collected === true
                      ? "collected"
                      : formData.starter_pack_collected === false
                      ? "not_collected"
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
                  className={`rounded-tl-[0px] rounded-[20px] md:rounded-[0px] py-[5px] px-[10px] md:py-0 md:px-[5px] bg-[#ECFEFF] md:bg-white w-full whitespace-nowrap truncate overflow-hidden outline-none border-[rgb(16,16,16)] border`}
                >
                  <option value={""}>Select:</option>
                  <option value={"collected"}>Collected</option>
                  <option value={"not_collected"}>Not Collected</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end text-white font-Poppins text-[15px] md:text-[12px] xl:text-[13px]">
            <input
              type="submit"
              disabled={isAdding}
              // onClick={() => {}}
              className={`mr-[10px] rounded-[15px] bg-[#05878F] py-[2px] px-[12px] ${
                isAdding ? "cursor-not-allowed" : "cursor-auto"
              } `}
              value={isAdding ? "Submitting..." : "Submit"}
            />
            <input
              type="button"
              onClick={() => {
                setAddToggle(false);
              }}
              className="rounded-[15px] bg-[#05878F] py-[2px] px-[12px]"
              value={"Cancel"}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default memo(AddButton);
