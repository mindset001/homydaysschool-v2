import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { getChatMessages, postChatMessage } from "../../services/api/calls/getApis";
import { markChatRead } from "../../services/api/calls/postApis";
import { getRole } from "../../utils/authTokens";

interface ChatMessage {
  _id: string;
  text: string;
  authorRole: string;
  createdAt: string;
}

const Chat: React.FC = () => {
  const role = getRole()?.toLowerCase();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: messagesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chatMessages"],
    queryFn: getChatMessages,
    retry: 1,
    refetchInterval: 30_000,
  });

  // Mark all admin messages as read when this page is opened (guardian / staff only)
  useEffect(() => {
    if (role === "guardian" || role === "staff") {
      markChatRead().then(() => {
        queryClient.invalidateQueries({ queryKey: ["unreadChatCount"] });
      });
    }
  }, [role, queryClient]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const mutation = useMutation<any, Error, string>({
    mutationFn: (text: string) => postChatMessage(text),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    },
  });

  const isPosting = mutation.status === "pending";
  const { mutate } = mutation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      mutate(newMessage.trim());
    }
  };

  const messages: ChatMessage[] =
    messagesData?.data?.messages && Array.isArray(messagesData.data.messages)
      ? messagesData.data.messages
      : [];

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">School Chat</h2>
      {isLoading ? (
        <div>Loading messages...</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load messages</div>
      ) : (
        <div className="space-y-2 mb-4 max-h-[60vh] overflow-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 border rounded-lg ${
                  msg.authorRole === "admin"
                    ? "bg-[#ECFEFF] border-[#05878F]/30"
                    : "bg-white"
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  <span className="font-semibold capitalize text-[#046a71]">
                    {msg.authorRole}
                  </span>{" "}
                  · {new Date(msg.createdAt).toLocaleString()}
                </div>
                <div className="text-sm">{msg.text}</div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {role === "admin" && (
        <form onSubmit={handleSubmit} className="flex space-x-2 mt-auto">
          <input
            type="text"
            className="flex-grow border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#05878F] hover:bg-[#046a71] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            disabled={isPosting}
          >
            {isPosting ? "Sending…" : "Send"}
          </button>
        </form>
      )}
      {role !== "admin" && (
        <p className="text-gray-400 text-xs mt-2">
          Messages posted here are from the school administration.
        </p>
      )}
    </div>
  );
};

export default Chat;
