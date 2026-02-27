import { getDb } from "../db/connection.js";
import { chatRepo } from "../db/chat.repository.js";
import { taskRepo } from "../db/task.repository.js";
import { idempotencyRepo } from "../db/idempotency.repository.js";
import { hashMessage } from "../db/hash.js";
import { interpret } from "../llm/interpreter.js";
import type { ChatResponse, TaskSideEffect } from "@llm-tracker/shared";
import type { LlmIntent } from "../llm/types.js";

export async function processMessage(
  message: string
): Promise<ChatResponse> {
  const hash = hashMessage(message);

  // Phase A: fast path -- check idempotency cache
  const cached = idempotencyRepo.findByHash(hash);
  if (cached) return JSON.parse(cached.response_json);

  // Build context for LLM
  const tasks = taskRepo.getAll();
  const recentMessages = chatRepo.getRecent(20);

  // Phase B: call LLM (async, outside transaction)
  const llmResponse = await interpret({
    userMessage: message,
    tasks,
    recentMessages,
  });

  // Phase C: transaction -- re-check hash, execute intents, persist, cache
  const db = getDb();
  const commit = db.transaction(() => {
    // Re-check hash inside transaction for race safety
    const recheck = idempotencyRepo.findByHash(hash);
    if (recheck) return JSON.parse(recheck.response_json) as ChatResponse;

    // Execute intents
    const sideEffects: TaskSideEffect[] = [];
    for (const intent of llmResponse.intents) {
      const effect = executeIntent(intent);
      if (effect) sideEffects.push(effect);
    }

    // Save messages
    chatRepo.save("user", message);
    const assistantMsg = chatRepo.save("assistant", llmResponse.message);

    const response: ChatResponse = { message: assistantMsg, sideEffects };
    idempotencyRepo.store(hash, JSON.stringify(response));
    return response;
  });

  return commit();
}

function executeIntent(intent: LlmIntent): TaskSideEffect | null {
  switch (intent.type) {
    case "create_task": {
      const task = taskRepo.create({
        title: intent.title,
        description: intent.description,
        status: "todo",
        priority: intent.priority || "medium",
      });
      return { type: "created", task };
    }
    case "update_task": {
      const updates: Record<string, any> = {};
      if (intent.title) updates.title = intent.title;
      if (intent.description) updates.description = intent.description;
      if (intent.status) updates.status = intent.status;
      if (intent.priority) updates.priority = intent.priority;

      const task = taskRepo.update(intent.taskId, updates);
      if (!task) return null;
      return { type: "updated", task };
    }
    case "delete_task": {
      const task = taskRepo.getById(intent.taskId);
      if (!task) return null;
      taskRepo.remove(intent.taskId);
      return { type: "deleted", task };
    }
  }
}
