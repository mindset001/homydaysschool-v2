import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "../../../services/api/calls/getApis";
import Loader from "../../../shared/Loader";
import { profileImage as defaultProfileImage } from "../../../assets/images/users";

interface StudentUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface Student {
  _id: string;
  studentId: string;
  class: string;
  gender: string;
  fathersContact?: string;
  mothersContact?: string;
  fathersName?: string;
  mothersName?: string;
  userId: StudentUser;
}

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const StudentAdminAll: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allStudents"],
    queryFn: getAllStudents,
    staleTime: 1000 * 60 * 2,
  });

  const students: Student[] = useMemo(() => {
    return data?.data?.students ?? [];
  }, [data]);

  // Unique sorted class list for filter dropdown
  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(students.map((s) => s.class))).sort();
    return classes;
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      const fullName =
        `${s.userId?.firstName ?? ""} ${s.userId?.lastName ?? ""}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q);
      const matchesClass = !classFilter || s.class === classFilter;
      const matchesGender = !genderFilter || s.gender === genderFilter;
      return matchesSearch && matchesClass && matchesGender;
    });
  }, [students, search, classFilter, genderFilter]);

  return (
    <div className="p-4 md:p-6 font-Poppins min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#05878F] hover:underline mb-1 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">All Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? "Loading..." : `${filtered.length} of ${students.length} student${students.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#05878F]"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
        >
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader />
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center min-h-[300px] text-red-500 font-medium">
          Failed to load students. Please try again.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px] text-gray-500">
          No students found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#05878F] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Gender</th>
                  <th className="px-4 py-3 font-semibold">Guardian Contact</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, idx) => {
                  const fullName = `${student.userId?.lastName ?? ""} ${student.userId?.firstName ?? ""}`.trim();
                  const contact = student.fathersContact || student.mothersContact || "—";
                  return (
                    <tr
                      key={student._id}
                      className={`border-b border-gray-100 hover:bg-[#f0fafb] transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      onClick={() => navigate(`/dashboard/student/${student._id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.userId?.profileImage || defaultProfileImage}
                            alt={fullName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="font-medium text-gray-800">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#05878F] font-semibold">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{student.class}</td>
                      <td className="px-4 py-3 text-gray-700 capitalize">
                        {GENDER_LABELS[student.gender] ?? student.gender}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{contact}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{student.userId?.email ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((student) => {
              const fullName = `${student.userId?.lastName ?? ""} ${student.userId?.firstName ?? ""}`.trim();
              const contact = student.fathersContact || student.mothersContact || "—";
              return (
                <div
                  key={student._id}
                  onClick={() => navigate(`/dashboard/student/${student._id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4 cursor-pointer active:bg-gray-50"
                >
                  <img
                    src={student.userId?.profileImage || defaultProfileImage}
                    alt={fullName}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{fullName}</p>
                    <p className="text-xs font-mono text-[#05878F] font-bold">{student.studentId}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-[#e6f7f8] text-[#05878F] px-2 py-0.5 rounded-full">
                        {student.class}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {GENDER_LABELS[student.gender] ?? student.gender}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{contact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAdminAll;
