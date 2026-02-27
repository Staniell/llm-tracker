import type { ChatMessage } from "./chat.js";
import type { Task, TaskDetail, TaskStatus } from "./task.js";

export interface ChatRequest {
  message: string;
}

export interface TaskSideEffect {
  type: "created" | "updated" | "deleted" | "detail_added";
  task: Task;
  detail?: TaskDetail;
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
  details: TaskDetail[];
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface ResetResponse {
  message: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
