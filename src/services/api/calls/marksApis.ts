import apiClient from "../apiClient";

export const markAssignment = (assignmentId: string, marks: object[]) => {
  return apiClient.post(`assignments/marks/${assignmentId}`, { marks });
};

export const markQuiz = (quizId: string, marks: object[]) => {
  return apiClient.post(`quizzes/marks/${quizId}`, { marks });
};
