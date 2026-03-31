import { useMutation } from "@tanstack/react-query";
import apiClient from "./apiClient";

export const signIn = (data: {
  email: string;
  password: string;
  role: string;
}) => {
  return apiClient.post(`auth/login`, {
    email: data.email,
    password: data.password,
  });
};

export const guardianSignIn = (data: {
  studentId: string;
  password: string;
}) => {
  return apiClient.post(`auth/guardian-login`, {
    studentId: data.studentId,
    password: data.password,
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: signIn,
  });
};

export const useGuardianSignIn = () => {
  return useMutation({
    mutationFn: guardianSignIn,
  });
};
