import type { Task, TaskStatus } from "../types.js";
import { formatRelative } from "../utils/time.js";

interface TaskCardProps {
  task: Task;
  onSelect: (id: number) => void;
  onUpdateTaskStatus: (id: number, status: TaskStatus) => void;
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export default function TaskCard({
  task,
  onSelect,
  onUpdateTaskStatus,
}: TaskCardProps) {
  const isDone = task.status === "done";

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    onUpdateTaskStatus(task.id, isDone ? "todo" : "done");
  }

  return (
    <button
      onClick={() => onSelect(task.id)}
      className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200 ${
        isDone ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Interactive check circle */}
        <div
          role="button"
          tabIndex={0}
          aria-label={isDone ? "Reopen task" : "Complete task"}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onUpdateTaskStatus(task.id, isDone ? "todo" : "done");
            }
          }}
          className="mt-0.5 w-11 h-11 flex items-center justify-center shrink-0 -ml-1.5 cursor-pointer"
        >
          {isDone ? (
            <svg
              className="w-5 h-5 text-emerald-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-300 hover:text-gray-400 transition-colors"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="10" cy="10" r="8" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium text-gray-900 truncate ${
              isDone ? "line-through" : ""
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${priorityStyles[task.priority]}`}
            >
              {task.priority}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelative(task.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
