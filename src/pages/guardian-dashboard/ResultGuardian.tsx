import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassStudentResult } from "../../services/api/calls/getApis";
import Loader from "../../shared/Loader";

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

const gradeColor = (grade: string) => {
  if (!grade) return "text-gray-500";
  const g = grade.toUpperCase();
  if (g === "A" || g === "A+") return "text-green-600 font-bold";
  if (g === "B") return "text-blue-600 font-bold";
  if (g === "C") return "text-yellow-600 font-bold";
  if (g === "D") return "text-orange-500 font-bold";
  return "text-red-600 font-bold";
};

const ResultGuardian: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: raw, isLoading, isError } = useQuery({
    queryKey: ["guardian-student-result", id],
    queryFn: () => getClassStudentResult(id!),
    enabled: !!id,
  });

  const student: StudentResultData | null = raw?.data?.data?.[0] ?? null;
  const records: AcademicRecord[] = student?.academicRecords ?? [];

  const termOptions = records.map((r, i) => ({
    label: `${r.term} – ${r.year}`,
    index: i,
  }));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeRecord: AcademicRecord | undefined = records[selectedIndex];

  if (isLoading) return <Loader />;

  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 font-Poppins">
        <p className="text-red-500 text-sm mb-4">Failed to load results. Please try again.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-clr1 text-white text-sm rounded-[8px] hover:bg-[#046a71] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-Poppins">
      {/* Header */}
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
      <div className="bg-[#f0fafb] border border-[#046A7E33] rounded-[12px] p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <p className="text-[18px] font-semibold text-gray-800">
            {student.first_name} {student.last_name}
          </p>
          <p className="text-[13px] text-clr1 mt-[2px]">{student.class}</p>
          {student.studentId && (
            <p className="text-[11px] text-gray-400 mt-[2px]">ID: {student.studentId}</p>
          )}
        </div>

        {termOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">Select Term</label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="border border-gray-200 rounded-[8px] px-3 py-2 text-[12px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-clr1"
            >
              {termOptions.map((opt) => (
                <option key={opt.index} value={opt.index}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {termOptions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No academic records available yet.
        </div>
      ) : activeRecord ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-gray-600 font-medium">
              {activeRecord.term} &mdash; {activeRecord.year}
            </p>
            <p className="text-[11px] text-gray-400">{activeRecord.results.length} subject(s)</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-[12px] border border-gray-100 shadow-sm">
            <table className="w-full text-[13px]">
              <thead className="bg-clr1 text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Subject</th>
                  <th className="text-center px-4 py-3 font-semibold">Test (40)</th>
                  <th className="text-center px-4 py-3 font-semibold">Exam (60)</th>
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
      ) : null}
    </div>
  );
};

export default ResultGuardian;
