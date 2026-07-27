import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactMessages } from "../../services/api/calls/getApis";
import { markContactMessageRead } from "../../services/api/calls/updateApis";
import { deleteContactMessage } from "../../services/api/calls/deleteApis";
import { showSuccessToast, showErrorToast } from "../../shared/ToastNotification";
import Loader from "../../shared/Loader";

const ContactMessagesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contactMessages"],
    queryFn: () => getContactMessages(),
    staleTime: 60 * 1000,
  });

  const messages: any[] = data?.data?.data ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markContactMessageRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
    },
    onError: () => showErrorToast("Failed to update message"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContactMessage(id),
    onSuccess: () => {
      showSuccessToast("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
    },
    onError: () => showErrorToast("Failed to delete message"),
  });

  return (
    <div className="p-3 sm:p-6 font-Poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F97316]">Contact Messages</h1>
        {messages.length > 0 && (
          <span className="text-sm text-gray-500">
            {messages.filter((m) => m.status === "new").length} unread
          </span>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-red-500">
          Failed to load messages.
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m: any) => (
            <div
              key={m._id}
              className={`bg-white rounded-2xl shadow-sm border p-5 ${m.status === "new" ? "border-[#F97316]/40" : "border-gray-100"}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {m.name}
                    {m.status === "new" && (
                      <span className="ml-2 text-xs font-medium text-[#F97316] bg-orange-50 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0 text-xs">
                  {m.status === "new" && (
                    <button
                      onClick={() => markReadMutation.mutate(m._id)}
                      disabled={markReadMutation.isPending}
                      className="text-[#F97316] underline"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(m._id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                {m.phone && <span> · {m.phone}</span>}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessagesPage;
