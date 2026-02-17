"use client";
import { useState } from "react";
import Link from "next/link";
import type { PrinterProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";

export function PrintersClient({ printers, manufacturers, kinematics }: { printers: PrinterProfile[]; manufacturers: string[]; kinematics: string[] }) {
  const [filtered, setFiltered] = useState(printers);
  const [search, setSearch] = useState("");
  const [mfgFilter, setMfgFilter] = useState<string | null>(null);
  const [kinFilter, setKinFilter] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openprint3d-favorites-printers");
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
    localStorage.setItem("openprint3d-favorites-printers", JSON.stringify(newFavs));
  };

  const filter = (s: string, mfg: string | null, kin: string | null, fav: boolean) => {
    let result = printers;
    if (s) { const lower = s.toLowerCase(); result = result.filter((p) => p.model.toLowerCase().includes(lower) || p.manufacturer.toLowerCase().includes(lower)); }
    if (mfg) result = result.filter((p) => p.manufacturer === mfg);
    if (kin) result = result.filter((p) => p.kinematics === kin);
    if (fav) result = result.filter((p) => favorites.includes(p.id));
    setFiltered(result);
  };

  const toggleShowFavorites = () => {
    const newState = !showFavorites;
    setShowFavorites(newState);
    filter(search, mfgFilter, kinFilter, newState);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); filter(e.target.value, mfgFilter, kinFilter, showFavorites); }}
            placeholder="Search printers..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
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

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted py-1.5">Manufacturer:</span>
          <button onClick={() => { setMfgFilter(null); filter(search, null, kinFilter, showFavorites); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!mfgFilter ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>All</button>
          {manufacturers.map((m) => (
            <button key={m} onClick={() => { const v = mfgFilter === m ? null : m; setMfgFilter(v); filter(search, v, kinFilter, showFavorites); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mfgFilter === m ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>{m}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted py-1.5">Kinematics:</span>
          <button onClick={() => { setKinFilter(null); filter(search, mfgFilter, null, showFavorites); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!kinFilter ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>All</button>
          {kinematics.map((k) => (
            <button key={k} onClick={() => { const v = kinFilter === k ? null : k; setKinFilter(v); filter(search, mfgFilter, v, showFavorites); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${kinFilter === k ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>{k}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Link key={p.id} href={`/printers/${encodeURIComponent(p.id)}`}
            className="group relative p-5 rounded-2xl bg-card border border-border hover:border-border-hover glow-hover transition-all duration-300">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(p.id, e); }}
              className="absolute top-4 right-4 text-muted hover:text-yellow-400 transition-colors z-10"
            >
              {favorites.includes(p.id) ? "⭐" : "☆"}
            </button>
            <div className="flex items-center justify-between mb-3 pr-6">
              <Badge variant="accent">{p.kinematics}</Badge>
              <span className="text-xs text-muted font-mono">{p.build_volume.x}×{p.build_volume.y}×{p.build_volume.z}</span>
            </div>
            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1">{p.model}</h3>
            <p className="text-xs text-muted mb-3">{p.manufacturer}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted">Firmware</span><span className="font-mono">{p.firmware.flavor}</span></div>
              <div className="flex justify-between"><span className="text-muted">Nozzle</span><span className="font-mono">{p.extruders[0]?.nozzle_diameter}mm</span></div>
            </div>
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {p.tags.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
            )}
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted"><p>No printers match your search.</p></div>}
    </div>
  );
}
