// jobsRepo.js

import { pool } from "./index.js";
import { CLAY_IDLE_TIMEOUT_MS } from "../config.js";
import { v4 as uuid } from "uuid";
import { hasPlaybook } from "./playbookRepo.js";
import { hasWarmConnections } from "./warmRepo.js";

/**
 * Mark clay activity + warm connections readiness
 */
export async function touchClayEvent(domain) {
  await pool.query(
    `
    UPDATE jobs
    SET
      warm_connections_ready = TRUE,
      last_clay_event_at = NOW(),
      stage = 'clay_collecting'
    WHERE prospect_domain = $1
      AND status = 'running'
    `,
    [domain]
  );
}

/**
 * Mark playbook readiness
 */
export async function markPlaybookReady(domain) {
  await pool.query(
    `
    UPDATE jobs
    SET
      playbook_ready = TRUE,
      stage = 'merging'
    WHERE prospect_domain = $1
      AND status = 'running'
    `,
    [domain]
  );
}

/**
 * Fetch job by id
 */
export async function getJob(jobId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM jobs
    WHERE id = $1
    `,
    [jobId]
  );
  return rows[0] || null;
}

/**
 * Fetch latest running job for domain
 */
export async function getJobByDomain(domain) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM jobs
    WHERE prospect_domain = $1
      AND status = 'running'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [domain]
  );
  return rows[0] || null;
}

/**
 * Check if job is eligible for completion
 */
export async function tryCompleteJob(jobId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM jobs
    WHERE id = $1
      AND status = 'running'
    `,
    [jobId]
  );

  const job = rows[0];
  if (!job) return null;

  // Reconcile authoritative sources: if playbook or warm connections
  // exist in their tables, update the job flags so completion can proceed.
  try {
    if (!job.playbook_ready) {
      const exists = await hasPlaybook(job.prospect_domain);
      if (exists) {
        await pool.query(
          `UPDATE jobs SET playbook_ready = TRUE WHERE id = $1`,
          [job.id]
        );
        job.playbook_ready = true;
      }
    }

    if (!job.warm_connections_ready) {
      const existsWarm = await hasWarmConnections(job.prospect_domain);
      if (existsWarm) {
        await pool.query(
          `UPDATE jobs SET warm_connections_ready = TRUE WHERE id = $1`,
          [job.id]
        );
        job.warm_connections_ready = true;
      }
    }
  } catch (e) {
    // If reconciliation fails, log and continue with existing job state
    console.error('Job reconciliation failed:', e);
  }

  // both data sources must be ready
  if (!job.warm_connections_ready || !job.playbook_ready) {
    return null;
  }

  // clay inactivity window
  if (!job.last_clay_event_at) {
    return null;
  }

  const now = Date.now();
  const lastEvent = new Date(job.last_clay_event_at).getTime();

  if (now - lastEvent < CLAY_IDLE_TIMEOUT_MS) {
    return null;
  }

  return job;
}

/**
 * Complete job and merge results
 */
export async function completeJobWithMerge(job) {
  const { rows: warmRows } = await pool.query(
    `
    SELECT *
    FROM warm_connections
    WHERE prospect_domain = $1
    `,
    [job.prospect_domain]
  );

  const { rows: playbookRows } = await pool.query(
    `
    SELECT data
    FROM email_playbooks
    WHERE prospect_domain = $1
    `,
    [job.prospect_domain]
  );

  const mergedResult = {
    warm_connections: warmRows,
    sales_playbook: playbookRows[0]?.data || null
  };

  await pool.query(
    `
    UPDATE jobs
    SET
      status = 'completed',
      stage = 'completed',
      merged_result = $2,
      completed_at = NOW()
    WHERE id = $1
    `,
    [job.id, mergedResult]
  );

  return mergedResult;
}

/**
 * Attempt completion by domain (safe to call from any webhook)
 */
export async function tryCompleteJobByDomain(domain) {
  const job = await getJobByDomain(domain);
  if (!job) return null;

  const eligible = await tryCompleteJob(job.id);
  if (!eligible) return null;

  return completeJobWithMerge(eligible);
}

/**
 * Create a new running job
 */
export async function createJob({
  prospect_domain,
  warmReady,
  playbookReady
}) {
  const id = uuid();

  const stage =
    warmReady && !playbookReady
      ? "playbook"
      : !warmReady && playbookReady
      ? "clay_collecting"
      : "checking";

  await pool.query(
    `
    INSERT INTO jobs (
      id,
      prospect_domain,
      status,
      stage,
      warm_connections_ready,
      playbook_ready
    )
    VALUES ($1, $2, 'running', $3, $4, $5)
    `,
    [id, prospect_domain, stage, warmReady, playbookReady]
  );

  return id;
}
