import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

let client: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return client;
}
