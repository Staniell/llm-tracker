import { Type } from "@google/genai";
import type { FunctionDeclaration } from "@google/genai";

export const tools: FunctionDeclaration[] = [
  {
    name: "create_task",
    description:
      "Create a new task. Use when the user asks to add, create, or make a new task/todo/item.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Short descriptive title for the task",
        },
        description: {
          type: Type.STRING,
          description: "Optional longer description or notes",
        },
        priority: {
          type: Type.STRING,
          description: "Priority level",
          enum: ["low", "medium", "high"],
        },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task",
    description:
      "Update an existing task. Use to change title, description, status, or priority. Use status 'done' to mark a task as complete, 'in_progress' to mark as started.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        task_id: {
          type: Type.NUMBER,
          description: "The ID of the task to update",
        },
        title: { type: Type.STRING, description: "New title" },
        description: { type: Type.STRING, description: "New description" },
        status: {
          type: Type.STRING,
          description: "New status",
          enum: ["todo", "in_progress", "done"],
        },
        priority: {
          type: Type.STRING,
          description: "New priority",
          enum: ["low", "medium", "high"],
        },
      },
      required: ["task_id"],
    },
  },
  {
    name: "delete_task",
    description:
      "Permanently delete a task. Only use when the user explicitly asks to delete or remove a task.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        task_id: {
          type: Type.NUMBER,
          description: "The ID of the task to delete",
        },
      },
      required: ["task_id"],
    },
  },
];
