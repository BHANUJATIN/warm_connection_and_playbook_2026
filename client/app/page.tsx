"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob, cleanDomain } from "@/lib/api";

export default function HomePage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleaned = cleanDomain(domain);
    if (!cleaned) {
      setError("Please enter a valid domain (e.g. nvidia.com)");
      return;
    }

    setLoading(true);

    try {
      const res = await createJob(cleaned);

      if (res.status === "completed") {
        router.push(`/result?domain=${encodeURIComponent(cleaned)}`);
        return;
      }

      if (!res.job_id) {
        throw new Error("Unexpected response from server");
      }

      router.push(`/job/${res.job_id}?domain=${encodeURIComponent(cleaned)}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl px-6 relative z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
              <span className="text-white font-bold text-base">E</span>
            </div>
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              Exa Warm Connections
            </span>
          </div>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
            Discover warm introductions between Exa and any company.
            <br />
            <span className="text-slate-400 text-sm">Enter a company domain to find mutual connections.</span>
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <input
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                if (error) setError(null);
              }}
              placeholder="company.com"
              className="w-full border border-slate-200 rounded-xl pl-12 pr-5 py-4 text-base
                         bg-white shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                         placeholder:text-slate-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 text-slate-700"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full px-6 py-4 bg-slate-900 text-white rounded-xl text-base font-medium
                       hover:bg-slate-800 active:bg-slate-950 active:scale-[0.99]
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200 flex items-center justify-center gap-2
                       shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finding connections...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Find Warm Connections
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2.5 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </form>

        {/* Footer hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Results powered by Clay enrichment pipeline
          </p>
        </div>
      </div>
    </main>
  );
}
