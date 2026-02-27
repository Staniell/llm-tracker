import { getDb } from "./connection.js";
import { mapChatMessageRow } from "./mappers.js";
import type { ChatMessage, ChatRole } from "@llm-tracker/shared";

function stmts() {
  const db = getDb();
  return {
    getRecent: db.prepare(
      "SELECT * FROM chat_messages ORDER BY id DESC LIMIT ?"
    ),
    save: db.prepare(
      "INSERT INTO chat_messages (role, content) VALUES (@role, @content)"
    ),
    getById: db.prepare("SELECT * FROM chat_messages WHERE id = ?"),
    deleteAll: db.prepare("DELETE FROM chat_messages"),
  };
}

export const chatRepo = {
  getRecent(limit: number = 20): ChatMessage[] {
    const rows = stmts().getRecent.all(limit);
    return rows.map(mapChatMessageRow).reverse();
  },

  save(role: ChatRole, content: string): ChatMessage {
    const s = stmts();
    const result = s.save.run({ role, content });
    const row = s.getById.get(Number(result.lastInsertRowid));
    return mapChatMessageRow(row);
  },

  deleteAll(): void {
    stmts().deleteAll.run();
  },
};
