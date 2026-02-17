"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { FilamentProfile, PrinterProfile, ProcessProfile } from "@/lib/profiles";
import { Badge } from "@/components/badge";

type ViewType = "printer" | "filament" | "process" | "matrix";

interface RelationGroup {
  printer: PrinterProfile;
  filaments: FilamentProfile[];
  processes: ProcessProfile[];
}

export function RelationsClient({
  filaments,
  printers,
  processes,
}: {
  filaments: FilamentProfile[];
  printers: PrinterProfile[];
  processes: ProcessProfile[];
}) {
  const [viewType, setViewType] = useState<ViewType>("printer");
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // Get unique materials for filter
  const materials = useMemo(() => 
    [...new Set(filaments.map(f => f.material))].sort(), 
    [filaments]
  );

  // Filter items based on search and filters
  const filteredPrinters = useMemo(() => 
    printers.filter(p => 
      !search || 
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase())
    ),
    [printers, search]
  );

  const filteredFilaments = useMemo(() =>
    filaments.filter(f =>
      (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.brand.toLowerCase().includes(search.toLowerCase())) &&
      (!selectedMaterial || f.material === selectedMaterial)
    ),
    [filaments, search, selectedMaterial]
  );

  // Get compatible filaments for a printer based on temperature ranges
  const getCompatibleFilaments = (printer: PrinterProfile): FilamentProfile[] => {
    return filaments.filter(f => {
      // Check if filament nozzle temp is within printer's extruder temp range
      const extruderMaxTemp = printer.extruders?.[0]?.max_temp || 300;
      const extruderMinTemp = printer.extruders?.[0]?.min_temp || 0;
      return f.nozzle.max <= extruderMaxTemp && f.nozzle.min >= extruderMinTemp;
    });
  };

  // Get compatible printers for a filament
  const getCompatiblePrinters = (filament: FilamentProfile): PrinterProfile[] => {
    return printers.filter(p => {
      const extruderMaxTemp = p.extruders?.[0]?.max_temp || 300;
      const extruderMinTemp = p.extruders?.[0]?.min_temp || 0;
      return filament.nozzle.max <= extruderMaxTemp && filament.nozzle.min >= extruderMinTemp;
    });
  };

  // Get recommended processes for a filament
  const getRecommendedProcesses = (filament: FilamentProfile): ProcessProfile[] => {
    // Return processes that could work with this material type
    return processes.filter(p => {
      // Simple heuristic: match by material type or intent
      const materialLower = filament.material.toLowerCase();
      const intentLower = p.intent.toLowerCase();
      return materialLower.includes(intentLower) || intentLower.includes(materialLower);
    }).slice(0, 5);
  };

  // Group data by manufacturer/material
  const manufacturerGroups = useMemo(() => {
    const groups: Record<string, PrinterProfile[]> = {};
    printers.forEach(p => {
      if (!groups[p.manufacturer]) groups[p.manufacturer] = [];
      groups[p.manufacturer].push(p);
    });
    return groups;
  }, [printers]);

  const materialGroups = useMemo(() => {
    const groups: Record<string, FilamentProfile[]> = {};
    filaments.forEach(f => {
      if (!groups[f.material]) groups[f.material] = [];
      groups[f.material].push(f);
    });
    return groups;
  }, [filaments]);

  const intentGroups = useMemo(() => {
    const groups: Record<string, ProcessProfile[]> = {};
    processes.forEach(p => {
      if (!groups[p.intent]) groups[p.intent] = [];
      groups[p.intent].push(p);
    });
    return groups;
  }, [processes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relations</h1>
          <p className="text-muted">Explore connections between printers, filaments, and processes</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
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
            placeholder="Search..."
            className="input-search"
          />
        </div>
      </div>

      {/* View Type Tabs */}
      <div className="flex gap-2 p-1 bg-card rounded-xl border border-border w-fit">
        {(["printer", "filament", "process", "matrix"] as ViewType[]).map((view) => (
          <button
            key={view}
            onClick={() => { setViewType(view); setSelectedPrinter(null); setSelectedMaterial(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              viewType === view 
                ? "bg-accent text-white" 
                : "text-muted hover:text-foreground"
            }`}
          >
            {view === "matrix" ? "Compatibility Matrix" : view + "s"}
          </button>
        ))}
      </div>

      {/* Filter by Material (for filament view) */}
      {viewType === "filament" && materials.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted">Material:</span>
          <button
            onClick={() => setSelectedMaterial(null)}
            className={`filter-chip ${!selectedMaterial ? "active" : ""}`}
          >
            All
          </button>
          {materials.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMaterial(selectedMaterial === m ? null : m)}
              className={`filter-chip ${selectedMaterial === m ? "active" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* PRINTER VIEW - Show printers and their compatible filaments/processes */}
      {viewType === "printer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Printer List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Printers</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredPrinters.map((printer, idx) => {
                const compatible = getCompatibleFilaments(printer);
                const isSelected = selectedPrinter === printer.id;
                return (
                  <button
                    key={`${printer.id}-${idx}`}
                    onClick={() => setSelectedPrinter(isSelected ? null : printer.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? "bg-accent/10 border-accent" 
                        : "bg-card border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{printer.model}</span>
                      <Badge variant="accent">{printer.manufacturer}</Badge>
                    </div>
                    <div className="text-xs text-muted flex gap-3">
                      <span>🖨️ {printer.kinematics}</span>
                      <span>📦 {printer.build_volume.x}×{printer.build_volume.y}×{printer.build_volume.z}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      {compatible.length} compatible filaments
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Related Profiles</h2>
            {selectedPrinter ? (
              (() => {
                const printer = printers.find(p => p.id === selectedPrinter)!;
                const compatible = getCompatibleFilaments(printer);
                const recommended = processes.slice(0, 4);
                return (
                  <div className="space-y-6">
                    {/* Printer Info */}
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <h3 className="font-semibold mb-3">🖨️ {printer.model}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted">Manufacturer:</span> {printer.manufacturer}</div>
                        <div><span className="text-muted">Kinematics:</span> {printer.kinematics}</div>
                        <div><span className="text-muted">Build Volume:</span> {printer.build_volume.x}×{printer.build_volume.y}×{printer.build_volume.z}mm</div>
                        <div><span className="text-muted">Firmware:</span> {printer.firmware.flavor}</div>
                      </div>
                    </div>

                    {/* Compatible Filaments */}
                    <div>
                      <h4 className="font-semibold mb-3">🧵 Compatible Filaments ({compatible.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {compatible.slice(0, 10).map((f) => (
                          <Link
                            key={f.id}
                            href={`/filaments/${encodeURIComponent(f.id)}`}
                            className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                          >
                            <div className="text-sm font-medium">{f.name}</div>
                            <div className="text-xs text-muted">{f.brand} · {f.material}</div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Processes */}
                    <div>
                      <h4 className="font-semibold mb-3">⚙️ Recommended Processes</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recommended.map((p) => (
                          <Link
                            key={p.id}
                            href={`/processes/${encodeURIComponent(p.id)}`}
                            className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                          >
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="text-xs text-muted">{p.intent.replace("_", " ")}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-16 text-muted">
                <p>Select a printer to view compatible filaments and processes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILAMENT VIEW - Show filaments and their compatible printers */}
      {viewType === "filament" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filament List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Filaments</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredFilaments.slice(0, 30).map((filament, idx) => {
                const compatible = getCompatiblePrinters(filament);
                const recommended = getRecommendedProcesses(filament);
                return (
                  <button
                    key={`${filament.id}-${idx}`}
                    onClick={() => setSelectedMaterial(filament.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedMaterial === filament.id
                        ? "bg-accent/10 border-accent" 
                        : "bg-card border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold truncate">{filament.name}</span>
                      <Badge variant="accent">{filament.material}</Badge>
                    </div>
                    <div className="text-xs text-muted flex gap-3 flex-wrap">
                      <span>🏷️ {filament.brand}</span>
                      <span>🌡️ {filament.nozzle.min}-{filament.nozzle.max}°C</span>
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      {compatible.length} compatible printers · {recommended.length} recommended processes
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Related Profiles</h2>
            {selectedMaterial ? (
              (() => {
                const filament = filaments.find(f => f.id === selectedMaterial)!;
                const compatible = getCompatiblePrinters(filament);
                const recommended = getRecommendedProcesses(filament);
                return (
                  <div className="space-y-6">
                    {/* Filament Info */}
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <h3 className="font-semibold mb-3">🧵 {filament.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted">Brand:</span> {filament.brand}</div>
                        <div><span className="text-muted">Material:</span> {filament.material}</div>
                        <div><span className="text-muted">Diameter:</span> {filament.diameter}mm</div>
                        <div><span className="text-muted">Nozzle:</span> {filament.nozzle.min}-{filament.nozzle.max}°C</div>
                      </div>
                    </div>

                    {/* Compatible Printers */}
                    <div>
                      <h4 className="font-semibold mb-3">🖨️ Compatible Printers ({compatible.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {compatible.slice(0, 8).map((p) => (
                          <Link
                            key={p.id}
                            href={`/printers/${encodeURIComponent(p.id)}`}
                            className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                          >
                            <div className="text-sm font-medium">{p.model}</div>
                            <div className="text-xs text-muted">{p.manufacturer}</div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Processes */}
                    <div>
                      <h4 className="font-semibold mb-3">⚙️ Recommended Processes</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recommended.map((p) => (
                          <Link
                            key={p.id}
                            href={`/processes/${encodeURIComponent(p.id)}`}
                            className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                          >
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="text-xs text-muted">{p.intent.replace("_", " ")}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-16 text-muted">
                <p>Select a filament to view compatible printers and processes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROCESS VIEW - Show processes and related filaments */}
      {viewType === "process" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Process List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Processes</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {processes.slice(0, 30).map((process, idx) => {
                const compatibleFilaments = filaments.slice(0, 5); // Show some filaments
                return (
                  <button
                    key={`${process.id}-${idx}`}
                    onClick={() => setSelectedMaterial(process.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedMaterial === process.id
                        ? "bg-accent/10 border-accent" 
                        : "bg-card border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{process.name}</span>
                      <Badge variant="default">{process.intent.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-xs text-muted flex gap-3">
                      {process.layer_height?.default && (
                        <span>📏 {process.layer_height.default}mm</span>
                      )}
                      {process.speed?.outer_wall && (
                        <span>⚡ {process.speed.outer_wall}mm/s</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Compatible Filaments</h2>
            {selectedMaterial ? (
              (() => {
                const process = processes.find(p => p.id === selectedMaterial)!;
                // Find filaments that could work with this process intent
                const intentLower = process.intent.toLowerCase();
                const matchingFilaments = filaments.filter(f => {
                  const matLower = f.material.toLowerCase();
                  return matLower.includes(intentLower) || intentLower.includes(matLower);
                }).slice(0, 10);
                
                return (
                  <div className="space-y-4">
                    {/* Process Info */}
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <h3 className="font-semibold mb-3">⚙️ {process.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted">Intent:</span> {process.intent.replace("_", " ")}</div>
                        {process.layer_height?.default && (
                          <div><span className="text-muted">Layer Height:</span> {process.layer_height.default}mm</div>
                        )}
                      </div>
                    </div>

                    {/* Compatible Filaments */}
                    <div>
                      <h4 className="font-semibold mb-3">🧵 Filaments for {process.intent.replace("_", " ")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchingFilaments.length > 0 ? matchingFilaments.map((f) => (
                          <Link
                            key={f.id}
                            href={`/filaments/${encodeURIComponent(f.id)}`}
                            className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                          >
                            <div className="text-sm font-medium">{f.name}</div>
                            <div className="text-xs text-muted">{f.brand} · {f.material}</div>
                          </Link>
                        )) : (
                          <p className="text-sm text-muted col-span-2">No specific filaments found for this intent</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-16 text-muted">
                <p>Select a process to view compatible filaments</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MATRIX VIEW - Show compatibility matrix */}
      {viewType === "matrix" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-card border border-border">
            <h3 className="font-semibold mb-3">Compatibility Matrix</h3>
            <p className="text-sm text-muted mb-4">
              Overview of material compatibility with different printer manufacturers
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted font-medium">Material</th>
                    {Object.keys(manufacturerGroups).slice(0, 6).map(mfg => (
                      <th key={mfg} className="text-center py-2 px-3 text-muted font-medium">{mfg}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materials.slice(0, 8).map(mat => {
                    const matFilaments = materialGroups[mat] || [];
                    return (
                      <tr key={mat} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">{mat}</td>
                        {Object.keys(manufacturerGroups).slice(0, 6).map(mfg => {
                          const printersInMfg = manufacturerGroups[mfg] || [];
                          const hasCompatible = printersInMfg.some(p => 
                            getCompatibleFilaments(p).some(f => f.material === mat)
                          );
                          return (
                            <td key={mfg} className="text-center py-2 px-3">
                              {hasCompatible ? (
                                <span className="text-green-500" title="Compatible">✓</span>
                              ) : (
                                <span className="text-muted/30" title="Not tested">–</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-accent">{printers.length}</div>
              <div className="text-sm text-muted">Printers</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-accent">{filaments.length}</div>
              <div className="text-sm text-muted">Filaments</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-accent">{processes.length}</div>
              <div className="text-sm text-muted">Processes</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-border">
        <span>
          {viewType === "printer" && `${filteredPrinters.length} printers`}
          {viewType === "filament" && `${filteredFilaments.length} filaments`}
          {viewType === "process" && `${processes.length} processes`}
          {viewType === "matrix" && `Matrix view`}
        </span>
      </div>
    </div>
  );
}
