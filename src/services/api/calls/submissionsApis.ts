import apiClient from '../apiClient';

export const submitAssignment = async (assignmentId: string, payload: { studentId: string; content?: string; attachments?: string[] }) => {
  return apiClient.post(`/submissions/assignment/${assignmentId}`, payload);
};

export const submitQuiz = async (quizId: string, payload: { studentId: string; content?: string; attachments?: string[] }) => {
  return apiClient.post(`/submissions/quiz/${quizId}`, payload);
};

export const getAssignmentSubmissions = async (assignmentId: string) => {
  return apiClient.get(`/submissions/assignment/${assignmentId}`);
};

export const getQuizSubmissions = async (quizId: string) => {
  return apiClient.get(`/submissions/quiz/${quizId}`);
};
