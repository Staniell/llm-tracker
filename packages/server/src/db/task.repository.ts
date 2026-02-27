import { getDb } from "./connection.js";
import { mapTaskRow } from "./mappers.js";
import type { Task, TaskStatus, TaskPriority } from "@llm-tracker/shared";

function stmts() {
  const db = getDb();
  return {
    getAll: db.prepare("SELECT * FROM tasks ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM tasks WHERE id = ?"),
    create: db.prepare(
      "INSERT INTO tasks (title, description, status, priority) VALUES (@title, @description, @status, @priority)"
    ),
    remove: db.prepare("DELETE FROM tasks WHERE id = ?"),
    deleteAll: db.prepare("DELETE FROM tasks"),
  };
}

export const taskRepo = {
  getAll(): Task[] {
    const rows = stmts().getAll.all();
    return rows.map(mapTaskRow);
  },

  getById(id: number): Task | undefined {
    const row = stmts().getById.get(id);
    return row ? mapTaskRow(row) : undefined;
  },

  create(data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
  }): Task {
    const s = stmts();
    const result = s.create.run({
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? "todo",
      priority: data.priority ?? "medium",
    });
    return this.getById(Number(result.lastInsertRowid))!;
  },

  update(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
    }>
  ): Task | undefined {
    const fields = Object.keys(data).filter(
      (k) => data[k as keyof typeof data] !== undefined
    );
    if (fields.length === 0) return this.getById(id);

    const setClauses = fields.map((f) => `${f} = @${f}`).join(", ");
    const sql = `UPDATE tasks SET ${setClauses} WHERE id = @id`;
    const db = getDb();
    const stmt = db.prepare(sql);
    stmt.run({ ...data, id });
    return this.getById(id);
  },

  remove(id: number): boolean {
    const result = stmts().remove.run(id);
    return result.changes > 0;
  },

  deleteAll(): void {
    stmts().deleteAll.run();
  },
};
