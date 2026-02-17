"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import type { FilamentProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";

export function FilamentsClient({ filaments, materials, brands }: { filaments: FilamentProfile[]; materials: string[]; brands: string[] }) {
  const [filtered, setFiltered] = useState(filaments);
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openprint3d-favorites-filaments");
      if (saved) setFavorites(JSON.parse(saved));
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("openprint3d-favorites-filaments", JSON.stringify(newFavs));
  };

  const applyFilters = (s: string, mat: string | null, brand: string | null, fav: boolean) => {
    let result = filaments;
    if (s) {
      const lower = s.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(lower) || f.brand.toLowerCase().includes(lower) || f.material.toLowerCase().includes(lower));
    }
    if (mat) result = result.filter((f) => f.material === mat);
    if (brand) result = result.filter((f) => f.brand === brand);
    if (fav) result = result.filter((f) => favorites.includes(f.id));
    setFiltered(result);
  };

  const updateSearch = (val: string) => {
    setSearch(val);
    applyFilters(val, materialFilter, brandFilter, showFavorites);
  };

  const updateMaterial = (val: string | null) => {
    setMaterialFilter(val);
    applyFilters(search, val, brandFilter, showFavorites);
  };

  const updateBrand = (val: string | null) => {
    setBrandFilter(val);
    applyFilters(search, materialFilter, val, showFavorites);
  };

  const toggleShowFavorites = () => {
    const newState = !showFavorites;
    setShowFavorites(newState);
    applyFilters(search, materialFilter, brandFilter, newState);
  };

  return (
    <div className="space-y-6">
      {/* Search and Favorites Toggle */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search filaments..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={toggleShowFavorites}
          className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors ${
            showFavorites ? "bg-accent/10 border-accent text-accent" : "bg-card border-border hover:border-border-hover text-muted"
          }`}
        >
          <span className="text-lg">⭐</span>
          <span className="text-sm font-medium hidden sm:inline">Favorites</span>
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted py-1.5">Material:</span>
          <button onClick={() => updateMaterial(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!materialFilter ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>All</button>
          {materials.map((m) => (
            <button key={m} onClick={() => updateMaterial(materialFilter === m ? null : m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${materialFilter === m ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>{m}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted py-1.5">Brand:</span>
          <button onClick={() => updateBrand(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!brandFilter ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>All</button>
          {brands.map((b) => (
            <button key={b} onClick={() => updateBrand(brandFilter === b ? null : b)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${brandFilter === b ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>{b}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f) => (
          <Link
            key={f.id}
            href={`/filaments/${encodeURIComponent(f.id)}`}
            className="group relative p-5 rounded-2xl bg-card border border-border hover:border-border-hover glow-hover transition-all duration-300"
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(f.id, e); }}
              className="absolute top-4 right-4 text-muted hover:text-yellow-400 transition-colors z-10"
            >
              {favorites.includes(f.id) ? "⭐" : "☆"}
            </button>
            <div className="flex items-center justify-between mb-3 pr-6">
              <Badge variant="accent">{f.material}</Badge>
              {f.diameter && <span className="text-xs text-muted">{f.diameter}mm</span>}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1">{f.name}</h3>
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
                {f.environment.sensitive_to_moisture && <Badge variant="warning">Moisture Sensitive</Badge>}
                {f.environment.enclosure_recommended && <Badge variant="danger">Enclosure</Badge>}
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted">
          <p>No filaments match your search.</p>
        </div>
      )}
    </div>
  );
}
