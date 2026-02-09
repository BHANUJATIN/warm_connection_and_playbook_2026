"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getJob } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import ResultView from "@/components/ResultView";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ErrorCard({ title, message, action = "Try Again" }: { title: string; message: string; action?: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center max-w-md px-6">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {action}
        </a>
      </div>
    </main>
  );
}

function JobContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params?.id as string;
  const domain = searchParams.get("domain") || undefined;

  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !UUID_REGEX.test(jobId)) {
      setError("Invalid job ID format");
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const data = await getJob(jobId);
        if (!cancelled) {
          setJob(data);
          setError(null);
        }

        if (data?.status !== "completed") {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch job:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch job status. Please try again.");
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (!jobId) {
    return <ErrorCard title="Invalid Request" message="No job ID was provided." />;
  }

  if (error) {
    return <ErrorCard title="Something went wrong" message={error} />;
  }

  if (!job || job.status !== "completed") {
    return <LoadingState stage={job?.stage} domain={domain} />;
  }

  const result = job.result || job.merged_result;
  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center max-w-md px-6">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No results available</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            The job completed but no connection data was returned.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Try Another Domain
          </a>
        </div>
      </main>
    );
  }

  return <ResultView result={result} domain={domain} />;
}

export default function JobPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <JobContent />
    </Suspense>
  );
}
