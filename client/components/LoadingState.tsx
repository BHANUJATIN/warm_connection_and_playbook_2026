"use client";

import { useEffect, useState } from "react";

type LoadingStateProps = {
  stage?: string;
  domain?: string;
};

const STEPS = [
  { key: "checking", label: "Checking database", detail: "Looking up existing warm connections..." },
  { key: "clay_collecting", label: "Finding connections", detail: "Searching for mutual connections via Clay. This may take a few minutes..." },
  { key: "merging", label: "Compiling results", detail: "Finalizing your warm connections..." },
];

function getStepIndex(stage?: string): number {
  if (!stage) return 0;
  const idx = STEPS.findIndex((s) => s.key === stage);
  return idx >= 0 ? idx : 0;
}

export default function LoadingState({ stage, domain }: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);
  const currentIdx = getStepIndex(stage);
  const current = STEPS[currentIdx];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0
    ? `${minutes}m ${seconds.toString().padStart(2, "0")}s`
    : `${seconds}s`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center max-w-md px-6">
        {/* Animated spinner */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-[3px] border-slate-100" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-transparent border-t-slate-900 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">E</span>
              </div>
            </div>
          </div>
        </div>

        {/* Domain badge */}
        {domain && (
          <div className="inline-block bg-slate-100 text-slate-600 text-sm font-mono px-3 py-1.5 rounded-lg mb-4">
            {domain}
          </div>
        )}

        {/* Current step info */}
        <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
          {current.label}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {current.detail}
        </p>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((step, idx) => (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  idx < currentIdx
                    ? "bg-emerald-500"
                    : idx === currentIdx
                    ? "bg-slate-900 ring-4 ring-slate-900/10"
                    : "bg-slate-200"
                }`}
              />
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 transition-all duration-500 ${
                    idx < currentIdx ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Elapsed time */}
        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Elapsed: {timeStr}
        </div>
      </div>
    </main>
  );
}
