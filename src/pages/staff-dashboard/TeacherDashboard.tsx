import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClassStudentsId, getClass, getAttendance, getAssignmentsByClass, getQuizzesByClass, getAssignmentMarks, getQuizMarks } from "../../services/api/calls/getApis";
import { createAttendance, createAssignment, createQuiz } from "../../services/api/calls/postApis";
import { markAssignment, markQuiz } from "../../services/api/calls/marksApis";
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

  const createQuestion = () => ({
    type: "theory",
    prompt: "",
    options: ["", ""],
  });

  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    dueDate: "",
    questions: [createQuestion()],
  });
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: "",
    questions: [createQuestion()],
  });
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceModalRecord, setAttendanceModalRecord] = useState<any | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentModalRecord, setAssignmentModalRecord] = useState<any | null>(null);
  const [assignmentMarks, setAssignmentMarks] = useState<Record<string, any>>({});
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizModalRecord, setQuizModalRecord] = useState<any | null>(null);
  const [quizMarks, setQuizMarks] = useState<Record<string, any>>({});

  const assignmentMarksQuery = useQuery({
    queryKey: ['assignmentMarks', assignmentModalRecord?._id],
    queryFn: () => getAssignmentMarks(assignmentModalRecord?._id as string),
    enabled: !!assignmentModalRecord?._id,
    retry: 1,
  });

  const quizMarksQuery = useQuery({
    queryKey: ['quizMarks', quizModalRecord?._id],
    queryFn: () => getQuizMarks(quizModalRecord?._id as string),
    enabled: !!quizModalRecord?._id,
    retry: 1,
  });

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

  const assignmentsQuery = useQuery({
    queryKey: ["assignments", selectedClassId],
    queryFn: () => getAssignmentsByClass(selectedClassId as string),
    enabled: !!selectedClassId,
    retry: 1,
  });

  const quizzesQuery = useQuery({
    queryKey: ["quizzes", selectedClassId],
    queryFn: () => getQuizzesByClass(selectedClassId as string),
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

  const assignmentMutation = useMutation({
    mutationFn: (payload: any) => createAssignment(selectedClassId as string, payload),
    onSuccess: () => {
      showSuccessToast("Assignment created successfully");
      queryClient.invalidateQueries({ queryKey: ["assignments", selectedClassId] });
      setAssignmentData({ title: "", description: "", dueDate: "", questions: [createQuestion()] });
    },
    onError: (err: any) => showErrorToast(err?.response?.data?.message || "Failed to create assignment"),
  });

  const quizMutation = useMutation({
    mutationFn: (payload: any) => createQuiz(selectedClassId as string, payload),
    onSuccess: () => {
      showSuccessToast("Quiz created successfully");
      queryClient.invalidateQueries({ queryKey: ["quizzes", selectedClassId] });
      setQuizData({ title: "", description: "", scheduledAt: "", durationMinutes: "", questions: [createQuestion()] });
    },
    onError: (err: any) => showErrorToast(err?.response?.data?.message || "Failed to create quiz"),
  });

  const markAssignmentMutation = useMutation({
    mutationFn: ({assignmentId, marks}: any) => markAssignment(assignmentId, marks),
    onSuccess: () => {
      showSuccessToast('Marks saved');
      queryClient.invalidateQueries({ queryKey: ['assignments', selectedClassId] });
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedClassId] });
    },
    onError: (err: any) => showErrorToast(err?.response?.data?.message || 'Failed to save marks'),
  });

  const markQuizMutation = useMutation({
    mutationFn: ({quizId, marks}: any) => markQuiz(quizId, marks),
    onSuccess: () => {
      showSuccessToast('Marks saved');
      queryClient.invalidateQueries({ queryKey: ['quizzes', selectedClassId] });
    },
    onError: (err: any) => showErrorToast(err?.response?.data?.message || 'Failed to save marks'),
  });

  const handleAttendanceToggle = (studentId: string) => {
    setAttendancePresent((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  // populate assignmentMarks from fetched data or localStorage when available
  React.useEffect(() => {
    if (assignmentMarksQuery.data?.data?.marks) {
      const map: Record<string, any> = {};
      assignmentMarksQuery.data.data.marks.forEach((m: any) => {
        const sid = (m.studentId && (m.studentId._id || m.studentId)) || m.studentId;
        map[String(sid)] = { score: m.score ?? '', feedback: m.feedback ?? '' };
      });
      setAssignmentMarks(map);
    } else if (assignmentModalRecord?._id) {
      const saved = localStorage.getItem(`marks_assignment_${assignmentModalRecord._id}`);
      if (saved) setAssignmentMarks(JSON.parse(saved));
    }
  }, [assignmentMarksQuery.data, assignmentModalRecord]);

  // populate quizMarks from fetched data or localStorage when available
  React.useEffect(() => {
    if (quizMarksQuery.data?.data?.marks) {
      const map: Record<string, any> = {};
      quizMarksQuery.data.data.marks.forEach((m: any) => {
        const sid = (m.studentId && (m.studentId._id || m.studentId)) || m.studentId;
        map[String(sid)] = { score: m.score ?? '', feedback: m.feedback ?? '' };
      });
      setQuizMarks(map);
    } else if (quizModalRecord?._id) {
      const saved = localStorage.getItem(`marks_quiz_${quizModalRecord._id}`);
      if (saved) setQuizMarks(JSON.parse(saved));
    }
  }, [quizMarksQuery.data, quizModalRecord]);

  const updateQuestion = (index: number, field: string, value: any, isQuiz = false) => {
    const setter = isQuiz ? setQuizData : setAssignmentData;
    const data = isQuiz ? quizData : assignmentData;
    const questions = [...data.questions];
    questions[index] = {
      ...questions[index],
      [field]: value,
      options: field === "type" && value === "theory" ? ["", ""] : questions[index].options,
    };
    (setter as any)({ ...data, questions });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string, isQuiz = false) => {
    const setter = isQuiz ? setQuizData : setAssignmentData;
    const data = isQuiz ? quizData : assignmentData;
    const questions = [...data.questions];
    const updatedOptions = [...questions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    questions[questionIndex] = { ...questions[questionIndex], options: updatedOptions };
    (setter as any)({ ...data, questions });
  };

  const addQuestion = (isQuiz = false) => {
    const setter = isQuiz ? setQuizData : setAssignmentData;
    const data = isQuiz ? quizData : assignmentData;
    (setter as any)({ ...data, questions: [...data.questions, createQuestion()] });
  };

  const removeQuestion = (questionIndex: number, isQuiz = false) => {
    const setter = isQuiz ? setQuizData : setAssignmentData;
    const data = isQuiz ? quizData : assignmentData;
    const questions = [...data.questions];
    questions.splice(questionIndex, 1);
    (setter as any)({ ...data, questions: questions.length ? questions : [createQuestion()] });
  };

  const addQuestionOption = (questionIndex: number, isQuiz = false) => {
    const setter = isQuiz ? setQuizData : setAssignmentData;
    const data = isQuiz ? quizData : assignmentData;
    const questions = [...data.questions];
    const options = [...questions[questionIndex].options, ""];
    questions[questionIndex] = { ...questions[questionIndex], options };
    (setter as any)({ ...data, questions });
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number, isQuiz = false) => {
    const setter = isQuiz ? setQuizData : setAssignmentData;
    const data = isQuiz ? quizData : assignmentData;
    const questions = [...data.questions];
    const options = [...questions[questionIndex].options];
    if (options.length <= 2) return;
    options.splice(optionIndex, 1);
    questions[questionIndex] = { ...questions[questionIndex], options };
    (setter as any)({ ...data, questions });
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedClassId) return;
    const existingStudentIds = students.map((student) => String(student._id || student.id || student.userId));
    const present = existingStudentIds.filter((id) => attendancePresent[id]);
    const absent = existingStudentIds.filter((id) => !attendancePresent[id]);
    await attendanceMutation.mutateAsync({ date: attendanceDate, present, absent, notes: attendanceNotes });
  };

  const handleAssignmentSubmit = async () => {
    if (!selectedClassId || !assignmentData.title.trim()) {
      showErrorToast("Provide a title for the assignment");
      return;
    }

    const validQuestions = assignmentData.questions.filter((question) => question.prompt.trim());
    if (!validQuestions.length) {
      showErrorToast("Add at least one question for the assignment");
      return;
    }

    await assignmentMutation.mutateAsync({
      title: assignmentData.title,
      description: assignmentData.description,
      questions: assignmentData.questions,
      dueDate: assignmentData.dueDate || undefined,
    });
  };

  const handleQuizSubmit = async () => {
    if (!selectedClassId || !quizData.title.trim()) {
      showErrorToast("Provide a title for the quiz");
      return;
    }

    const validQuestions = quizData.questions.filter((question) => question.prompt.trim());
    if (!validQuestions.length) {
      showErrorToast("Add at least one question for the quiz");
      return;
    }

    await quizMutation.mutateAsync({
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      scheduledAt: quizData.scheduledAt || undefined,
      durationMinutes: quizData.durationMinutes ? Number(quizData.durationMinutes) : undefined,
    });
  };

  if (isClassesLoading) return <Loader />;
  if (isClassesError) return <div className="p-8 text-red-600">{(classesError as Error)?.message || "Unable to load classes."}</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-sm text-gray-600">Manage attendance, assignments and quizzes for your classes.</p>
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

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Create Assignment</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Title" value={assignmentData.title} onChange={(e) => setAssignmentData((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded border px-3 py-2" />
                <textarea placeholder="Description" value={assignmentData.description} onChange={(e) => setAssignmentData((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded border px-3 py-2" rows={4} />
                <input type="date" value={assignmentData.dueDate} onChange={(e) => setAssignmentData((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full rounded border px-3 py-2" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold">Questions</h3>
                    <button type="button" onClick={() => addQuestion(false)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                      Add Question
                    </button>
                  </div>
                  {assignmentData.questions.map((question: any, index: number) => (
                    <div key={index} className="space-y-3 rounded border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium">Question {index + 1}</label>
                          <select value={question.type} onChange={(e) => updateQuestion(index, 'type', e.target.value, false)} className="mt-2 w-full rounded border px-3 py-2">
                            <option value="theory">Theory</option>
                            <option value="objective">Objective</option>
                          </select>
                        </div>
                        <button type="button" onClick={() => removeQuestion(index, false)} className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600">
                          Remove
                        </button>
                      </div>
                      <textarea value={question.prompt} placeholder="Question text" onChange={(e) => updateQuestion(index, 'prompt', e.target.value, false)} className="w-full rounded border px-3 py-2" rows={3} />
                      {question.type === 'objective' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Options</span>
                            <button type="button" onClick={() => addQuestionOption(index, false)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                              Add Option
                            </button>
                          </div>
                          {question.options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input type="text" value={option} onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value, false)} className="flex-1 rounded border px-3 py-2" placeholder={`Option ${optionIndex + 1}`} />
                              <button type="button" onClick={() => removeQuestionOption(index, optionIndex, false)} className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600">
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handleAssignmentSubmit} disabled={assignmentMutation.isPending} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60">
                  {assignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Create Quiz</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Title" value={quizData.title} onChange={(e) => setQuizData((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded border px-3 py-2" />
                <textarea placeholder="Description" value={quizData.description} onChange={(e) => setQuizData((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded border px-3 py-2" rows={4} />
                <input type="datetime-local" value={quizData.scheduledAt} onChange={(e) => setQuizData((prev) => ({ ...prev, scheduledAt: e.target.value }))} className="w-full rounded border px-3 py-2" />
                <input type="number" placeholder="Duration (minutes)" min={1} value={quizData.durationMinutes} onChange={(e) => setQuizData((prev) => ({ ...prev, durationMinutes: e.target.value }))} className="w-full rounded border px-3 py-2" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold">Questions</h3>
                    <button type="button" onClick={() => addQuestion(true)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                      Add Question
                    </button>
                  </div>
                  {quizData.questions.map((question: any, index: number) => (
                    <div key={index} className="space-y-3 rounded border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium">Question {index + 1}</label>
                          <select value={question.type} onChange={(e) => updateQuestion(index, 'type', e.target.value, true)} className="mt-2 w-full rounded border px-3 py-2">
                            <option value="theory">Theory</option>
                            <option value="objective">Objective</option>
                          </select>
                        </div>
                        <button type="button" onClick={() => removeQuestion(index, true)} className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600">
                          Remove
                        </button>
                      </div>
                      <textarea value={question.prompt} placeholder="Question text" onChange={(e) => updateQuestion(index, 'prompt', e.target.value, true)} className="w-full rounded border px-3 py-2" rows={3} />
                      {question.type === 'objective' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Options</span>
                            <button type="button" onClick={() => addQuestionOption(index, true)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                              Add Option
                            </button>
                          </div>
                          {question.options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input type="text" value={option} onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value, true)} className="flex-1 rounded border px-3 py-2" placeholder={`Option ${optionIndex + 1}`} />
                              <button type="button" onClick={() => removeQuestionOption(index, optionIndex, true)} className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600">
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handleQuizSubmit} disabled={quizMutation.isPending} className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60">
                  {quizMutation.isPending ? "Creating..." : "Create Quiz"}
                </button>
              </div>
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
                <div className="rounded border bg-slate-50 p-3">
                  <h3 className="font-semibold">Assignments</h3>
                  {assignmentsQuery.isLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : assignmentsQuery.data?.data?.assignments?.length ? (
                    assignmentsQuery.data.data.assignments.map((assignment: any) => (
                      <button
                        key={assignment._id}
                        onClick={() => {
                          setAssignmentModalRecord(assignment);
                          // load saved marks from localStorage if any
                          const saved = localStorage.getItem(`marks_assignment_${assignment._id}`);
                          setAssignmentMarks(saved ? JSON.parse(saved) : {});
                          setAssignmentModalOpen(true);
                        }}
                        className="w-full text-left text-sm text-gray-700 border-b last:border-b-0 py-2 hover:bg-slate-100"
                      >
                        {assignment.title} {assignment.dueDate ? `(due ${new Date(assignment.dueDate).toLocaleDateString()})` : ""}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No assignments yet.</div>
                  )}
                </div>
                <div className="rounded border bg-slate-50 p-3">
                  <h3 className="font-semibold">Quizzes</h3>
                  {quizzesQuery.isLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : quizzesQuery.data?.data?.quizzes?.length ? (
                    quizzesQuery.data.data.quizzes.map((quiz: any) => (
                      <button
                        key={quiz._id}
                        onClick={() => {
                          setQuizModalRecord(quiz);
                          const saved = localStorage.getItem(`marks_quiz_${quiz._id}`);
                          setQuizMarks(saved ? JSON.parse(saved) : {});
                          setQuizModalOpen(true);
                        }}
                        className="w-full text-left text-sm text-gray-700 border-b last:border-b-0 py-2 hover:bg-slate-100"
                      >
                        {quiz.title} {quiz.scheduledAt ? `(on ${new Date(quiz.scheduledAt).toLocaleString()})` : ""}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No quizzes yet.</div>
                  )}
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
          {assignmentModalOpen && assignmentModalRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg max-w-3xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Assignment — {assignmentModalRecord.title}</h3>
                  <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setAssignmentModalOpen(false)}>Close</button>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>{assignmentModalRecord.description || "No description"}</div>
                  <div>Due: {assignmentModalRecord.dueDate ? new Date(assignmentModalRecord.dueDate).toLocaleDateString() : 'N/A'}</div>
                  <div>
                    <h4 className="font-semibold">Questions</h4>
                    <ol className="list-decimal ml-6 mt-2">
                      {(assignmentModalRecord.questions || []).map((q: any, i: number) => (
                        <li key={i} className="mb-2">
                          <div className="font-medium">{q.prompt}</div>
                          {q.type === 'objective' && (
                            <ul className="list-disc ml-6">
                              {q.options.map((opt: string, oi: number) => <li key={oi}>{opt}</li>)}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold">Mark Submissions</h4>
                    <div className="text-xs text-gray-600 mb-2">Enter score and optional feedback for each student. Marks are saved locally (use backend endpoint to persist).</div>
                    <div className="max-h-56 overflow-auto border rounded">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Score</th>
                            <th className="px-3 py-2">Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((st: any) => {
                            const sid = String(st._id || st.id || st.userId?._id || st.userId || st.studentId);
                            const name = [st.userId?.firstName || st.firstName, st.userId?.lastName || st.lastName].filter(Boolean).join(' ') || st.name || sid;
                            const mark = assignmentMarks[sid] || { score: '', feedback: '' };
                            return (
                              <tr key={sid} className="border-t">
                                <td className="px-3 py-2 align-top">{name}</td>
                                <td className="px-3 py-2 align-top">
                                  <input type="number" className="w-20 rounded border px-2 py-1" value={mark.score} onChange={(e) => setAssignmentMarks((prev) => ({ ...prev, [sid]: { ...prev[sid], score: e.target.value } }))} />
                                </td>
                                <td className="px-3 py-2">
                                  <input type="text" className="w-full rounded border px-2 py-1" value={mark.feedback || ''} onChange={(e) => setAssignmentMarks((prev) => ({ ...prev, [sid]: { ...prev[sid], feedback: e.target.value } }))} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="rounded bg-green-600 px-4 py-2 text-white" onClick={async () => {
                        if (!assignmentModalRecord?._id) return;
                        const marksArray = Object.entries(assignmentMarks).map(([studentId, m]: any) => ({ studentId, score: m.score === '' ? null : Number(m.score), feedback: m.feedback }));
                        try {
                          await markAssignmentMutation.mutateAsync({ assignmentId: assignmentModalRecord._id, marks: marksArray });
                          localStorage.setItem(`marks_assignment_${assignmentModalRecord._id}`, JSON.stringify(assignmentMarks));
                          setAssignmentModalOpen(false);
                        } catch (e) {
                          // handled by mutation
                        }
                      }} disabled={markAssignmentMutation.isPending}>{markAssignmentMutation.isPending ? 'Saving...' : 'Save Marks'}</button>
                      <button className="rounded bg-gray-200 px-4 py-2" onClick={() => { setAssignmentModalOpen(false); }}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {quizModalOpen && quizModalRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg max-w-3xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Quiz — {quizModalRecord.title}</h3>
                  <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setQuizModalOpen(false)}>Close</button>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>{quizModalRecord.description || "No description"}</div>
                  <div>Scheduled: {quizModalRecord.scheduledAt ? new Date(quizModalRecord.scheduledAt).toLocaleString() : 'N/A'}</div>
                  <div>
                    <h4 className="font-semibold">Questions</h4>
                    <ol className="list-decimal ml-6 mt-2">
                      {(quizModalRecord.questions || []).map((q: any, i: number) => (
                        <li key={i} className="mb-2">
                          <div className="font-medium">{q.prompt}</div>
                          {q.type === 'objective' && (
                            <ul className="list-disc ml-6">
                              {q.options.map((opt: string, oi: number) => <li key={oi}>{opt}</li>)}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold">Mark Submissions</h4>
                    <div className="text-xs text-gray-600 mb-2">Enter score and optional feedback for each student. Marks are saved locally (use backend endpoint to persist).</div>
                    <div className="max-h-56 overflow-auto border rounded">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Score</th>
                            <th className="px-3 py-2">Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((st: any) => {
                            const sid = String(st._id || st.id || st.userId?._id || st.userId || st.studentId);
                            const name = [st.userId?.firstName || st.firstName, st.userId?.lastName || st.lastName].filter(Boolean).join(' ') || st.name || sid;
                            const mark = quizMarks[sid] || { score: '', feedback: '' };
                            return (
                              <tr key={sid} className="border-t">
                                <td className="px-3 py-2 align-top">{name}</td>
                                <td className="px-3 py-2 align-top">
                                  <input type="number" className="w-20 rounded border px-2 py-1" value={mark.score} onChange={(e) => setQuizMarks((prev) => ({ ...prev, [sid]: { ...prev[sid], score: e.target.value } }))} />
                                </td>
                                <td className="px-3 py-2">
                                  <input type="text" className="w-full rounded border px-2 py-1" value={mark.feedback || ''} onChange={(e) => setQuizMarks((prev) => ({ ...prev, [sid]: { ...prev[sid], feedback: e.target.value } }))} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="rounded bg-green-600 px-4 py-2 text-white" onClick={async () => {
                        if (!quizModalRecord?._id) return;
                        const marksArray = Object.entries(quizMarks).map(([studentId, m]: any) => ({ studentId, score: m.score === '' ? null : Number(m.score), feedback: m.feedback }));
                        try {
                          await markQuizMutation.mutateAsync({ quizId: quizModalRecord._id, marks: marksArray });
                          localStorage.setItem(`marks_quiz_${quizModalRecord._id}`, JSON.stringify(quizMarks));
                          setQuizModalOpen(false);
                        } catch (e) {
                          // handled by mutation
                        }
                      }} disabled={markQuizMutation.isPending}>{markQuizMutation.isPending ? 'Saving...' : 'Save Marks'}</button>
                      <button className="rounded bg-gray-200 px-4 py-2" onClick={() => { setQuizModalOpen(false); }}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-gray-600">Select one of your assigned classes above to begin recording attendance or creating assignments/quizzes.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
