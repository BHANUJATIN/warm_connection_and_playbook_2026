import fetch from "node-fetch";

const CLAY_INPUT_WEBHOOK_URL
    = process.env.CLAY_INPUT_WEBHOOK_URL
    ||
    'https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b96dd247-8f52-4db8-9b48-50a34a58fdc2';

export async function triggerClayFlow(prospectDomain) {
  console.log("[Clay Trigger] domain =", prospectDomain);

  const payload = {
    company_domain: prospectDomain
  };

  await fetch(CLAY_INPUT_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

