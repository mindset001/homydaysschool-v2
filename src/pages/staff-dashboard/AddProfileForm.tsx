// AddStaffForm.tsx
import React, { useState } from "react";
import { IProfile } from "../../types/user.type";
import useClasses from "../../hooks/useClasses";

interface AddStaffFormProps {
  onSubmit: (staff: IProfile) => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<IProfile>({
    first_name: "",
    last_name: "",
    age: '',
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
  const { classNameData: classOptions, isClassLoading } = useClasses();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Name</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Last Name</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div>
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Class Teacher</label>
        <select
          name="classTeacher"
          value={formData.classTeacher}
          onChange={handleChange}
          disabled={isClassLoading}
        >
          <option value="">-- select class --</option>
          {classOptions.map((cls) => (
            <option key={cls.id} value={cls.name}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>
      {/* Add more fields as needed */}
      <button type="submit">Add Staff</button>
    </form>
  );
};

export default AddStaffForm;
