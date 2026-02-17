"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { PrinterProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";
import { useDebounce } from "@/components/search-filter";

export function PrintersClient({
  printers,
  manufacturers,
  kinematics,
}: {
  printers: PrinterProfile[];
  manufacturers: string[];
  kinematics: string[];
}) {
  const [filtered, setFiltered] = useState(printers);
  const [search, setSearch] = useState("");
  const [mfgFilter, setMfgFilter] = useState<string | null>(null);
  const [kinFilter, setKinFilter] = useState<string | null>(null);
  const [nozzleFilter, setNozzleFilter] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<string>("model");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Get unique nozzle sizes
  const nozzleSizes = [...new Set(printers.map((p) => p.extruders?.[0]?.nozzle_diameter).filter(Boolean))].sort();

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("openprint3d-favorites-printers");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("openprint3d-favorites-printers", JSON.stringify(newFavs));
  };

  const sortItems = useCallback(
    (items: PrinterProfile[]) => {
      return [...items].sort((a, b) => {
        let comparison = 0;
        if (sortBy === "model") comparison = a.model.localeCompare(b.model);
        else if (sortBy === "manufacturer") comparison = a.manufacturer.localeCompare(b.manufacturer);
        else if (sortBy === "kinematics") comparison = a.kinematics.localeCompare(b.kinematics);
        else if (sortBy === "volume") {
          const aVol = a.build_volume.x * a.build_volume.y * a.build_volume.z;
          const bVol = b.build_volume.x * b.build_volume.y * b.build_volume.z;
          comparison = aVol - bVol;
        }
        return sortDir === "asc" ? comparison : -comparison;
      });
    },
    [sortBy, sortDir]
  );

  const filter = useCallback(
    (s: string, mfg: string | null, kin: string | null, nozzle: string | null, fav: boolean) => {
      let result = printers;
      if (s) {
        const lower = s.toLowerCase();
        result = result.filter(
          (p) => 
            p.model.toLowerCase().includes(lower) || 
            p.manufacturer.toLowerCase().includes(lower) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(lower)))
        );
      }
      if (mfg) result = result.filter((p) => p.manufacturer === mfg);
      if (kin) result = result.filter((p) => p.kinematics === kin);
      if (nozzle) result = result.filter((p) => p.extruders?.[0]?.nozzle_diameter === parseFloat(nozzle));
      if (fav) result = result.filter((p) => favorites.includes(p.id));
      setFiltered(sortItems(result));
    },
    [printers, favorites, sortItems]
  );

  useEffect(() => {
    filter(debouncedSearch, mfgFilter, kinFilter, nozzleFilter, showFavorites);
  }, [debouncedSearch, mfgFilter, kinFilter, nozzleFilter, showFavorites, filter]);

  const toggleShowFavorites = () => setShowFavorites(!showFavorites);

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
            placeholder="Search printers..."
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
            <option value="model">Model</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="kinematics">Kinematics</option>
            <option value="volume">Build Volume</option>
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
          <button
            onClick={toggleShowFavorites}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all duration-200 ${
              showFavorites
                ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500"
                : "bg-card border-border hover:border-border-hover text-muted"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={showFavorites ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Favorites</span>
            {favorites.length > 0 && <span className="count-badge">{favorites.length}</span>}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted">Manufacturer:</span>
          <button
            onClick={() => setMfgFilter(null)}
            className={`filter-chip ${!mfgFilter ? "active" : ""}`}
          >
            All
          </button>
          {manufacturers.map((m) => (
            <button
              key={m}
              onClick={() => setMfgFilter(mfgFilter === m ? null : m)}
              className={`filter-chip ${mfgFilter === m ? "active" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted">Kinematics:</span>
          <button
            onClick={() => setKinFilter(null)}
            className={`filter-chip ${!kinFilter ? "active" : ""}`}
          >
            All
          </button>
          {kinematics.map((k) => (
            <button
              key={k}
              onClick={() => setKinFilter(kinFilter === k ? null : k)}
              className={`filter-chip ${kinFilter === k ? "active" : ""}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted">Nozzle:</span>
          <button
            onClick={() => setNozzleFilter(null)}
            className={`filter-chip ${!nozzleFilter ? "active" : ""}`}
          >
            All
          </button>
          {nozzleSizes.map((n) => (
            <button
              key={n}
              onClick={() => setNozzleFilter(nozzleFilter === n ? null : String(n))}
              className={`filter-chip ${nozzleFilter === String(n) ? "active" : ""}`}
            >
              {n}mm
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => (
          <Link
            key={`${p.id}-${i}`}
            href={`/printers/${encodeURIComponent(p.id)}`}
            className="profile-card animate-slide-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {mounted && (
              <button
                onClick={(e) => toggleFavorite(p.id, e)}
                className={`favorite-btn ${favorites.includes(p.id) ? "active" : ""}`}
                aria-label={favorites.includes(p.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className="w-5 h-5"
                  fill={favorites.includes(p.id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            )}
            <div className="flex items-center justify-between mb-3 pr-6">
              <Badge variant="accent">{p.kinematics}</Badge>
              <span className="text-xs text-muted font-mono">
                {p.build_volume.x}×{p.build_volume.y}×{p.build_volume.z}
              </span>
            </div>
            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1 truncate pr-6">
              {p.model}
            </h3>
            <p className="text-xs text-muted mb-3">{p.manufacturer}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Firmware</span>
                <span className="font-mono">{p.firmware.flavor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Nozzle</span>
                <span className="font-mono">{p.extruders?.[0]?.nozzle_diameter || "N/A"}mm</span>
              </div>
            </div>
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {p.tags.slice(0, 3).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}
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
          <p className="text-muted mb-2">No printers match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setMfgFilter(null);
              setKinFilter(null);
              setNozzleFilter(null);
              setShowFavorites(false);
            }}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-border">
        <span>{filtered.length} of {printers.length} printers</span>
      </div>
    </div>
  );
}