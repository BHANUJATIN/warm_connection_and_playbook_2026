"use client";

type WarmConnection = {
  prospect_person_name: string;
  prospect_person_linkedin: string;
  exa_person_linkedin: string;
  connection_type: string;
  summary?: string | null;
};

type EmailTouch = {
  touch_number: number;
  day: number;
  subject: string;
  body: string;
  call_to_action?: string;
};

type EmailSequence = {
  persona_title: string;
  sequence_name: string;
  touches: EmailTouch[];
};

type SalesPlaybook = {
  vendor_name: string;
  prospect_name: string;
  executive_summary?: string;
  priority_personas?: string[];
  email_sequences?: EmailSequence[];
};

type ResultViewProps = {
  result: {
    warm_connections: WarmConnection[];
    sales_playbook: SalesPlaybook;
  };
  domain?: string;
};

export default function ResultView({ result, domain }: ResultViewProps) {
  const { warm_connections, sales_playbook } = result;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 text-neutral-300">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          {sales_playbook.vendor_name}
          <span className="mx-2 text-neutral-400">→</span>
          {sales_playbook.prospect_name}
        </h1>
        <div className="mt-2 h-px w-full bg-neutral-200" />
      </header>

      {/* Executive Summary */}
      {sales_playbook.executive_summary && (
        <section className="mb-12">
          <h2 className="mb-3 text-xl font-medium">Executive Summary</h2>
          <p className="max-w-3xl text-neutral-400 leading-relaxed">
            {sales_playbook.executive_summary}
          </p>
        </section>
      )}

      {/* Warm Connections */}
      <section className="mb-14">
        <h2 className="mb-4 text-xl font-medium">
          Warm Connections
          <span className="ml-2 text-sm text-neutral-500">
            ({warm_connections.length})
          </span>
        </h2>

        {warm_connections.length === 0 && (
          <p className="text-neutral-500">No warm connections found.</p>
        )}

        <div className="space-y-4">
          {warm_connections.map((conn, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 text-sm font-medium">
                {conn.prospect_person_name}
              </div>

              <div className="space-y-1 text-sm text-neutral-600">
                <div>
                  Prospect LinkedIn:{" "}
                  <a
                    href={conn.prospect_person_linkedin}
                    target="_blank"
                    className="text-neutral-900 underline underline-offset-2"
                  >
                    Profile
                  </a>
                </div>

                <div>
                  Connected via Exa:{" "}
                  <a
                    href={conn.exa_person_linkedin}
                    target="_blank"
                    className="text-neutral-900 underline underline-offset-2"
                  >
                    Profile
                  </a>
                </div>

                <div>Connection Type: {conn.connection_type}</div>

                {conn.summary && (
                  <div className="pt-2 text-neutral-700">
                    {conn.summary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Email Sequences */}
      <section>
        <h2 className="mb-6 text-xl font-medium">Email Sequences</h2>

        {!sales_playbook.email_sequences ||
          (sales_playbook.email_sequences.length === 0 && (
            <p className="text-neutral-500">
              No email sequences generated.
            </p>
          ))}

        <div className="space-y-12">
          {sales_playbook.email_sequences?.map((seq, idx) => (
            <div key={idx}>
              <h3 className="mb-4 text-lg font-medium">
                {seq.sequence_name}
                <span className="ml-2 text-sm text-green-500">
                  — {seq.persona_title}
                </span>
              </h3>

              <div className="space-y-4">
                {seq.touches.map((touch) => (
                  <div
                    key={touch.touch_number}
                    className="rounded-md border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="mb-2 text-sm font-medium text-gray-600">
                      Day {touch.day}: {touch.subject}
                    </div>

                    <pre className="whitespace-pre-wrap rounded-md bg-white p-4 text-sm text-neutral-800 border border-neutral-200">
                      {touch.body}
                    </pre>

                    {touch.call_to_action && (
                      <div className="mt-2 text-sm text-neutral-700">
                        CTA: {touch.call_to_action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
