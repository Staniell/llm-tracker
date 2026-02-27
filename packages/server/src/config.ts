import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  dbPath: process.env.DB_PATH || "data/tracker.db",
  nodeEnv: process.env.NODE_ENV || "development",
};
