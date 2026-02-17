"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

type ViewMode = "grid" | "list";
type SortDirection = "asc" | "desc";

interface SearchFilterProps {
  items: Array<{ id: string; [key: string]: unknown }>;
  searchFields: string[];
  filterKey?: string;
  filterOptions?: string[];
  filterLabel?: string;
  sortOptions?: { key: string; label: string }[];
  defaultSortKey?: string;
  onFilter: (filtered: Array<{ id: string; [key: string]: unknown }>) => void;
  placeholder?: string;
  showViewToggle?: boolean;
  showSort?: boolean;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchFilter({
  items,
  searchFields,
  filterKey,
  filterOptions,
  filterLabel,
  sortOptions,
  defaultSortKey,
  onFilter,
  placeholder = "Search...",
  showViewToggle = false,
  showSort = false,
}: SearchFilterProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState(defaultSortKey || "");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const debouncedSearch = useDebounce(search, 300);

  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split(".").reduce((acc: unknown, key: string) => {
      if (acc && typeof acc === "object" && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };

  const sortItems = useCallback(
    (itemsToSort: Array<{ id: string; [key: string]: unknown }>) => {
      if (!sortKey) return itemsToSort;

      return [...itemsToSort].sort((a, b) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    },
    [sortKey, sortDirection]
  );

  useEffect(() => {
    let result = items;

    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = getNestedValue(item, field);
          return typeof val === "string" && val.toLowerCase().includes(lower);
        })
      );
    }

    if (activeFilter && filterKey) {
      result = result.filter((item) => {
        const val = getNestedValue(item, filterKey);
        return typeof val === "string" && val.toLowerCase() === activeFilter.toLowerCase();
      });
    }

    if (sortKey) {
      result = sortItems(result);
    }

    onFilter(result);
  }, [debouncedSearch, activeFilter, items, searchFields, filterKey, sortKey, sortDirection, sortItems, onFilter]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
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
            placeholder={placeholder}
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
          {showSort && sortOptions && sortOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="sort-select"
              >
                <option value="">Sort by</option>
                {sortOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {sortKey && (
                <button
                  onClick={toggleSortDirection}
                  className="icon-btn"
                  aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {showViewToggle && (
            <div className="view-toggle">
              <button
                onClick={() => setViewMode("grid")}
                className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {filterOptions && filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`filter-chip ${!activeFilter ? "active" : ""}`}
          >
            All{filterLabel ? ` ${filterLabel}` : ""}
          </button>
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(activeFilter === opt ? null : opt)}
              className={`filter-chip ${activeFilter === opt ? "active" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}