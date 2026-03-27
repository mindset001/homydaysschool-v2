import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPromotionPreview } from "../../services/api/calls/getApis";
import { promoteStudents } from "../../services/api/calls/postApis";
import useActiveSession from "../../hooks/useActiveSession";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface StudentEntry {
  id: string;
  name: string;
}

interface PreviewRow {
  from: string;
  to: string;
  graduating: boolean;
  studentCount: number;
  students: StudentEntry[];
}

interface PromotionResult {
  from: string;
  to: string;
  promoted: number;
  retained: number;
}

/** Checkbox that shows indeterminate state when some-but-not-all are selected */
function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="accent-[#05878F] w-4 h-4 cursor-pointer"
    />
  );
}

export default function StudentPromotion() {
  const queryClient = useQueryClient();
  const { activeSession } = useActiveSession();

  // Track selected student IDs individually — unchecked = retained
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promotionResults, setPromotionResults] = useState<PromotionResult[] | null>(null);

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["promotion-preview"],
    queryFn: getPromotionPreview,
  });

  const preview: PreviewRow[] = data?.data?.preview ?? [];

  // Auto-select all students on first load
  useEffect(() => {
    if (preview.length > 0 && selectedStudents.size === 0) {
      const allIds = preview.flatMap((r) => r.students.map((s) => s.id));
      if (allIds.length > 0) setSelectedStudents(new Set(allIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mutation = useMutation({
    mutationFn: promoteStudents,
    onSuccess: (res: any) => {
      const results: PromotionResult[] = res?.data?.results ?? [];
      const total: number = res?.data?.totalPromoted ?? 0;
      setPromotionResults(results);
      setConfirmOpen(false);
      setSelectedStudents(new Set());
      setExpandedClasses(new Set());
      queryClient.invalidateQueries({ queryKey: ["promotion-preview"] });
      queryClient.invalidateQueries({ queryKey: ["classStudents"] });
      toast.success(`${total} student(s) promoted successfully!`);
    },
    onError: () => {
      toast.error("Promotion failed. Please try again.");
    },
  });

  // ── Per-class helpers ───────────────────────────────────────────────────
  const classStudentIds = (row: PreviewRow) => row.students.map((s) => s.id);

  const classSelectionState = (row: PreviewRow): "all" | "some" | "none" => {
    const ids = classStudentIds(row);
    if (ids.length === 0) return "none";
    const n = ids.filter((id) => selectedStudents.has(id)).length;
    if (n === ids.length) return "all";
    if (n > 0) return "some";
    return "none";
  };

  const toggleClass = (row: PreviewRow, forceOn?: boolean) => {
    const ids = classStudentIds(row);
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      const shouldSelect = forceOn !== undefined ? forceOn : classSelectionState(row) !== "all";
      if (shouldSelect) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (cls: string) => {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  };

  // ── Global select state ─────────────────────────────────────────────────
  const allStudentIds = preview.flatMap((r) => r.students.map((s) => s.id));
  const globalState =
    allStudentIds.length === 0
      ? "none"
      : allStudentIds.every((id) => selectedStudents.has(id))
      ? "all"
      : allStudentIds.some((id) => selectedStudents.has(id))
      ? "some"
      : "none";

  const toggleGlobal = (checked: boolean) => {
    if (checked) setSelectedStudents(new Set(allStudentIds));
    else setSelectedStudents(new Set());
  };

  // ── Confirm summary ─────────────────────────────────────────────────────
  const confirmSummary = preview
    .map((row) => ({
      row,
      promoting: row.students.filter((s) => selectedStudents.has(s.id)),
      retaining: row.students.filter((s) => !selectedStudents.has(s.id)),
    }))
    .filter((x) => x.promoting.length > 0);

  const totalSelected = selectedStudents.size;

  const handlePromote = () => {
    mutation.mutate({ studentIds: Array.from(selectedStudents) });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto font-Poppins">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-Lora font-bold text-gray-900">Student Promotion</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Select which students to promote. <span className="text-orange-500 font-medium">Uncheck a student</span> to
          retain them in their current class. Everyone else moves to the next class.
        </p>
        {activeSession && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFEFF] border border-[#05878F]/30 text-[12px] text-[#05878F] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#05878F]" />
            Current Session: {activeSession.term} &middot; {activeSession.academicYear}
          </div>
        )}
      </div>

      {/* Post-promotion results */}
      {promotionResults && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="text-[14px] font-bold text-green-800 mb-3">Promotion Complete</h2>
          <div className="space-y-1.5">
            {promotionResults.map((r) => (
              <div key={r.from} className="flex items-center gap-2 text-[13px] text-green-800 flex-wrap">
                <span className="font-semibold">{r.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold">{r.to}</span>
                <span className="text-green-600 ml-auto">{r.promoted} promoted</span>
                {r.retained > 0 && (
                  <span className="text-orange-500 ml-2">{r.retained} retained</span>
                )}
              </div>
            ))}
          </div>
          <button className="mt-3 text-[12px] text-green-700 underline" onClick={() => setPromotionResults(null)}>
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-red-500 text-[13px]">Failed to load promotion preview.</div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer select-none">
              <IndeterminateCheckbox
                checked={globalState === "all"}
                indeterminate={globalState === "some"}
                onChange={toggleGlobal}
                disabled={allStudentIds.length === 0}
              />
              {globalState === "all" ? "Deselect all" : "Select all students"}
            </label>
            <button
              disabled={totalSelected === 0 || mutation.isPending}
              onClick={() => setConfirmOpen(true)}
              className="px-5 py-2 rounded-[8px] bg-[#05878F] text-white text-[13px] font-semibold
                         hover:bg-[#046a71] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Promote {totalSelected > 0 ? `${totalSelected} Student${totalSelected !== 1 ? "s" : ""}` : "Selected"}
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-[48px_1fr_36px_1fr_100px] bg-[#05878F] text-white text-[12px] font-semibold px-4 py-3 gap-2 items-center">
              <span />
              <span>Current Class</span>
              <span />
              <span>Promoted To</span>
              <span className="text-right">Students</span>
            </div>

            {preview.map((row, idx) => {
              const state = classSelectionState(row);
              const isExpanded = expandedClasses.has(row.from);
              const hasAny = row.studentCount > 0;
              const promotedCount = row.students.filter((s) => selectedStudents.has(s.id)).length;
              const retainedCount = row.studentCount - promotedCount;

              return (
                <div key={row.from} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <div
                    className={`grid grid-cols-[48px_1fr_36px_1fr_100px] px-4 py-3 gap-2 items-center text-[13px] border-b border-gray-100
                      ${state !== "none" && hasAny ? "bg-[#ECFEFF]/50" : ""}`}
                  >
                    <IndeterminateCheckbox
                      checked={state === "all"}
                      indeterminate={state === "some"}
                      onChange={(checked) => toggleClass(row, checked)}
                      disabled={!hasAny}
                    />
                    <span className="font-semibold text-gray-800">{row.from}</span>
                    <span className="text-gray-400 text-center">→</span>
                    <span className={`font-medium ${row.graduating ? "text-purple-600" : "text-[#05878F]"}`}>
                      {row.graduating ? "🎓 Graduated" : row.to}
                    </span>
                    <div className="flex flex-col items-end gap-0.5">
                      {hasAny ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-green-600 font-semibold">{promotedCount}↑</span>
                            {retainedCount > 0 && (
                              <span className="text-[11px] text-orange-500 font-semibold">{retainedCount} held</span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleExpand(row.from)}
                            className="text-[10px] text-[#05878F] underline"
                          >
                            {isExpanded ? "hide" : "view all"}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-300 text-[12px]">—</span>
                      )}
                    </div>
                  </div>

                  {/* Per-student list */}
                  {isExpanded && row.students.length > 0 && (
                    <div className="border-b border-gray-100 bg-white px-12 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                        {row.students.map((s) => {
                          const isPromoting = selectedStudents.has(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isPromoting}
                                onChange={() => toggleStudent(s.id)}
                                className="accent-[#05878F] w-4 h-4 shrink-0"
                              />
                              <span className={`text-[12px] truncate ${isPromoting ? "text-gray-800" : "text-orange-500 line-through"}`}>
                                {s.name}
                              </span>
                              {!isPromoting && (
                                <span className="text-[10px] text-orange-400 shrink-0">(retained)</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {allStudentIds.length === 0 && (
            <p className="text-center text-gray-400 text-[13px] mt-6">
              No students are currently enrolled in any class.
            </p>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-[16px] font-Lora font-bold text-gray-900 mb-1">Confirm Promotion</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Students shown with ⏸ will <span className="font-semibold text-orange-600">remain in their current class</span>.
              Students shown with ↑ will move to the next class.
            </p>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 mb-4 max-h-64 overflow-y-auto space-y-3">
              {confirmSummary.map(({ row, promoting, retaining }) => (
                <div key={row.from}>
                  <div className="flex items-center gap-2 text-[12px] mb-1 font-bold text-gray-700">
                    <span>{row.from}</span>
                    <span className="text-gray-400 font-normal">→</span>
                    <span className={row.graduating ? "text-purple-600" : "text-[#05878F]"}>
                      {row.graduating ? "Graduated" : row.to}
                    </span>
                    <span className="ml-auto text-gray-400 font-normal text-[11px]">
                      {promoting.length} up · {retaining.length} held
                    </span>
                  </div>
                  <div className="ml-2 space-y-0.5">
                    {promoting.map((s) => (
                      <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-green-700">
                        <span>↑</span> {s.name}
                      </div>
                    ))}
                    {retaining.map((s) => (
                      <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-orange-500">
                        <span>⏸</span> {s.name} <span className="text-gray-400">(retained)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2 rounded-[8px] border border-gray-200 text-gray-700 text-[13px] font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePromote}
                disabled={mutation.isPending}
                className="flex-1 py-2 rounded-[8px] bg-[#05878F] text-white text-[13px] font-semibold
                           hover:bg-[#046a71] transition-colors disabled:opacity-60"
              >
                {mutation.isPending ? "Promoting..." : `Promote ${totalSelected}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

