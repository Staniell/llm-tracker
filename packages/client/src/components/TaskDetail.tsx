import type { Task } from "../types.js";
import { formatDateTime } from "../utils/time.js";

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
}

const statusLabel: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusStyles: Record<string, string> = {
  todo: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

const priorityLabel: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export default function TaskDetail({ task, onBack }: TaskDetailProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back to list
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-lg font-semibold text-gray-900 leading-snug">
          {task.title}
        </h2>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[task.status]}`}
          >
            {statusLabel[task.status]}
          </span>
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${priorityStyles[task.priority]}`}
          >
            {priorityLabel[task.priority]}
          </span>
        </div>

        {task.description && (
          <div className="mt-5">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Created</span>
            <span className="text-xs text-gray-600">
              {formatDateTime(task.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Updated</span>
            <span className="text-xs text-gray-600">
              {formatDateTime(task.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
