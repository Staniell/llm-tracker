// Test idempotency: same message twice should not create duplicate tasks
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const green = (s) => console.log(`\x1b[32m${s}\x1b[0m`);
const red = (s) => console.log(`\x1b[31m${s}\x1b[0m`);
const bold = (s) => console.log(`\x1b[1m${s}\x1b[0m`);

let pass = 0;
let fail = 0;

function assertEq(desc, expected, actual) {
  if (expected === actual) {
    green(`  PASS: ${desc}`);
    pass++;
  } else {
    red(`  FAIL: ${desc} (expected=${expected}, actual=${actual})`);
    fail++;
  }
}

async function chat(message) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Chat failed (${res.status}): ${body}`);
  }
  return res.json();
}

async function getTaskCount() {
  const res = await fetch(`${BASE_URL}/api/tasks`);
  const data = await res.json();
  return data.tasks.length;
}

async function main() {
  bold("=== Idempotency Test ===");
  console.log();

  // Step 1: Reset
  bold("1. Resetting all data...");
  await fetch(`${BASE_URL}/admin/reset`, { method: "POST" });
  console.log("   Done.");
  console.log();

  // Step 2: Send a message to create a task
  bold("2. Sending first message: 'Create a task to buy groceries'");
  const resp1 = await chat("Create a task to buy groceries");
  console.log(`   Response: ${JSON.stringify(resp1).slice(0, 200)}`);
  console.log();

  // Step 3: Count tasks
  bold("3. Counting tasks after first message...");
  const count1 = await getTaskCount();
  assertEq("Task count after first message", 1, count1);
  console.log();

  // Step 4: Send the SAME message again
  bold("4. Sending duplicate message: 'Create a task to buy groceries'");
  const resp2 = await chat("Create a task to buy groceries");
  console.log(`   Response: ${JSON.stringify(resp2).slice(0, 200)}`);
  console.log();

  // Step 5: Count tasks again — should still be 1
  bold("5. Counting tasks after duplicate message...");
  const count2 = await getTaskCount();
  assertEq("Task count after duplicate message (idempotent)", 1, count2);
  console.log();

  // Step 6: Verify responses are identical
  bold("6. Checking response consistency...");
  assertEq("Both responses have same message", resp1.message.content, resp2.message.content);
  console.log();

  // Step 7: Test with whitespace variation (should normalize to same hash)
  bold("7. Sending whitespace variant: '  Create a task to buy groceries  '");
  await chat("  Create a task to buy groceries  ");
  const count3 = await getTaskCount();
  assertEq("Task count after whitespace variant (normalized)", 1, count3);
  console.log();

  // Summary
  bold("=== Results ===");
  green(`Passed: ${pass}`);
  if (fail > 0) {
    red(`Failed: ${fail}`);
    process.exit(1);
  } else {
    green("All idempotency tests passed!");
  }
}

main().catch((err) => {
  red(`Error: ${err.message}`);
  process.exit(1);
});
