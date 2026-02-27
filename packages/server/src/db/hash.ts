import { createHash } from "node:crypto";

export function normalizeMessage(msg: string): string {
  return msg.trim().replace(/\s+/g, " ").toLowerCase();
}

export function hashMessage(msg: string): string {
  return createHash("sha256").update(normalizeMessage(msg)).digest("hex");
}
