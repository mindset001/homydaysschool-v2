import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useClasses from "../../hooks/useClasses";
import useActiveSession, { ISession } from "../../hooks/useActiveSession";
import { getAllAcademicSessions, getClassFees } from "../../services/api/calls/getApis";
import { setClassFee } from "../../services/api/calls/updateApis";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import Loader from "../../shared/Loader";

const ClassFeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSession } = useActiveSession();
  const { classNameData: classes } = useClasses();

  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({}); // className -> input value

  const { data: sessionsData } = useQuery({
    queryKey: ["allAcademicSessions"],
    queryFn: getAllAcademicSessions,
  });
  const sessions: ISession[] = sessionsData?.data?.data ?? [];

  // Default the picker to the active session once it loads
  useEffect(() => {
    if (activeSession && !academicYear && !term) {
      setAcademicYear(activeSession.academicYear);
      setTerm(activeSession.term);
    }
  }, [activeSession, academicYear, term]);

  const { data: feesData, isLoading: isFeesLoading } = useQuery({
    queryKey: ["classFees", academicYear, term],
    queryFn: () => getClassFees(academicYear, term),
    enabled: !!academicYear && !!term,
  });

  const existingFees: Record<string, number> = useMemo(() => {
    const fees = feesData?.data?.fees ?? [];
    const map: Record<string, number> = {};
    fees.forEach((f: any) => { map[f.className] = f.amount; });
    return map;
  }, [feesData]);

  // Sync the editable inputs whenever the selected session's fees load
  useEffect(() => {
    const next: Record<string, string> = {};
    classes.forEach((c) => {
      next[c.name] = existingFees[c.name] !== undefined ? String(existingFees[c.name]) : "";
    });
    setAmounts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingFees, classes.length]);

  const saveMutation = useMutation({
    mutationFn: (className: string) =>
      setClassFee({
        className,
        academicYear,
        term,
        amount: Number(amounts[className]) || 0,
      }),
    onSuccess: () => {
      showSuccessToast("Fee saved");
      queryClient.invalidateQueries({ queryKey: ["classFees", academicYear, term] });
    },
    onError: () => showErrorToast("Failed to save fee"),
  });

  const uniqueYears = Array.from(new Set(sessions.map((s) => s.academicYear))).sort();
  const termsForYear = sessions
    .filter((s) => s.academicYear === academicYear)
    .map((s) => s.term);

  return (
    <div className="p-3 sm:p-6 font-Poppins">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F97316]">Class Fees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set each class's tuition for a specific term. A term with no fee set is free to
          view — nothing carries over from other terms.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Academic Year</label>
          <select
            value={academicYear}
            onChange={(e) => { setAcademicYear(e.target.value); setTerm(""); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="">Select year…</option>
            {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            disabled={!academicYear}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] disabled:opacity-50"
          >
            <option value="">Select term…</option>
            {termsForYear.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {!academicYear || !term ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          Choose an academic year and term to set fees for it.
        </div>
      ) : isFeesLoading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_160px_100px] bg-[#F97316] text-white text-xs font-semibold px-4 py-3">
            <span>Class</span>
            <span>Fee (₦)</span>
            <span className="text-right">Action</span>
          </div>
          {classes.map((c, idx) => (
            <div
              key={c.id}
              className={`grid grid-cols-[1fr_160px_100px] items-center px-4 py-3 gap-2 text-sm border-b border-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <span className="font-medium text-gray-800">{c.name}</span>
              <input
                type="number"
                min={0}
                value={amounts[c.name] ?? ""}
                onChange={(e) => setAmounts((a) => ({ ...a, [c.name]: e.target.value }))}
                placeholder="0"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <button
                onClick={() => saveMutation.mutate(c.name)}
                disabled={saveMutation.isPending}
                className="justify-self-end text-xs font-semibold text-[#F97316] hover:underline disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">No classes found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassFeesPage;
