import { getDb } from "./connection.js";

export function resetAll(): void {
  const db = getDb();
  const reset = db.transaction(() => {
    db.exec("DELETE FROM message_hashes");
    db.exec("DELETE FROM chat_messages");
    db.exec("DELETE FROM task_details");
    db.exec("DELETE FROM tasks");
    // Reset autoincrement counters
    db.exec("DELETE FROM sqlite_sequence");
  });
  reset();
}
