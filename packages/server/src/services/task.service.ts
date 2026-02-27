import { taskRepo } from "../db/task.repository.js";
import { detailRepo } from "../db/detail.repository.js";
import { NotFoundError } from "../errors/app-error.js";
import type { TaskStatus } from "@llm-tracker/shared";

export function getAllTasks() {
  return taskRepo.getAll();
}

export function getTaskById(id: number) {
  const task = taskRepo.getById(id);
  if (!task) throw new NotFoundError(`Task with id ${id} not found`);
  return task;
}

export function getTaskWithDetails(id: number) {
  const task = taskRepo.getById(id);
  if (!task) throw new NotFoundError(`Task with id ${id} not found`);
  const details = detailRepo.getByTaskId(id);
  return { task, details };
}

export function updateTaskStatus(id: number, status: TaskStatus) {
  const task = taskRepo.getById(id);
  if (!task) throw new NotFoundError(`Task with id ${id} not found`);
  return taskRepo.update(id, { status })!;
}
