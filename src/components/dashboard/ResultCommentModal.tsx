import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClassStudentResult } from "../../services/api/calls/getApis";
import { saveAcademicRecordComment } from "../../services/api/calls/updateApis";
import useActiveSession from "../../hooks/useActiveSession";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import Loader from "../../shared/Loader";

interface ResultCommentModalProps {
  studentId: string | null;
  studentName?: string;
  onClose: () => void;
}

const ResultCommentModal: React.FC<ResultCommentModalProps> = ({ studentId, studentName, onClose }) => {
  const queryClient = useQueryClient();
  const { activeSession } = useActiveSession();
  const [comment, setComment] = useState("");

  const isOpen = !!studentId;

  const { data, isLoading } = useQuery({
    queryKey: ["studentResultForComment", studentId],
    queryFn: () => getClassStudentResult(studentId!),
    enabled: isOpen,
  });

  const activeRecord = (data?.data?.data?.[0]?.academicRecords ?? []).find(
    (r: any) =>
      r.term === activeSession?.term &&
      activeSession?.academicYear.split("/").some((y: string) => parseInt(y) === r.year)
  );

  useEffect(() => {
    setComment(activeRecord?.comment ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRecord?.comment, studentId]);

  const mutation = useMutation({
    mutationFn: (commentValue: string) =>
      saveAcademicRecordComment({
        studentId: studentId!,
        term: activeSession!.term,
        year: parseInt(activeSession!.academicYear.split("/")[0]),
        comment: commentValue,
      }),
    onSuccess: (_data, commentValue) => {
      showSuccessToast(commentValue ? "Comment saved" : "Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["studentResultForComment", studentId] });
      queryClient.invalidateQueries({ queryKey: ["guardian-student-result", studentId] });
      onClose();
    },
    onError: () => showErrorToast("Failed to save comment"),
  });

  const hasExistingComment = !!activeRecord?.comment?.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-800">Comment on Result</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {studentName && <p className="text-sm text-gray-500 mb-4">{studentName}</p>}

        {!activeSession ? (
          <p className="text-sm text-red-500">No active academic session is set.</p>
        ) : isLoading ? (
          <div className="py-6"><Loader /></div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">
              {activeSession.term} &mdash; {activeSession.academicYear}
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Write a comment on this student's result…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-[8px] border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {hasExistingComment && (
                <button
                  onClick={() => {
                    setComment("");
                    mutation.mutate("");
                  }}
                  disabled={mutation.isPending}
                  className="flex-1 py-2 rounded-[8px] border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => mutation.mutate(comment)}
                disabled={mutation.isPending}
                className="flex-1 py-2 rounded-[8px] bg-[#F97316] text-white text-sm font-semibold hover:bg-[#046a71] transition-colors disabled:opacity-60"
              >
                {mutation.isPending ? "Saving…" : "Save Comment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultCommentModal;
