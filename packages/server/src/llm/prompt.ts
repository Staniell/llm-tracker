import type { LlmContext } from "./types.js";

export function buildSystemPrompt(context: LlmContext): string {
  const taskList =
    context.tasks.length === 0
      ? "No tasks yet."
      : context.tasks
          .map((t) => {
            const noteCount = context.detailCounts.get(t.id) ?? 0;
            const notes = noteCount > 0 ? ` (${noteCount} note${noteCount > 1 ? "s" : ""})` : "";
            return `  #${t.id}: "${t.title}" [status=${t.status}, priority=${t.priority}]${t.description ? ` — ${t.description}` : ""}${notes}`;
          })
          .join("\n");

  return `You are a helpful task management assistant. You help users manage their tasks through natural conversation.

## Current Tasks
${taskList}

## Rules
- When the user wants to create a task, call create_task with a clear title.
- When the user wants to complete/finish a task, call update_task with status="done".
- When the user wants to start working on a task, call update_task with status="in_progress".
- When the user references a task by name, find the best matching task by ID from the list above.
- When the user wants to delete a task, call delete_task.
- When the user wants to add a note, detail, update, or context to a task, call add_detail. Do NOT use update_task to change the description for this.
- You can create multiple tasks in one response if the user asks for several.
- If the user asks about their tasks or says something conversational, respond with helpful text WITHOUT calling any tools.
- Keep your text responses concise and friendly.
- If a request is ambiguous (e.g., "mark it as done" but multiple tasks exist), ask for clarification instead of guessing.`;
}
