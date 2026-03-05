import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaymentsByStudent } from "../../services/api/calls/getApis";
import { profileImage } from "../../assets/images/users";
import { DetailRow } from "./ProfileGuardian";

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

export function WardWithPaymentInfo({ ward }: { ward: Ward }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["guardian-ward-payment", ward._id],
    queryFn: () => getPaymentsByStudent(ward._id),
    enabled: !!ward._id,
    staleTime: 5 * 60 * 1000,
  });
  const summary = data?.data?.summary;
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center gap-4 md:w-[220px] shrink-0">
        <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-[20px] overflow-hidden shadow-md">
          <img
            src={ward.userId?.profileImage || profileImage}
            alt={`${ward.userId?.firstName} ${ward.userId?.lastName}`}
            onError={(e) => (e.currentTarget.src = profileImage)}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <p className="text-[18px] font-Lora font-bold text-gray-900">
            {ward.userId?.firstName} {ward.userId?.lastName}
          </p>
          <p className="text-[13px] font-Poppins text-clr1 mt-1">{ward.class || "N/A"}</p>
          {ward.studentId && (
            <p className="text-[11px] font-Poppins text-gray-500 mt-1">ID: {ward.studentId}</p>
          )}
        </div>
        <Link
          to={`/dashboard/guardian-result/${ward._id}`}
          className="px-4 py-2 bg-clr1 text-white text-[12px] font-Poppins font-semibold rounded-[8px] hover:bg-[#046a71] transition-colors"
        >
          View Result
        </Link>
        <div className="mt-4 w-full">
          <h3 className="text-[14px] font-bold text-gray-700 mb-1">School Fees Summary</h3>
          {isLoading ? (
            <div className="text-gray-400 text-xs">Loading payment info...</div>
          ) : isError ? (
            <div className="text-red-400 text-xs">Could not load payment info</div>
          ) : summary ? (
            <div className="text-[13px] text-gray-700 space-y-1">
              <div>Paid: <span className="font-semibold text-green-700">₦{summary.totalPaid?.toLocaleString() ?? 0}</span></div>
              <div>Debt: <span className="font-semibold text-red-600">₦{summary.balance > 0 ? summary.balance.toLocaleString() : 0}</span></div>
              <div>Total Due: <span className="font-semibold">₦{summary.totalDue?.toLocaleString() ?? 0}</span></div>
              <div>Status: <span className="font-semibold text-blue-700">{summary.paymentStatus}</span></div>
            </div>
          ) : (
            <div className="text-gray-400 text-xs">No payment info available</div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-[16px] font-Lora font-bold text-gray-800 mb-4 pb-2 border-b border-clr1">
          Student Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="Class" value={ward.class} />
          <DetailRow label="Gender" value={ward.gender} />
          <DetailRow label="Date of Birth" value={formatDate(ward.dateOfBirth || "")} />
          <DetailRow label="Religion" value={ward.religion} />
          <DetailRow label="Home Address" value={ward.address} />
          <DetailRow label="Home Town" value={ward.homeTown} />
          <DetailRow label="State of Origin" value={ward.stateOfOrigin} />
          <DetailRow label="Country" value={ward.country} />
        </div>

        <h2 className="text-[16px] font-Lora font-bold text-gray-800 mt-6 mb-4 pb-2 border-b border-clr1">
          Parent / Guardian Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="Father's Name" value={ward.fathersName} />
          <DetailRow label="Father's Occupation" value={ward.fathersOccupation} />
          <DetailRow label="Father's Contact" value={ward.fathersContact} />
          <DetailRow label="Mother's Name" value={ward.mothersName} />
          <DetailRow label="Mother's Occupation" value={ward.mothersOccupation} />
          <DetailRow label="Mother's Contact" value={ward.mothersContact} />
        </div>
      </div>
    </div>
  );
}