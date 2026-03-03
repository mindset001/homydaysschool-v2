// import React from 'react'

import { useQuery } from "@tanstack/react-query";
import { getGuardianWardId } from "../services/api/calls/getApis";
import { useEffect, useMemo } from "react";
// import { getUser } from "../utils/authTokens";
import { guardianWardInterface } from "../types/user.type";
import { useData } from "./UseUserContext";

const useGuardianWardId = () => {
  // USER
  // const user = getUser();
  const { guardianActiveStudentID: userId } = useData();

  useEffect(() => {
    console.log("Userrrrrrrrr", userId);
  }, [userId]);

  const {
    data: guardianWardIdData,
    isError: isGuardianWardIdError,
    error: guadianWardIdError,
    isLoading: isGuardianWardIdLoading,
  } = useQuery({
    queryKey: ["guardianWard", userId.id],
    queryFn: () => getGuardianWardId(userId.id),
    enabled: !!userId.id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  const guardianWard: guardianWardInterface = useMemo(() => {
    if (!guardianWardIdData || !guardianWardIdData.data) {
      return [];
    }
    // Backend returns { ward: {...} }
    return guardianWardIdData.data.ward || [];
  }, [guardianWardIdData]);

  useEffect(() => {
    // console.log(
    //   "guardianWardIdData Dataaaaaaaaa :",
    //   guardianWardIdData,
    //   isGuardianWardIdError,
    //   guadianWardIdError,
    //   isGuardianWardIdLoading
    // );
  }, [
    guadianWardIdError,
    guardianWardIdData,
   
    isGuardianWardIdError,
    isGuardianWardIdLoading,
  ]);
  return {
    guardianWard,
    userId,
    isGuardianWardIdLoading,
    guadianWardIdError,
    isGuardianWardIdError,
  };
};

export default useGuardianWardId;
