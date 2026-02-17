"use client";
import { useState } from "react";
import Link from "next/link";
import type { ProcessProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";

const intentColors: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
  high_detail: "accent",
  quality: "success",
  standard: "default",
  draft: "warning",
  mechanical: "danger",
  flexible: "accent",
  functional: "success",
};

export function ProcessesClient({ processes, intents }: { processes: ProcessProfile[]; intents: string[] }) {
  const [filtered, setFiltered] = useState(processes);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<string | null>(null);

  const filter = (s: string, intent: string | null) => {
    let result = processes;
    if (s) { const lower = s.toLowerCase(); result = result.filter((p) => p.name.toLowerCase().includes(lower) || p.intent.toLowerCase().includes(lower)); }
    if (intent) result = result.filter((p) => p.intent === intent);
    setFiltered(result);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); filter(e.target.value, intentFilter); }}
          placeholder="Search processes..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted py-1.5">Intent:</span>
        <button onClick={() => { setIntentFilter(null); filter(search, null); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!intentFilter ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>All</button>
        {intents.map((i) => (
          <button key={i} onClick={() => { const v = intentFilter === i ? null : i; setIntentFilter(v); filter(search, v); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${intentFilter === i ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"}`}>{i.replace("_", " ")}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Link key={p.id} href={`/processes/${encodeURIComponent(p.id)}`}
            className="group p-5 rounded-2xl bg-card border border-border hover:border-border-hover glow-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={intentColors[p.intent] ?? "default"}>{p.intent.replace("_", " ")}</Badge>
              {p.quality_bias?.priority && <span className="text-xs text-muted">Priority: {p.quality_bias.priority}</span>}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1">{p.name}</h3>
            {p.layer_height && <p className="text-xs text-muted mb-3">Layer: {p.layer_height.default}mm</p>}
            <div className="space-y-1.5 text-xs">
              {p.speed && <div className="flex justify-between"><span className="text-muted">Outer Wall</span><span className="font-mono">{p.speed.outer_wall} mm/s</span></div>}
              {p.speed && <div className="flex justify-between"><span className="text-muted">Infill</span><span className="font-mono">{p.speed.infill} mm/s</span></div>}
              {p.infill && <div className="flex justify-between"><span className="text-muted">Infill Density</span><span className="font-mono">{p.infill.density_default}%</span></div>}
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted"><p>No processes match your search.</p></div>}
    </div>
  );
}
