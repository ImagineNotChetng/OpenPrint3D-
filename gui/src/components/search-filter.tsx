"use client";
import { useState, useMemo } from "react";

interface SearchFilterProps {
  items: Array<{ id: string; [key: string]: unknown }>;
  searchFields: string[];
  filterKey?: string;
  filterOptions?: string[];
  filterLabel?: string;
  onFilter: (filtered: Array<{ id: string; [key: string]: unknown }>) => void;
  placeholder?: string;
}

export function SearchFilter({ items, searchFields, filterKey, filterOptions, filterLabel, onFilter, placeholder = "Search..." }: SearchFilterProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useMemo(() => {
    let result = items;

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return typeof val === "string" && val.toLowerCase().includes(lower);
        })
      );
    }

    if (activeFilter && filterKey) {
      result = result.filter((item) => {
        const val = item[filterKey];
        return typeof val === "string" && val.toLowerCase() === activeFilter.toLowerCase();
      });
    }

    onFilter(result);
  }, [search, activeFilter, items, searchFields, filterKey, onFilter]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {filterOptions && filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !activeFilter ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"
            }`}
          >
            All{filterLabel ? ` ${filterLabel}` : ""}
          </button>
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(activeFilter === opt ? null : opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === opt ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
