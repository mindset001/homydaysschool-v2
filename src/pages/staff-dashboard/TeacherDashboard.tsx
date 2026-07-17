import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClassStudentsId, getClass, getAttendance } from "../../services/api/calls/getApis";
import { createAttendance } from "../../services/api/calls/postApis";
import { getUser } from "../../utils/authTokens";
import Loader from "../../shared/Loader";
import { showErrorToast, showSuccessToast } from "../../shared/ToastNotification";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const TeacherDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const user = getUser() as any;
  const staffId = String(user.id || user._id || user.userId || "");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(formatDate(new Date()));
  const [attendancePresent, setAttendancePresent] = useState<Record<string, boolean>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<string>("");

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceModalRecord, setAttendanceModalRecord] = useState<any | null>(null);

  const {
    data: classData,
    isLoading: isClassesLoading,
    isError: isClassesError,
    error: classesError,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: () => getClass(),
    retry: 1,
  });

  const classes: any[] = useMemo(() => {
    const raw = classData?.data?.classes;
    if (!Array.isArray(raw)) return [];
    return raw;
  }, [classData]);

  const assignedClasses = useMemo(() => {
    if (!staffId || !classes.length) return [];
    return classes.filter((cls: any) => {
      if (!cls.teacher) return false;
      if (typeof cls.teacher === "string") return cls.teacher === staffId;
      const teacherId = String(cls.teacher._id || cls.teacher.id || "");
      const teacherUserId = String(cls.teacher.userId?._id || cls.teacher.userId?.id || "");
      return teacherId === staffId || teacherUserId === staffId;
    });
  }, [classes, staffId]);

  const selectedClass = assignedClasses.find((cls: any) => String(cls._id || cls.id) === selectedClassId);

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
  } = useQuery({
    queryKey: ["classStudents", selectedClassId],
    queryFn: () => getClassStudentsId(selectedClassId as string),
    enabled: !!selectedClassId,
    retry: 1,
  });

  const students: any[] = useMemo(() => {
    const raw = studentsData?.data?.students || [];
    if (!Array.isArray(raw)) return [];
    return raw;
  }, [studentsData]);

  const attendanceQuery = useQuery({
    queryKey: ["attendance", selectedClassId],
    queryFn: () => getAttendance(selectedClassId as string),
    enabled: !!selectedClassId,
    retry: 1,
  });

  const attendanceMutation = useMutation({
    mutationFn: (payload: any) => createAttendance(selectedClassId as string, payload),
    onSuccess: () => {
      showSuccessToast("Attendance saved successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance", selectedClassId] });
    },
    onError: (err: any) => showErrorToast(err?.response?.data?.message || "Failed to save attendance"),
  });

  const handleAttendanceToggle = (studentId: string) => {
    setAttendancePresent((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedClassId) return;
    const existingStudentIds = students.map((student) => String(student._id || student.id || student.userId));
    const present = existingStudentIds.filter((id) => attendancePresent[id]);
    const absent = existingStudentIds.filter((id) => !attendancePresent[id]);
    await attendanceMutation.mutateAsync({ date: attendanceDate, present, absent, notes: attendanceNotes });
  };

  if (isClassesLoading) return <Loader />;
  if (isClassesError) return <div className="p-8 text-red-600">{(classesError as Error)?.message || "Unable to load classes."}</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-sm text-gray-600">Manage attendance for your classes.</p>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-700">Assigned classes</div>
          <div className="flex flex-wrap gap-2">
            {assignedClasses.length > 0 ? assignedClasses.map((cls: any) => (
              <button
                key={cls._id || cls.id}
                onClick={() => setSelectedClassId(String(cls._id || cls.id))}
                className={`rounded-full border px-4 py-2 text-sm ${String(cls._id || cls.id) === selectedClassId ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
              >
                {cls.name}
              </button>
            )) : (
              <span className="text-gray-500">No teacher classes assigned.</span>
            )}
          </div>
        </div>
      </div>

      {selectedClassId ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Attendance</h2>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <label className="flex flex-col gap-1 text-sm">
                  Date
                  <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="w-full rounded border px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Notes
                  <input type="text" value={attendanceNotes} onChange={(e) => setAttendanceNotes(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Optional notes" />
                </label>
              </div>
              <div className="mt-4 overflow-x-auto rounded border">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isStudentsLoading ? (
                      <tr><td colSpan={2} className="p-3">Loading students...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan={2} className="p-3">No students found for this class.</td></tr>
                    ) : students.map((student) => {
                      const studentId = String(student._id || student.id || student.userId || student.studentId);
                      const firstName = student.userId?.firstName || student.userId?.first_name || student.firstName || student.first_name || "";
                      const lastName = student.userId?.lastName || student.userId?.last_name || student.lastName || student.last_name || "";
                      const studentName = [firstName, lastName].filter(Boolean).join(" ") || student.userId?.username || student.name || "Student";

                      return (
                        <tr key={studentId} className="border-t">
                          <td className="px-3 py-2">{studentName}</td>
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={!!attendancePresent[studentId]} onChange={() => handleAttendanceToggle(studentId)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleAttendanceSubmit}
                disabled={attendanceMutation.isPending}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {attendanceMutation.isPending ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Class Summary</h2>
              <p className="text-sm text-gray-600">{selectedClass?.name}</p>
              <p className="text-sm text-gray-600">Grade: {selectedClass?.grade || "N/A"}</p>
              <p className="text-sm text-gray-600">Section: {selectedClass?.section || "N/A"}</p>
              <div className="mt-4 space-y-3">
                <div className="rounded border bg-slate-50 p-3">
                  <h3 className="font-semibold">Attendance Records</h3>
                  {attendanceQuery.isLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (() => {
                    const records = attendanceQuery.data?.data?.attendance || [];
                    if (!records.length) return <div className="text-sm text-gray-500">No records yet.</div>;

                    // class-level totals
                    const totalSessions = records.length;
                    const totalPresentCount = records.reduce((acc: number, r: any) => acc + (Array.isArray(r.present) ? r.present.length : 0), 0);
                    const studentCount = students.length || (selectedClass?.students?.length || 0);
                    const attendancePercent = studentCount && totalSessions ? Math.round((totalPresentCount / (studentCount * totalSessions)) * 10000) / 100 : 0;

                    return (
                      <div>
                        <div className="mb-2 text-sm text-gray-700">Sessions: {totalSessions} • Students: {studentCount} • Avg attendance: {attendancePercent}%</div>
                        {records.map((record: any) => (
                          <button
                            key={record._id}
                            onClick={() => { setAttendanceModalRecord(record); setAttendanceModalOpen(true); }}
                            className="w-full text-left text-sm text-gray-700 border-b last:border-b-0 py-2 hover:bg-slate-100"
                          >
                            {new Date(record.date).toLocaleDateString()} — Present: {Array.isArray(record.present) ? record.present.length : 0}, Absent: {Array.isArray(record.absent) ? record.absent.length : 0}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </aside>
          {attendanceModalOpen && attendanceModalRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Attendance Details — {new Date(attendanceModalRecord.date).toLocaleDateString()}</h3>
                  <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setAttendanceModalOpen(false)}>Close</button>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">Notes: {attendanceModalRecord.notes || 'None'}</div>
                  <div>
                    <h4 className="font-semibold">Present ({Array.isArray(attendanceModalRecord.present) ? attendanceModalRecord.present.length : 0})</h4>
                    <ul className="list-disc ml-6 mt-2 text-sm text-gray-700 max-h-40 overflow-auto">
                      {(attendanceModalRecord.present || []).map((id: string) => {
                        const s = students.find((st: any) => String(st._id || st.id || st.userId) === String(id) || String(st.userId?._id) === String(id));
                        const name = s ? ([s.userId?.firstName || s.firstName, s.userId?.lastName || s.lastName].filter(Boolean).join(' ') || s.name) : id;
                        return <li key={id}>{name}</li>;
                      })}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Absent ({Array.isArray(attendanceModalRecord.absent) ? attendanceModalRecord.absent.length : 0})</h4>
                    <ul className="list-disc ml-6 mt-2 text-sm text-gray-700 max-h-40 overflow-auto">
                      {(attendanceModalRecord.absent || []).map((id: string) => {
                        const s = students.find((st: any) => String(st._id || st.id || st.userId) === String(id) || String(st.userId?._id) === String(id));
                        const name = s ? ([s.userId?.firstName || s.firstName, s.userId?.lastName || s.lastName].filter(Boolean).join(' ') || s.name) : id;
                        return <li key={id}>{name}</li>;
                      })}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold">Per-student totals</h4>
                    <div className="text-sm text-gray-700 mt-2">
                      {(() => {
                        const records = attendanceQuery.data?.data?.attendance || [];
                        const totalSessions = records.length;
                        if (!students.length) return <div>No student data.</div>;
                        return (
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr>
                                <th className="py-1">Student</th>
                                <th className="py-1">Present</th>
                                <th className="py-1">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((st: any) => {
                                const sid = String(st._id || st.id || st.userId?._id || st.userId || st.studentId);
                                const presentCount = records.reduce((acc: number, r: any) => acc + ((Array.isArray(r.present) && r.present.map(String).includes(sid)) ? 1 : 0), 0);
                                const pct = totalSessions ? Math.round((presentCount / totalSessions) * 10000) / 100 : 0;
                                const name = [st.userId?.firstName || st.firstName, st.userId?.lastName || st.lastName].filter(Boolean).join(' ') || st.name || sid;
                                return (
                                  <tr key={sid} className="border-t">
                                    <td className="py-1">{name}</td>
                                    <td className="py-1">{presentCount}</td>
                                    <td className="py-1">{pct}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-gray-600">Select one of your assigned classes above to begin recording attendance.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
