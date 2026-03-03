import apiClient from "../apiClient";

export const updateStudent = async ({
  id,
  updateData,
}: {
  id: number | string;
  updateData: object;
}) => {
  const response = await apiClient.patch(`students/${id}/`, updateData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const editStaff = ({ id, updateData }: { id: number; updateData: object }) => {
  return apiClient.patch(`/staff/${id}/`, updateData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteStaff = (id: number) => {
  return apiClient.delete(`/staff/${id}/`);
};

export const updateClass = async ({
  id,
  updateData,
}: {
  id: string | number;
  updateData: object;
}) => {
  const response = await apiClient.put(`classes/${id}`, updateData);
  return response.data;
};

export const updateSubject = async (id: string, updateData: object) => {
  const response = await apiClient.put(`subjects/${id}`, updateData);
  return response.data;
};

export const deleteSubject = async (id: string) => {
  const response = await apiClient.delete(`subjects/${id}`);
  return response.data;
};

export const saveStudentTermReport = async ({
  studentId,
  term,
  year,
  reportData,
}: {
  studentId: string | number;
  term: string;
  year: number;
  reportData: {
    attendance: {
      schoolOpened: string;
      timesPresent: string;
      timesAbsent: string;
    };
    position: string;
    psychomotorSkills: {
      handwriting: string;
      verbalFluency: string;
      game: string;
      sports: string;
      handlingTools: string;
      drawingPainting: string;
      musicSkills: string;
    };
    affectiveArea: {
      punctuality: string;
      neatness: string;
      honesty: string;
      cooperation: string;
      leadership: string;
      helpingOthers: string;
    };
    comments: {
      teacherComment: string;
      teacherSignature: string;
      headmasterComment: string;
      headmasterSignature: string;
    };
  };
}) => {
  const response = await apiClient.put(`students/${studentId}/term-report`, {
    term,
    year,
    reportData,
  });
  return response.data;
};
