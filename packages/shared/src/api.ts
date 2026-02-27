import type { ChatMessage } from "./chat.js";
import type { Task } from "./task.js";

export interface ChatRequest {
  message: string;
}

export interface TaskSideEffect {
  type: "created" | "updated" | "deleted";
  task: Task;
}

export interface ChatResponse {
  message: ChatMessage;
  sideEffects: TaskSideEffect[];
}

export interface TaskListResponse {
  tasks: Task[];
}

export interface TaskDetailResponse {
  task: Task;
}

export interface ResetResponse {
  message: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
