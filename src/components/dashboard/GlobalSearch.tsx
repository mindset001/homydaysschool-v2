import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllStudents, getStaffs } from "../../services/api/calls/getApis";
import SearchSVG from "../svg/dashboard navbar svg/SearchSVG";

interface GlobalSearchProps {
  role: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ role }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSearching = query.trim().length > 0;
  const canSearchStaff = role === "admin";

  const { data: studentsData } = useQuery({
    queryKey: ["allStudents"],
    queryFn: getAllStudents,
    enabled: isSearching,
    staleTime: 1000 * 60 * 2,
  });

  const { data: staffData } = useQuery({
    queryKey: ["staffs"],
    queryFn: () => getStaffs(),
    enabled: isSearching && canSearchStaff,
    staleTime: 1000 * 60 * 2,
  });

  const matchedStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const students: any[] = studentsData?.data?.students ?? [];
    return students
      .filter((s) => {
        const fullName = `${s.userId?.firstName ?? ""} ${s.userId?.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(q) ||
          s.studentId?.toLowerCase().includes(q) ||
          s.class?.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [studentsData, query]);

  const matchedStaff = useMemo(() => {
    if (!canSearchStaff) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const staffList: any[] = staffData?.data?.staff ?? [];
    return staffList
      .filter((s) => {
        const fullName = `${s.userId?.firstName ?? ""} ${s.userId?.lastName ?? ""}`.toLowerCase();
        return fullName.includes(q) || s.userId?.email?.toLowerCase().includes(q);
      })
      .slice(0, 6);
  }, [staffData, query, canSearchStaff]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToStudent = (student: any) => {
    navigate(`/dashboard/student/${student._id}`);
    setQuery("");
    setIsOpen(false);
  };

  const goToStaff = (staff: any) => {
    navigate(`/dashboard/staff?staffId=${staff._id}`);
    setQuery("");
    setIsOpen(false);
  };

  const hasResults = matchedStudents.length > 0 || matchedStaff.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="dashboard-header-desktop-search-svg max-w-[24px] h-auto absolute top-0 bottom-0 left-[15px] lg:left-[20px] 2xl:left-[25px] flex items-center z-10">
        <SearchSVG />
      </div>
      <input
        type="search"
        name="search"
        id="search"
        placeholder={canSearchStaff ? "Search students or staff…" : "Search students…"}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="bg-[#F1F0F0] rounded-[20px] w-[calc(100%-20px)] lg:min-w-full min-h-full pl-[45px] lg:pl-[56px] 2xl:pl-[69px] pr-[17px] xl:pr-[25px] py-[8px] 2xl:py-[13px] text-lg font-medium"
      />
      {isOpen && isSearching && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-80 overflow-auto">
          {!hasResults ? (
            <div className="p-4 text-sm text-gray-400">No matches found.</div>
          ) : (
            <>
              {matchedStudents.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">
                    Students
                  </div>
                  {matchedStudents.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => goToStudent(s)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {s.userId?.firstName} {s.userId?.lastName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {s.studentId} · {s.class}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {matchedStaff.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">
                    Staff
                  </div>
                  {matchedStaff.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => goToStaff(s)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {s.userId?.firstName} {s.userId?.lastName}
                      </span>
                      <span className="text-xs text-gray-400">{s.userId?.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
