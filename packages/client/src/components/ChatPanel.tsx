import type { ChatMessage } from "../types.js";
import MessageList from "./MessageList.js";
import ChatInput from "./ChatInput.js";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
}: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
    </div>
  );
}
