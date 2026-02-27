import { useState, useEffect } from "react";
import type { Task, TaskDetail as TaskDetailType, TaskStatus } from "../types.js";
import { getTask } from "../api/client.js";
import { formatDateTime } from "../utils/time.js";

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  onUpdateTaskStatus: (id: number, status: TaskStatus) => void;
  detailVersion: number;
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

export default function TaskDetail({
  task,
  onBack,
  onUpdateTaskStatus,
  detailVersion,
}: TaskDetailProps) {
  const [details, setDetails] = useState<TaskDetailType[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingDetails(true);
    getTask(task.id)
      .then((data) => {
        if (!cancelled) {
          setDetails(data.details);
          setLoadingDetails(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingDetails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [task.id, detailVersion]);

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

        {/* Status action buttons */}
        <div className="flex items-center gap-2 mt-4">
          {task.status !== "done" && (
            <button
              onClick={() => onUpdateTaskStatus(task.id, "done")}
              aria-label="Mark as done"
              className="h-11 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Mark as Done
            </button>
          )}
          {task.status === "todo" && (
            <button
              onClick={() => onUpdateTaskStatus(task.id, "in_progress")}
              aria-label="Start working"
              className="h-11 px-4 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Working
            </button>
          )}
          {task.status === "done" && (
            <button
              onClick={() => onUpdateTaskStatus(task.id, "todo")}
              aria-label="Reopen task"
              className="h-11 px-4 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Reopen
            </button>
          )}
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

        {/* Notes section */}
        <div className="mt-5">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Notes
          </h3>
          {loadingDetails ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading notes...
            </div>
          ) : details.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No notes yet — add one via chat
            </p>
          ) : (
            <div className="space-y-3">
              {details.map((detail) => (
                <div key={detail.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {detail.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(detail.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
