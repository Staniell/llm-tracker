import type { ChatMessage } from "../types.js";
import { formatTime } from "../utils/time.js";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 ${
          isUser
            ? "bg-primary-600 text-white rounded-2xl rounded-br-sm"
            : "bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-sm"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p
          className={`text-xs mt-1.5 ${
            isUser ? "text-primary-200" : "text-gray-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
