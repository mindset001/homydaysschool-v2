import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClassStudentsId, getAttendance, getStaff } from "../../services/api/calls/getApis";
import { createAttendance } from "../../services/api/calls/postApis";
import { getRole } from "../../utils/authTokens";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import useClasses from "../../hooks/useClasses";

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

const AttendancePage: React.FC = () => {
  const role = getRole();
  const queryClient = useQueryClient();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  const { classNameData: allClasses } = useClasses();

  // For staff: fetch their profile to get assigned classes (by name)
  const { data: staffProfileData } = useQuery({
    queryKey: ["staffMe"],
    queryFn: getStaff,
    enabled: role === "staff",
    staleTime: 5 * 60 * 1000,
  });
  const assignedClassNames: string[] = staffProfileData?.data?.staff?.classes ?? [];

  // Staff only see their assigned classes; admin sees all
  const classes = role === "staff"
    ? allClasses.filter((c: any) => assignedClassNames.includes(c.name))
    : allClasses;

  const { data: studentsData } = useQuery({
    queryKey: ["classStudentsId", selectedClassId],
    queryFn: () => getClassStudentsId(selectedClassId),
    enabled: !!selectedClassId,
    staleTime: 2 * 60 * 1000,
  });

  const students: any[] = studentsData?.data?.students ?? [];

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", selectedClassId],
    queryFn: () => getAttendance(selectedClassId, date),
    enabled: !!selectedClassId,
    staleTime: 60 * 1000,
  });

  const attendanceRecords: any[] = attendanceData?.data?.attendance ?? attendanceData?.data ?? [];

  const markMutation = useMutation({
    mutationFn: ({ classId, ...rest }: any) => createAttendance(classId, rest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", selectedClassId] });
      showSuccessToast("Attendance saved");
      setPresent({});
      setNotes("");
    },
    onError: () => showErrorToast("Failed to save attendance"),
  });

  const handleSubmit = () => {
    if (!selectedClassId || !date) return;
    const records = students.map((s: any) => ({
      studentId: s._id,
      status: present[s._id] ? "present" : "absent",
    }));
    markMutation.mutate({ classId: selectedClassId, date, records, notes });
  };

  const selectedClass = classes.find((c: any) => (c.id ?? c._id) === selectedClassId);

  return (
    <div className="p-6 font-Poppins">
      <h1 className="text-2xl font-bold text-[#F97316] mb-6">Attendance</h1>

      {/* Class selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setPresent({}); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="">Select a class…</option>
              {classes.map((c: any) => (
                <option key={c.id ?? c._id} value={c.id ?? c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>
      </div>

      {selectedClassId && (
        <>
          {/* Mark attendance */}
          {(role === "admin" || role === "staff") && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Mark Attendance — {selectedClass?.name} · {date}
              </h2>
              {students.length === 0 ? (
                <p className="text-sm text-gray-400">No students in this class.</p>
              ) : (
                <>
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        students.forEach((s: any) => { all[s._id] = true; });
                        setPresent(all);
                      }}
                      className="text-xs text-[#F97316] underline"
                    >
                      Mark all present
                    </button>
                    <button
                      onClick={() => setPresent({})}
                      className="text-xs text-gray-400 underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {students.map((s: any) => {
                      const name = `${s.userId?.firstName ?? ""} ${s.userId?.lastName ?? ""}`.trim();
                      const isPresent = !!present[s._id];
                      return (
                        <button
                          key={s._id}
                          onClick={() => setPresent((p) => ({ ...p, [s._id]: !p[s._id] }))}
                          className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm border transition-colors ${
                            isPresent
                              ? "bg-green-50 border-green-300 text-green-800"
                              : "bg-red-50 border-red-200 text-red-700"
                          }`}
                        >
                          <span>{name || s.studentId}</span>
                          <span className="font-semibold">{isPresent ? "Present" : "Absent"}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any notes for this session…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={markMutation.isPending}
                    className="bg-[#F97316] text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-[#EA580C] transition-colors disabled:opacity-50"
                  >
                    {markMutation.isPending ? "Saving…" : "Save Attendance"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Attendance history */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Attendance History</h2>
            {attendanceRecords.length === 0 ? (
              <p className="text-sm text-gray-400">No attendance records yet for this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 pr-4 font-medium">Date</th>
                      <th className="pb-2 pr-4 font-medium">Present</th>
                      <th className="pb-2 pr-4 font-medium">Absent</th>
                      <th className="pb-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((rec: any) => {
                      const presentCount = rec.records?.filter((r: any) => r.status === "present").length ?? 0;
                      const absentCount = rec.records?.filter((r: any) => r.status === "absent").length ?? 0;
                      return (
                        <tr key={rec._id} className="border-b border-gray-50">
                          <td className="py-2 pr-4">{new Date(rec.date).toLocaleDateString()}</td>
                          <td className="py-2 pr-4 text-green-600 font-medium">{presentCount}</td>
                          <td className="py-2 pr-4 text-red-500 font-medium">{absentCount}</td>
                          <td className="py-2 text-gray-500">{rec.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
