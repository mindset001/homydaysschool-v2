import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassStudentResult, getStudentTermSummary } from "../../services/api/calls/getApis";
import Loader from "../../shared/Loader";
import ResultView from "../../components/dashboard/ResultView";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AcademicResult {
  subject: string;
  test: number;
  exam: number;
  score: number;
  grade: string;
}

interface AcademicRecord {
  term: string;
  year: number;
  results: AcademicResult[];
}

interface StudentResultData {
  id: string;
  studentId: string;
  first_name: string;
  last_name: string;
  class: string;
  academicRecords: AcademicRecord[];
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
  status: "Paid" | "Partial" | "Unpaid";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getScoreBands = (className: string) => {
  const name = className.toLowerCase();
  if (name.includes("jss") || name.includes("sss")) {
    return { testMax: 30, examMax: 70 };
  }
  return { testMax: 40, examMax: 60 };
};

const gradeColor = (grade: string) => {
  if (!grade) return "text-gray-500";
  const g = grade.toUpperCase();
  if (g === "A" || g === "A+") return "text-green-600 font-bold";
  if (g === "B") return "text-blue-600 font-bold";
  if (g === "C") return "text-yellow-600 font-bold";
  if (g === "D") return "text-orange-500 font-bold";
  return "text-red-600 font-bold";
};

/**
 * Match an academic record to its term summary.
 * Handles the year→academicYear mapping ("2025/2026" contains both 2025 and 2026).
 */
function findTermSummary(
  record: AcademicRecord,
  summaries: TermSummary[]
): TermSummary | undefined {
  return summaries.find(
    (s) =>
      s.term === record.term &&
      s.academicYear.split("/").some((y) => parseInt(y) === record.year)
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const ResultGuardian: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fullReportOpen, setFullReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Fetch result data
  const {
    data: raw,
    isLoading: isResultLoading,
    isError: isResultError,
  } = useQuery({
    queryKey: ["guardian-student-result", id],
    queryFn: () => getClassStudentResult(id!),
    enabled: !!id,
  });

  // Fetch per-term payment summary
  const {
    data: termData,
    isLoading: isTermLoading,
    isError: isTermError,
  } = useQuery({
    queryKey: ["guardian-ward-term-summary", id],
    queryFn: () => getStudentTermSummary(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const student: StudentResultData | null = raw?.data?.data?.[0] ?? null;
  const allRecords: AcademicRecord[] = student?.academicRecords ?? [];
  const termSummaries: TermSummary[] = termData?.data?.termSummaries ?? [];
  const { testMax, examMax } = getScoreBands(student?.class ?? "");

  // ── Loading / error states ──────────────────────────────────────────────────
  if (isResultLoading || isTermLoading) return <Loader />;

  if (isResultError || isTermError || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 font-Poppins">
        <p className="text-red-500 text-sm mb-4">
          Failed to load results. Please try again.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-clr1 text-white text-sm rounded-[8px] hover:bg-[#046a71] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Determine which tab to show ─────────────────────────────────────────────
  const safeTab = Math.min(activeTab, Math.max(allRecords.length - 1, 0));
  const activeRecord: AcademicRecord | undefined = allRecords[safeTab];

  // Find this record's payment status in the term summaries
  const matchedSummary = activeRecord
    ? findTermSummary(activeRecord, termSummaries)
    : undefined;

  // Block if the term has an outstanding balance (balance > 0)
  const isBlocked = matchedSummary
    ? matchedSummary.balance > 0
    : false; // if no summary found, allow viewing (no billing data = no block)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 font-Poppins">
      {/* Full Report Sheet Overlay */}
      <ResultView
        studentID={id!}
        className={student.class}
        resultViewToggle={fullReportOpen}
        setResultViewToggle={setFullReportOpen}
        readOnly={true}
      />

      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-clr1 text-sm hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-[16px] font-semibold text-gray-700">Academic Results</h1>
      </div>

      {/* Student Info Card */}
      <div className="bg-[#f0fafb] border border-[#046A7E33] rounded-[12px] p-4 mb-5 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <p className="text-[18px] font-semibold text-gray-800">
            {student.first_name} {student.last_name}
          </p>
          <p className="text-[13px] text-clr1 mt-[2px]">{student.class}</p>
          {student.studentId && (
            <p className="text-[11px] text-gray-400 mt-[2px]">ID: {student.studentId}</p>
          )}
        </div>
      </div>

      {/* Term Tabs — one tab per academic record */}
      {allRecords.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {allRecords.map((record, idx) => {
            const summary = findTermSummary(record, termSummaries);
            const owed = summary ? summary.balance > 0 : false;
            const isActive = safeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  isActive
                    ? "bg-clr1 text-white border-clr1"
                    : "bg-white text-gray-600 border-gray-200 hover:border-clr1 hover:text-clr1"
                }`}
              >
                {record.term} — {record.year}
                {owed && (
                  <span
                    title="Outstanding balance — results locked"
                    className={`text-[10px] ${isActive ? "text-yellow-200" : "text-red-500"}`}
                  >
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No records at all */}
      {allRecords.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No result records are available yet.
        </div>
      )}

      {/* Blocked — outstanding balance for this term */}
      {activeRecord && isBlocked && (
        <div className="flex flex-col items-center justify-center py-16 font-Poppins">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 21.75h16.5a1.5 1.5 0 001.5-1.5v-9a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v9a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
          <p className="text-red-500 text-base font-semibold mb-1">
            Result Locked — {activeRecord.term} {activeRecord.year}
          </p>
          <p className="text-gray-500 text-sm text-center max-w-xs mb-5">
            Outstanding school fees for this term must be cleared before results can be accessed.
          </p>
          {matchedSummary && (
            <div className="bg-[#fff8f8] border border-red-100 rounded-[12px] p-4 w-full max-w-xs text-[13px] text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Due</span>
                <span className="font-semibold">₦{matchedSummary.totalDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="font-semibold text-green-700">₦{matchedSummary.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-red-100 pt-1 mt-1">
                <span className="text-gray-500">Outstanding</span>
                <span className="font-bold text-red-600">₦{matchedSummary.balance.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results table — shown when paid or no billing data */}
      {activeRecord && !isBlocked && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-gray-600 font-medium">
              {activeRecord.term} &mdash; {activeRecord.year}
            </p>
            <p className="text-[11px] text-gray-400">{activeRecord.results.length} subject(s)</p>
          </div>

          {activeRecord.results.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No subject scores uploaded for this term yet.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-[12px] border border-gray-100 shadow-sm">
                <table className="w-full text-[13px]">
                  <thead className="bg-clr1 text-white">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Subject</th>
                      <th className="text-center px-4 py-3 font-semibold">Test ({testMax})</th>
                      <th className="text-center px-4 py-3 font-semibold">Exam ({examMax})</th>
                      <th className="text-center px-4 py-3 font-semibold">Total (100)</th>
                      <th className="text-center px-4 py-3 font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRecord.results.map((r, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8fdfd]"}>
                        <td className="px-4 py-3 text-gray-700">{r.subject}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{r.test ?? "-"}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{r.exam ?? "-"}</td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-800">{r.score ?? "-"}</td>
                        <td className={`px-4 py-3 text-center ${gradeColor(r.grade)}`}>{r.grade || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                  {activeRecord.results.length > 0 && (
                    <tfoot className="bg-[#e8f7f9]">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-gray-700">Average</td>
                        <td colSpan={2} />
                        <td className="px-4 py-3 text-center font-bold text-clr1">
                          {(
                            activeRecord.results.reduce((sum, r) => sum + (r.score ?? 0), 0) /
                            activeRecord.results.length
                          ).toFixed(1)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-3">
                {activeRecord.results.map((r, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-[10px] p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-800 text-[13px]">{r.subject}</p>
                      <span className={`text-[13px] ${gradeColor(r.grade)}`}>{r.grade || "-"}</span>
                    </div>
                    <div className="flex gap-4 text-[12px] text-gray-500">
                      <span>Test: <span className="text-gray-700 font-medium">{r.test ?? "-"}</span></span>
                      <span>Exam: <span className="text-gray-700 font-medium">{r.exam ?? "-"}</span></span>
                      <span>Total: <span className="text-clr1 font-bold">{r.score ?? "-"}</span></span>
                    </div>
                  </div>
                ))}
                {activeRecord.results.length > 0 && (
                  <div className="bg-[#e8f7f9] rounded-[10px] p-4 flex justify-between text-[13px]">
                    <span className="font-semibold text-gray-700">Average Score</span>
                    <span className="font-bold text-clr1">
                      {(
                        activeRecord.results.reduce((s, r) => s + (r.score ?? 0), 0) /
                        activeRecord.results.length
                      ).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResultGuardian;
