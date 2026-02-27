# Demo Walkthrough

## Prerequisites

- Node.js 18+
- A Gemini API key in `packages/server/.env` (see [README](README.md#configuration))
- Dependencies installed (`npm install`)

## 1. Start the App

```bash
# Terminal 1: Build shared types + start server
npm run build:shared
npm run dev:server                # Express on :3000

# Terminal 2: Start client
npm run dev:client                # Vite on :5173
```

Open **http://localhost:5173** — two-panel UI with chat on the left, task sidebar on the right.

## 2. Interactive Demo (Web UI)

### Multi-task creation from one message

Type in the chat:

> Create three tasks: write the quarterly report, schedule team sync, and review PRs

Three tasks appear in the sidebar instantly. Gemini returns parallel `create_task` function calls, and the UI updates from side effects without a page refresh.

### Complete a task from natural language

> I finished reviewing the PRs

The "review PRs" task moves to the **Done** group with a strikethrough. You can also click the **check circle** on any task card to toggle completion directly — this uses `PATCH /api/tasks/:id/status` (no LLM round-trip).

### Attach a detail to a task (R3 — appendable notes)

> Add a note to the quarterly report: it should cover Q4 revenue metrics

Click the "quarterly report" task in the sidebar. The detail view shows the note in the **Notes** timeline section.

Now send a second note:

> Add another note to the report: needs VP sign-off before Friday

Click the task again — **both notes** appear in chronological order, proving append behavior (not overwrite). The description field remains unchanged.

### Idempotency

Send the exact same message again:

> Add a note to the quarterly report: it should cover Q4 revenue metrics

The response is identical (returned from the idempotency cache), and **no duplicate note** is created. The task detail view still shows exactly 2 notes.

## 3. Scripted Demo (Headless)

Runs the full demo against the API without the browser:

```bash
# Server must be running on :3000
npm run demo
```

This executes `scripts/demo-walkthrough.js`:

| Step | Action | What to watch for |
|------|--------|-------------------|
| 1 | Reset all data | Clean slate |
| 2 | Create 3 tasks via chat | Three `created` side effects |
| 3 | Mark a task in progress | `updated` side effect, status changes |
| 4 | Complete a task | Status → `done` |
| 5 | **Attach two notes** | First `showTaskDetails` → 1 note. Second → **2 notes** (proves append) |
| 6 | Change priority | `updated` side effect |
| 7 | Duplicate message (idempotency) | Same response, no new side effects applied |
| 8 | Conversational query | Text-only response, no tool calls |
| 9 | Delete a task | `deleted` side effect |
| 10 | Final reset | Back to empty |

## 4. Test Suites

```bash
npm run test:idempotency    # Verifies duplicate messages don't create duplicates
npm run test:edge-cases     # Validates error handling (empty input, bad JSON, 404s)
npm run test:all            # Runs both
```
