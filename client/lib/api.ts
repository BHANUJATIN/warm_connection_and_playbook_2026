export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export async function createJob(domain: string) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospect_domain: domain })
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error("Failed to create job");
  }

  return res.json();
}

export async function getJob(jobId: string) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    cache: "no-store"
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error("Failed to fetch job");
  }

  return res.json();
}
