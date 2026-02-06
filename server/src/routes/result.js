import express from "express";
import { getPlaybook } from "../db/playbookRepo.js";
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
      `,
      [domain]
    );

    // Fetch playbook
    const playbookRow = await getPlaybook(domain);

    // Return merged result
    res.json({
      status: "completed",
      domain,
      result: {
        warm_connections: warmRows,
        sales_playbook: playbookRow?.data || null
      }
    });
  } catch (err) {
    console.error("Failed to fetch result:", err);
    res.status(500).json({ error: "Failed to fetch result" });
  }
});

export default router;
