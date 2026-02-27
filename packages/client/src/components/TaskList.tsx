import type { Task, TaskStatus } from "../types.js";
import TaskCard from "./TaskCard.js";

interface TaskListProps {
  tasks: Task[];
  onSelectTask: (id: number) => void;
  onUpdateTaskStatus: (id: number, status: TaskStatus) => void;
}

const groupOrder: TaskStatus[] = ["in_progress", "todo", "done"];

const groupLabels: Record<TaskStatus, string> = {
  in_progress: "In Progress",
  todo: "To Do",
  done: "Done",
};

export default function TaskList({
  tasks,
  onSelectTask,
  onUpdateTaskStatus,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No tasks yet</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Chat to create your first task
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupOrder
    .map((status) => ({
      status,
      label: groupLabels[status],
      items: tasks.filter((t) => t.status === status),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {grouped.map((group) => (
        <div key={group.status}>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-1">
            {group.label}
          </h3>
          <div className="space-y-0.5">
            {group.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={onSelectTask}
                onUpdateTaskStatus={onUpdateTaskStatus}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
