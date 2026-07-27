import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEnrollmentApplications } from "../../services/api/calls/getApis";
import { updateEnrollmentApplicationStatus } from "../../services/api/calls/updateApis";
import { deleteEnrollmentApplication } from "../../services/api/calls/deleteApis";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import Loader from "../../shared/Loader";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  enrolled: "Enrolled",
  declined: "Declined",
};

const STATUS_STYLES: Record<string, string> = {
  new: "text-[#F97316] bg-orange-50",
  contacted: "text-blue-600 bg-blue-50",
  enrolled: "text-green-600 bg-green-50",
  declined: "text-gray-500 bg-gray-100",
};

const EnrollmentApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["enrollmentApplications"],
    queryFn: () => getEnrollmentApplications(),
    staleTime: 60 * 1000,
  });

  const applications: any[] = data?.data?.data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateEnrollmentApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollmentApplications"] });
    },
    onError: () => showErrorToast("Failed to update application"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEnrollmentApplication(id),
    onSuccess: () => {
      showSuccessToast("Application deleted");
      queryClient.invalidateQueries({ queryKey: ["enrollmentApplications"] });
    },
    onError: () => showErrorToast("Failed to delete application"),
  });

  return (
    <div className="p-3 sm:p-6 font-Poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F97316]">Enrollment Applications</h1>
        {applications.length > 0 && (
          <span className="text-sm text-gray-500">
            {applications.filter((a) => a.status === "new").length} new
          </span>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-red-500">
          Failed to load applications.
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          No applications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((a: any) => (
            <div
              key={a._id}
              className={`bg-white rounded-2xl shadow-sm border p-5 ${
                a.status === "new" ? "border-[#F97316]/40" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-800">
                    {a.childFullName}
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status] ?? ""}`}
                    >
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Applying for {a.desiredLevel}
                    {a.dateOfBirth ? ` · DOB ${new Date(a.dateOfBirth).toLocaleDateString()}` : ""}
                    {" · "}
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <select
                    value={a.status}
                    onChange={(e) => statusMutation.mutate({ id: a._id, status: e.target.value })}
                    disabled={statusMutation.isPending}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteMutation.mutate(a._id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Guardian: <span className="font-medium text-gray-800">{a.guardianName}</span>
                {" · "}
                <a href={`mailto:${a.guardianEmail}`} className="hover:underline">
                  {a.guardianEmail}
                </a>
                {" · "}
                {a.guardianPhone}
              </div>
              {a.message && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {a.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrollmentApplicationsPage;
