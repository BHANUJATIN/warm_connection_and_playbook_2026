"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import ResultView from "@/components/ResultView";

// Simple UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function JobPage() {
  const params = useParams();
  const jobId = params?.id as string;

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
          setError("Failed to fetch job status");
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (!jobId) {
    return <div className="text-center py-8">Invalid job ID</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!job || job.status !== "completed") {
    return <LoadingState stage={job?.stage} />;
  }

  const result = job.merged_result;
  if (!result) {
    return <div className="text-center py-8 text-red-600">No results available</div>;
  }

  return <ResultView result={result} />;
}