// import React from 'react'

import { useQuery } from "@tanstack/react-query";
// import { getGuardianWardId } from "../services/api/calls/getApis";
import { useEffect, useMemo } from "react";
// import { getUser } from "../utils/authTokens";
import { userGuardWardDataI } from "../types/user.type";
import { getGuardianWard } from "../services/api/calls/getApis";
import { getRole } from "../utils/authTokens";

const useGuardianWard = () => {
  const role = getRole() as string;
  // // USER
  // const user = getUser();

  // useEffect(() => {
  //   console.log("User", user);
  // }, [user]);

  const {
    data: guardianWardData,
    isError: isGuardianWardError,
    error: guadianWardError,
    isLoading: isGuardianWardLoading,
  } = useQuery({
    queryKey: ["guardianWards"],
    queryFn: getGuardianWard,
    enabled: role.toLowerCase() === "guardian",
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  const guardianWard : userGuardWardDataI = useMemo(() => {
    // make sure the hook returns an object with a `students` array so
    // components can consistently access `guardianWard.students`
    if (!guardianWardData || !guardianWardData.data) {
      return { students: [] };
    }
    const rawWards: any[] = guardianWardData.data.wards || [];
    // map backend student objects into the simpler shape the UI expects
    const students = rawWards.map((s) => {
      const user = s.userId || {};
      return {
        id: s._id || s.id || 0,
        firstName: user.firstName || s.first_name || '',
        lastName: user.lastName || s.last_name || '',
        middleName: user.middleName || s.middle_name || '',
        studentClass: s.class || s.student_class || '',
        studentClassId: s.class || s.student_class_id || '',
      };
    });
    return { students };
  }, [guardianWardData]);
  
  useEffect(() => {
    console.log(
      "guardianWardData Dataaaaaaaaa :",
      guardianWardData,
      isGuardianWardError,
      guadianWardError,
      isGuardianWardLoading
    );
  }, [
    guadianWardError,
    guardianWardData,
    isGuardianWardError,
    isGuardianWardLoading,
  ]);
  return {
    guardianWard,
    isGuardianWardLoading,
    guadianWardError,
    isGuardianWardError,
  };
};

export default useGuardianWard;
