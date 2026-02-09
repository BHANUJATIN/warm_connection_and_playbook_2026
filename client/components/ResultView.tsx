"use client";

import { useState, useMemo } from "react";

type WarmConnection = {
  prospect_person_name: string;
  prospect_person_first_name?: string;
  prospect_person_last_name?: string;
  prospect_person_linkedin: string;
  prospect_company_name?: string;
  prospect_company_linkedin?: string;
  exa_person_linkedin: string;
  connection_type: string;
  summary?: string | null;
};

// PLAYBOOK DISABLED: keeping types for future use
// type EmailTouch = { ... };
// type EmailSequence = { ... };
// type SalesPlaybook = { ... };

type ResultViewProps = {
  result: {
    warm_connections: WarmConnection[];
    // PLAYBOOK DISABLED
    // sales_playbook?: SalesPlaybook;
  };
  domain?: string;
};

type SortKey = "name" | "company" | "type";
type SortDir = "asc" | "desc";

function getDisplayName(conn: WarmConnection): string {
  return (
    conn.prospect_person_name ||
    `${conn.prospect_person_first_name || ""} ${conn.prospect_person_last_name || ""}`.trim() ||
    ""
  );
}

function linkedinName(url: string): string {
  if (!url) return "";
  const parts = url.replace(/\/+$/, "").split("/");
  const slug = parts[parts.length - 1] || url;
  return slug
    .replace(/-[a-f0-9]{6,}$/i, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function connectionTypeBadge(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("1st") || lower.includes("first")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (lower.includes("2nd") || lower.includes("second")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (lower.includes("3rd") || lower.includes("third")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

const LinkedInIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg className={`w-3.5 h-3.5 inline-block ml-1 transition-colors ${active ? "text-slate-900" : "text-slate-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      {dir === "asc" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      )}
    </svg>
  );
}

export default function ResultView({ result, domain }: ResultViewProps) {
  const { warm_connections } = result;

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Count connection types
  const typeCounts = warm_connections.reduce<Record<string, number>>((acc, c) => {
    const t = c.connection_type || "Unknown";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = warm_connections.filter((conn) => {
      // Type filter
      if (typeFilter && (conn.connection_type || "Unknown") !== typeFilter) return false;

      // Search filter
      if (!q) return true;
      const name = getDisplayName(conn).toLowerCase();
      const company = (conn.prospect_company_name || "").toLowerCase();
      const summary = (conn.summary || "").toLowerCase();
      const prospectLi = linkedinName(conn.prospect_person_linkedin).toLowerCase();
      const exaLi = linkedinName(conn.exa_person_linkedin).toLowerCase();
      return (
        name.includes(q) ||
        company.includes(q) ||
        summary.includes(q) ||
        prospectLi.includes(q) ||
        exaLi.includes(q)
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = getDisplayName(a).localeCompare(getDisplayName(b));
      } else if (sortKey === "company") {
        cmp = (a.prospect_company_name || "").localeCompare(b.prospect_company_name || "");
      } else if (sortKey === "type") {
        cmp = (a.connection_type || "").localeCompare(b.connection_type || "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [warm_connections, search, sortKey, sortDir, typeFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Warm Connections
                  </h1>
                  <p className="text-xs text-slate-400">
                    Exa
                    <span className="mx-1.5">&rarr;</span>
                    <span className="font-medium text-slate-600">{domain || "Target Company"}</span>
                  </p>
                </div>
              </div>
            </div>
            <a
              href="/"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              New Search
            </a>
          </div>
        </header>

        {/* Stats + type filter chips */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${warm_connections.length > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className="text-sm font-medium text-slate-700">
              {warm_connections.length} connection{warm_connections.length !== 1 ? "s" : ""} found
            </span>
          </div>
          {Object.entries(typeCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-200 ${
                typeFilter === type
                  ? "ring-2 ring-slate-900/20 shadow-sm " + connectionTypeBadge(type)
                  : typeFilter === null
                  ? connectionTypeBadge(type)
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              {type}: {count}
              {typeFilter === type && (
                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Search bar */}
        {warm_connections.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-sm">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, company, keyword..."
                className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                           placeholder:text-slate-400 transition-all duration-200 text-slate-800"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {(search || typeFilter) && (
              <p className="text-xs text-slate-400 mt-2">
                Showing {filtered.length} of {warm_connections.length} connection{warm_connections.length !== 1 ? "s" : ""}
                {typeFilter && <span> &middot; Type: {typeFilter}</span>}
                {search && <span> &middot; Search: &ldquo;{search}&rdquo;</span>}
              </p>
            )}
          </div>
        )}

        {/* No results */}
        {warm_connections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No warm connections found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any mutual connections between Exa and {domain || "the target company"} at this time.
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
        ) : filtered.length === 0 ? (
          /* No matches for current filters */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No matching connections</h3>
            <p className="text-sm text-slate-500 mb-4">
              Try adjusting your search or clearing the filter.
            </p>
            <button
              onClick={() => { setSearch(""); setTypeFilter(null); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Connections Table */
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th
                      onClick={() => toggleSort("name")}
                      className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[22%] cursor-pointer hover:text-slate-700 transition-colors select-none"
                    >
                      Prospect
                      <SortIcon active={sortKey === "name"} dir={sortKey === "name" ? sortDir : "asc"} />
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[20%]">
                      Prospect LinkedIn
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[20%]">
                      Exa Connection
                    </th>
                    <th
                      onClick={() => toggleSort("type")}
                      className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[12%] cursor-pointer hover:text-slate-700 transition-colors select-none"
                    >
                      Type
                      <SortIcon active={sortKey === "type"} dir={sortKey === "type" ? sortDir : "asc"} />
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((conn, idx) => {
                    const isExpanded = expandedIdx === idx;
                    const hasSummary = !!conn.summary;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/80 transition-colors"
                        style={{ animation: `slideUp 0.3s ease-out ${idx * 0.03}s both` }}
                      >
                        {/* Prospect Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-slate-500">
                                {(conn.prospect_person_first_name || conn.prospect_person_name || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 truncate">
                                {getDisplayName(conn) || "\u2014"}
                              </div>
                              {conn.prospect_company_name && (
                                <div className="text-xs text-slate-400 truncate">
                                  {conn.prospect_company_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Prospect LinkedIn */}
                        <td className="py-3.5 px-4">
                          {conn.prospect_person_linkedin ? (
                            <a
                              href={conn.prospect_person_linkedin.startsWith("http") ? conn.prospect_person_linkedin : `https://${conn.prospect_person_linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors group"
                            >
                              <LinkedInIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                              <span className="group-hover:underline truncate max-w-35">
                                {linkedinName(conn.prospect_person_linkedin)}
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Exa Connection LinkedIn */}
                        <td className="py-3.5 px-4">
                          {conn.exa_person_linkedin ? (
                            <a
                              href={conn.exa_person_linkedin.startsWith("http") ? conn.exa_person_linkedin : `https://${conn.exa_person_linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors group"
                            >
                              <LinkedInIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                              <span className="group-hover:underline truncate max-w-35">
                                {linkedinName(conn.exa_person_linkedin)}
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Connection Type */}
                        <td className="py-3.5 px-4">
                          {conn.connection_type ? (
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${connectionTypeBadge(conn.connection_type)}`}>
                              {conn.connection_type}
                            </span>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Summary */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {hasSummary ? (
                            <div>
                              <span className={`text-slate-600 text-[13px] leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                                {conn.summary}
                              </span>
                              <button
                                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                className="block text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium transition-colors"
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing {filtered.length}{filtered.length !== warm_connections.length ? ` of ${warm_connections.length}` : ""} result{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-slate-400">
                Data sourced from LinkedIn via Clay
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
