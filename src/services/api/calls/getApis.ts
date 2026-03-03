// import apiClient from "./apiClient";

import apiClient from "../apiClient";

export const getBaseClass = () => {
  // Returns classes - baseclass endpoint doesn't exist, use classes instead
  return apiClient.get(`classes/`);
};

export const getClass = () => {
  return apiClient.get(`classes/`);
};

export const getSubjects = () => {
  return apiClient.get(`subjects/`);
};

export const getClassStudentsId = (id: number | string) => {
  return apiClient.get(`classes/${id}/student/`);
};

// Not yet used
// export const getStudentId = (id : number | string) => {
//   return apiClient.get(`classes/${id}/student/3`);
// };

export const getClassStatId = (id: string | null) => {
  // If id is null or empty string, this should generally be prevented
  // by the caller (query `enabled` flag), but ensure we don't construct
  // a URL like /class_stat/null
  const safeId = id || '';
  return apiClient.get(`class_stat/${safeId}`);
};
// import apiClient from "./apiClient";

export const getClassStat = () => {
  return apiClient.get(`class_stat`);
};

export const getHomeAnalytic = () => {
  return apiClient.get(`homeanalytic`);
};

export const getStudents = () => {
  return apiClient.get(`guardians/ward`);
};

export const getStudentsId = (id: number | string) => {
  return apiClient.get(`students/${id}`);
};

export const getGuardianWardId = (id: number) => {
  return apiClient.get(`guardians/ward/${id}`);
};

export const getGuardianWard = () => {
  return apiClient.get(`guardians/wards`);
};

export const getGuardianProfile = () => {
  return apiClient.get(`guardians/profile/me`);
};


export const getClassStudentResult = ( id : number | string) => {
  return apiClient.get(`students/${id}/results`);
};

////////////////////////////
//STAFFS SECTION
////////////////////////////
export const getStaffs = () => {
  return apiClient.get(`staff/`);
};

export const getStaff = () => {
  // fetch the profile of currently authenticated staff user
  return apiClient.get(`staff/me`);
};

export const getStaffByClass = (className: string) => {
  return apiClient.get(`staff/by-class/${encodeURIComponent(className)}`);
};

export const getCalender = () => {
  return apiClient.get(`calender/`);
};

export const getAllTimetables = () => {
  // Placeholder - timetables not yet implemented
  return Promise.resolve({ data: { data: [] } });
};
export const getAllPayments = () => {
  return apiClient.get(`payments/`);
};

export const getPaymentsByStudent = (studentId: string | number) => {
  return apiClient.get(`payments/student/${studentId}`);
};

export const getPaymentsByClass = (classId: string | number) => {
  return apiClient.get(`payments/class/${classId}`);
};

// CHAT APIs
export const getChatMessages = () => {
  return apiClient.get(`chat/messages`);
};

export const postChatMessage = (text: string) => {
  return apiClient.post(`chat/message`, { text });
};