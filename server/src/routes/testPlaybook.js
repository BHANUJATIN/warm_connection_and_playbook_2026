// src/routes/testPlaybook.js
import express from "express";
import { triggerPlaybookAsync } from "../../services/playbookService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { prospect_domain } = req.body;

    if (!prospect_domain) {
        return res.status(400).json({ error: "prospect_domain is required" });
    }

    // fire-and-forget
    triggerPlaybookAsync(prospect_domain).catch(err => {
        console.error("Playbook trigger failed:", err);
    });

    // immediate response
    res.json({
        ok: true,
        message: "Playbook triggered (async)",
        prospect_domain
    });
});

export default router;
