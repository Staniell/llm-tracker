import express from "express";
import helmet from "helmet";
import cors from "cors";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { mountRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "16kb" }));
  app.use(requestLogger);
  mountRoutes(app);
  app.use(errorHandler);
  return app;
}
