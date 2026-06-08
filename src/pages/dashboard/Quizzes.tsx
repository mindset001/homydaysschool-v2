import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizzesByClass, getQuizMarks } from "../../services/api/calls/getApis";
import { createQuiz } from "../../services/api/calls/postApis";
import { getRole } from "../../utils/authTokens";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import useActiveSession from "../../hooks/useActiveSession";
import useClasses from "../../hooks/useClasses";
import QuestionBuilder, { IQuestion } from "../../components/admin-dashboard/QuestionBuilder";

const QuizzesPage: React.FC = () => {
  const role = getRole();
  const { activeSession } = useActiveSession();
  const queryClient = useQueryClient();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewQuiz, setViewQuiz] = useState<any | null>(null);
  const [viewMarks, setViewMarks] = useState<any | null>(null);

  const [form, setForm] = useState({ title: "", description: "", scheduledAt: "", durationMinutes: 30 });
  const [questions, setQuestions] = useState<IQuestion[]>([]);

  const { classNameData: classes } = useClasses();

  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ["quizzes", selectedClassId],
    queryFn: () => getQuizzesByClass(selectedClassId),
    enabled: !!selectedClassId,
    staleTime: 60 * 1000,
  });
  const quizzes: any[] = quizzesData?.data?.quizzes ?? [];

  const { data: marksData } = useQuery({
    queryKey: ["quizMarks", viewMarks?._id],
    queryFn: () => getQuizMarks(viewMarks._id),
    enabled: !!viewMarks?._id,
    staleTime: 60 * 1000,
  });
  const marks: any[] = marksData?.data?.marks ?? marksData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      createQuiz(selectedClassId, {
        ...form,
        questions,
        term: activeSession?.term,
        academicYear: activeSession?.academicYear,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", selectedClassId] });
      showSuccessToast("Quiz created");
      setCreateOpen(false);
      setForm({ title: "", description: "", scheduledAt: "", durationMinutes: 30 });
      setQuestions([]);
    },
    onError: () => showErrorToast("Failed to create quiz"),
  });

  const selectedClass = classes.find((c: any) => (c.id ?? c._id) === selectedClassId);
  const totalMarks = (qs: IQuestion[]) => qs.reduce((s, q) => s + (q.marks || 1), 0);
  const objectiveCount = (qs: any[]) => qs.filter((q) => q.type === "objective").length;
  const theoryCount = (qs: any[]) => qs.filter((q) => q.type === "theory").length;

  return (
    <div className="p-6 font-Poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#05878F]">Quizzes</h1>
        {selectedClassId && (role === "admin" || role === "staff") && (
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-[#05878F] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#046e75] transition-colors"
          >
            + New Quiz
          </button>
        )}
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <label className="block text-xs font-medium text-gray-500 mb-1">Select Class</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
        >
          <option value="">Choose a class…</option>
          {classes.map((c: any) => (
            <option key={c.id ?? c._id} value={c.id ?? c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Quizzes list */}
      {selectedClassId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">{selectedClass?.name} — Quizzes</h2>
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : quizzes.length === 0 ? (
            <p className="text-sm text-gray-400">No quizzes yet for this class.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((q: any) => {
                const qs: any[] = q.questions ?? [];
                return (
                  <div key={q._id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{q.title}</p>
                        {q.description && <p className="text-xs text-gray-500 mt-0.5">{q.description}</p>}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {q.scheduledAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(q.scheduledAt).toLocaleString()}
                            </span>
                          )}
                          {q.durationMinutes && (
                            <span className="text-xs text-gray-400">{q.durationMinutes} min</span>
                          )}
                          {qs.length > 0 && (
                            <>
                              <span className="text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                                {qs.length} question{qs.length !== 1 ? "s" : ""}
                              </span>
                              {objectiveCount(qs) > 0 && (
                                <span className="text-xs bg-purple-50 text-purple-600 rounded-full px-2 py-0.5">
                                  {objectiveCount(qs)} Objective
                                </span>
                              )}
                              {theoryCount(qs) > 0 && (
                                <span className="text-xs bg-orange-50 text-orange-600 rounded-full px-2 py-0.5">
                                  {theoryCount(qs)} Theory
                                </span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                {totalMarks(qs)} marks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 ml-4 shrink-0">
                        {qs.length > 0 && (
                          <button onClick={() => setViewQuiz(q)} className="text-xs text-gray-500 underline">
                            Questions
                          </button>
                        )}
                        <button onClick={() => setViewMarks(q)} className="text-xs text-[#05878F] underline">
                          Marks
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create slide-over */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">New Quiz</h2>
              <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    placeholder="Quiz title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    placeholder="Optional description…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scheduled At</label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={form.durationMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 text-sm">Questions</h3>
                  {questions.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalMarks(questions)} marks total
                    </span>
                  )}
                </div>
                <QuestionBuilder questions={questions} onChange={setQuestions} />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setCreateOpen(false)}
                className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!form.title || createMutation.isPending}
                className="flex-1 bg-[#05878F] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View questions modal */}
      {viewQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{viewQuiz.title}</h2>
              <button onClick={() => setViewQuiz(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              {(viewQuiz.questions ?? []).map((q: any, i: number) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400">Q{i + 1}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                      q.type === "objective" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {q.type === "objective" ? "Objective" : "Theory"}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{q.marks ?? 1} mark{(q.marks ?? 1) !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{q.text}</p>
                  {q.type === "objective" && q.options?.length > 0 && (
                    <ul className="space-y-1">
                      {q.options.map((opt: string, oi: number) => (
                        <li key={oi} className={`text-sm flex items-center gap-2 ${oi === q.correctAnswer ? "text-green-700 font-medium" : "text-gray-600"}`}>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${oi === q.correctAnswer ? "border-green-500 bg-green-500 text-white" : "border-gray-300"}`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.type === "theory" && q.sampleAnswer && (
                    <p className="text-xs text-gray-400 mt-1 italic">Model answer: {q.sampleAnswer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marks modal */}
      {viewMarks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{viewMarks.title} — Marks</h2>
              <button onClick={() => setViewMarks(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {marks.length === 0 ? (
              <p className="text-sm text-gray-400">No marks recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4 font-medium">Student</th>
                    <th className="pb-2 pr-4 font-medium">Score</th>
                    <th className="pb-2 font-medium">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m: any) => (
                    <tr key={m._id} className="border-b border-gray-50">
                      <td className="py-2 pr-4">{m.studentId?.userId?.firstName} {m.studentId?.userId?.lastName}</td>
                      <td className="py-2 pr-4 font-medium">{m.score ?? "—"}</td>
                      <td className="py-2 text-gray-500">{m.feedback || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
