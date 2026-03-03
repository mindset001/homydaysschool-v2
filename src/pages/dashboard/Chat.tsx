import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { getChatMessages, postChatMessage } from "../../services/api/calls/getApis";
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

  const {
    data: messagesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chatMessages"],
    queryFn: getChatMessages,
    retry: 1,
  });

  const mutation = useMutation<any, Error, string>(
    {
      mutationFn: (text: string) => postChatMessage(text),
      onSuccess: () => {
        setNewMessage("");
        queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      },
    }
  );

  const isPosting = mutation.status === 'pending';
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
    <div className="p-4">
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
              <div key={msg._id} className="p-2 border rounded">
                <div className="text-sm text-gray-500">
                  {msg.authorRole} - {new Date(msg.createdAt).toLocaleString()}
                </div>
                <div>{msg.text}</div>
              </div>
            ))
          )}
        </div>
      )}

      {role === "admin" && (
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            className="flex-grow border p-2"
            placeholder="Enter a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={isPosting}
          >
            Send
          </button>
        </form>
      )}
      {role !== "admin" && (
        <div className="text-gray-600 text-sm">
          Only administrators can post messages.
        </div>
      )}
    </div>
  );
};

export default Chat;
