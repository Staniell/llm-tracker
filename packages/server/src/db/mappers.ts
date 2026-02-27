import type { Task, ChatMessage, TaskDetail } from "@llm-tracker/shared";

export function mapTaskRow(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTaskDetailRow(row: any): TaskDetail {
  return {
    id: row.id,
    taskId: row.task_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function mapChatMessageRow(row: any): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}
