import type { Task, TaskDetail, TaskStatus, ChatResponse } from "../types.js";

const BASE = "";

export async function sendMessage(message: string): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE}/api/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.tasks;
}

export async function getTask(
  id: number
): Promise<{ task: Task; details: TaskDetail[] }> {
  const res = await fetch(`${BASE}/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus
): Promise<Task> {
  const res = await fetch(`${BASE}/api/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update task status");
  const data = await res.json();
  return data.task;
}

export async function resetAll(): Promise<void> {
  const res = await fetch(`${BASE}/admin/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset");
}
