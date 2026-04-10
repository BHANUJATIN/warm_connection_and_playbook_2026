import express from "express";
import { hasWarmConnections, getWarmConnections } from "../db/warmRepo.js";
import { createJob, getLatestJobByDomain, tryCompleteJob, completeJobWithMerge } from "../db/jobsRepo.js";
import { triggerClayFlow } from "../../services/clayService.js";

const router = express.Router();

const API_KEY = "wc-api-key-2026-xK9mP3qL";
const ONE_HOUR_MS = 60 * 60 * 1000;

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function cleanAndValidateDomain(raw) {
  if (!raw || typeof raw !== "string") return null;
  let domain = raw.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/^www\./, "");
  domain = domain.replace(/\/.*$/, "");
  domain = domain.replace(/:\d+$/, "");
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
  if (!domainRegex.test(domain)) return null;
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) return null;
  return domain;
}

async function startNewJob(domain, res) {
  const jobId = await createJob({ prospect_domain: domain, warmReady: false });
  if (!jobId) return res.status(500).json({ error: "Failed to create job" });

  triggerClayFlow(domain).catch((err) => {
    console.error("Clay trigger failed:", err);
  });

  return res.json({ status: "searching", message: "We're finding warm connections. Check back in a few minutes." });
}

/**
 * POST /api/warm-connections
 * Body: { "domain": "nvidia.com" }
 *
 * - If data already in DB → returns immediately with warm_connections
 * - If job is running and < 1hr old → returns { status: "searching" }
 * - If job is stale (≥ 1hr, still running/errored) → creates a new job
 * - If completed with no connections → returns { status: "no_connections_found" }
 * - No job exists → creates a job, returns { status: "searching" }
 */
router.post("/warm-connections", requireApiKey, async (req, res) => {
  const { domain } = req.body;

  const cleanDomain = cleanAndValidateDomain(domain);
  if (!cleanDomain) {
    return res.status(400).json({ error: "Provide a valid domain e.g. 'nvidia.com'" });
  }

  try {
    // 1. Warm connections already in DB → return immediately
    const warmReady = await hasWarmConnections(cleanDomain);
    if (warmReady) {
      const connections = await getWarmConnections(cleanDomain);
      return res.json({ status: "completed", warm_connections: connections });
    }

    // 2. Check most recent job for this domain
    const job = await getLatestJobByDomain(cleanDomain);

    if (job) {
      const ageMs = Date.now() - new Date(job.created_at).getTime();
      const isStale = ageMs >= ONE_HOUR_MS;

      // Job completed → try to complete it if still marked running, or read result
      if (job.status === "completed") {
        const connections = job.merged_result?.warm_connections ?? [];
        if (connections.length === 0) {
          return res.json({ status: "no_connections_found", message: "No warm connections were found for this domain." });
        }
        return res.json({ status: "completed", warm_connections: connections });
      }

      // Job is running — try to auto-complete it first
      if (job.status === "running") {
        const eligible = await tryCompleteJob(job.id);
        if (eligible) {
          const merged = await completeJobWithMerge(eligible);
          const connections = merged?.warm_connections ?? [];
          if (connections.length === 0) {
            return res.json({ status: "no_connections_found", message: "No warm connections were found for this domain." });
          }
          return res.json({ status: "completed", warm_connections: connections });
        }

        // Still not done — if stale, restart; otherwise tell caller to wait
        if (isStale) return startNewJob(cleanDomain, res);
        return res.json({ status: "searching", message: "We're finding warm connections. Check back in a few minutes." });
      }

      // Job errored/unknown status — restart if stale
      if (isStale) return startNewJob(cleanDomain, res);
      return res.json({ status: "searching", message: "We're finding warm connections. Check back in a few minutes." });
    }

    // 3. No job exists — start one
    return startNewJob(cleanDomain, res);

  } catch (err) {
    console.error("API warm-connections error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
