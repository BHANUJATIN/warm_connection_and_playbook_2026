// src/routes/playbookWebhook.js

import express from "express";
import { upsertPlaybook } from "../db/playbookRepo.js";
import {
  markPlaybookReady,
  tryCompleteJobByDomain
} from "../db/jobsRepo.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prospect_domain, data } = req.body;

    if (!prospect_domain || !data) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // 1️⃣ Persist playbook data
    await upsertPlaybook(prospect_domain, data);

    // 2️⃣ Update job state
    await markPlaybookReady(prospect_domain);

    // 3️⃣ Attempt completion (idempotent, safe)
    await tryCompleteJobByDomain(prospect_domain);

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Playbook webhook error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
