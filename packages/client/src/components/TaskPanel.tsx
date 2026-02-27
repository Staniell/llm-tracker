import type { Task } from "../types.js";
import TaskList from "./TaskList.js";
import TaskDetail from "./TaskDetail.js";

interface TaskPanelProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (id: number | null) => void;
}

export default function TaskPanel({
  tasks,
  selectedTaskId,
  onSelectTask,
}: TaskPanelProps) {
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  return (
    <div className="hidden md:flex flex-col h-full w-96 bg-white border-l border-gray-200">
      {selectedTask ? (
        <TaskDetail task={selectedTask} onBack={() => onSelectTask(null)} />
      ) : (
        <>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Tasks</h2>
              {tasks.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {tasks.length}
                </span>
              )}
            </div>
          </div>
          <TaskList tasks={tasks} onSelectTask={onSelectTask} />
        </>
      )}
    </div>
  );
}
