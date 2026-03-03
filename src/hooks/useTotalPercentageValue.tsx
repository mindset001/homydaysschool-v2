import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getHomeAnalytic } from "../services/api/calls/getApis";
import { totalPercentageValueI } from "../types/user.type";

export interface EventInterface {
  id: number | string;
  event: string;
  date: string;
}

interface HomeAnalyticDataInterface {
  total_students: number;
  total_staffs: number;
  total_subject: number;
  total_classes: number;
  completed_tuition: number;
  void: number;
  incompleted_tuition: number;
  starter_pack_collected: number;
  events: EventInterface[];
}

const useTotalPercentageValue = (): totalPercentageValueI => {
  const [totalPercentageValue, setTotalPercentageValue] =
    useState<totalPercentageValueI>({
      completed: 0,
      incomplete: 0,
      void: 0,
      total_students: 0,
      paid: 0,
      paid_half: 0,
      paid_nothing: 0,
      starter_pack_collected: 0,
    });
  // Get data for home analytic
  const {
    data: homeAnalyticData,
    isError: isHomeAnalyticError,
    error: homeAnalyticError,
    // isLoading: isHomeAnalyticLoading,
  } = useQuery<{ data: { data: HomeAnalyticDataInterface } }>({
    queryKey: ["home-analytic"],
    queryFn: getHomeAnalytic,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  const homeAnalytic: HomeAnalyticDataInterface = useMemo(() => {
    return (
      (homeAnalyticData && homeAnalyticData?.data?.data) ||
      ({} as HomeAnalyticDataInterface)
    );
  }, [homeAnalyticData]);
  const {
    total_students,
    completed_tuition,
    incompleted_tuition,
    void: void_tuition,
    starter_pack_collected,
  } = homeAnalytic;

  useEffect(() => {
    if (
      total_students &&
      completed_tuition !== undefined &&
      incompleted_tuition !== undefined &&
      void_tuition !== undefined
    ) {
      const calculatePercentage = (value: number) => {
        const percentage = (value / total_students) * 100;
        return Number(percentage.toFixed(2));
      };

      setTotalPercentageValue({
        completed: calculatePercentage(completed_tuition),
        incomplete: calculatePercentage(incompleted_tuition),
        void: calculatePercentage(void_tuition),
        total_students: total_students,
        paid: completed_tuition,
        paid_half: incompleted_tuition,
        paid_nothing: void_tuition,
        starter_pack_collected: calculatePercentage(starter_pack_collected),
      });
    }
  }, [
    total_students,
    completed_tuition,
    incompleted_tuition,
    void_tuition,
    starter_pack_collected,
  ]);

  // console.log(
  //   "Home Analytics Total:",
  //   homeAnalytic,
  //   isHomeAnalyticError,
  //   homeAnalyticError,
  //   isHomeAnalyticLoading
  // );
  isHomeAnalyticError && console.error(homeAnalyticError);

  return totalPercentageValue;
};

export default useTotalPercentageValue;
