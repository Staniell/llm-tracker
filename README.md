# LLM-Powered Chat Task Tracker

A chat-based task tracker where natural language messages are interpreted by **Gemini 2.0 Flash** to create, update, and complete tasks. Built with a two-panel React UI (chat + task sidebar) and an Express backend with SQLite persistence.

## Features

- **Natural language task management** — "Create a task to buy groceries", "Mark buy groceries as done"
- **Multi-task creation** — "Create three tasks: X, Y, and Z"
- **Appendable task details** — "Add a note to the report: it covers Q4 metrics" appends notes without overwriting
- **Direct status toggling** — Click the check circle on any task card or use action buttons in the detail view
- **Idempotent** — Sending the same message twice won't create duplicates
- **Persistent** — All data stored in SQLite with WAL mode
- **Real-time feedback** — Side effects (created/updated/deleted/detail_added) returned with each chat response

## Architecture

```
[React Client] --fetch--> [Express Routes] --> [Service Layer] --> [LLM Layer (Gemini)]
                                                      |
                                                      v
                                               [DB Layer (SQLite)]
```

**Data flow for `POST /api/chat`:**
1. Validate input (non-empty string, max 2000 chars)
2. Hash message → check idempotency cache → if hit, return cached response
3. Load all tasks + recent 20 chat messages for LLM context
4. Call Gemini 2.0 Flash with function calling tools (`create_task`, `update_task`, `delete_task`, `add_detail`)
5. Parse function calls into typed intents
6. Execute intents against DB in a transaction (re-check hash for race safety)
7. Cache response and return to client with side effects

## Tech Stack

| Layer | Technology |
|-------|------------|
| LLM | Gemini 2.0 Flash via `@google/genai` SDK |
| Backend | Express.js + TypeScript |
| Database | better-sqlite3 (sync, WAL mode) |
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| Monorepo | npm workspaces |

## Setup

### Prerequisites

- Node.js 18+
- npm 7+ (for workspaces)
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

### Installation

```bash
git clone <repo-url>
cd llm-tracker
npm install
```

### Configuration

Create `packages/server/.env`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3000
DB_PATH=data/tracker.db
NODE_ENV=development
```

You can get a free API key at https://aistudio.google.com/apikey

## Running

### Development (two terminals)

```bash
# Terminal 1: Start the server
npm run dev:server

# Terminal 2: Start the client
npm run dev:client
```

Then open http://localhost:5173 (Vite dev server proxies API calls to Express on port 3000).

### Production

```bash
npm run build:shared
npm run build:server
npm run build:client
```

## API Endpoints

| Method | Path | Request | Response |
|--------|------|---------|----------|
| `POST` | `/api/chat` | `{ message: string }` | `{ message: ChatMessage, sideEffects: TaskSideEffect[] }` |
| `GET` | `/api/tasks` | — | `{ tasks: Task[] }` |
| `GET` | `/api/tasks/:id` | — | `{ task: Task, details: TaskDetail[] }` |
| `PATCH` | `/api/tasks/:id/status` | `{ status: "todo" \| "in_progress" \| "done" }` | `{ task: Task }` |
| `POST` | `/admin/reset` | — | `{ message: string }` |

## Idempotency

The system ensures that sending the same message twice doesn't create duplicate tasks:

1. **Normalization**: Messages are trimmed, whitespace-collapsed, and lowercased before hashing
2. **SHA-256 hash**: Normalized message → deterministic hash
3. **Two-phase check**:
   - **Phase A** (before LLM call): Check hash in DB → if found, return cached response immediately (fast path)
   - **Phase B**: Call Gemini (async, outside transaction)
   - **Phase C** (inside SQLite write transaction): Re-check hash → if found (race condition), return cached; otherwise execute intents and cache

SQLite's write lock serializes Phase C, so concurrent duplicate requests are safely handled.

## Test Scripts

Requires the server to be running on port 3000 (or set `BASE_URL`).

```bash
# Test idempotency
npm run test:idempotency

# Test edge cases (validation, errors)
npm run test:edge-cases

# Full demo walkthrough
npm run demo

