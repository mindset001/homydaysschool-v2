import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../shared/Loader";
import { profileImage } from "../../assets/images/users";
import MessageSVG from "../../components/svg/student/MessageSVG";
import CallSVG from "../../components/svg/student/CallSVG";
import { getGuardianWard, getGuardianProfile } from "../../services/api/calls/getApis";

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
          <p className="text-[18px] text-clr1 font-bold font-Lora">{subtitle}</p>
        </div>
      </div>
    </header>
  );
};

interface ClassTeacher {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  subject: string;
  position: string;
}

interface Ward {
  _id: string;
  studentId?: string;
  class?: string;
  dateOfBirth?: string;
  gender?: string;
  fathersName?: string;
  fathersOccupation?: string;
  fathersContact?: string;
  mothersName?: string;
  mothersOccupation?: string;
  mothersContact?: string;
  address?: string;
  homeTown?: string;
  stateOfOrigin?: string;
  country?: string;
  religion?: string;
  userId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
  };
  classTeachers?: ClassTeacher[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
    <p className="text-[13px] font-Poppins font-semibold text-gray-600 min-w-[140px]">{label}</p>
    <p className="text-[13px] font-Poppins text-gray-800 text-right">{value || "N/A"}</p>
  </div>
);

const ProfileGuardian: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"guardian" | "student" | "staff">("guardian");
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ["guardianProfile"],
    queryFn: getGuardianProfile,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const { data: wardsData, isLoading: isWardsLoading, isError: isWardsError } = useQuery({
    queryKey: ["guardianWards"],
    queryFn: getGuardianWard,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const profile = profileData?.data?.profile;
  const wards: Ward[] = wardsData?.data?.wards || [];
  const activeWard: Ward | undefined = wards[activeStudentIndex];
  const classTeachers: ClassTeacher[] = activeWard?.classTeachers || [];
  const isLoading = isProfileLoading || isWardsLoading;
  const isError = isProfileError || isWardsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px] font-Lora font-bold text-red-500">
        Error loading profile data. Please try again.
      </div>
    );
  }

  const tabs = [
    { key: "guardian" as const, label: "My Profile" },
    { key: "student" as const, label: `Ward${wards.length !== 1 ? "s" : ""} (${wards.length})` },
    { key: "staff" as const, label: "Class Teachers" },
  ];

  return (
    <section className="pb-10">
      {/* Mobile Header */}
      <div className="block md:hidden bg-clr1">
        <MobileHeader title="Profile" subtitle="Guardian Profile" />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block px-[30px] mb-6">
        <h1 className="text-[22px] font-Lora font-bold text-clr1">Profile</h1>
      </div>

      <div className="rounded-t-[30px] md:rounded-[20px] bg-white md:mx-[30px] shadow-[0px_1px_25px_0px_rgba(56,159,166,0.1)]">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-4 text-[12px] md:text-[13px] font-Poppins font-semibold transition-colors ${
                activeTab === tab.key
                  ? "text-clr1 border-b-2 border-clr1 bg-[#f0fdfd]"
                  : "text-gray-500 hover:text-clr1 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Guardian Profile Tab ── */}
        {activeTab === "guardian" && (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image + name */}
              <div className="flex flex-col items-center gap-4 md:w-[220px] shrink-0">
                <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-[20px] overflow-hidden shadow-md">
                  <img
                    src={profile?.profileImage || profileImage}
                    alt={`${profile?.firstName} ${profile?.lastName}`}
                    onError={(e) => (e.currentTarget.src = profileImage)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-Lora font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-[13px] font-Poppins text-clr1 mt-1 capitalize">
                    {profile?.relationshipToStudent || "Guardian"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to={`tel:${profile?.phoneNumber}`} className="student-db-call cursor-pointer" title="Call">
                    <div className="w-[18px] h-auto"><CallSVG /></div>
                  </Link>
                  <Link to={`mailto:${profile?.email}`} className="student-db-email" title="Email">
                    <div className="max-w-[18px] h-auto ml-[1px]"><MessageSVG /></div>
                  </Link>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-[16px] font-Lora font-bold text-gray-800 mb-4 pb-2 border-b border-clr1">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <DetailRow label="Guardian ID" value={profile?.guardianId} />
                  <DetailRow label="Email" value={profile?.email} />
                  <DetailRow label="Phone Number" value={profile?.phoneNumber} />
                  <DetailRow label="Occupation" value={profile?.occupation} />
                  <DetailRow label="Relationship" value={profile?.relationshipToStudent} />
                  <DetailRow label="Alt. Phone" value={profile?.alternatePhoneNumber} />
                  <DetailRow label="Address" value={profile?.address} />
                  <DetailRow label="Wards Registered" value={profile?.studentCount ?? wards.length} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Wards Tab ── */}
        {activeTab === "student" && (
          <div className="p-6 md:p-8">
            {wards.length === 0 ? (
              <div className="flex justify-center items-center min-h-[200px] font-Lora text-gray-500">
                No wards registered to your account.
              </div>
            ) : (
              <>
                {wards.length > 1 && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {wards.map((ward, idx) => (
                      <button
                        key={ward._id}
                        onClick={() => setActiveStudentIndex(idx)}
                        className={`px-4 py-2 rounded-full text-[12px] font-Poppins font-semibold whitespace-nowrap transition-colors ${
                          activeStudentIndex === idx
                            ? "bg-clr1 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {`${ward.userId?.firstName || ""} ${ward.userId?.lastName || ""}`.trim() || `Ward ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                {activeWard && (
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center gap-4 md:w-[220px] shrink-0">
                      <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-[20px] overflow-hidden shadow-md">
                        <img
                          src={activeWard.userId?.profileImage || profileImage}
                          alt={`${activeWard.userId?.firstName} ${activeWard.userId?.lastName}`}
                          onError={(e) => (e.currentTarget.src = profileImage)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[18px] font-Lora font-bold text-gray-900">
                          {activeWard.userId?.firstName} {activeWard.userId?.lastName}
                        </p>
                        <p className="text-[13px] font-Poppins text-clr1 mt-1">{activeWard.class || "N/A"}</p>
                        {activeWard.studentId && (
                          <p className="text-[11px] font-Poppins text-gray-500 mt-1">ID: {activeWard.studentId}</p>
                        )}
                      </div>
                      <Link
                        to={`/dashboard/guardian-result/${activeWard._id}`}
                        className="px-4 py-2 bg-clr1 text-white text-[12px] font-Poppins font-semibold rounded-[8px] hover:bg-[#046a71] transition-colors"
                      >
                        View Result
                      </Link>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-[16px] font-Lora font-bold text-gray-800 mb-4 pb-2 border-b border-clr1">
                        Student Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <DetailRow label="Class" value={activeWard.class} />
                        <DetailRow label="Gender" value={activeWard.gender} />
                        <DetailRow label="Date of Birth" value={formatDate(activeWard.dateOfBirth || "")} />
                        <DetailRow label="Religion" value={activeWard.religion} />
                        <DetailRow label="Home Address" value={activeWard.address} />
                        <DetailRow label="Home Town" value={activeWard.homeTown} />
                        <DetailRow label="State of Origin" value={activeWard.stateOfOrigin} />
                        <DetailRow label="Country" value={activeWard.country} />
                      </div>

                      <h2 className="text-[16px] font-Lora font-bold text-gray-800 mt-6 mb-4 pb-2 border-b border-clr1">
                        Parent / Guardian Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <DetailRow label="Father's Name" value={activeWard.fathersName} />
                        <DetailRow label="Father's Occupation" value={activeWard.fathersOccupation} />
                        <DetailRow label="Father's Contact" value={activeWard.fathersContact} />
                        <DetailRow label="Mother's Name" value={activeWard.mothersName} />
                        <DetailRow label="Mother's Occupation" value={activeWard.mothersOccupation} />
                        <DetailRow label="Mother's Contact" value={activeWard.mothersContact} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Class Teachers Tab ── */}
        {activeTab === "staff" && (
          <div className="p-6 md:p-8">
            {wards.length === 0 ? (
              <div className="flex justify-center items-center min-h-[200px] font-Lora text-gray-500">
                No ward data available.
              </div>
            ) : (
              <>
                {wards.length > 1 && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {wards.map((ward, idx) => (
                      <button
                        key={ward._id}
                        onClick={() => setActiveStudentIndex(idx)}
                        className={`px-4 py-2 rounded-full text-[12px] font-Poppins font-semibold whitespace-nowrap transition-colors ${
                          activeStudentIndex === idx
                            ? "bg-clr1 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {`${ward.userId?.firstName || ""} ${ward.userId?.lastName || ""}`.trim() || `Ward ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-[16px] font-Lora font-bold text-gray-800">
                    Teachers for <span className="text-clr1">{activeWard?.class || "this class"}</span>
                  </h2>
                  <p className="text-[12px] font-Poppins text-gray-500 mt-1">
                    Ward: {`${activeWard?.userId?.firstName || ""} ${activeWard?.userId?.lastName || ""}`.trim() || "N/A"}
                  </p>
                </div>

                {classTeachers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[160px] gap-2 text-gray-500">
                    <p className="font-Lora font-bold text-[15px]">No teachers assigned yet</p>
                    <p className="font-Poppins text-[13px] text-center">
                      Teachers will appear here once assigned to {activeWard?.class || "this class"}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {classTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex flex-col items-center gap-3 p-5 rounded-[16px] border border-gray-100 shadow-[0px_1px_15px_0px_rgba(56,159,166,0.08)] hover:shadow-[0px_4px_20px_0px_rgba(56,159,166,0.18)] transition-shadow"
                      >
                        <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-clr1">
                          <img
                            src={teacher.image || profileImage}
                            alt={teacher.name}
                            onError={(e) => (e.currentTarget.src = profileImage)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-[15px] font-Lora font-bold text-gray-900">{teacher.name || "N/A"}</p>
                          <p className="text-[12px] font-Poppins text-clr1 font-semibold mt-0.5">
                            {teacher.subject || teacher.position || "Teacher"}
                          </p>
                          {teacher.position && teacher.subject && (
                            <p className="text-[11px] font-Poppins text-gray-500 mt-0.5">{teacher.position}</p>
                          )}
                          <p className="text-[11px] font-Poppins text-gray-400 mt-1">ID: {teacher.staffId}</p>
                        </div>
                        <div className="flex gap-3 mt-1">
                          {teacher.phone && (
                            <Link to={`tel:${teacher.phone}`} className="student-db-call cursor-pointer" title={`Call ${teacher.name}`}>
                              <div className="w-[16px] h-auto"><CallSVG /></div>
                            </Link>
                          )}
                          {teacher.email && (
                            <Link to={`mailto:${teacher.email}`} className="student-db-email" title={`Email ${teacher.name}`}>
                              <div className="max-w-[16px] h-auto ml-[1px]"><MessageSVG /></div>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileGuardian;
