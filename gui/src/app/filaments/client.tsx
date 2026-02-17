"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { FilamentProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";
import { useDebounce } from "@/components/search-filter";

export function FilamentsClient({
  filaments,
  materials,
  brands,
}: {
  filaments: FilamentProfile[];
  materials: string[];
  brands: string[];
}) {
  const [filtered, setFiltered] = useState(filaments);
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [diameterFilter, setDiameterFilter] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Get unique diameters
  const diameters = [...new Set(filaments.map((f) => f.diameter).filter(Boolean))].sort();

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("openprint3d-favorites-filaments");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("openprint3d-favorites-filaments", JSON.stringify(newFavs));
  };

  const sortItems = useCallback(
    (items: FilamentProfile[]) => {
      return [...items].sort((a, b) => {
        let comparison = 0;
        if (sortBy === "name") comparison = a.name.localeCompare(b.name);
        else if (sortBy === "brand") comparison = a.brand.localeCompare(b.brand);
        else if (sortBy === "material") comparison = a.material.localeCompare(b.material);
        else if (sortBy === "temp") comparison = (a.nozzle.recommended ?? a.nozzle.min) - (b.nozzle.recommended ?? b.nozzle.min);
        return sortDir === "asc" ? comparison : -comparison;
      });
    },
    [sortBy, sortDir]
  );

  const applyFilters = useCallback(
    (s: string, mat: string | null, brand: string | null, diam: string | null, fav: boolean) => {
      let result = filaments;
      if (s) {
        const lower = s.toLowerCase();
        result = result.filter(
          (f) =>
            f.name.toLowerCase().includes(lower) ||
            f.brand.toLowerCase().includes(lower) ||
            f.material.toLowerCase().includes(lower) ||
            (f.tags && f.tags.some(t => t.toLowerCase().includes(lower)))
        );
      }
      if (mat) result = result.filter((f) => f.material === mat);
      if (brand) result = result.filter((f) => f.brand === brand);
      if (diam) result = result.filter((f) => f.diameter === parseFloat(diam));
      if (fav) result = result.filter((f) => favorites.includes(f.id));
      setFiltered(sortItems(result));
    },
    [filaments, favorites, sortItems]
  );

  useEffect(() => {
    applyFilters(debouncedSearch, materialFilter, brandFilter, diameterFilter, showFavorites);
  }, [debouncedSearch, materialFilter, brandFilter, diameterFilter, showFavorites, applyFilters]);

  const updateSearch = (val: string) => setSearch(val);

  const updateMaterial = (val: string | null) => setMaterialFilter(val);

  const updateBrand = (val: string | null) => setBrandFilter(val);

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
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search filaments..."
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="brand">Brand</option>
            <option value="material">Material</option>
            <option value="temp">Temperature</option>
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
          <span className="text-xs text-muted">Material:</span>
          <button onClick={() => updateMaterial(null)} className={`filter-chip ${!materialFilter ? "active" : ""}`}>
            All
          </button>
          {materials.map((m) => (
            <button
              key={m}
              onClick={() => updateMaterial(materialFilter === m ? null : m)}
              className={`filter-chip ${materialFilter === m ? "active" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted">Brand:</span>
          <button onClick={() => updateBrand(null)} className={`filter-chip ${!brandFilter ? "active" : ""}`}>
            All
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => updateBrand(brandFilter === b ? null : b)}
              className={`filter-chip ${brandFilter === b ? "active" : ""}`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted">Diameter:</span>
          <button onClick={() => setDiameterFilter(null)} className={`filter-chip ${!diameterFilter ? "active" : ""}`}>
            All
          </button>
          {diameters.map((d) => (
            <button
              key={d}
              onClick={() => setDiameterFilter(diameterFilter === String(d) ? null : String(d))}
              className={`filter-chip ${diameterFilter === String(d) ? "active" : ""}`}
            >
              {d}mm
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((f, i) => (
          <Link
            key={`${f.id}-${i}`}
            href={`/filaments/${encodeURIComponent(f.id)}`}
            className="profile-card animate-slide-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {mounted && (
              <button
                onClick={(e) => toggleFavorite(f.id, e)}
                className={`favorite-btn ${favorites.includes(f.id) ? "active" : ""}`}
                aria-label={favorites.includes(f.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className="w-5 h-5"
                  fill={favorites.includes(f.id) ? "currentColor" : "none"}
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
              <Badge variant="accent">{f.material}</Badge>
              {f.diameter && <span className="text-xs text-muted">{f.diameter}mm</span>}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1 truncate pr-6">
              {f.name}
            </h3>
            <p className="text-xs text-muted mb-3">{f.brand}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Nozzle</span>
                <span className="font-mono">{f.nozzle.min}–{f.nozzle.max}°C</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Bed</span>
                <span className="font-mono">{f.bed.min}–{f.bed.max}°C</span>
              </div>
            </div>
            {f.environment && (
              <div className="flex gap-1.5 mt-3">
                {f.environment.sensitive_to_moisture && <Badge variant="warning">Moisture</Badge>}
                {f.environment.enclosure_recommended && <Badge variant="danger">Enclosure</Badge>}
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
          <p className="text-muted mb-2">No filaments match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setMaterialFilter(null);
              setBrandFilter(null);
              setDiameterFilter(null);
              setShowFavorites(false);
            }}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-border">
        <span>{filtered.length} of {filaments.length} filaments</span>
      </div>
    </div>
  );
}