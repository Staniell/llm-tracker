import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { getAllTasks, getTaskWithDetails, updateTaskStatus } from "../services/task.service.js";
import type { TaskStatus } from "@llm-tracker/shared";

const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export const taskRouter = Router();

taskRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tasks = getAllTasks();
    res.json({ tasks });
  })
);

taskRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { task, details } = getTaskWithDetails(Number(req.params.id));
    res.json({ task, details });
  })
);

taskRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status: string };
    if (!status || !VALID_STATUSES.includes(status as TaskStatus)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      return;
    }
    const task = updateTaskStatus(Number(req.params.id), status as TaskStatus);
    res.json({ task });
  })
);
