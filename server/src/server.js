// server.js
import dotenv from "dotenv";
dotenv.config(); // MUST be first
import cors from "cors";
import express from "express";

// force DB init AFTER env is loaded
import "./db/index.js";
import playbookWebhook from "./routes/playbookWebhook.js";
import clayWebhook from "./routes/clayWebhook.js";
import jobsRouter from "./routes/jobs.js";
import resultRouter from "./routes/result.js";
import testPlaybook from './routes/testPlaybook.js'



const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use("/webhooks", clayWebhook);
app.use("/jobs", jobsRouter);
app.use("/result", resultRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/test/playbook", testPlaybook);
app.use("/webhooks/playbook", playbookWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
