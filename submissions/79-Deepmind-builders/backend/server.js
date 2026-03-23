import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { triageRouter } from "./routes/triage.js";
import { emailsRouter } from "./routes/emails.js";
import { testConnection } from "./db/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/emails", emailsRouter);
app.use("/api/triage", triageRouter);

app.get("/health", async (_, res) => {
  let dbStatus = "disconnected";
  try {
    const [rows] = await (await import("./db/database.js")).default.query("SELECT 1");
    dbStatus = "connected";
  } catch {}
  res.json({ status: "ok", database: dbStatus });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testConnection();
});
