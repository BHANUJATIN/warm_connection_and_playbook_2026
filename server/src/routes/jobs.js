import express from "express";
import {
  getJob,
  tryCompleteJob,
  createJob,
  completeJobWithMerge,
  // PLAYBOOK DISABLED
  // markPlaybookReady
} from "../db/jobsRepo.js";
import { validate as uuidValidate } from "uuid";

import { triggerClayFlow } from "../../services/clayService.js";

import { hasWarmConnections, getWarmConnections } from "../db/warmRepo.js";
// PLAYBOOK DISABLED: keeping imports for future use
// import { hasPlaybook, getPlaybook, upsertPlaybook } from "../db/playbookRepo.js";
// import { triggerPlaybookAsync } from "../../services/playbookService.js";

const router = express.Router();

/**
 * Validate and clean a domain string.
 * Strips protocol, www, paths, and whitespace. Returns null if invalid.
 */
function cleanAndValidateDomain(raw) {
  if (!raw || typeof raw !== "string") return null;

  let domain = raw.trim().toLowerCase();

  // Remove protocol
  domain = domain.replace(/^https?:\/\//, "");
  // Remove www.
  domain = domain.replace(/^www\./, "");
  // Remove trailing path/slash
  domain = domain.replace(/\/.*$/, "");
  // Remove port
  domain = domain.replace(/:\d+$/, "");

  // Must have at least one dot and valid TLD characters
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
  if (!domainRegex.test(domain)) return null;

  // TLD must be at least 2 chars
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) return null;

  return domain;
}

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!id || !uuidValidate(id)) {
    return res.status(400).json({ error: "Invalid or missing job id" });
  }

  try {
    const job = await getJob(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // If already completed, return result
    if (job.status === "completed") {
      return res.json({
        job_id: job.id,
        status: "completed",
        result: job.merged_result
      });
    }

    const eligibleJob = await tryCompleteJob(job.id);
    if (eligibleJob) {
      const merged = await completeJobWithMerge(eligibleJob);
      return res.json({
        job_id: job.id,
        status: "completed",
        result: merged
      });
    }

    res.json({
      job_id: job.id,
      status: job.status,
      stage: job.stage
    });
  } catch (err) {
    console.error("Error polling job:", err);
    res.status(500).json({ error: "Failed to fetch job status" });
  }
});


router.post("/", async (req, res) => {
  const { prospect_domain } = req.body;

  // Validate and clean domain
  const cleanDomain = cleanAndValidateDomain(prospect_domain);
  if (!cleanDomain) {
    return res.status(400).json({
      error: "Invalid domain. Please enter a valid domain like 'nvidia.com'"
    });
  }

  try {
    // 1. Check if warm connections already exist in DB
    const warmReady = await hasWarmConnections(cleanDomain);

    // PLAYBOOK DISABLED
    // const playbookReady = await hasPlaybook(cleanDomain);

    // 2. Short-circuit if warm connections already exist
    if (warmReady) {
      const connections = await getWarmConnections(cleanDomain);
      return res.json({
        status: "completed",
        result: {
          warm_connections: connections
        }
      });
    }

    // 3. Create job
    const jobId = await createJob({
      prospect_domain: cleanDomain,
      warmReady: false,
    });

    if (!jobId) {
      return res.status(500).json({ error: "Failed to create job - no job ID returned" });
    }

    // 4. Trigger Clay flow to find warm connections
    triggerClayFlow(cleanDomain).catch((err) => {
      console.error("Clay trigger failed:", err);
    });

    // PLAYBOOK DISABLED
    // if (!playbookReady) {
    //   triggerPlaybookAsync(cleanDomain);
    // }

    // 5. Respond immediately - client will poll for results
    res.json({
      job_id: jobId,
      status: "running"
    });
  } catch (err) {
    console.error("Job creation failed:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
