export const deleteClass = async (id: string | number) => {
  const response = await apiClient.delete(`/classes/${id}`);
  return response.data;
};
import apiClient from "../apiClient";

export const deleteData = async ({id, studentid} : {id: string | number, studentid: string | number}) => {
    const response = await apiClient.delete(`classes/${id}/students/${studentid}`);
    return response.data;
  };

export const deleteEvent = async (id: string | number) => {
    const response = await apiClient.delete(
      `/calender/${id}/`
    );
    return response.data;
  };
