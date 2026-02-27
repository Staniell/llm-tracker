// Full feature demo walkthrough
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const green = (s) => console.log(`\x1b[32m${s}\x1b[0m`);
const red = (s) => console.log(`\x1b[31m${s}\x1b[0m`);
const cyan = (s) => console.log(`\x1b[36m${s}\x1b[0m`);
const bold = (s) => console.log(`\x1b[1m${s}\x1b[0m`);
const dim = (s) => console.log(`\x1b[2m${s}\x1b[0m`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function chat(msg) {
  cyan(`You: ${msg}`);
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg }),
  });
  if (!res.ok) {
    const body = await res.text();
    red(`  Error (${res.status}): ${body}`);
    console.log();
    return;
  }
  const data = await res.json();
  green(`Assistant: ${data.message.content}`);
  const effects = data.sideEffects;
  if (effects.length) {
    dim(`  Side effects: ${effects.map((s) => `${s.type}: ${s.task.title} [${s.task.status}]`).join(", ")}`);
  } else {
    dim("  Side effects: (no side effects)");
  }
  console.log();
  await sleep(1000);
}

async function showTasks() {
  bold("--- Current Tasks ---");
  const res = await fetch(`${BASE_URL}/api/tasks`);
  const data = await res.json();
  const tasks = data.tasks;
  if (tasks.length === 0) {
    console.log("  (none)");
  } else {
    const icons = { todo: "\u25CB", in_progress: "\u25D1", done: "\u25CF" };
    for (const t of tasks) {
      const status = icons[t.status] || "?";
      console.log(`  ${status} #${t.id} ${t.title} [${t.status}, ${t.priority}]`);
    }
  }
  console.log();
}

async function main() {
  bold("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557");
  bold("\u2551   LLM Task Tracker \u2014 Demo           \u2551");
  bold("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
  console.log();

  // Step 1: Reset
  bold("Step 1: Reset everything");
  await fetch(`${BASE_URL}/admin/reset`, { method: "POST" });
  green("  Reset complete.");
  console.log();

  // Step 2: Create multiple tasks
  bold("Step 2: Create tasks via chat");
  await chat("Create three tasks: buy groceries, clean the house, and write a report");
  await showTasks();

  // Step 3: Update a task
  bold("Step 3: Mark a task as in progress");
  await chat("I'm starting to work on buying groceries");
  await showTasks();

  // Step 4: Complete a task
  bold("Step 4: Complete a task");
  await chat("I finished buying groceries");
  await showTasks();

  // Step 5: Add details
  bold("Step 5: Add details to a task");
  await chat("Add a note to the report task: it's due by Friday and should cover Q4 metrics");
  await showTasks();

  // Step 6: Change priority
  bold("Step 6: Change priority");
  await chat("Make cleaning the house high priority");
  await showTasks();

  // Step 7: Duplicate message (idempotency)
  bold("Step 7: Test idempotency \u2014 send same message again");
  await chat("Make cleaning the house high priority");
  await showTasks();

  // Step 8: Ask about tasks
  bold("Step 8: Ask about current tasks");
  await chat("What tasks do I have left to do?");

  // Step 9: Delete a task
  bold("Step 9: Delete a task");
  await chat("Delete the report task");
  await showTasks();

  // Step 10: Final reset
  bold("Step 10: Reset");
  await fetch(`${BASE_URL}/admin/reset`, { method: "POST" });
  green("  Reset complete.");
  await showTasks();

  bold("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557");
  bold("\u2551   Demo Complete!                     \u2551");
  bold("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
}

main().catch((err) => {
  console.error(`\x1b[31mError: ${err.message}\x1b[0m`);
  process.exit(1);
});
