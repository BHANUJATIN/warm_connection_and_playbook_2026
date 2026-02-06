export default function WarmConnections({ connections }: any) {
  if (!connections || connections.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Warm Connections</h2>
        <p className="text-gray-500">No warm connections found.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Warm Connections</h2>

      <div className="space-y-4">
        {connections.map((item: any, idx: number) => (
          <div key={idx} className="border rounded p-4">
            <div className="font-medium">{item.person.name}</div>
            <div className="text-sm text-gray-500">
              {item.person.company}
            </div>

            <ul className="mt-2 space-y-2">
              {item.connections.map((c: any, i: number) => (
                <li key={i} className="text-sm">
                  <strong>{c.type}</strong>
                  {" — "}
                  {c.summary}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
