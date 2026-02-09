// src/routes/clayWebhook.js

import express from "express";
import { upsertWarmConnection } from "../db/warmRepo.js";
import {
  touchClayEvent,
  getJobByDomain,
  tryCompleteJob,
  completeJobWithMerge
} from "../db/jobsRepo.js";

const router = express.Router();

router.post("/clay", async (req, res) => {
  try {
    const {
      company_domain,
      company_name,
      company_linkedin,
      data
    } = req.body;

    if (!company_domain || !data || !Array.isArray(data.connections)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const {
      name,
      ["first name"]: firstName,
      ["last name"]: lastName,
      Linkedin: prospectLinkedin,
      connections
    } = data;

    let savedCount = 0;
    for (const conn of connections) {
      try {
        await upsertWarmConnection({
          prospect_domain: company_domain,
          prospect_company_name: company_name,
          prospect_company_linkedin: company_linkedin,
          prospect_person_name: name,
          prospect_person_first_name: firstName,
          prospect_person_last_name: lastName,
          prospect_person_linkedin: prospectLinkedin,
          exa_person_linkedin: conn.connected_to,
          connection_type: conn.connection_type,
          summary: conn.summary || null,
          source: "clay"
        });
        savedCount++;
      } catch (connErr) {
        console.error("Failed to upsert connection:", connErr.message);
      }
    }
    console.log(`[Clay Webhook] Saved ${savedCount}/${connections.length} connections for ${company_domain}`);

    // 🔹 MARK CLAY ACTIVITY
    await touchClayEvent(company_domain);

    // 🔹 TRY TO ADVANCE JOB STATE
    const job = await getJobByDomain(company_domain);
    if (job) {
      const eligible = await tryCompleteJob(job.id);
      if (eligible) {
        await completeJobWithMerge(eligible);
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Clay webhook error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
