import React, { useEffect, useMemo, useState } from "react";
import { Add, FilterMobile } from "../../assets/images/dashboard/students";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCreateCalender } from "../../services/api/staffApis";
import Loader from "../../shared/Loader";
import SlidePanel from "../../shared/SlidePanel";
import AddCalender from "./AddCalender";
import { EventInterface } from "../../hooks/useTotalPercentageValue";
import { deleteEvent } from "../../services/api/calls/deleteApis";
import { getCalender } from "../../services/api/calls/getApis";
import { getRole } from "../../utils/authTokens";
import { formatDate } from "../../utils/regex";
import { showErrorToast, showSuccessToast } from "../../shared/ToastNotification";
// const events = [];



const Calendar: React.FC = () => {
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["calender"],
    queryFn: () => getCalender(),
  });

  // ALERT ERROR IF REQUEST FAILS
  isError && showErrorToast(`${error.message}`)
  const calender: EventInterface[] = useMemo(
    () =>
      ((data &&
        data.data.data &&
        Array.isArray(data.data.data) &&
        data.data.data.map(
          (event: { event: string; date: string; _id: string }) => ({
            event: event.event,
            date: formatDate(event.date), // Format the date string
            id: event._id,
          })
        )) ||
      []) as EventInterface[],
    [data]
  );
  const months = [
    {
      id: 0,
      name: "All",
    },
    {
      id: 1,
      name: "January",
    },
    {
      id: 2,
      name: "February",
    },
    {
      id: 3,
      name: "March",
    },
    {
      id: 4,
      name: "April",
    },
    {
      id: 5,
      name: "May",
    },
    {
      id: 6,
      name: "June",
    },
    {
      id: 7,
      name: "July",
    },
    {
      id: 8,
      name: "August",
    },
    {
      id: 9,
      name: "September",
    },
    {
      id: 10,
      name: "October",
    },
    {
      id: 11,
      name: "November",
    },
    {
      id: 12,
      name: "December",
    },
  ];

  data && console.log(calender);
  const [filteredData, setFilteredData] = useState<EventInterface[]>(
    calender ? calender : []
  );

  useEffect(() => {
    setFilteredData(calender);
  }, [calender]);

  const filterByMonth = (month: { id: number; name: string }) => {
    if (month.id === 0) {
      setFilteredData(calender);
      setIsFiltering(false);
    } else {
      setFilteredData(
        calender.filter((item: EventInterface) =>
          month.name
            .toLowerCase()
            .includes(item.date.split(" ")[0].toLowerCase())
        )
      );
      setIsFiltering(false);
    }
  };
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);
  const { mutate, isPending } = useCreateCalender();
  const queryClient = useQueryClient();

  const handleAddStaff = (newEvent: EventInterface) => {
    mutate(newEvent, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["calender"] });
        alert("Event created successfully!");
      },
      onError: (error: Error) => {
        console.error("Login failed:", error);
        // setLoading(false);
        // Handle error (e.g., show an error message)
      },
    });
    setIsSliderOpen(false);
    console.log(newEvent);
  };

  //DELETE REQUEST

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calender"] });
      showSuccessToast("Event deleted successfully!");
      console.log("Event deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(`Error deleting Event:${error.message} ` );
      console.error("Error deleting Event: ", error);
    },
  });

  const { isPending: isDeleting } = deleteMutation;


  if (isLoading || isPending || isDeleting) {
    return <Loader />;
  }

  const role = getRole();
  return (
    <div className="calendar">
      <div className="calendar-header">Calendar</div>
      <div className="calendar-body-container">
        <div className="calendar-body-container-header lg:mr-[15px]">
          <div className="font-Lora font-bold mr-5">
            <div className="text-[15px] leading-[19.2px] text-[#05878F]">
              TODAY
            </div>
            <div className="text-[15px] text-center leading-[19.2px] font-bold flex flex-col md:flex-row-reverse">
              <div>{new Date().getDate()}</div>
              <div className="md:mr-[6px]">{Date().split(" ")[1]}</div>
            </div>
          </div>
          <div className="flex flex-row self-center gap-3">
            <div className="filter">
              <button
                onClick={() => setIsFiltering(!isFiltering)}
                // className="mr-[10px] lg:mr-[15px] xl:mr-[20px]"
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
              <div
                className={`months ${isFiltering ? "flex flex-col" : "hidden"}`}
              >
                {months.map((month) => (
                  <button
                    key={month.id}
                    onClick={() => filterByMonth(month)}
                    className={`text-[15px] leading-[19.2px] text-[#05878F] ${
                      month.id === new Date().getMonth() + 1 ? "font-bold" : ""
                    }`}
                  >
                    {month.name}
                  </button>
                ))}
              </div>
            </div>

            {role === "admin" && (
              <button
                onClick={() => setIsSliderOpen(true)}
                className="py-[11px] px-[14px]"
              >
                <div className="min-w-[10px] h-auto mr-[5px]">
                  <img
                    src={Add}
                    alt="add"
                    className="object-contain object-center size-full"
                  />
                </div>
                <div className="font-Lora font-bold text-[15px] leading-[19.2px]">
                  Add
                </div>
              </button>
            )}
          </div>
        </div>
        <div className="calendar-body-content">
          <div className="calendar-body-content-calendar">
            <>
              <CalendarComponent events={filteredData} />
            </>
          </div>
          <div className="calendar-body-content-upcoming">
            <h2 className="text-[15px] md:text-[18px] xl:text-[22px] font-bold font-Lora mb-[10px] md:mb-[30px] lg:mb-[36px] xl:mb-[40px] text-center">
              Upcoming Events
            </h2>
            {filteredData.length ? (
              filteredData
                // .filter((event) => event.date.split("-") >= Date.now())
                .map((event, index) => (
                  <div
                    key={index}
                    className="date-container flex flex-row items-center justify-between mb-[30px] md:mb-[35px] xl:mb-[40px] gap-[20px] md:gap-[30px]"
                  >
                    <div className="gap-[20px] md:gap-[30px] flex flex-row items-center">
                      <div className="upcoming-date">
                        <div className="text-[18px] leading-none font-bold font-Lora">
                          {event.date.split(" ")[1].slice(0, 2)}
                        </div>
                        <div className="text-[11px] font-normal">
                          {event.date.split(" ")[0]}
                        </div>
                      </div>
                      <div className=" font-Poppins font-medium text-[15px]">
                        {event.event}
                      </div>
                    </div>

                    {role === "admin" && (
                      <button
                        onClick={() => deleteMutation.mutate(event.id)}
                        className="hover:bg-red-600  hover:border-red-600 border border-black px-2 py-1 hover:text-white rounded-full font-Poppins font-medium text-[17px] size-7 flex justify-center items-center"
                      >
                        <span className="">x</span>
                      </button>
                    )}
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-center h-[50%] w-full ">
                {" "}
                <em className="text-center">No Upcoming Event</em>
              </div>
            )}
          </div>
        </div>
      </div>
      <SlidePanel isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)}>
        <h2 className="my-[20px] text-center text-[#05878F] font-Poppins text-[15px]">
          Add New Event
        </h2>
        <AddCalender
          onSubmit={handleAddStaff}
          // onClose={() => setIsSliderOpen(false)}
        />
      </SlidePanel>
    </div>
  );
};

export default Calendar;
