import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useClasses from "../../hooks/useClasses";
import useActiveSession, { ISession } from "../../hooks/useActiveSession";
import { getAllAcademicSessions, getClassFees } from "../../services/api/calls/getApis";
import { setClassFee } from "../../services/api/calls/updateApis";
import { deleteClassFee } from "../../services/api/calls/deleteApis";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import Loader from "../../shared/Loader";

const FEE_TYPES = [
  "School Fee",
  "Uniform",
  "Sport Wear",
  "School Bus",
  "Snack",
  "Science",
  "Games",
  "Library Fee",
  "Extra Activities",
  "Starter Pack",
  "Other",
];

interface FeeLine {
  _id: string;
  className: string;
  feeType: string;
  amount: number;
}

const ClassFeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSession } = useActiveSession();
  const { classNameData: classes } = useClasses();

  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");

  // New-fee mini-form state, keyed by className
  const [draftType, setDraftType] = useState<Record<string, string>>({});
  const [draftAmount, setDraftAmount] = useState<Record<string, string>>({});

  const { data: sessionsData } = useQuery({
    queryKey: ["classFeesSessionList"],
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

  const feesByClass: Record<string, FeeLine[]> = useMemo(() => {
    const fees: FeeLine[] = feesData?.data?.fees ?? [];
    const map: Record<string, FeeLine[]> = {};
    fees.forEach((f) => {
      if (!map[f.className]) map[f.className] = [];
      map[f.className].push(f);
    });
    return map;
  }, [feesData]);

  const saveMutation = useMutation({
    mutationFn: (vars: { className: string; feeType: string; amount: number }) =>
      setClassFee({ className: vars.className, academicYear, term, feeType: vars.feeType, amount: vars.amount }),
    onSuccess: (_res, vars) => {
      showSuccessToast("Fee saved");
      setDraftType((d) => ({ ...d, [vars.className]: "" }));
      setDraftAmount((d) => ({ ...d, [vars.className]: "" }));
      queryClient.invalidateQueries({ queryKey: ["classFees", academicYear, term] });
    },
    onError: () => showErrorToast("Failed to save fee"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClassFee(id),
    onSuccess: () => {
      showSuccessToast("Fee removed");
      queryClient.invalidateQueries({ queryKey: ["classFees", academicYear, term] });
    },
    onError: () => showErrorToast("Failed to remove fee"),
  });

  const uniqueYears = Array.from(new Set(sessions.map((s) => s.academicYear))).sort();
  const termsForYear = sessions.filter((s) => s.academicYear === academicYear).map((s) => s.term);

  const handleAddFee = (className: string) => {
    const feeType = draftType[className] || FEE_TYPES[0];
    const amount = Number(draftAmount[className]);
    if (!amount || amount <= 0) {
      showErrorToast("Enter an amount greater than 0");
      return;
    }
    saveMutation.mutate({ className, feeType, amount });
  };

  return (
    <div className="p-3 sm:p-6 font-Poppins">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F97316]">Class Fees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add one or more fee items per class for a specific term — School Fee, Uniform, Bus,
          etc. A term with nothing added is free to view; nothing carries over from other terms.
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
          Choose an academic year and term to manage fees for it.
        </div>
      ) : isFeesLoading ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {classes.map((c) => {
            const lines = feesByClass[c.name] ?? [];
            const total = lines.reduce((sum, f) => sum + f.amount, 0);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">{c.name}</h2>
                  <span className="text-xs text-gray-400">Total: ₦{total.toLocaleString()}</span>
                </div>

                {lines.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {lines.map((f) => (
                      <div key={f._id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-700">{f.feeType}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">₦{f.amount.toLocaleString()}</span>
                          <button
                            onClick={() => deleteMutation.mutate(f._id)}
                            disabled={deleteMutation.isPending}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={draftType[c.name] ?? FEE_TYPES[0]}
                    onChange={(e) => setDraftType((d) => ({ ...d, [c.name]: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    {FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="number"
                    min={0}
                    placeholder="Amount (₦)"
                    value={draftAmount[c.name] ?? ""}
                    onChange={(e) => setDraftAmount((d) => ({ ...d, [c.name]: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                  <button
                    onClick={() => handleAddFee(c.name)}
                    disabled={saveMutation.isPending}
                    className="text-xs font-semibold text-white bg-[#F97316] hover:bg-[#046a71] rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    Add / Update Fee
                  </button>
                </div>
              </div>
            );
          })}
          {classes.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              No classes found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassFeesPage;
