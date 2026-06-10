import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitAssignment, submitQuiz, getAssignmentSubmissions, getQuizSubmissions } from "../../services/api/calls/submissionsApis";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";

interface IQuestion {
  type: "objective" | "theory";
  text: string;
  marks?: number;
  options?: string[];
  correctAnswer?: number;
  sampleAnswer?: string;
}

interface Props {
  type: "assignment" | "quiz";
  item: any; // the assignment or quiz object
  wardId: string;
  wardName: string;
  onClose: () => void;
}

type Answers = Record<number, string | number>; // questionIndex → answer

const SubmissionModal: React.FC<Props> = ({ type, item, wardId, wardName, onClose }) => {
  const queryClient = useQueryClient();
  const questions: IQuestion[] = item.questions ?? [];

  const { data: prevData, isLoading: loadingPrev } = useQuery({
    queryKey: ["submission", type, item._id, wardId],
    queryFn: () =>
      type === "assignment"
        ? getAssignmentSubmissions(item._id, wardId)
        : getQuizSubmissions(item._id, wardId),
    staleTime: 30 * 1000,
  });

  const prevSubmission = prevData?.data?.submissions?.[0] ?? null;
  const prevAnswers: Answers = (() => {
    if (!prevSubmission?.content) return {};
    try {
      const parsed = JSON.parse(prevSubmission.content);
      return Object.fromEntries(parsed.map((a: any) => [a.questionIndex, a.answer]));
    } catch {
      return {};
    }
  })();

  const [answers, setAnswers] = useState<Answers>(prevAnswers);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      const content = JSON.stringify(
        questions.map((_, i) => ({ questionIndex: i, answer: answers[i] ?? "" }))
      );
      return type === "assignment"
        ? submitAssignment(item._id, { studentId: wardId, content })
        : submitQuiz(item._id, { studentId: wardId, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", type, item._id, wardId] });
      showSuccessToast("Answers submitted successfully");
      setSubmitted(true);
    },
    onError: () => showErrorToast("Failed to submit answers"),
  });

  const allAnswered = questions.every((_, i) => answers[i] !== undefined && answers[i] !== "");
  // If previously submitted and user hasn't clicked "Edit", show read-only view
  const [editing, setEditing] = useState(!prevSubmission);
  const showReadOnly = !!prevSubmission && !editing && !submitted;

  if (loadingPrev) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{item.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{wardName}'s submission</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Status banner */}
        {prevSubmission && !editing && (
          <div className="bg-green-50 border-b border-green-100 px-5 py-2.5 flex items-center justify-between">
            <span className="text-xs text-green-700 font-medium">
              Already submitted — {new Date(prevSubmission.createdAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => { setEditing(true); setAnswers(prevAnswers); }}
              className="text-xs text-[#F97316] underline"
            >
              Edit answers
            </button>
          </div>
        )}

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {questions.length === 0 && (
            <p className="text-sm text-gray-400">No questions for this {type}.</p>
          )}
          {questions.map((q, i) => {
            const ans = showReadOnly ? prevAnswers[i] : answers[i];
            return (
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

                <p className="text-sm text-gray-800 mb-3">{q.text}</p>

                {q.type === "objective" && q.options && q.options.length > 0 && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = ans === oi;
                      return (
                        <button
                          key={oi}
                          disabled={showReadOnly}
                          onClick={() => !showReadOnly && setAnswers((a) => ({ ...a, [i]: oi }))}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left border transition-colors ${
                            selected
                              ? "bg-[#F97316]/10 border-[#F97316] text-[#F97316] font-medium"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          } ${showReadOnly ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-semibold ${
                            selected ? "border-[#F97316] bg-[#F97316] text-white" : "border-gray-300 text-gray-400"
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "theory" && (
                  <textarea
                    rows={3}
                    disabled={showReadOnly}
                    value={(ans as string) ?? ""}
                    onChange={(e) => !showReadOnly && setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                    placeholder="Write your answer here…"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none ${
                      showReadOnly ? "bg-gray-50 text-gray-600 border-gray-100 cursor-default" : "border-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium"
          >
            {showReadOnly ? "Close" : "Cancel"}
          </button>
          {!showReadOnly && (
            <button
              onClick={() => mutation.mutate()}
              disabled={questions.length === 0 || !allAnswered || mutation.isPending}
              className="flex-1 bg-[#F97316] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? "Submitting…" : submitted ? "Submitted!" : "Submit Answers"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
