"use client";
import { useState, useEffect } from "react";
import type { FilamentProfile, PrinterProfile, ProcessProfile } from "@/lib/profiles";
import {
  convertFilament, convertPrinter, convertProcess,
  getFileExtension, getSlicerLabel,
  type SlicerTarget,
} from "@/lib/converter";
import { Badge } from "@/components/badge";

type Step = "slicer" | "profiles" | "preview";

const slicers: { id: SlicerTarget; name: string; desc: string; icon: string }[] = [
  { id: "orcaslicer", name: "OrcaSlicer / BambuStudio", desc: "JSON format — compatible with OrcaSlicer, BambuStudio, and forks", icon: "🦈" },
  { id: "prusaslicer", name: "PrusaSlicer / SuperSlicer", desc: "INI config bundle format", icon: "🔶" },
  { id: "cura", name: "UltiMaker Cura", desc: "CFG profile format for Cura 5.x+", icon: "⬡" },
];

export function ExportClient({
  filaments, printers, processes,
}: {
  filaments: FilamentProfile[];
  printers: PrinterProfile[];
  processes: ProcessProfile[];
}) {
  const [step, setStep] = useState<Step>("slicer");
  const [slicer, setSlicer] = useState<SlicerTarget | null>(null);
  const [selectedFilament, setSelectedFilament] = useState<string | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<"filament" | "printer" | "process">("filament");
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [printerManufacturerFilter, setPrinterManufacturerFilter] = useState<string | null>(null);
  const [favFilaments, setFavFilaments] = useState<string[]>([]);
  const [favPrinters, setFavPrinters] = useState<string[]>([]);

  // Get unique materials and brands for filters
  const materials = [...new Set(filaments.map(f => f.material))].filter(Boolean);
  const brands = [...new Set(filaments.map(f => f.brand))].filter(Boolean);
  const printerManufacturers = [...new Set(printers.map(p => p.manufacturer))].filter(Boolean);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFavFilaments(JSON.parse(localStorage.getItem("openprint3d-favorites-filaments") || "[]"));
      setFavPrinters(JSON.parse(localStorage.getItem("openprint3d-favorites-printers") || "[]"));
    }
  }, []);

  // Toggle favorite for filaments
  const toggleFavFilament = (id: string) => {
    const newFavs = favFilaments.includes(id) 
      ? favFilaments.filter(f => f !== id)
      : [...favFilaments, id];
    setFavFilaments(newFavs);
    localStorage.setItem("openprint3d-favorites-filaments", JSON.stringify(newFavs));
  };

  // Toggle favorite for printers
  const toggleFavPrinter = (id: string) => {
    const newFavs = favPrinters.includes(id)
      ? favPrinters.filter(p => p !== id)
      : [...favPrinters, id];
    setFavPrinters(newFavs);
    localStorage.setItem("openprint3d-favorites-printers", JSON.stringify(newFavs));
  };

  const fil = filaments.find((f) => f.id === selectedFilament);
  const prt = printers.find((p) => p.id === selectedPrinter);
  const proc = processes.find((p) => p.id === selectedProcess);

  const hasSelection = selectedFilament || selectedPrinter || selectedProcess;

  // Filter lists based on search
  const filteredPrinters = printers.filter(p => 
    (!search || p.model.toLowerCase().includes(search.toLowerCase()) || p.manufacturer.toLowerCase().includes(search.toLowerCase())) &&
    (!printerManufacturerFilter || p.manufacturer === printerManufacturerFilter)
  ).sort((a, b) => {
    // Sort favorites first
    const aFav = favPrinters.includes(a.id);
    const bFav = favPrinters.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const filteredFilaments = filaments.filter(f => 
    (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.brand.toLowerCase().includes(search.toLowerCase())) &&
    (!materialFilter || f.material === materialFilter) &&
    (!brandFilter || f.brand === brandFilter)
  ).sort((a, b) => {
    const aFav = favFilaments.includes(a.id);
    const bFav = favFilaments.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const filteredProcesses = processes.filter(p => 
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    if (!slicer) return;
    const ext = getFileExtension(slicer, "");
    if (fil) download(convertFilament(fil, slicer), `filament-${fil.id.replace(/\//g, "-")}${ext}`);
    if (prt) download(convertPrinter(prt, slicer), `printer-${prt.id.replace(/\//g, "-")}${ext}`);
    if (proc) download(convertProcess(proc, slicer), `process-${proc.id.replace(/\//g, "-")}${ext}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {(["slicer", "profiles", "preview"] as Step[]).map((s, i) => (
          <button
            key={s}
            onClick={() => { if (s === "slicer" || (s === "profiles" && slicer) || (s === "preview" && slicer && hasSelection)) setStep(s); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              step === s ? "bg-accent text-white" : "bg-card text-muted border border-border hover:bg-card-hover"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">{i + 1}</span>
            {s === "slicer" ? "Choose Slicer" : s === "profiles" ? "Select Profiles" : "Preview & Download"}
          </button>
        ))}
      </div>

      {/* Step 1: Choose Slicer */}
      {step === "slicer" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slicers.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSlicer(s.id); setStep("profiles"); }}
              className={`p-6 rounded-2xl border text-left transition-all duration-300 glow-hover ${
                slicer === s.id ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-border-hover"
              }`}
            >
              <span className="text-3xl mb-3 block">{s.icon}</span>
              <h3 className="font-semibold mb-1">{s.name}</h3>
              <p className="text-xs text-muted">{s.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Profiles */}
      {step === "profiles" && slicer && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="accent">{getSlicerLabel(slicer)}</Badge>
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search profiles..."
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Material Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Material:</span>
              <select
                value={materialFilter || ""}
                onChange={(e) => setMaterialFilter(e.target.value || null)}
                className="px-2 py-1 text-xs bg-card border border-border rounded-lg focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                {materials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Brand:</span>
              <select
                value={brandFilter || ""}
                onChange={(e) => setBrandFilter(e.target.value || null)}
                className="px-2 py-1 text-xs bg-card border border-border rounded-lg focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {/* Clear Filters */}
            {(materialFilter || brandFilter || printerManufacturerFilter) && (
              <button
                onClick={() => { setMaterialFilter(null); setBrandFilter(null); setPrinterManufacturerFilter(null); }}
                className="text-xs text-accent hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Printer Manufacturer Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-muted">Manufacturer:</span>
            <button
              onClick={() => setPrinterManufacturerFilter(null)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                !printerManufacturerFilter ? "bg-accent text-white" : "bg-card border border-border hover:bg-card-hover"
              }`}
            >
              All
            </button>
            {printerManufacturers.map(m => (
              <button
                key={m}
                onClick={() => setPrinterManufacturerFilter(printerManufacturerFilter === m ? null : m)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  printerManufacturerFilter === m ? "bg-accent text-white" : "bg-card border border-border hover:bg-card-hover"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Favorites Section */}
          {favPrinters.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">⭐ Favorites - Printers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {printers.filter(p => favPrinters.includes(p.id)).map((p) => (
                  <div key={p.id} className="relative">
                    <button
                      onClick={() => setSelectedPrinter(selectedPrinter === p.id ? null : p.id)}
                      className={`w-full p-3 rounded-xl border text-left text-sm transition-colors ${
                        selectedPrinter === p.id ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-border-hover"
                      }`}
                    >
                      <div className="font-medium truncate pr-4">{p.model}</div>
                      <div className="text-xs text-muted">{p.manufacturer}</div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavPrinter(p.id); }}
                      className="absolute top-2 right-2 text-sm hover:scale-110 transition-transform"
                    >
                      ⭐
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {favFilaments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">⭐ Favorites - Filaments</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {filaments.filter(f => favFilaments.includes(f.id)).map((f) => (
                  <div key={f.id} className="relative">
                    <button
                      onClick={() => setSelectedFilament(selectedFilament === f.id ? null : f.id)}
                      className={`w-full p-3 rounded-xl border text-left text-sm transition-colors ${
                        selectedFilament === f.id ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-border-hover"
                      }`}
                    >
                      <div className="font-medium truncate pr-4">{f.name}</div>
                      <div className="text-xs text-muted">{f.material} · {f.brand}</div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavFilament(f.id); }}
                      className="absolute top-2 right-2 text-sm hover:scale-110 transition-transform"
                    >
                      ⭐
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Printer Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-3">🖨️ Printer</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2">
              {filteredPrinters.map((p) => (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => setSelectedPrinter(selectedPrinter === p.id ? null : p.id)}
                    className={`w-full p-3 rounded-xl border text-left text-sm transition-colors ${
                      selectedPrinter === p.id ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="font-medium truncate pr-4">{p.model}</div>
                    <div className="text-xs text-muted">{p.manufacturer}</div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavPrinter(p.id); }}
                    className="absolute top-2 right-2 text-sm hover:scale-110 transition-transform"
                  >
                    {favPrinters.includes(p.id) ? "⭐" : "☆"}
                  </button>
                </div>
              ))}
              {filteredPrinters.length === 0 && <p className="text-sm text-muted col-span-full">No printers match "{search}"</p>}
            </div>
          </div>

          {/* Filament Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-3">🧵 Filament</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2">
              {filteredFilaments.map((f) => (
                <div key={f.id} className="relative">
                  <button
                    onClick={() => setSelectedFilament(selectedFilament === f.id ? null : f.id)}
                    className={`w-full p-3 rounded-xl border text-left text-sm transition-colors ${
                      selectedFilament === f.id ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="font-medium truncate pr-4">{f.name}</div>
                    <div className="text-xs text-muted">{f.material} · {f.brand}</div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavFilament(f.id); }}
                    className="absolute top-2 right-2 text-sm hover:scale-110 transition-transform"
                  >
                    {favFilaments.includes(f.id) ? "⭐" : "☆"}
                  </button>
                </div>
              ))}
              {filteredFilaments.length === 0 && <p className="text-sm text-muted col-span-full">No filaments match "{search}"</p>}
            </div>
          </div>

          {/* Process Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-3">⚙️ Process</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2">
              {filteredProcesses.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProcess(selectedProcess === p.id ? null : p.id)}
                  className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                    selectedProcess === p.id ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-border-hover"
                  }`}
                >
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted">{p.intent.replace("_", " ")}</div>
                </button>
              ))}
              {filteredProcesses.length === 0 && <p className="text-sm text-muted col-span-full">No processes match "{search}"</p>}
            </div>
          </div>

          <button
            onClick={() => { if (hasSelection) setStep("preview"); }}
            disabled={!hasSelection}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hasSelection ? "bg-accent text-white hover:bg-accent-hover" : "bg-card text-muted border border-border cursor-not-allowed"
            }`}
          >
            Preview & Download →
          </button>
        </div>
      )}

      {/* Step 3: Preview & Download */}
      {step === "preview" && slicer && hasSelection && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{getSlicerLabel(slicer)}</Badge>
              <span className="text-sm text-muted">
                {[fil && "Filament", prt && "Printer", proc && "Process"].filter(Boolean).join(" + ")}
              </span>
            </div>
            <button
              onClick={downloadAll}
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors"
            >
              Download All
            </button>
          </div>

          {/* Preview Tabs */}
          <div className="flex gap-1 p-1 bg-card rounded-xl border border-border w-fit">
            {fil && <button onClick={() => setActivePreview("filament")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activePreview === "filament" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}>Filament</button>}
            {prt && <button onClick={() => setActivePreview("printer")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activePreview === "printer" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}>Printer</button>}
            {proc && <button onClick={() => setActivePreview("process")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activePreview === "process" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}>Process</button>}
          </div>

          {/* Preview Content */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-card border-b border-border flex items-center justify-between">
              <span className="text-xs font-mono text-muted">
                {activePreview === "filament" && fil ? `filament-${fil.id.replace(/\//g, "-")}${getFileExtension(slicer, "")}` :
                 activePreview === "printer" && prt ? `printer-${prt.id.replace(/\//g, "-")}${getFileExtension(slicer, "")}` :
                 activePreview === "process" && proc ? `process-${proc.id.replace(/\//g, "-")}${getFileExtension(slicer, "")}` : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const content = activePreview === "filament" && fil ? convertFilament(fil, slicer) :
                      activePreview === "printer" && prt ? convertPrinter(prt, slicer) :
                      activePreview === "process" && proc ? convertProcess(proc, slicer) : "";
                    copyToClipboard(content);
                  }}
                  className="px-3 py-1 text-xs bg-card-hover text-muted rounded-lg hover:text-foreground transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const content = activePreview === "filament" && fil ? convertFilament(fil, slicer) :
                      activePreview === "printer" && prt ? convertPrinter(prt, slicer) :
                      activePreview === "process" && proc ? convertProcess(proc, slicer) : "";
                    const name = activePreview === "filament" && fil ? `filament-${fil.id.replace(/\//g, "-")}` :
                      activePreview === "printer" && prt ? `printer-${prt.id.replace(/\//g, "-")}` :
                      activePreview === "process" && proc ? `process-${proc.id.replace(/\//g, "-")}` : "profile";
                    download(content, `${name}${getFileExtension(slicer, "")}`);
                  }}
                  className="px-3 py-1 text-xs bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-background text-xs font-mono text-muted overflow-auto max-h-[500px]">
              {activePreview === "filament" && fil ? convertFilament(fil, slicer) :
               activePreview === "printer" && prt ? convertPrinter(prt, slicer) :
               activePreview === "process" && proc ? convertProcess(proc, slicer) :
               "Select a profile to preview"}
            </pre>
          </div>

          {/* Import Instructions */}
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-3">How to Import</h3>
            {slicer === "orcaslicer" && (
              <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                <li>Open OrcaSlicer or BambuStudio</li>
                <li>Go to <strong className="text-foreground">File → Import → Import Configs</strong></li>
                <li>Select the downloaded .json files</li>
                <li>The profiles will appear in the respective dropdowns (Printer/Filament/Process)</li>
              </ol>
            )}
            {slicer === "prusaslicer" && (
              <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                <li>Open PrusaSlicer or SuperSlicer</li>
                <li>Go to <strong className="text-foreground">File → Import → Import Config</strong></li>
                <li>Select the downloaded .ini files</li>
                <li>Or copy the .ini files into your PrusaSlicer config directory</li>
              </ol>
            )}
            {slicer === "cura" && (
              <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                <li>Open UltiMaker Cura</li>
                <li>Go to <strong className="text-foreground">Preferences → Profiles → Import</strong> (for process profiles)</li>
                <li>For materials: <strong className="text-foreground">Preferences → Materials → Import</strong></li>
                <li>For printers: <strong className="text-foreground">Settings → Printers → Add Printer → Custom</strong> and set the values manually, or import the .cfg</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
