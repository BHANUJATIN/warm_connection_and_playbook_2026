"use client";

import Spinner from "./Spinner";

type LoadingStateProps = {
  stage?: string;
};

const COPY: Record<string, string> = {
  checking: "Checking existing data…",
  clay_collecting: "Finding warm connections…",
  playbook: "Generating sales playbook…",
  merging: "Finalizing results…"
};

export default function LoadingState({ stage }: LoadingStateProps) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>{(stage && COPY[stage]) || "Working…"}</h2>
      <Spinner />
    </div>
  );
}
