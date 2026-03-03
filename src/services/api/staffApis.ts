import { useMutation } from "@tanstack/react-query";
import { createCalender, createStaff } from "./calls/postApis";
import { deleteStaff, editStaff } from "./calls/updateApis";
export const useCreateStaff = () => {
  return useMutation({
    mutationFn: createStaff,
  });
};

export const useEditStaff = () => {
  return useMutation({
    mutationFn: editStaff,
  });
};

export const useDeleteStaff = () => {
  return useMutation({
    mutationFn: deleteStaff,
  });
};
export const useCreateCalender = () => {
  return useMutation({
    mutationFn: createCalender,
  });
};
