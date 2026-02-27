import { getGenAI } from "./client.js";
import { tools } from "./tools.js";
import { buildSystemPrompt } from "./prompt.js";
import type {
  LlmContext,
  LlmResponse,
  LlmIntent,
  CreateTaskIntent,
  UpdateTaskIntent,
  DeleteTaskIntent,
  AddDetailIntent,
} from "./types.js";

export async function interpret(context: LlmContext): Promise<LlmResponse> {
  const ai = getGenAI();

  // Build conversation history for the LLM
  const contents = [
    ...context.recentMessages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    })),
    { role: "user" as const, parts: [{ text: context.userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction: buildSystemPrompt(context),
      temperature: 0.2,
      tools: [{ functionDeclarations: tools }],
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    return {
      message: "I'm sorry, I couldn't process that request.",
      intents: [],
    };
  }

  const intents: LlmIntent[] = [];
  let message = "";

  for (const part of candidate.content.parts) {
    if (part.text) {
      message += part.text;
    }
    if (part.functionCall && part.functionCall.name) {
      const intent = parseFunctionCall(
        part.functionCall.name,
        part.functionCall.args as Record<string, any> | undefined
      );
      if (intent) intents.push(intent);
    }
  }

  // If we have intents but no text, generate a summary message
  if (intents.length > 0 && !message.trim()) {
    message = summarizeIntents(intents);
  }

  return { message: message || "Done!", intents };
}

function parseFunctionCall(
  name: string,
  args: Record<string, any> | undefined
): LlmIntent | null {
  if (!args) return null;

  switch (name) {
    case "create_task":
      if (!args.title) return null;
      return {
        type: "create_task",
        title: args.title,
        description: args.description,
        priority: args.priority,
      } satisfies CreateTaskIntent;

    case "update_task": {
      const taskId = args.task_id;
      if (typeof taskId !== "number") return null;
      return {
        type: "update_task",
        taskId,
        title: args.title,
        description: args.description,
        status: args.status,
        priority: args.priority,
      } satisfies UpdateTaskIntent;
    }

    case "delete_task": {
      const taskId = args.task_id;
      if (typeof taskId !== "number") return null;
      return { type: "delete_task", taskId } satisfies DeleteTaskIntent;
    }

    case "add_detail": {
      const taskId = args.task_id;
      if (typeof taskId !== "number" || !args.content) return null;
      return {
        type: "add_detail",
        taskId,
        content: args.content,
      } satisfies AddDetailIntent;
    }

    default:
      return null;
  }
}

function summarizeIntents(intents: LlmIntent[]): string {
  const parts = intents.map((intent) => {
    switch (intent.type) {
      case "create_task":
        return `Created task "${intent.title}"`;
      case "update_task":
        return `Updated task #${intent.taskId}`;
      case "delete_task":
        return `Deleted task #${intent.taskId}`;
      case "add_detail":
        return `Added a note to task #${intent.taskId}`;
    }
  });
  return parts.join(". ") + ".";
}
