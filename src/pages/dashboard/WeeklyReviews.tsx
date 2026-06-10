import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWeeklyReviewsByClass, getClassStudentsId } from "../../services/api/calls/getApis";
import { upsertWeeklyReview } from "../../services/api/calls/postApis";
import { getRole } from "../../utils/authTokens";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import useActiveSession from "../../hooks/useActiveSession";
import useClasses from "../../hooks/useClasses";
import { getStaff } from "../../services/api/calls/getApis";

// Returns ISO string of Monday for a given date string
function mondayOf(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function weekLabel(mondayIso: string): string {
  const mon = new Date(mondayIso);
  const fri = new Date(mondayIso);
  fri.setDate(fri.getDate() + 4);
  return `Week of ${mon.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${fri.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`;
}

const WeeklyReviewsPage: React.FC = () => {
  const role = getRole();
  const { activeSession } = useActiveSession();
  const queryClient = useQueryClient();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [weekOf, setWeekOf] = useState(mondayOf(new Date().toISOString()));
  const [message, setMessage] = useState("");
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({}); // studentId → note
  const [showForm, setShowForm] = useState(false);

  const { classNameData: allClasses } = useClasses();

  // Staff: filter to assigned class only
  const { data: staffProfileData } = useQuery({
    queryKey: ["staffMe"],
    queryFn: getStaff,
    enabled: role === "staff",
    staleTime: 5 * 60 * 1000,
  });
  const assignedClassNames: string[] = staffProfileData?.data?.staff?.classes ?? [];
  const classes = role === "staff"
    ? allClasses.filter((c: any) => assignedClassNames.includes(c.name))
    : allClasses;

  // Auto-select if staff has exactly one class
  useEffect(() => {
    if (role === "staff" && classes.length === 1 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, role, selectedClassId]);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["weeklyReviews", selectedClassId],
    queryFn: () => getWeeklyReviewsByClass(selectedClassId),
    enabled: !!selectedClassId,
    staleTime: 60 * 1000,
  });
  const reviews: any[] = reviewsData?.data?.reviews ?? [];

  const { data: studentsData } = useQuery({
    queryKey: ["classStudentsId", selectedClassId],
    queryFn: () => getClassStudentsId(selectedClassId),
    enabled: !!selectedClassId && showForm,
    staleTime: 5 * 60 * 1000,
  });
  const students: any[] = studentsData?.data?.students ?? [];

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertWeeklyReview({
        classId: selectedClassId,
        weekOf,
        term: activeSession?.term ?? "",
        academicYear: activeSession?.academicYear ?? "",
        message,
        studentNotes: Object.entries(studentNotes)
          .filter(([, note]) => note.trim())
          .map(([studentId, note]) => ({ studentId, note })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyReviews", selectedClassId] });
      showSuccessToast("Weekly review saved");
      setShowForm(false);
      setMessage("");
      setStudentNotes({});
    },
    onError: () => showErrorToast("Failed to save review"),
  });

  const selectedClass = classes.find((c: any) => (c.id) === selectedClassId);

  const openForm = (existing?: any) => {
    if (existing) {
      setWeekOf(existing.weekOf.slice(0, 10));
      setMessage(existing.message);
      const notes: Record<string, string> = {};
      (existing.studentNotes ?? []).forEach((n: any) => { notes[n.studentId] = n.note; });
      setStudentNotes(notes);
    } else {
      setWeekOf(mondayOf(new Date().toISOString()));
      setMessage("");
      setStudentNotes({});
    }
    setShowForm(true);
  };

  return (
    <div className="p-6 font-Poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F97316]">Weekly Reviews</h1>
        {selectedClassId && (
          <button
            onClick={() => openForm()}
            className="bg-[#F97316] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#EA580C] transition-colors"
          >
            + New Review
          </button>
        )}
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        >
          <option value="">Choose a class…</option>
          {classes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Reviews list */}
      {selectedClassId && (
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              No reviews posted yet for {selectedClass?.name}. Click <strong>+ New Review</strong> to post the first one.
            </div>
          ) : (
            reviews.map((r: any) => (
              <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{weekLabel(r.weekOf)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      By {r.author?.firstName} {r.author?.lastName} · Posted {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => openForm(r)}
                    className="text-xs text-[#F97316] underline shrink-0 ml-4"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.message}</p>
                {r.studentNotes?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs font-medium text-gray-400 mb-2">Individual notes ({r.studentNotes.length} students)</p>
                    <div className="space-y-1">
                      {r.studentNotes.map((n: any) => (
                        <div key={n.studentId} className="flex gap-2 text-sm">
                          <span className="font-medium text-gray-600 shrink-0">·</span>
                          <span className="text-gray-600">{n.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit slide-over */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Weekly Review — {selectedClass?.name}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Week picker */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Week (any day — auto-snaps to Monday)</label>
                <input
                  type="date"
                  value={weekOf}
                  onChange={(e) => setWeekOf(mondayOf(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <p className="text-xs text-gray-400 mt-1">{weekLabel(weekOf)}</p>
              </div>

              {/* Class-wide message */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Update *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Write the weekly academic update for the whole class…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                />
              </div>

              {/* Per-student notes */}
              {students.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Individual Notes (optional)</p>
                  <div className="space-y-3">
                    {students.map((s: any) => {
                      const name = `${s.userId?.firstName ?? ""} ${s.userId?.lastName ?? ""}`.trim() || s.studentId;
                      return (
                        <div key={s._id}>
                          <label className="block text-xs text-gray-500 mb-1">{name}</label>
                          <input
                            value={studentNotes[s._id] ?? ""}
                            onChange={(e) => setStudentNotes((n) => ({ ...n, [s._id]: e.target.value }))}
                            placeholder="Personal note for this student…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!message.trim() || saveMutation.isPending}
                className="flex-1 bg-[#F97316] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {saveMutation.isPending ? "Saving…" : "Save Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReviewsPage;