# Run all tests
npm run test:all
```

## Project Structure

```
llm-tracker/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   │   └── src/
│   │       ├── task.ts        # Task, TaskDetail, TaskStatus, TaskPriority
│   │       ├── chat.ts        # ChatMessage, ChatRole
│   │       └── api.ts         # Request/Response types
│   │
│   ├── server/          # Express backend
│   │   └── src/
│   │       ├── db/            # SQLite schema, repos (task, detail, chat, idempotency), connection
│   │       ├── llm/           # Gemini client, tools, interpreter
│   │       ├── routes/        # Express route handlers
│   │       ├── services/      # Business logic orchestration
│   │       ├── middleware/     # Error handler, logger, async wrapper
│   │       └── errors/        # Custom error classes
│   │
│   └── client/          # React frontend
│       └── src/
│           ├── api/           # Typed fetch wrappers
│           └── components/    # React components
│
└── scripts/             # Test & demo scripts
```

## LLM Integration

### System Prompt

The system prompt is built dynamically on every request. It injects **all current tasks** formatted as:

```
#1: "Buy groceries" [status=todo, priority=medium] — Weekly shopping (2 notes)
```

This gives the model full awareness of existing tasks so it can resolve references like "mark the groceries one as done" to the correct `task_id`. Detail counts (e.g., "2 notes") are shown per task to inform the model without injecting full note content, keeping the prompt compact.

Key behavioral rules in the prompt:
- Call `create_task` when the user wants to add something; `update_task` with `status="done"` to complete
- Call `add_detail` when the user wants to append a note, comment, or detail to a task — do NOT use `update_task` for this
- Match tasks by name to their ID from the injected list
- Respond with **text only** (no tool calls) for conversational queries like "what tasks do I have?"
- Ask for clarification when ambiguous (e.g., "mark it as done" with multiple tasks)

### Tool / Function Schemas

Four function declarations are registered via Gemini's `functionDeclarations` config:

| Tool | Required Params | Optional Params | When Used |
|------|----------------|-----------------|-----------|
| `create_task` | `title: string` | `description: string`, `priority: "low" \| "medium" \| "high"` | User says "add", "create", "make a new task" |
| `update_task` | `task_id: number` | `title`, `description`, `status: "todo" \| "in_progress" \| "done"`, `priority` | "Mark as done", "start working on", rename, reprioritize |
| `delete_task` | `task_id: number` | — | User explicitly says "delete" or "remove" |
| `add_detail` | `task_id: number`, `content: string` | — | User says "add a note to", "attach detail", "note that..." |

Gemini can return **multiple parallel function calls** in a single response (e.g., "create three tasks: X, Y, Z" produces three `create_task` calls).

### Intent Interpretation

The raw function call responses are parsed into typed **intent objects** (`CreateTaskIntent`, `UpdateTaskIntent`, `DeleteTaskIntent`, `AddDetailIntent`) before any database work happens. This separates LLM output parsing from business logic — if you swapped Gemini for another provider, only the interpreter module would change.

If the model returns function calls but no text, a summary is auto-generated (e.g., `Created task "Buy groceries". Created task "Clean house".`).

## Key Tradeoffs

- **`FunctionCallingMode.AUTO`** — Allows Gemini to return text-only responses for queries like "what tasks do I have?"
- **One tool per action** — Gemini returns parallel function calls natively; simpler schemas reduce hallucinations
- **Temperature 0.2** — Low temperature for deterministic tool selection
- **Synchronous SQLite** — `better-sqlite3` transactions are truly atomic (no event loop yielding)
- **Optimistic UI updates** — Task status toggles update instantly in the UI and revert on error; chat side effects also update task state without extra GET calls
- **Direct status endpoint** — `PATCH /api/tasks/:id/status` bypasses the LLM for deterministic UI actions (clicking a checkbox shouldn't cost an API call)
- **Last 20 messages for context** — Enough for pronoun resolution without prompt explosion
- **No authentication** — Scoped as a single-user local tool; adding auth would be the first step for multi-user deployment

## What I'd Improve Next

- **Streaming responses** — Currently waits for the full LLM response before replying; streaming via SSE would improve perceived latency
- **Idempotency cache TTL** — The `message_hashes` table grows unbounded; adding a TTL or LRU eviction would prevent long-term bloat
- **WebSocket/SSE for real-time sync** — If multiple tabs are open, task state can drift; push-based updates would fix this
- **Pagination** — `GET /api/tasks` returns all tasks; pagination or cursor-based fetching would be needed at scale
- **Richer LLM context** — The system prompt injects all tasks, which won't scale past a few hundred; a retrieval or summarization layer would help
- **Test coverage** — Current tests are integration scripts that require a running server; adding unit tests (especially for the interpreter and idempotency logic) would improve confidence
