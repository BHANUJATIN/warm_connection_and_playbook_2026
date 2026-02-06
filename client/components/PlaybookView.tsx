"use client";

import { useState } from "react";

export default function PlaybookView({ playbook }: any) {
  const sequences = playbook?.email_sequences || [];
  const [active, setActive] = useState(0);

  if (sequences.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Sales Playbook</h2>
        <p className="text-gray-500">No playbook available.</p>
      </section>
    );
  }

  const current = sequences[active];

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Sales Playbook</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {sequences.map((seq: any, idx: number) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`px-3 py-1 rounded border text-sm ${
              idx === active ? "bg-black text-white" : ""
            }`}
          >
            {seq.persona_title}
          </button>
        ))}
      </div>

      {current.touches.map((t: any, i: number) => (
        <div key={i} className="border rounded p-4 mb-4">
          <div className="text-sm text-gray-500">Day {t.day}</div>
          <div className="font-medium">{t.subject}</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm">
            {t.body}
          </pre>
        </div>
      ))}
    </section>
  );
}
