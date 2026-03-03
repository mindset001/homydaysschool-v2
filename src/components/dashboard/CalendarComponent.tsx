import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { memo, useMemo } from "react";
import { EventInterface } from "../../hooks/useTotalPercentageValue";

const localizer = momentLocalizer(moment);
interface CalendarComponentProps {
  events?: EventInterface[];
}
const CalendarComponent: React.FC<CalendarComponentProps> = ({
  events = [],
}) => {
  const formattedDateEvent = useMemo(() => {
    return events.map((event) => {
      return {
        ...event,
        title: event.event,
        start: event.date,
        end: event.date,
      };
    });
  }, [events]);
  return (
    <div className="mb-[17px] xl:mb-[42px] h-[300px] md:h-[350px] xl:h-[400px]">
      <Calendar
        localizer={localizer}
        events={formattedDateEvent}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        className="calendar-styling"
      />
      {/* <div>{evente}</div> */}
    </div>
  );
};

export default memo(CalendarComponent);
