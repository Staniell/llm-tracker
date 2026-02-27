import { getDb } from "./connection.js";

function stmts() {
  const db = getDb();
  return {
    findByHash: db.prepare("SELECT * FROM message_hashes WHERE hash = ?"),
    store: db.prepare(
      "INSERT INTO message_hashes (hash, response_json) VALUES (@hash, @response_json)"
    ),
    deleteAll: db.prepare("DELETE FROM message_hashes"),
  };
}

export const idempotencyRepo = {
  findByHash(hash: string): { hash: string; response_json: string; created_at: string } | undefined {
    return stmts().findByHash.get(hash) as
      | { hash: string; response_json: string; created_at: string }
      | undefined;
  },

  store(hash: string, responseJson: string): void {
    stmts().store.run({ hash, response_json: responseJson });
  },

  deleteAll(): void {
    stmts().deleteAll.run();
  },
};
