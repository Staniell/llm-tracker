import { useState, useRef, useCallback } from "react";

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const MAX_CHARS = 2000;
const MAX_ROWS = 4;

export default function ChatInput({ isLoading, onSendMessage }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * MAX_ROWS;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    if (next.length <= MAX_CHARS) {
      setValue(next);
      requestAnimationFrame(adjustHeight);
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setValue("");
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="flex items-end gap-3 px-6 py-4 bg-white border-t border-gray-200">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        disabled={isLoading}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:opacity-50 transition-colors"
      />
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
      >
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      </button>
    </div>
  );
}
