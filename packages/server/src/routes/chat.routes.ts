import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { processMessage } from "../services/chat.service.js";
import { ValidationError } from "../errors/app-error.js";

export const chatRouter = Router();

chatRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== "string")
      throw new ValidationError("message is required and must be a string");
    if (message.length > 2000)
      throw new ValidationError("message must be 2000 characters or less");
    if (message.trim().length === 0)
      throw new ValidationError("message must not be empty");

    const response = await processMessage(message.trim());
    res.json(response);
  })
);
