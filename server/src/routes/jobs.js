import express from "express";
import {
  getJob,
  tryCompleteJob,
  createJob,
  completeJobWithMerge,
  markPlaybookReady
} from "../db/jobsRepo.js";
import { validate as uuidValidate } from "uuid";

import { triggerClayFlow } from "../../services/clayService.js";


import { hasWarmConnections } from "../db/warmRepo.js";
import { hasPlaybook, getPlaybook, upsertPlaybook } from "../db/playbookRepo.js";
import { triggerPlaybookAsync } from "../../services/playbookService.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!id || !uuidValidate(id)) {
    return res.status(400).json({ error: "Invalid or missing job id" });
  }

  const job = await getJob(id);
    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }

    const eligibleJob = await tryCompleteJob(job.id);
    if (eligibleJob) {
        const merged = await completeJobWithMerge(eligibleJob);
        return res.json({
            status: "completed",
            result: merged
        });
    }

    res.json({
        job_id: job.id,
        status: job.status,
        stage: job.stage
    });
});


router.post("/", async (req, res) => {
  const { prospect_domain } = req.body;
  if (!prospect_domain) {
    return res.status(400).json({ error: "prospect_domain is required" });
  }

  // 1️⃣ Authoritative DB checks
  const warmReady = await hasWarmConnections(prospect_domain);
  const playbookReady = await hasPlaybook(prospect_domain);

  // 2️⃣ Short-circuit if everything exists
  if (warmReady && playbookReady) {
    const playbook = await getPlaybook(prospect_domain);
    return res.json({
      status: "completed",
      result: {
        warm_connections: "already exists",
        sales_playbook: playbook.data
      }
    });
  }

  // 3️⃣ Create job ONCE
  let jobId;
  try {
    jobId = await createJob({
      prospect_domain,
      warmReady,
      playbookReady
    });

    if (!jobId) {
      return res.status(500).json({ error: "Failed to create job - no job ID returned" });
    }
  } catch (err) {
    console.error("Job creation failed:", err);
    return res.status(500).json({ error: "Failed to create job" });
  }

  // 4️⃣ Trigger ONLY missing processors
  if (!warmReady) {
    triggerClayFlow(prospect_domain).catch(console.error);
  }

  if (!playbookReady) {
    // 🔒 GUARDED: only runs when DB says missing
    triggerPlaybookAsync(prospect_domain);
  }

  // 5️⃣ Respond immediately
  res.json({
    job_id: jobId,
    status: "running"
  });
});




export default router;
