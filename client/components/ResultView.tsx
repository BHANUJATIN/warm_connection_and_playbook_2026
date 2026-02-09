"use client";

import { useState, useMemo, useCallback } from "react";

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

function extractCommonEntity(summary: string | null | undefined): string {
  if (!summary) return "";
  // Match patterns like "Both worked at Apple" or "Both studied at MIT"
  const match = summary.match(/Both (?:worked|studied|volunteered|interned) at ([^.,;]+)/i);
  return match ? match[1].trim() : "";
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Draft outbound modal
  const [draftConn, setDraftConn] = useState<WarmConnection | null>(null);

  // Filter out Self-Employed rows globally
  const validConnections = useMemo(
    () => warm_connections.filter((c) => !(c.summary || "").toLowerCase().includes("self-employed")),
    [warm_connections]
  );

  // Count connection types (after Self-Employed filter)
  const typeCounts = validConnections.reduce<Record<string, number>>((acc, c) => {
    const t = c.connection_type || "Unknown";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = validConnections.filter((conn) => {
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
  }, [validConnections, search, sortKey, sortDir, typeFilter]);

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset to page 1 when filters change
  const handleSearch = useCallback((v: string) => { setSearch(v); setCurrentPage(1); }, []);
  const handleTypeFilter = useCallback((type: string | null) => { setTypeFilter(type); setCurrentPage(1); }, []);

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
            <div className={`w-2 h-2 rounded-full ${validConnections.length > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className="text-sm font-medium text-slate-700">
              {validConnections.length} connection{validConnections.length !== 1 ? "s" : ""} found
            </span>
          </div>
          {Object.entries(typeCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => handleTypeFilter(typeFilter === type ? null : type)}
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
        {validConnections.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-sm">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, company, keyword..."
                className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                           placeholder:text-slate-400 transition-all duration-200 text-slate-800"
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
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
                Showing {filtered.length} of {validConnections.length} connection{validConnections.length !== 1 ? "s" : ""}
                {typeFilter && <span> &middot; Type: {typeFilter}</span>}
                {search && <span> &middot; Search: &ldquo;{search}&rdquo;</span>}
              </p>
            )}
          </div>
        )}

        {/* No results */}
        {validConnections.length === 0 ? (
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
              onClick={() => { handleSearch(""); handleTypeFilter(null); }}
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
                      className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[20%] cursor-pointer hover:text-slate-700 transition-colors select-none"
                    >
                      Prospect
                      <SortIcon active={sortKey === "name"} dir={sortKey === "name" ? sortDir : "asc"} />
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[17%]">
                      Prospect LinkedIn
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[17%]">
                      Exa Connection
                    </th>
                    <th
                      onClick={() => toggleSort("type")}
                      className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[10%] cursor-pointer hover:text-slate-700 transition-colors select-none"
                    >
                      Type
                      <SortIcon active={sortKey === "type"} dir={sortKey === "type" ? sortDir : "asc"} />
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[26%]">
                      Summary
                    </th>
                    <th className="text-left py-3.5 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-[10%]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedRows.map((conn, idx) => {
                    const globalIdx = (safePage - 1) * pageSize + idx;
                    const isExpanded = expandedIdx === globalIdx;
                    const hasSummary = !!conn.summary;

                    return (
                      <tr
                        key={globalIdx}
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
                                onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}
                                className="block text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium transition-colors"
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Draft Outbound */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setDraftConn(conn)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Draft
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing {(safePage - 1) * pageSize + 1}&ndash;{Math.min(safePage * pageSize, filtered.length)} of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | "dots")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("dots");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "dots" ? (
                        <span key={`dots-${i}`} className="px-1.5 text-xs text-slate-400">&hellip;</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item as number)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                            safePage === item
                              ? "bg-slate-900 text-white border-slate-900"
                              : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
              <span className="text-xs text-slate-400">
                Data sourced from LinkedIn via Clay
              </span>
            </div>
          </div>
        )}

        {/* Draft Outbound Modal */}
        {draftConn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDraftConn(null)}>
            <div
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-semibold text-slate-900">Draft Outbound Messages</h2>
                <button onClick={() => setDraftConn(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-5">
                {(() => {
                  const prospectFirst = draftConn.prospect_person_first_name || getDisplayName(draftConn).split(" ")[0] || "there";
                  const exaName = linkedinName(draftConn.exa_person_linkedin);
                  const commonEntity = extractCommonEntity(draftConn.summary);
                  const targetCompany = draftConn.prospect_company_name || domain || "your company";

                  // Determine relation type from summary
                  const summaryLower = (draftConn.summary || "").toLowerCase();
                  let relation = "connection";
                  if (summaryLower.includes("studied at")) relation = "alumni";
                  else if (summaryLower.includes("worked at")) relation = "alum";

                  const connectionMsg = commonEntity
                    ? `Hey ${prospectFirst}, ${exaName} here! Fellow ${commonEntity} ${relation} — how's it going at ${targetCompany}?`
                    : `Hey ${prospectFirst}, ${exaName} here! Would love to connect — how's it going at ${targetCompany}?`;

                  const followUpMsg = commonEntity
                    ? `Hi ${prospectFirst}, just following up! As a fellow ${commonEntity} ${relation}, I'd love to chat about what you're building at ${targetCompany}. Would you be open to a quick call?`
                    : `Hi ${prospectFirst}, just following up! I'd love to chat about what you're building at ${targetCompany}. Would you be open to a quick call?`;

                  return (
                    <>
                      {/* Connection Request */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connection Request</label>
                          <button
                            onClick={() => navigator.clipboard.writeText(connectionMsg)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-700 leading-relaxed">
                          {connectionMsg}
                        </div>
                      </div>

                      {/* Follow-up Message */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow-up Message</label>
                          <button
                            onClick={() => navigator.clipboard.writeText(followUpMsg)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-700 leading-relaxed">
                          {followUpMsg}
                        </div>
                      </div>

                      {/* Context */}
                      {draftConn.summary && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-400 mb-1 font-medium">Connection context</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{draftConn.summary}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  onClick={() => setDraftConn(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
