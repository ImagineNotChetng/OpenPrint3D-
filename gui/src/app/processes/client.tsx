"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { ProcessProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";
import { useDebounce } from "@/components/search-filter";

const intentColors: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
  high_detail: "accent",
  quality: "success",
  standard: "default",
  draft: "warning",
  mechanical: "danger",
  flexible: "accent",
  functional: "success",
};

export function ProcessesClient({
  processes,
  intents,
}: {
  processes: ProcessProfile[];
  intents: string[];
}) {
  const [filtered, setFiltered] = useState(processes);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(search, 300);

  const sortItems = useCallback(
    (items: ProcessProfile[]) => {
      return [...items].sort((a, b) => {
        let comparison = 0;
        if (sortBy === "name") comparison = a.name.localeCompare(b.name);
        else if (sortBy === "intent") comparison = a.intent.localeCompare(b.intent);
        else if (sortBy === "layer" && a.layer_height?.default && b.layer_height?.default) {
          comparison = a.layer_height.default - b.layer_height.default;
        }
        return sortDir === "asc" ? comparison : -comparison;
      });
    },
    [sortBy, sortDir]
  );

  const filter = useCallback(
    (s: string, intent: string | null) => {
      let result = processes;
      if (s) {
        const lower = s.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(lower) || p.intent.toLowerCase().includes(lower)
        );
      }
      if (intent) result = result.filter((p) => p.intent === intent);
      setFiltered(sortItems(result));
    },
    [processes, sortItems]
  );

  useEffect(() => {
    filter(debouncedSearch, intentFilter);
  }, [debouncedSearch, intentFilter, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search processes..."
            className="input-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="name">Name</option>
            <option value="intent">Intent</option>
            <option value="layer">Layer Height</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="icon-btn"
            aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted">Intent:</span>
        <button
          onClick={() => setIntentFilter(null)}
          className={`filter-chip ${!intentFilter ? "active" : ""}`}
        >
          All
        </button>
        {intents.map((i) => (
          <button
            key={i}
            onClick={() => setIntentFilter(intentFilter === i ? null : i)}
            className={`filter-chip ${intentFilter === i ? "active" : ""}`}
          >
            {i.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => (
          <Link
            key={p.id}
            href={`/processes/${encodeURIComponent(p.id)}`}
            className="profile-card animate-slide-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <Badge variant={intentColors[p.intent] ?? "default"}>{p.intent.replace("_", " ")}</Badge>
              {p.quality_bias?.priority && (
                <span className="text-xs text-muted">Priority: {p.quality_bias.priority}</span>
              )}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1">{p.name}</h3>
            {p.layer_height && (
              <p className="text-xs text-muted mb-3">Layer: {p.layer_height.default}mm</p>
            )}
            <div className="space-y-1.5 text-xs">
              {p.speed && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted">Outer Wall</span>
                    <span className="font-mono">{p.speed.outer_wall} mm/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Infill</span>
                    <span className="font-mono">{p.speed.infill} mm/s</span>
                  </div>
                </>
              )}
              {p.infill && (
                <div className="flex justify-between">
                  <span className="text-muted">Infill Density</span>
                  <span className="font-mono">{p.infill.density_default}%</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card-hover flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-muted mb-2">No processes match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setIntentFilter(null);
            }}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-border">
        <span>{filtered.length} of {processes.length} processes</span>
      </div>
    </div>
  );
}