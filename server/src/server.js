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

// Default allowed origins
const defaultOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://warm-connection-and-playbook-2026.vercel.app",
  "https://email-sequence-finder-2026.onrender.com"
];

// Allow additional origins from environment variable (comma-separated)
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const allowedOrigins = [...defaultOrigins, ...envOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
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
