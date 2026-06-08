import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentTermSummary, getAssignmentsByClass, getQuizzesByClass } from "../../services/api/calls/getApis";
import { submitAssignment } from "../../services/api/calls/submissionsApis";
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
      
      {/* Assignments & Quizzes for this ward's class */}
      <div className="mt-6 md:mx-[30px]">
        <h2 className="text-[16px] font-Lora font-bold text-gray-800 mb-3">Class Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClassAssignments ward={ward} />
          <ClassQuizzes ward={ward} />
        </div>
      </div>
    </div>
  );
}

function ClassAssignments({ ward }: { ward: Ward }) {
  const classId = ward.class || ward._id;
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["guardian_assignments", classId], queryFn: () => getAssignmentsByClass(classId), enabled: !!classId });
  const assignments: any[] = data?.data?.assignments || [];
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<any | null>(null);

  // submission state
  const [answer, setAnswer] = useState<string>("");
  const [attachments, setAttachments] = useState<string>(""); // comma-separated URLs

  const submitMutation = useMutation({
    mutationFn: (payload: any) => submitAssignment(record._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardian_assignments", classId] });
      setOpen(false);
      setAnswer("");
      setAttachments("");
    },
  });

  const handleSubmit = () => {
    if (!record) return;
    const payload = {
      studentId: ward.studentId || ward._id,
      content: answer,
      attachments: attachments ? attachments.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    submitMutation.mutate(payload);
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold mb-2">Assignments</h3>
      {isLoading ? <div className="text-sm text-gray-500">Loading...</div> : assignments.length ? (
        assignments.map((a) => (
          <button key={a._id} onClick={() => { setRecord(a); setOpen(true); }} className="w-full text-left py-2 text-sm border-b last:border-b-0 hover:bg-gray-50">{a.title} {a.dueDate ? `(due ${new Date(a.dueDate).toLocaleDateString()})` : ''}</button>
        ))
      ) : (
        <div className="text-sm text-gray-500">No assignments for this class.</div>
      )}

      {open && record && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">{record.title}</h4>
              <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="text-sm text-gray-700 space-y-3">
              <div>{record.description || 'No description'}</div>
              <div>
                <h5 className="font-medium">Questions</h5>
                <ol className="list-decimal ml-6 mt-2">
                  {(record.questions || []).map((q: any, i: number) => (
                    <li key={i} className="mb-2">
                      <div className="font-medium">{q.prompt}</div>
                      {q.type === 'objective' && (<ul className="list-disc ml-6">{q.options.map((opt: string, oi: number) => <li key={oi}>{opt}</li>)}</ul>)}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4">
                <h5 className="font-medium">Submit Answer</h5>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full border rounded p-2 mt-2" rows={5} placeholder="Type the student's answer or notes here"></textarea>
                <input value={attachments} onChange={(e) => setAttachments(e.target.value)} className="w-full border rounded p-2 mt-2" placeholder="Attachment URLs (comma separated)" />
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={handleSubmit} disabled={submitMutation.isPending} className="px-4 py-2 bg-clr1 text-white rounded">{submitMutation.isPending ? 'Submitting...' : 'Submit'}</button>
                  {submitMutation.isError && <span className="text-red-500 text-sm">Could not submit. Try again.</span>}
                  {submitMutation.isSuccess && <span className="text-green-600 text-sm">Submitted</span>}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassQuizzes({ ward }: { ward: Ward }) {
  const classId = ward.class || ward._id;
  const { data, isLoading } = useQuery({ queryKey: ["guardian_quizzes", classId], queryFn: () => getQuizzesByClass(classId), enabled: !!classId });
  const quizzes: any[] = data?.data?.quizzes || [];
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<any | null>(null);

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold mb-2">Quizzes</h3>
      {isLoading ? <div className="text-sm text-gray-500">Loading...</div> : quizzes.length ? (
        quizzes.map((q) => (
          <button key={q._id} onClick={() => { setRecord(q); setOpen(true); }} className="w-full text-left py-2 text-sm border-b last:border-b-0 hover:bg-gray-50">{q.title} {q.scheduledAt ? `(on ${new Date(q.scheduledAt).toLocaleString()})` : ''}</button>
        ))
      ) : (
        <div className="text-sm text-gray-500">No quizzes for this class.</div>
      )}

      {open && record && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">{record.title}</h4>
              <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="text-sm text-gray-700 space-y-3">
              <div>{record.description || 'No description'}</div>
              <div>
                <h5 className="font-medium">Questions</h5>
                <ol className="list-decimal ml-6 mt-2">
                  {(record.questions || []).map((q: any, i: number) => (
                    <li key={i} className="mb-2">
                      <div className="font-medium">{q.prompt}</div>
                      {q.type === 'objective' && (<ul className="list-disc ml-6">{q.options.map((opt: string, oi: number) => <li key={oi}>{opt}</li>)}</ul>)}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

