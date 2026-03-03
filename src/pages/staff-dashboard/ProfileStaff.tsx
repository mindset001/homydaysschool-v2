// import CallImg from "../../assets/images/profile/call.png";
import { useMemo } from "react";
import {
  PhoneIcon as PhoneSolid,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { IProfile } from "../../types/user.type";
import Loader from "../../shared/Loader";
import { convertToNormalWords } from "../../utils/regex";
import { getStaff } from "../../services/api/calls/getApis";

const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const MobileHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <header className="profile_header">
      <div className="profile-box">
        <p className="text-[22px] text-white font-bold font-Lora">{title}</p>
        <div className="px-6 py-1.5 bg-white rounded-[10px]">
          <p className="text-[18px] text-clr1 font-bold font-Lora">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};

const ProfileStaff: React.FC = () => {
const { data, isError, error, isLoading } = useQuery({
  queryKey: ["user"],
  queryFn: () => getStaff(),
});

// Backend returns { staff: {...} }
const staff: IProfile = useMemo(() => {
  if (!data || !data.data || !data.data.staff) return {} as IProfile;
  const s: any = data.data.staff; // raw response
  return {
    id: s._id || s.id,
    first_name: s.userId?.firstName || '',
    last_name: s.userId?.lastName || '',
    middle_name: s.middleName || '',
    gender: s.gender || '',
    date_of_birth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '',
    homeAddress: s.address || '',
    stateOfOrigin: s.stateOfOrigin || '',
    homeTown: s.homeTown || '',
    qualification: Array.isArray(s.qualification) ? s.qualification.join(', ') : s.qualification || '',
    country: s.country || '',
    subject: Array.isArray(s.subjects) ? s.subjects.join(', ') : s.department || '',
    classTeacher: Array.isArray(s.classes) ? s.classes.join(', ') : '',
    age: s.age ? s.age.toString() : '',
    image: s.userId?.profileImage || '',
    phone_number: s.userId?.phoneNumber || '',
    email: s.userId?.email || '',
  } as IProfile;
}, [data]);

// log fetch issues
if (isError) console.error('Error loading staff profile', error);

// ensure loading state displays loader
if (isLoading) {
  return <Loader />;
}

  const profileProps = Object.keys(staff) as Array<keyof IProfile>;
  console.log(profileProps)

  const profileName = staff["first_name"] + " " + staff["last_name"];
  const profileClass = staff["classTeacher"];
  const otherProps = profileProps.filter(
    (prop) =>
      !prop.includes("_name") && prop !== "id" && prop !== "classTeacher" && prop !== "date_of_birth"
  );

  if (isLoading) {
    <Loader/>
  }

  return (
    <section className="">
      {/* mobile screen */}
      <div className="block md:hidden bg-clr1">
        <MobileHeader title="Profile" subtitle="Staff Database" />

        <div className="rounded-t-[30px] flex flex-col gap-0 md:gap-5 pt-[20px] md:pt-0 md:mt-[30px] md:px-[30px] bg-white">
          <div className="profile-section">
            <div className="profile-thumbnail flex flex-col">
              <div className="profile-picture">
                <img
                  src={staff.image}
                  alt="profile image"
                  className="block scale-[1.5]"
                />
              </div>
              <div className="flex justify-between w-[45%] items-center">
                <a
                  href={`tel:+${staff["phone_number"]}`}
                  className="p-[10px] rounded-full shadow-shadow3 bg-clr1"
                >
                  <PhoneSolid className="size-4 text-[#fff] rounded-2 " />
                </a>
                <a
                  href={`mailto:${staff["email"]}`}
                  className="p-[10px] rounded-full shadow-shadow3 bg-clr1"
                >
                  <EnvelopeIcon className="size-4 text-[#fff] rounded-2 bg-clr1" />
                </a>
              </div>
            </div>

            <div className="w-full py-10 px-6">
              <div className="flex flex-col gap-5 sm:gap-6">
                {profileProps.map((prop: string, index: number) => {
                  const profileValue = staff[prop as keyof IProfile];

                  const value =
                    prop === "dob"
                      ? new Date(profileValue as string)
                      : profileValue;

                  const dateOfBirth =
                    value instanceof Date ? formatDate(value).split(" ") : [];

                  return (
                    prop !== "image" && (
                      <div
                        key={index}
                        className="flex justify-between items-start"
                      >
                        <p className="text-[13px] sm:text-[15px] font-Lora font-bold">
                          {prop}
                        </p>
                        {value instanceof Date ? (
                          <div className="flex gap-2 sm:gap-3">
                            {dateOfBirth.map((date: string, index: number) => (
                              <p key={index} className="student-details">
                                {date}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="student-details">{value}</p>
                        )}
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* desktop screen */}
      <div className="hidden md:block px-[30px]">
        <div className="profile-wrapper-desktop">
          <div className="profile-wrapper-picture-desktop">
            <div className="w-full max-h-[50vh] flex justify-center items-center">
              <img
                src={staff.image}
                alt="profile image"
                className="w-full h-full object-cover rounded-[20px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-10 w-full lg:basis-[45%] pl-10 pr-10 lg:pr-4 py-6 ">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <p className="lg:text-[23px] xl:text-[28px] font-Lora font-bold">
                  {profileName.split(" ").splice(0, 2).join(" ")}
                </p>
                <p className="lg:text-[13px] xl:text-[18px] font-Poppins font-medium">
                  {profileClass}
                </p>
                <div className="flex justify-center items-center gap-3">
                  <a
                    href={`tel:+${staff["phone_number"]}`}
                    className="p-5 rounded-full shadow-shadow3"
                  >
                    <PhoneIcon className="size-3 xl:size-4 text-clr1 rounded-2 bg-[#fff]" />
                  </a>
                  <a
                    href={`mailto:${staff["email"]}`}
                    className="p-5 rounded-full shadow-shadow3"
                  >
                    <EnvelopeIcon className="size-3 xl:size-4 text-clr1 rounded-2 bg-[#fff]" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 xl:gap-2.5">
                {otherProps.map(
                  (prop, index) =>
                    prop !== "image" && (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <p className="profile-student-prop">
                          {convertToNormalWords(prop)}:
                        </p>
                        <p className="profile-student-value">
                          {staff[prop as keyof IProfile]?.toString()}
                        </p>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileStaff;
