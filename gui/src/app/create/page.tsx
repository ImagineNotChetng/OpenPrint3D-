"use client";
import { useState } from "react";

type ProfileType = "filament" | "printer" | "process";

const templates: Record<ProfileType, object> = {
  filament: {
    op3d_schema: "filament",
    op3d_schema_version: "0.1.0",
    profile_version: "1.0.0",
    id: "",
    maintainer: { name: "", maintainer_type: "community", website: "" },
    license: "CC0-1.0",
    brand: "",
    name: "",
    material: "PLA",
    color: "#FFFFFF",
    color_variants: [],
    diameter: 1.75,
    density: 0,
    nozzle: { min: 190, max: 240, recommended: 215 },
    bed: { min: 40, max: 60, recommended: 50 },
    fan: { min: 0, max: 100, recommended: 100 },
    drying: { temperature: 50, duration_hours: 4 },
    environment: { sensitive_to_moisture: false, enclosure_recommended: false },
    printing_speed: { min: 30, max: 80, recommended: 50 },
    volumetric_speed: 0,
    tags: [],
    notes: "",
    x_prusa_slicer: {},
    x_cura: {},
    relative_overrides: {},
  },
  printer: {
    op3d_schema: "printer",
    op3d_schema_version: "0.1.0",
    profile_version: "1.0.0",
    id: "",
    maintainer: { name: "", maintainer_type: "community", website: "" },
    license: "CC0-1.0",
    manufacturer: "",
    model: "",
    variant: "Stock",
    build_volume: { x: 220, y: 220, z: 250, shape: "rectangular", origin: "front_left" },
    kinematics: "cartesian",
    axes: { x: { max_speed: 300, max_accel: 3000 }, y: { max_speed: 300, max_accel: 3000 }, z: { max_speed: 12, max_accel: 200 } },
    extruders: [{ id: "tool0", nozzle_diameter: 0.4, nozzle_material: "brass", max_temp: 300, min_temp: 0 }],
    bed: { heated: true, max_temp: 110, surface_type: "PEI" },
    firmware: { flavor: "marlin", identifier: "" },
    personal_preferences: {},
    tags: [],
    notes: "",
    x_prusa_slicer: {},
    x_cura: {},
  },
  process: {
    op3d_schema: "process",
    op3d_schema_version: "0.1.0",
    profile_version: "1.0.0",
    id: "",
    maintainer: { name: "", maintainer_type: "community", website: "" },
    license: "CC0-1.0",
    name: "",
    intent: "standard",
    layer_height: { min: 0.12, max: 0.28, default: 0.2 },
    wall_settings: { wall_count: 3, top_layers: 4, bottom_layers: 4 },
    infill: { density_default: 20, recommended_patterns: ["grid", "gyroid"] },
    speed: { outer_wall: 30, inner_wall: 60, infill: 80, travel: 150 },
    accel: { default: 1000, outer_wall: 500, infill: 2000 },
    retraction: { distance: 5, speed: 45 },
    cooling: { fan_default: 100, fan_min_layer_time: 10 },
    supports: { enabled_default: false, overhang_threshold: 45 },
    adhesion: { default_type: "brim", brim_width: 5 },
    quality_bias: { priority: "balanced" },
    relative_overrides: {},
    personal_preferences: {},
    tags: [],
    notes: "",
    x_prusa_slicer: {},
    x_cura: {},
  },
};

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<ProfileType>("filament");
  const [json, setJson] = useState(JSON.stringify(templates.filament, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const switchTab = (tab: ProfileType) => {
    setActiveTab(tab);
    setJson(JSON.stringify(templates[tab], null, 2));
    setError(null);
  };

  const validate = () => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.op3d_schema !== activeTab) {
        setError(`op3d_schema should be "${activeTab}" but got "${parsed.op3d_schema}"`);
        return;
      }
      if (!parsed.id) { setError("id is required"); return; }
      if (!parsed.maintainer?.name) { setError("maintainer.name is required"); return; }
      setError(null);
      alert("Profile is valid! ✓");
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
    }
  };

  const download = () => {
    try {
      JSON.parse(json);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}-profile.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Fix JSON errors before downloading");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Profile</h1>
        <p className="text-muted">Start from a template, edit the JSON, validate, and download.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border mb-6 w-fit">
        {(["filament", "printer", "process"] as ProfileType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-accent text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-card border-b border-border flex items-center justify-between">
              <span className="text-xs font-mono text-muted">{activeTab}-profile.json</span>
              <div className="flex gap-2">
                <button onClick={validate} className="px-3 py-1 text-xs bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors">
                  Validate
                </button>
                <button onClick={copy} className="px-3 py-1 text-xs bg-card-hover text-muted rounded-lg hover:text-foreground transition-colors">
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={download} className="px-3 py-1 text-xs bg-card-hover text-muted rounded-lg hover:text-foreground transition-colors">
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={json}
              onChange={(e) => { setJson(e.target.value); setError(null); }}
              className="w-full h-[600px] p-4 bg-background text-sm font-mono text-foreground resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-card border-b border-border">
              <span className="text-xs font-mono text-muted">Live Preview</span>
            </div>
            <pre className="p-4 bg-background text-xs font-mono text-muted overflow-auto h-[600px]">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(json), null, 2);
                } catch {
                  return "⚠️ Invalid JSON — fix errors to see preview";
                }
              })()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
