// AddCalender.tsx
import React, { useState } from "react";
import { today } from "../../utils/regex";
import { EventInterface } from "../../hooks/useTotalPercentageValue";

interface AddCalenderProps {
  onSubmit: (event: EventInterface) => void;
  // onClose: () => void;
}

const AddCalender: React.FC<AddCalenderProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<EventInterface>({
    id:0,
    date:"",
    event:""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    } as EventInterface);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Event:</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="text"
          name="event"
          value={formData.event}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-Lora text-[15px] font-medium">Event Date:</label>
        <input
          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
          type="date"
          name="date"
          min={today}
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <menu className="flex justify-center">
        <button
          type="submit"
          className=" bg-[#05878F] cursor-pointer px-[25px] font-Lora text-white self-center rounded-[25px] text-xl font-bold py-[7px] w-full sm:w-auto text-center mt-[23px] md:mt-[23px]  md:mb-[2px]"
        >
          Add Event
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

export default AddCalender;
