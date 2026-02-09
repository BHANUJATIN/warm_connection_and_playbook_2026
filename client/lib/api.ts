export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

/**
 * Clean and validate a domain string on the frontend.
 * Returns the cleaned domain or null if invalid.
 */
export function cleanDomain(raw: string): string | null {
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

  // Must have at least one dot and valid characters
  const domainRegex =
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
  if (!domainRegex.test(domain)) return null;

  // TLD must be at least 2 chars
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) return null;

  return domain;
}

export async function createJob(domain: string) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospect_domain: domain }),
  });

  if (res.status < 200 || res.status >= 300) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function getJob(jobId: string) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    cache: "no-store",
  });

  if (res.status < 200 || res.status >= 300) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return res.json();
}
