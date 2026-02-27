import type { Task, ChatMessage, TaskStatus, TaskPriority } from "@llm-tracker/shared";

export interface CreateTaskIntent {
  type: "create_task";
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskIntent {
  type: "update_task";
  taskId: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface DeleteTaskIntent {
  type: "delete_task";
  taskId: number;
}

export interface AddDetailIntent {
  type: "add_detail";
  taskId: number;
  content: string;
}

export type LlmIntent = CreateTaskIntent | UpdateTaskIntent | DeleteTaskIntent | AddDetailIntent;

export interface LlmResponse {
  message: string;
  intents: LlmIntent[];
}

export interface LlmContext {
  userMessage: string;
  tasks: Task[];
  recentMessages: ChatMessage[];
  detailCounts: Map<number, number>;
}
