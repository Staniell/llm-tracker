import { getDb } from "./connection.js";
import { mapTaskDetailRow } from "./mappers.js";
import type { TaskDetail } from "@llm-tracker/shared";

function stmts() {
  const db = getDb();
  return {
    getByTaskId: db.prepare(
      "SELECT * FROM task_details WHERE task_id = ? ORDER BY created_at ASC"
    ),
    create: db.prepare(
      "INSERT INTO task_details (task_id, content) VALUES (?, ?)"
    ),
    getById: db.prepare("SELECT * FROM task_details WHERE id = ?"),
    countByTask: db.prepare(
      "SELECT task_id, COUNT(*) as cnt FROM task_details GROUP BY task_id"
    ),
    deleteAll: db.prepare("DELETE FROM task_details"),
  };
}

export const detailRepo = {
  getByTaskId(taskId: number): TaskDetail[] {
    const rows = stmts().getByTaskId.all(taskId);
    return rows.map(mapTaskDetailRow);
  },

  create(taskId: number, content: string): TaskDetail {
    const s = stmts();
    const result = s.create.run(taskId, content);
    const row = s.getById.get(Number(result.lastInsertRowid));
    return mapTaskDetailRow(row);
  },

  getDetailCounts(): Map<number, number> {
    const rows = stmts().countByTask.all() as Array<{
      task_id: number;
      cnt: number;
    }>;
    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(row.task_id, row.cnt);
    }
    return map;
  },

  deleteAll(): void {
    stmts().deleteAll.run();
  },
};
