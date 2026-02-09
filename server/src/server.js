// server.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Resolve .env relative to this file (server/.env), not cwd
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Dynamic imports so they run AFTER dotenv has loaded env vars
// (ES module static imports are hoisted and run before any code)
const { default: cors } = await import("cors");
const { default: express } = await import("express");
await import("./db/index.js");
// PLAYBOOK DISABLED
// const { default: playbookWebhook } = await import("./routes/playbookWebhook.js");
const { default: clayWebhook } = await import("./routes/clayWebhook.js");
const { default: jobsRouter } = await import("./routes/jobs.js");
const { default: resultRouter } = await import("./routes/result.js");
// PLAYBOOK DISABLED
// const { default: testPlaybook } = await import('./routes/testPlaybook.js');

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

// PLAYBOOK DISABLED
// app.use("/test/playbook", testPlaybook);
// app.use("/webhooks/playbook", playbookWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
