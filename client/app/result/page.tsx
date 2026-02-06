"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import ResultView from "@/components/ResultView";
import LoadingState from "@/components/LoadingState";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain");
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain) {
      setError("No domain provided");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await fetch(`${API_BASE}/result?domain=${encodeURIComponent(domain)}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Backend error (${res.status}):`, errorText);
          throw new Error(`Failed to fetch result: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch result");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [domain]);

  if (!domain) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">No domain provided</div>
      </main>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  return <ResultView result={data.result} domain={domain} />;
}
