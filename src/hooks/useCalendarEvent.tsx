import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getHomeAnalytic } from "../services/api/calls/getApis";

interface EventInterface {
  id: number;
  title: string;
  date: string;
}

interface useCalendarEventI {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calendarEvents : any[],
    isHomeAnalyticError : boolean,
    homeAnalyticError : string | unknown,
    isHomeAnalyticLoading : boolean,
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
  events: [
    {
      id: number;
      event: string;
      date: string;
    }
  ];
}

const useCalendarEvent = (): useCalendarEventI => {
  const [calendarEvents, setCalendarEvents] = useState<EventInterface[]>([]);
  console.log("Calendar Events", calendarEvents);

  // Get data for home analytic
  const {
    data: homeAnalyticData,
    isError: isHomeAnalyticError,
    error: homeAnalyticError,
    isLoading: isHomeAnalyticLoading,
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

  const { events = [] } = homeAnalytic;

  const transformedEvents: EventInterface[] = useMemo(() => {
    return events.map(({ id, event, date }) => ({
      id,
      title: event.toLowerCase()
      .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase()), // Rename 'event' to 'title'
      date,
    }));
  }, [events]);
  const filterToUpcoming = useMemo(() => {
    const today = new Date();
    today.setHours(1, 0, 0, 0);
    const stringToday = today.getTime();
    return transformedEvents.filter(
      (event) => new Date(event.date).getTime() >= stringToday
    );
  }, [transformedEvents]);
  useEffect(() => {
    if (events.length > 0) {
      // console.log("Hmmmm", stringToday);
      console.log(
        "Date",
        filterToUpcoming.map((event) => new Date(event.date))
      );

      setCalendarEvents(filterToUpcoming);
    }
  }, [events, filterToUpcoming]);

  console.log(
    "Home Analytics Total:",
    homeAnalytic,
    isHomeAnalyticError,
    homeAnalyticError,
    isHomeAnalyticLoading
  );
  isHomeAnalyticError && console.error(homeAnalyticError);

  return {calendarEvents, isHomeAnalyticError, homeAnalyticError, isHomeAnalyticLoading};
};

export default useCalendarEvent;
