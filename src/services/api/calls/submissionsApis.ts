import apiClient from '../apiClient';

export const submitAssignment = async (assignmentId: string, payload: { studentId: string; content?: string; attachments?: string[] }) => {
  return apiClient.post(`/submissions/assignment/${assignmentId}`, payload);
};

export const submitQuiz = async (quizId: string, payload: { studentId: string; content?: string; attachments?: string[] }) => {
  return apiClient.post(`/submissions/quiz/${quizId}`, payload);
};

export const getAssignmentSubmissions = async (assignmentId: string, studentId?: string) => {
  return apiClient.get(`/submissions/assignment/${assignmentId}`, { params: studentId ? { studentId } : {} });
};

export const getQuizSubmissions = async (quizId: string, studentId?: string) => {
  return apiClient.get(`/submissions/quiz/${quizId}`, { params: studentId ? { studentId } : {} });
};
