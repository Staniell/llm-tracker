// Test edge cases: validation, error handling, boundary conditions
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const green = (s) => console.log(`\x1b[32m${s}\x1b[0m`);
const red = (s) => console.log(`\x1b[31m${s}\x1b[0m`);
const bold = (s) => console.log(`\x1b[1m${s}\x1b[0m`);

let pass = 0;
let fail = 0;

function assertStatus(desc, expected, actual) {
  if (expected === actual) {
    green(`  PASS: ${desc} (status=${actual})`);
    pass++;
  } else {
    red(`  FAIL: ${desc} (expected=${expected}, actual=${actual})`);
    fail++;
  }
}

async function postChat(body) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return res.status;
}

async function main() {
  bold("=== Edge Case Tests ===");
  console.log();

  // Reset first
  await fetch(`${BASE_URL}/admin/reset`, { method: "POST" });

  // Test 1: Empty message
  bold("1. Empty message should return 400");
  assertStatus("Empty message", 400, await postChat(JSON.stringify({ message: "" })));
  console.log();

  // Test 2: Whitespace-only message
  bold("2. Whitespace-only message should return 400");
  assertStatus("Whitespace-only message", 400, await postChat(JSON.stringify({ message: "   " })));
  console.log();

  // Test 3: Missing message field
  bold("3. Missing message field should return 400");
  assertStatus("Missing message field", 400, await postChat(JSON.stringify({ text: "hello" })));
  console.log();

  // Test 4: Non-string message
  bold("4. Non-string message should return 400");
  assertStatus("Non-string message", 400, await postChat(JSON.stringify({ message: 123 })));
  console.log();

  // Test 5: Oversized message (> 2000 chars)
  bold("5. Oversized message should return 400");
  assertStatus("Oversized message (2001 chars)", 400, await postChat(JSON.stringify({ message: "a".repeat(2001) })));
  console.log();

  // Test 6: Invalid JSON body
  bold("6. Invalid JSON body should return 400");
  assertStatus("Invalid JSON body", 400, await postChat("not json"));
  console.log();

  // Test 7: Nonexistent task ID
  bold("7. Nonexistent task ID should return 404");
  const taskRes = await fetch(`${BASE_URL}/api/tasks/99999`);
  assertStatus("Nonexistent task", 404, taskRes.status);
  console.log();

  // Test 8: GET /api/tasks returns empty array after reset
  bold("8. GET /api/tasks returns empty array after reset");
  const tasksRes = await fetch(`${BASE_URL}/api/tasks`);
  const tasksData = await tasksRes.json();
  const count = tasksData.tasks.length;
  if (count === 0) {
    green("  PASS: Empty tasks after reset (count=0)");
    pass++;
  } else {
    red(`  FAIL: Expected 0 tasks, got ${count}`);
    fail++;
  }
  console.log();

  // Test 9: Double reset should be fine (idempotent)
  bold("9. Double reset should succeed");
  const reset1 = await fetch(`${BASE_URL}/admin/reset`, { method: "POST" });
  const reset2 = await fetch(`${BASE_URL}/admin/reset`, { method: "POST" });
  assertStatus("First reset", 200, reset1.status);
  assertStatus("Second reset", 200, reset2.status);
  console.log();

  // Summary
  bold("=== Results ===");
  green(`Passed: ${pass}`);
  if (fail > 0) {
    red(`Failed: ${fail}`);
    process.exit(1);
  } else {
    green("All edge case tests passed!");
  }
}

main().catch((err) => {
  red(`Error: ${err.message}`);
  process.exit(1);
});
