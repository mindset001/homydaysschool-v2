export const createClass = (classData: object) => {
  return apiClient.post(`/classes/`, classData);
};
import { EventInterface } from "../../../hooks/useTotalPercentageValue";
import apiClient from "../apiClient";

export const addStudent = async (newData: object) => {
  const response = await apiClient.post(`/students/`, newData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createStaff = (newData: object) => {
  return apiClient.post(`/staff/`, newData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const createCalender = ({ event, date }: EventInterface) => {
  return apiClient.post(`/calender/`, {
    event,
    date,
  });
};

export const generateTemplate = (subjectData: object) => {
  return apiClient.post(
    `/generatetemplate`,
    subjectData
    //   , {
    //   // headers: {
    //   //   "Content-Type": "multipart/form-data",
    //   // },
    // }
  );
};

export const uploadResult = (resultFile: object) => {
  return apiClient.post(`/uploadresult`, resultFile, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const createPayment = (paymentData: object) => {
  return apiClient.post(`/payments/`, paymentData);
};

export const createSubject = (subjectData: object) => {
  return apiClient.post(`/subjects/`, subjectData);
};

export const saveTimetable = (data: object) => {
  return apiClient.post(`/timetables/`, data);
};

export const markChatRead = () => {
  return apiClient.post(`/chat/messages/read`, {});
};

export const promoteStudents = (data: { studentIds: string[] }) => {
  return apiClient.post('students/promote', data);
};