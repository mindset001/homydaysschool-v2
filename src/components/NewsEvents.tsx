import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api/apiClient";
import Logo from "../../public/logo.png"

interface IEvent {
  _id: string;
  event: string;
  date: string;
  createdBy?: { firstName: string; lastName: string };
}

const fetchPublicEvents = async (): Promise<IEvent[]> => {
  const res = await apiClient.get("calender/public");
  return res.data?.data ?? [];
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const NewsEvents: React.FC = () => {
  const { data: events = [], isLoading } = useQuery<IEvent[]>({
    queryKey: ["publicEvents"],
    queryFn: fetchPublicEvents,
    staleTime: 5 * 60 * 1000,
  });

  const displayEvents = events.slice(0, 3);

  return (
    <section className="w-full py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Header card */}
          <div className="rounded-lg shadow p-4 flex flex-col justify-between bg-black text-white min-h-[220px]">
            <img
              src={Logo}
              alt="News Logo"
              className="w-16 h-16 mb-2 object-contain"
              loading="lazy"
            />
            <div className="font-bold text-lg mb-2">News and Events</div>
            <div className="text-sm mb-2 opacity-80">
              Stay updated with the latest happenings in our school community.
            </div>
          </div>

          {/* Event cards */}
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg shadow p-4 bg-white animate-pulse min-h-[160px]">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-auto" />
              </div>
            ))
            : displayEvents.length > 0
              ? displayEvents.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg shadow p-4 flex flex-col justify-between bg-white text-black min-h-[160px]"
                >
                  <div className="font-bold text-base mb-2 line-clamp-3">{item.event}</div>
                  <div className="text-xs text-gray-500 mt-auto">{formatDate(item.date)}</div>
                </div>
              ))
              : Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg shadow p-4 flex flex-col justify-between bg-white text-black min-h-[160px]"
                >
                  <div className="text-sm text-gray-400 italic">No events scheduled.</div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default NewsEvents;
