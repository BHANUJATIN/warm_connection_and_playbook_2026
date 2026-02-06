const PLAYBOOK_API_URL = process.env.PLAYBOOK_API_URL || 'http://localhost:10000/workflows/playbook-ai---sales-intelligence-pipeline/runs'

// 'https://email-sequence-finder-2026.onrender.com/workflows/playbook-ai---sales-intelligence-pipeline/runs';
// http://localhost:8080/workflows/playbook-ai---sales-intelligence-pipeline/runs
// services/playbookService.js

export async function generatePlaybook(prospectDomain) {
  console.log("[Playbook Trigger] domain =", prospectDomain);

  const form = new URLSearchParams();
  form.append(
    "message",
    JSON.stringify({
      vendor_domain: "exa.ai",
      prospect_domain: prospectDomain
    })
  );
  form.append("stream", "false");

  const res = await fetch(PLAYBOOK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Playbook API failed ${res.status}: ${text}`);
  }

  return res.json();
}

export async function triggerPlaybookAsync(domain) {
  // Ensure repo functions are available and check DB before calling external API
  try {
    const { hasPlaybook, upsertPlaybook } = await import("../src/db/playbookRepo.js");
    const { markPlaybookReady } = await import("../src/db/jobsRepo.js");

    const exists = await hasPlaybook(domain);
    if (exists) {
      await markPlaybookReady(domain);
      return;
    }

    const data = await generatePlaybook(domain);
    await upsertPlaybook(domain, data);
    await markPlaybookReady(domain);
  } catch (err) {
    console.error("Playbook generation failed:", err);
  }
}


