import fs from "fs";
import path from "path";

export interface FilamentProfile {
  op3d_schema: "filament";
  op3d_schema_version: string;
  profile_version?: string;
  id: string;
  maintainer: { name: string; maintainer_type: string; website?: string };
  license?: string;
  brand: string;
  name: string;
  material: string;
  color?: string;
  color_variants?: Array<{ name: string; hex?: string; Pantone?: string }>;
  diameter?: number;
  density?: number;
  nozzle: { min: number; max: number; recommended?: number };
  bed: { min: number; max: number; recommended?: number };
  fan?: { min?: number; max?: number; recommended?: number };
  drying?: { temperature?: number; duration_hours?: number };
  environment?: {
    sensitive_to_moisture?: boolean;
    enclosure_recommended?: boolean;
    max_ambient_temp?: number;
  };
  printing_speed?: { min?: number; max?: number; recommended?: number };
  volumetric_speed?: number;
  external_ids?: Record<string, string>;
  links?: Record<string, string>;
  tags?: string[];
  notes?: string;
  x_prusa_slicer?: Record<string, unknown>;
  x_cura?: Record<string, unknown>;
  x_simplify3d?: Record<string, unknown>;
  relative_overrides?: Record<string, unknown>;
}

export interface PrinterProfile {
  op3d_schema: "printer";
  op3d_schema_version: string;
  profile_version?: string;
  id: string;
  maintainer: { name: string; maintainer_type: string; website?: string };
  license?: string;
  manufacturer: string;
  model: string;
  variant?: string;
  build_volume: { x: number; y: number; z: number; shape?: string; origin?: string };
  kinematics: "cartesian" | "corexy" | "corexz" | "hybrid_corexy" | "hybrid_corexz" | "delta" | "scara" | "polar" | "belt" | "other";
  axes: {
    x: { max_speed?: number; max_accel?: number };
    y: { max_speed?: number; max_accel?: number };
    z: { max_speed?: number; max_accel?: number };
  };
  extruders: Array<{
    id: string;
    nozzle_diameter: number;
    nozzle_material?: string;
    max_temp?: number;
    min_temp?: number;
    retraction_supported?: boolean;
  }>;
  bed?: { heated?: boolean; max_temp?: number; surface_type?: string };
  chamber?: { heated?: boolean; max_temp?: number; passive?: boolean };
  firmware: { flavor: string; identifier?: string };
  network?: { has_wifi?: boolean; has_ethernet?: boolean; supports_lan_api?: boolean };
  personal_preferences?: Record<string, unknown>;
  links?: Record<string, string>;
  tags?: string[];
  notes?: string;
  x_prusa_slicer?: Record<string, unknown>;
  x_cura?: Record<string, unknown>;
  x_simplify3d?: Record<string, unknown>;
}

export interface ProcessProfile {
  op3d_schema: "process";
  op3d_schema_version: string;
  profile_version?: string;
  id: string;
  maintainer: { name: string; maintainer_type: string; website?: string };
  license?: string;
  name: string;
  intent: string;
  layer_height?: { min?: number; max?: number; default?: number };
  wall_settings?: { wall_count?: number; top_layers?: number; bottom_layers?: number };
  infill?: {
    density_default?: number;
    density_range?: { min?: number; max?: number };
    recommended_patterns?: string[];
  };
  speed?: {
    outer_wall?: number;
    inner_wall?: number;
    infill?: number;
    top_bottom?: number;
    travel?: number;
  };
  accel?: { default?: number; outer_wall?: number; infill?: number };
  retraction?: { distance?: number; speed?: number };
  cooling?: { fan_default?: number; fan_min_layer_time?: number };
  supports?: { enabled_default?: boolean; overhang_threshold?: number };
  adhesion?: { default_type?: string; brim_width?: number };
  quality_bias?: { priority?: string };
  relative_overrides?: Record<string, unknown>;
  personal_preferences?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
  x_prusa_slicer?: Record<string, unknown>;
  x_cura?: Record<string, unknown>;
  x_simplify3d?: Record<string, unknown>;
}

function readJsonFiles<T>(dir: string): T[] {
  const results: T[] = [];
  if (!fs.existsSync(dir)) return results;

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".json")) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          const parsed = JSON.parse(content);
          results.push(parsed as T);
        } catch {
          // skip invalid JSON
        }
      }
    }
  }

  walk(dir);
  return results;
}

const ROOT = path.resolve(process.cwd(), "..");

export function getFilaments(): FilamentProfile[] {
  return readJsonFiles<FilamentProfile>(path.join(ROOT, "filament"));
}

export function getPrinters(): PrinterProfile[] {
  return readJsonFiles<PrinterProfile>(path.join(ROOT, "printer"));
}

export function getProcesses(): ProcessProfile[] {
  return readJsonFiles<ProcessProfile>(path.join(ROOT, "process"));
}

export function getFilamentById(id: string): FilamentProfile | undefined {
  return getFilaments().find((f) => f.id === id);
}

export function getPrinterById(id: string): PrinterProfile | undefined {
  return getPrinters().find((p) => p.id === id);
}

export function getProcessById(id: string): ProcessProfile | undefined {
  return getProcesses().find((p) => p.id === id);
}
