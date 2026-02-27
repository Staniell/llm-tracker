import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { resetAll } from "../db/reset.js";

export const adminRouter = Router();

adminRouter.post(
  "/reset",
  asyncHandler(async (_req, res) => {
    resetAll();
    res.json({ message: "All data has been reset" });
  })
);
