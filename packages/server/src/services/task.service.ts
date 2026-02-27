import { taskRepo } from "../db/task.repository.js";
import { NotFoundError } from "../errors/app-error.js";

export function getAllTasks() {
  return taskRepo.getAll();
}

export function getTaskById(id: number) {
  const task = taskRepo.getById(id);
  if (!task) throw new NotFoundError(`Task with id ${id} not found`);
  return task;
}
