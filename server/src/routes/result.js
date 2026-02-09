import express from "express";
// PLAYBOOK DISABLED
// import { getPlaybook } from "../db/playbookRepo.js";
import { pool } from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "domain query parameter is required" });
  }

  try {
    // Fetch warm connections
    const { rows: warmRows } = await pool.query(
      `
      SELECT *
      FROM warm_connections
      WHERE prospect_domain = $1
      ORDER BY created_at DESC
      `,
      [domain]
    );

    // PLAYBOOK DISABLED
    // const playbookRow = await getPlaybook(domain);

    // Return result (warm connections only)
    res.json({
      status: "completed",
      domain,
      result: {
        warm_connections: warmRows,
        // PLAYBOOK DISABLED
        // sales_playbook: playbookRow?.data || null
      }
    });
  } catch (err) {
    console.error("Failed to fetch result:", err);
    res.status(500).json({ error: "Failed to fetch result" });
  }
});

export default router;
