import type { Express } from "express";
import { chatRouter } from "./chat.routes.js";
import { taskRouter } from "./task.routes.js";
import { adminRouter } from "./admin.routes.js";

export function mountRoutes(app: Express) {
  app.use("/api/chat", chatRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/admin", adminRouter);
}
