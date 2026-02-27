export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface TaskSideEffect {
  type: "created" | "updated" | "deleted";
  task: Task;
}

export interface ChatResponse {
  message: ChatMessage;
  sideEffects: TaskSideEffect[];
}
