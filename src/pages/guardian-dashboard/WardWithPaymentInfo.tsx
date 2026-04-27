import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudentTermSummary } from "../../services/api/calls/getApis";
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

interface TermSummary {
  term: string;
  academicYear: string;
  label: string;
  termFee: number;
  carryOver: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  overpaid: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
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

const statusColor = (status: string) => {
  if (status === 'Paid') return 'text-green-700 bg-green-50 border-green-200';
  if (status === 'Partial') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

export function WardWithPaymentInfo({ ward }: { ward: Ward }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["guardian-ward-term-summary", ward._id],
    queryFn: () => getStudentTermSummary(ward._id),
    enabled: !!ward._id,
    staleTime: 5 * 60 * 1000,
  });

  const termSummaries: TermSummary[] = data?.data?.termSummaries ?? [];
  const overall = data?.data?.overall;
  const termFee: number = data?.data?.termFee ?? 0;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left column — avatar + fee summary */}
      <div className="flex flex-col items-center gap-4 md:w-[240px] shrink-0">
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

        {/* Overall fee summary */}
        <div className="w-full mt-2">
          <h3 className="text-[13px] font-bold text-gray-700 mb-2">Overall Fee Summary</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : isError ? (
            <p className="text-red-400 text-xs">Could not load payment info</p>
          ) : overall ? (
            <div className="text-[12px] text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Term Fee</span>
                <span className="font-semibold">₦{termFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-semibold text-green-700">₦{overall.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance</span>
                <span className="font-semibold text-red-600">₦{overall.balance.toLocaleString()}</span>
              </div>
              <div className={`mt-2 text-center text-[11px] font-bold px-2 py-1 rounded-full border ${statusColor(overall.status)}`}>
                {overall.status}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-xs">No payment records found</p>
          )}
        </div>
      </div>

      {/* Right column — details + term breakdown */}
      <div className="flex-1 min-w-0">
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

        {/* Per-Term Breakdown */}
        <h2 className="text-[16px] font-Lora font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-clr1">
          Term-by-Term Payment Breakdown
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : isError ? (
          <p className="text-red-400 text-xs">Could not load payment breakdown</p>
        ) : termSummaries.length === 0 ? (
          <p className="text-gray-400 text-[12px]">No billing terms have been created yet. Once the school creates an academic session, payment records will appear here automatically.</p>
        ) : (
          <div className="space-y-3">
            {termSummaries.map((ts) => (
              <div
                key={ts.label}
                className={`rounded-xl border p-4 text-[12px] ${statusColor(ts.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[13px]">{ts.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(ts.status)}`}>
                    {ts.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Term Fee</span>
                    <span className="font-semibold">₦{ts.termFee.toLocaleString()}</span>
                  </div>
                  {ts.carryOver > 0 && (
                    <div className="flex justify-between col-span-2 text-red-600">
                      <span>Carry-over from prev. term</span>
                      <span className="font-semibold">+ ₦{ts.carryOver.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Total Due</span>
                    <span className="font-semibold">₦{ts.totalDue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid</span>
                    <span className="font-semibold text-green-700">₦{ts.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span>{ts.balance > 0 ? 'Outstanding Balance' : 'Fully Settled'}</span>
                    <span className={`font-bold ${ts.balance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {ts.balance > 0 ? `₦${ts.balance.toLocaleString()}` : '✓'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

