import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { getAllTasks, getTaskById } from "../services/task.service.js";

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
    const task = getTaskById(Number(req.params.id));
    res.json({ task });
  })
);
