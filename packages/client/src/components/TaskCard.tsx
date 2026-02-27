import type { Task } from "../types.js";
import { formatRelative } from "../utils/time.js";

interface TaskCardProps {
  task: Task;
  onSelect: (id: number) => void;
}

const statusDotColor: Record<string, string> = {
  todo: "bg-amber-400",
  in_progress: "bg-blue-400",
  done: "bg-emerald-400",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export default function TaskCard({ task, onSelect }: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <button
      onClick={() => onSelect(task.id)}
      className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200 ${
        isDone ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${statusDotColor[task.status]}`}
        />
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
