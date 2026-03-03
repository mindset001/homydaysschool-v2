// AddStaffForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { today } from "../../utils/regex";
import useClasses from "../../hooks/useClasses";
import Loader from "../../shared/Loader";

export interface AddStaff {
  title: "";
  first_name: "";
  last_name: "";
  middle_name: "";
  age: 0;
  image: "";
  subject: "";
  dob: "";
  gender: "";
  phone_number: "";
  country: "";
  date_of_birth: "";
  home_address: "";
  email: "";
  home_town: "";
  state_of_origin: "";
  assigned_to: "";
  qualification: "";
}

interface AddStaffFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (staff: any) => void;
  // onClose: () => void;
  // onClose: () => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSubmit }) => {
  const { classNameData, isClassLoading, isClassError, classError } = useClasses();

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    console.log('=== Class Data Debug ===');
    console.log('Class data received:', classNameData);
    console.log('Is loading:', isClassLoading);
    console.log('Is error:', isClassError);
    if (classError) {
      console.error('Class fetch error:', classError);
    }
    console.log('=======================');
    
    if (classNameData && classNameData.length > 0) {
      const mappedClasses = classNameData.map((data) => ({
        id: data.id,
        name: data.name,
      }));
      console.log('Setting classes to state:', mappedClasses);
      setClasses(mappedClasses);
    } else {
      console.log('No classes to set - data is empty or null');
    }
  }, [classNameData, isClassLoading, isClassError, classError]);

  const [formData, setFormData] = useState<Partial<AddStaff>>({
    title: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    age: 0,
    image: "",
    subject: "",
    dob: "",
    gender: "",
    phone_number: "",
    country: "",
    date_of_birth: "",
    home_address: "",
    email: "",
    home_town: "",
    state_of_origin: "",
    assigned_to: "",
    qualification: "",
  });
  const [imageFile, setImageFile] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    // Append the image file (if selected)
    if (imageInputRef.current?.files?.[0]) {
      data.append("image", imageInputRef.current.files[0]);
    }

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value as string);
    });

    onSubmit(data);
    // Reset the form
    setFormData({
      title: "",
      first_name: "",
      last_name: "",
      age: 0,
      subject: "",
      date_of_birth: "",
      gender: "",
      phone_number: "",
      home_address: "",
      email: "",
      home_town: "",
      state_of_origin: "",
      assigned_to: "",
      qualification: "",
    });
    setImageFile("");
    // Clear the file input (since files are not part of the formData state)
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  if (isClassLoading) {
    <Loader/>
  }

  return (
    <form onSubmit={handleSubmit}>
      {imageFile && (
        <div className="relative max-w-[200px] size-[200px] md:max-w-[150px] md:size-[150px]  rounded-full overflow-hidden mb-[15px] md:mb-[5px] m-auto">
          <img
            src={imageFile}
            alt=""
            className="size-full scale-105 object-cover object-center border rounded-full"
          />
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Image</label>
        <input
          ref={imageInputRef}
          name="image"
          type="file"
          onChange={(e) =>
            e.target.files &&
            setImageFile(URL.createObjectURL(e.target.files[0]))
          }
          accept="image/*"
          className="size-full scale-90 mx-auto"
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Title</label>
        <select
          required
          name="title"
          value={formData.title}
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          onChange={handleChange}
        >
          <option value="">title</option>
          <option value="mr">Mr.</option>
          <option value="mrs">Mrs.</option>
          <option value="miss">Miss</option>
        </select>
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">First Name</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Last Name:</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">
          Middle Name:
        </label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Email:</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">DOB:</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="date"
          name="date_of_birth"
          max={today}
          value={formData.date_of_birth}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Gender</label>
        <select
          name="gender"
          required
          value={formData.gender}
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          onChange={handleChange}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">
          Home Address
        </label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="tel"
          name="home_address"
          value={formData.home_address}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">
          State Of Origin
        </label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="state_of_origin"
          value={formData.state_of_origin}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Home Town</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="home_town"
          value={formData.home_town}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Country</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">
          Qualification
        </label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Class</label>
        <select
          name="assigned_to"
          value={formData.assigned_to}
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          onChange={handleChange}
          required
          disabled={isClassLoading}
        >
          <option value="">
            {isClassLoading ? 'Loading classes...' : 'Select class'}
          </option>
          {isClassError && (
            <option value="" disabled>Error loading classes</option>
          )}
          {classes.length > 0 ? (
            classes.map((classItem, index) => (
              <option key={index} value={classItem.id}>
                {classItem.name}
              </option>
            ))
          ) : (
            !isClassLoading && <option value="" disabled>No classes available</option>
          )}
        </select>
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Subject</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

      <menu className="flex justify-center">
        <button
          type="submit"
          className=" bg-[#05878F] cursor-pointer px-[25px] font-Lora text-white self-center rounded-[25px] text-xl font-bold py-[7px] w-full sm:w-auto text-center mt-[23px] md:mt-[23px]  md:mb-[2px]"
        >
          Add Staff
        </button>
        {/* <button
          type="button"
          onClick={() => onClose()}
          className=" bg-red-500 cursor-pointer px-[15px] font-Lora text-white self-center rounded-[25px] text-xl font-bold py-[7px] w-full sm:w-auto text-center mt-[23px] md:mt-[23px]  md:mb-[2px]"
        >
          Close
        </button> */}
      </menu>
    </form>
  );
};

export default AddStaffForm;
