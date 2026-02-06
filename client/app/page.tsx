"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";

export default function HomePage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    setError(null);

    try {
      const res = await createJob(domain);

      // CASE 1: data already exists, no job created
      if (res.status === "completed") {
        router.push(`/result?domain=${encodeURIComponent(domain)}`);
        return;
      }

      // CASE 2: job created, poll
      if (!res.job_id) {
        throw new Error("job_id missing from backend response");
      }

      router.push(`/job/${res.job_id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to start job");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter company domain (e.g. nvidia.com)"
            className="flex-1 border rounded px-4 py-3 text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded text-lg disabled:opacity-50"
          >
            {loading ? "Starting…" : "Generate"}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </main>
  );
}
