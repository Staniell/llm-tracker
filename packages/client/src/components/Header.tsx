import { useState } from "react";

interface HeaderProps {
  onReset: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    if (confirming) {
      onReset();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
          <svg
            className="w-4.5 h-4.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Task Tracker</h1>
      </div>

      <button
        onClick={handleReset}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
          confirming
            ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        {confirming ? "Confirm Reset?" : "Reset All"}
      </button>
    </header>
  );
}
