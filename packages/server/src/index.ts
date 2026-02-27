import { config } from "./config.js";
import { initDb } from "./db/connection.js";
import { createApp } from "./app.js";

initDb();
const app = createApp();
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
