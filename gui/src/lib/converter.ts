/**
 * OpenPrint3D → Slicer Profile Converter v3
 *
 * Generates importable profiles for:
 * - OrcaSlicer / BambuStudio (user preset JSON — File > Import > Import Configs)
 * - PrusaSlicer / SuperSlicer (.ini config — File > Import > Import Config)
 * - Cura (.cfg profile — Preferences > Profiles > Import)
 * - YAML (native OpenPrint3D format)
 * - JSON (native OpenPrint3D format)
 *
 * Based on:
 * - OrcaSlicer wiki: https://github.com/OrcaSlicer/OrcaSlicer/wiki/How-to-create-profiles
 * - OrcaSlicer user preset format (JSON with string arrays)
 * - PrusaSlicer INI config bundle format
 * - Cura 5.x .cfg quality_changes format
 */

import yaml from "js-yaml";
import type { FilamentProfile, PrinterProfile, ProcessProfile } from "./profiles";

// ═══════════════════════════════════════════════════════
// OrcaSlicer / BambuStudio — User Preset JSON
// ═══════════════════════════════════════════════════════
// OrcaSlicer stores ALL values as string arrays ["value"]
// type must be "filament", "machine", or "process"
// from: "User" for user-created presets
// compatible_printers: [] means compatible with all

export function toOrcaFilament(f: FilamentProfile): object {
  return {
    type: "filament",
    name: `${f.brand} ${f.name}`,
    from: "User",
    instantiation: "true",
    inherits: mapMaterialToOrcaParent(f.material),
    filament_id: f.id.replace(/\//g, "-"),
    filament_type: [mapMaterialToOrca(f.material)],
    filament_vendor: [f.brand],
    filament_density: [String(f.density ?? 1.24)],
    filament_diameter: [String(f.diameter ?? 1.75)],
    nozzle_temperature: [String(f.nozzle.recommended ?? Math.round((f.nozzle.min + f.nozzle.max) / 2))],
    nozzle_temperature_initial_layer: [String((f.nozzle.recommended ?? Math.round((f.nozzle.min + f.nozzle.max) / 2)) + 5)],
    nozzle_temperature_range_low: [String(f.nozzle.min)],
    nozzle_temperature_range_high: [String(f.nozzle.max)],
    bed_temperature: [String(f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2))],
    bed_temperature_initial_layer: [String((f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2)) + 5)],
    hot_plate_temp: [String(f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2))],
    hot_plate_temp_initial_layer: [String((f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2)) + 5)],
    textured_plate_temp: [String(f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2))],
    textured_plate_temp_initial_layer: [String((f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2)) + 5)],
    cool_plate_temp: [String(Math.max(0, (f.bed.recommended ?? f.bed.min) - 10))],
    cool_plate_temp_initial_layer: [String(Math.max(0, (f.bed.recommended ?? f.bed.min) - 5))],
    fan_min_speed: [String(f.fan?.min ?? 0)],
    fan_max_speed: [String(f.fan?.max ?? 100)],
    reduce_fan_stop_start_freq: ["1"],
    fan_cooling_layer_time: ["60"],
    slow_down_layer_time: ["4"],
    close_fan_the_first_x_layers: ["1"],
    filament_max_volumetric_speed: [String(f.volumetric_speed ?? 10)],
    filament_flow_ratio: ["1"],
    filament_cost: ["0"],
    filament_colour: ["#FFFFFF"],
    compatible_printers: [],
  };
}

export function toOrcaPrinter(p: PrinterProfile): object {
  const ext = p.extruders[0];
  return {
    type: "machine",
    name: `${p.manufacturer} ${p.model}`,
    from: "User",
    instantiation: "true",
    inherits: "fdm_machine_common",
    printer_model: p.model,
    printer_variant: ext?.nozzle_diameter ? String(ext.nozzle_diameter) : "0.4",
    gcode_flavor: mapFirmwareToGcode(p.firmware.flavor),
    nozzle_diameter: [String(ext?.nozzle_diameter ?? 0.4)],
    nozzle_type: ext?.nozzle_material ?? "brass",
    printable_area: [
      "0x0",
      `${p.build_volume.x}x0`,
      `${p.build_volume.x}x${p.build_volume.y}`,
      `0x${p.build_volume.y}`,
    ],
    printable_height: String(p.build_volume.z),
    bed_exclude_area: [],
    machine_max_speed_x: [String(p.axes.x.max_speed ?? 200), String(p.axes.x.max_speed ?? 200)],
    machine_max_speed_y: [String(p.axes.y.max_speed ?? 200), String(p.axes.y.max_speed ?? 200)],
    machine_max_speed_z: [String(p.axes.z.max_speed ?? 10), String(p.axes.z.max_speed ?? 10)],
    machine_max_speed_e: ["80", "80"],
    machine_max_acceleration_x: [String(p.axes.x.max_accel ?? 2000), String(p.axes.x.max_accel ?? 2000)],
    machine_max_acceleration_y: [String(p.axes.y.max_accel ?? 2000), String(p.axes.y.max_accel ?? 2000)],
    machine_max_acceleration_z: [String(p.axes.z.max_accel ?? 100), String(p.axes.z.max_accel ?? 100)],
    machine_max_acceleration_extruding: ["5000", "5000"],
    machine_max_acceleration_retracting: ["5000", "5000"],
    machine_max_jerk_x: ["8", "8"],
    machine_max_jerk_y: ["8", "8"],
    machine_max_jerk_z: ["2", "2"],
    machine_max_jerk_e: ["2.5", "2.5"],
    retract_length_toolchange: ["0"],
    retraction_length: ["0.8"],
    retraction_speed: ["40"],
    deretraction_speed: ["40"],
    retraction_minimum_travel: ["1"],
    z_hop: ["0.4"],
    z_hop_types: ["Auto Lift"],
    nozzle_temperature_range_low: [String(ext?.min_temp ?? 170)],
    nozzle_temperature_range_high: [String(ext?.max_temp ?? 260)],
    bed_custom_texture: "",
    bed_custom_model: "",
    default_filament_profile: [`Generic PLA @System`],
    default_print_profile: "0.20mm Standard",
    printer_notes: p.notes ?? "",
  };
}

export function toOrcaProcess(proc: ProcessProfile): object {
  return {
    type: "process",
    name: proc.name,
    from: "User",
    instantiation: "true",
    inherits: "fdm_process_common",
    layer_height: String(proc.layer_height?.default ?? 0.2),
    initial_layer_height: "0.2",
    wall_loops: String(proc.wall_settings?.wall_count ?? 3),
    top_shell_layers: String(proc.wall_settings?.top_layers ?? 4),
    bottom_shell_layers: String(proc.wall_settings?.bottom_layers ?? 4),
    sparse_infill_density: `${proc.infill?.density_default ?? 20}%`,
    sparse_infill_pattern: mapInfillToOrca(proc.infill?.recommended_patterns?.[0] ?? "grid"),
    outer_wall_speed: String(proc.speed?.outer_wall ?? 50),
    inner_wall_speed: String(proc.speed?.inner_wall ?? 80),
    sparse_infill_speed: String(proc.speed?.infill ?? 100),
    top_surface_speed: String(proc.speed?.top_bottom ?? 40),
    internal_solid_infill_speed: String(proc.speed?.top_bottom ?? 40),
    travel_speed: String(proc.speed?.travel ?? 150),
    initial_layer_speed: "30",
    default_acceleration: String(proc.accel?.default ?? 3000),
    outer_wall_acceleration: String(proc.accel?.outer_wall ?? 2000),
    inner_wall_acceleration: String(proc.accel?.default ?? 3000),
    sparse_infill_acceleration: String(proc.accel?.infill ?? proc.accel?.default ?? 5000),
    initial_layer_acceleration: "500",
    travel_acceleration: String(proc.accel?.default ?? 3000),
    fan_min_speed: String(proc.cooling?.fan_default ?? 100),
    fan_max_speed: String(proc.cooling?.fan_default ?? 100),
    slow_down_min_speed: "10",
    slow_down_layer_time: String(proc.cooling?.fan_min_layer_time ?? 8),
    skirt_loops: proc.adhesion?.default_type === "skirt" ? "2" : "0",
    skirt_height: "1",
    brim_type: proc.adhesion?.default_type === "brim" ? "outer_only" : "no_brim",
    brim_width: proc.adhesion?.default_type === "brim" ? String(proc.adhesion.brim_width ?? 5) : "0",
    enable_support: proc.supports?.enabled_default ? "1" : "0",
    support_type: "normal(auto)",
    support_threshold_angle: String(proc.supports?.overhang_threshold ?? 55),
    line_width: "0.42",
    initial_layer_line_width: "0.5",
    outer_wall_line_width: "0.42",
    inner_wall_line_width: "0.45",
    sparse_infill_line_width: "0.45",
    top_surface_line_width: "0.42",
    support_line_width: "0.36",
    compatible_printers: [],
    notes: proc.notes ?? "",
  };
}

// ═══════════════════════════════════════════════════════
// PrusaSlicer / SuperSlicer — INI Config Bundle
// ═══════════════════════════════════════════════════════

export function toPrusaFilament(f: FilamentProfile): string {
  const temp = f.nozzle.recommended ?? Math.round((f.nozzle.min + f.nozzle.max) / 2);
  const bedTemp = f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2);
  const lines = [
    `# generated by OpenPrint3D Converter`,
    `# source profile: ${f.id}`,
    `# import via: File > Import > Import Config`,
    ``,
    `[filament:${f.brand} ${f.name}]`,
    `filament_vendor = ${f.brand}`,
    `filament_type = ${f.material}`,
    `filament_density = ${f.density ?? 1.24}`,
    `filament_diameter = ${f.diameter ?? 1.75}`,
    `filament_colour = #FFFFFF`,
    `filament_cost = 0`,
    `temperature = ${temp}`,
    `first_layer_temperature = ${temp + 5}`,
    `bed_temperature = ${bedTemp}`,
    `first_layer_bed_temperature = ${bedTemp + 5}`,
    `min_fan_speed = ${f.fan?.min ?? 0}`,
    `max_fan_speed = ${f.fan?.max ?? 100}`,
    `bridge_fan_speed = ${f.fan?.max ?? 100}`,
    `disable_fan_first_layers = 1`,
    `fan_always_on = 1`,
    `fan_below_layer_time = 60`,
    `slowdown_below_layer_time = 15`,
    `max_volumetric_speed = ${f.volumetric_speed ?? 10}`,
    `filament_retract_length = 0.8`,
    `filament_retract_speed = 40`,
    `filament_deretract_speed = 40`,
    `filament_retract_lift = 0.4`,
    `filament_retract_before_travel = 1`,
    `filament_notes = ${(f.notes ?? "").replace(/\n/g, "\\n")}`,
    `compatible_printers =`,
    `compatible_printers_condition =`,
  ];
  return lines.join("\n");
}

export function toPrusaPrinter(p: PrinterProfile): string {
  const ext = p.extruders[0];
  const lines = [
    `# generated by OpenPrint3D Converter`,
    `# source profile: ${p.id}`,
    `# import via: File > Import > Import Config`,
    ``,
    `[printer:${p.manufacturer} ${p.model}]`,
    `printer_model = ${p.model}`,
    `printer_variant = ${ext?.nozzle_diameter ?? 0.4}`,
    `printer_vendor = ${p.manufacturer}`,
    `printer_technology = FFF`,
    `gcode_flavor = ${mapFirmwareToPrusa(p.firmware.flavor)}`,
    `bed_shape = 0x0,${p.build_volume.x}x0,${p.build_volume.x}x${p.build_volume.y},0x${p.build_volume.y}`,
    `max_print_height = ${p.build_volume.z}`,
    `nozzle_diameter = ${ext?.nozzle_diameter ?? 0.4}`,
    `machine_max_feedrate_x = ${p.axes.x.max_speed ?? 200}`,
    `machine_max_feedrate_y = ${p.axes.y.max_speed ?? 200}`,
    `machine_max_feedrate_z = ${p.axes.z.max_speed ?? 10}`,
    `machine_max_feedrate_e = 80`,
    `machine_max_acceleration_x = ${p.axes.x.max_accel ?? 2000}`,
    `machine_max_acceleration_y = ${p.axes.y.max_accel ?? 2000}`,
    `machine_max_acceleration_z = ${p.axes.z.max_accel ?? 100}`,
    `machine_max_acceleration_extruding = 5000`,
    `machine_max_acceleration_retracting = 5000`,
    `machine_max_jerk_x = 8`,
    `machine_max_jerk_y = 8`,
    `machine_max_jerk_z = 2`,
    `machine_max_jerk_e = 2.5`,
    `retract_length = 0.8`,
    `retract_speed = 40`,
    `deretract_speed = 40`,
    `retract_lift = 0.4`,
    `retract_before_travel = 1`,
    `use_relative_e_distances = 1`,
    `use_firmware_retraction = 0`,
    `default_filament_profile = Generic PLA`,
    `default_print_profile = 0.20mm Quality`,
    `printer_notes = ${(p.notes ?? "").replace(/\n/g, "\\n")}`,
  ];
  return lines.join("\n");
}

export function toPrusaProcess(proc: ProcessProfile): string {
  const lines = [
    `# generated by OpenPrint3D Converter`,
    `# source profile: ${proc.id}`,
    `# import via: File > Import > Import Config`,
    ``,
    `[print:${proc.name}]`,
    `layer_height = ${proc.layer_height?.default ?? 0.2}`,
    `first_layer_height = 0.2`,
    `perimeters = ${proc.wall_settings?.wall_count ?? 3}`,
    `top_solid_layers = ${proc.wall_settings?.top_layers ?? 4}`,
    `bottom_solid_layers = ${proc.wall_settings?.bottom_layers ?? 4}`,
    `fill_density = ${proc.infill?.density_default ?? 20}%`,
    `fill_pattern = ${mapInfillToPrusa(proc.infill?.recommended_patterns?.[0] ?? "grid")}`,
    `top_fill_pattern = monotonic`,
    `bottom_fill_pattern = monotonic`,
    `external_perimeter_speed = ${proc.speed?.outer_wall ?? 50}`,
    `perimeter_speed = ${proc.speed?.inner_wall ?? 80}`,
    `small_perimeter_speed = ${Math.round((proc.speed?.outer_wall ?? 50) * 0.6)}`,
    `infill_speed = ${proc.speed?.infill ?? 100}`,
    `solid_infill_speed = ${proc.speed?.top_bottom ?? 40}`,
    `top_solid_infill_speed = ${proc.speed?.top_bottom ?? 40}`,
    `travel_speed = ${proc.speed?.travel ?? 150}`,
    `first_layer_speed = 30`,
    `external_perimeter_extrusion_width = 0.42`,
    `perimeter_extrusion_width = 0.45`,
    `infill_extrusion_width = 0.45`,
    `solid_infill_extrusion_width = 0.42`,
    `top_infill_extrusion_width = 0.42`,
    `first_layer_extrusion_width = 0.5`,
    `default_acceleration = ${proc.accel?.default ?? 3000}`,
    `perimeter_acceleration = ${proc.accel?.outer_wall ?? 2000}`,
    `infill_acceleration = ${proc.accel?.infill ?? proc.accel?.default ?? 5000}`,
    `first_layer_acceleration = 500`,
    `travel_acceleration = ${proc.accel?.default ?? 3000}`,
    `min_fan_speed = ${proc.cooling?.fan_default ?? 100}`,
    `max_fan_speed = ${proc.cooling?.fan_default ?? 100}`,
    `bridge_fan_speed = 100`,
    `fan_below_layer_time = ${proc.cooling?.fan_min_layer_time ?? 8}`,
    `slowdown_below_layer_time = 15`,
    `skirts = ${proc.adhesion?.default_type === "skirt" ? 2 : 0}`,
    `skirt_distance = 2`,
    `skirt_height = 1`,
    `brim_width = ${proc.adhesion?.default_type === "brim" ? (proc.adhesion.brim_width ?? 5) : 0}`,
    `support_material = ${proc.supports?.enabled_default ? 1 : 0}`,
    `support_material_auto = 1`,
    `support_material_threshold = ${proc.supports?.overhang_threshold ?? 55}`,
    `support_material_pattern = rectilinear`,
    `support_material_interface_layers = 3`,
    `ensure_vertical_shell_thickness = 1`,
    `detect_thin_wall = 1`,
    `seam_position = aligned`,
    `notes = ${(proc.notes ?? "").replace(/\n/g, "\\n")}`,
    `compatible_printers =`,
    `compatible_printers_condition =`,
  ];
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════
// Cura 5.x — .cfg Profile Format
// ═══════════════════════════════════════════════════════

export function toCuraFilament(f: FilamentProfile): string {
  const temp = f.nozzle.recommended ?? Math.round((f.nozzle.min + f.nozzle.max) / 2);
  const bedTemp = f.bed.recommended ?? Math.round((f.bed.min + f.bed.max) / 2);
  const lines = [
    `[general]`,
    `name = ${f.brand} ${f.name}`,
    `version = 4`,
    `definition = fdmprinter`,
    ``,
    `[metadata]`,
    `type = material`,
    `setting_version = 22`,
    `brand = ${f.brand}`,
    `material = ${f.material.toLowerCase()}`,
    `color_name = ${f.color ?? "Generic"}`,
    `GUID = op3d-${f.id.replace(/\//g, "-").toLowerCase()}`,
    `approximate_diameter = ${Math.round(f.diameter ?? 1.75)}`,
    `description = ${f.notes ?? `${f.brand} ${f.material}`}`,
    ``,
    `[values]`,
    `material_diameter = ${f.diameter ?? 1.75}`,
    `material_density = ${f.density ?? 1.24}`,
    `default_material_print_temperature = ${temp}`,
    `material_print_temperature = ${temp}`,
    `material_print_temperature_layer_0 = ${temp + 5}`,
    `material_final_print_temperature = ${temp - 5}`,
    `material_standby_temperature = ${temp - 15}`,
    `default_material_bed_temperature = ${bedTemp}`,
    `material_bed_temperature = ${bedTemp}`,
    `material_bed_temperature_layer_0 = ${bedTemp + 5}`,
    `cool_fan_speed_min = ${f.fan?.min ?? 0}`,
    `cool_fan_speed_max = ${f.fan?.max ?? 100}`,
    `cool_fan_speed = ${f.fan?.recommended ?? f.fan?.max ?? 100}`,
    `cool_min_layer_time = 10`,
    `cool_fan_full_at_height = 0.6`,
    `retraction_enable = true`,
    `retraction_amount = 0.8`,
    `retraction_speed = 40`,
    `material_flow = 100`,
    `speed_print = 60`,
  ];
  return lines.join("\n");
}

export function toCuraPrinter(p: PrinterProfile): string {
  const ext = p.extruders[0];
  const lines = [
    `[general]`,
    `name = ${p.manufacturer} ${p.model}`,
    `version = 4`,
    `definition = fdmprinter`,
    ``,
    `[metadata]`,
    `type = machine`,
    `setting_version = 22`,
    `manufacturer = ${p.manufacturer}`,
    `visible = true`,
    ``,
    `[values]`,
    `machine_name = ${p.manufacturer} ${p.model}`,
    `machine_width = ${p.build_volume.x}`,
    `machine_depth = ${p.build_volume.y}`,
    `machine_height = ${p.build_volume.z}`,
    `machine_shape = ${p.build_volume.shape === "cylindrical" ? "elliptic" : "rectangular"}`,
    `machine_center_is_zero = ${p.build_volume.origin === "center" ? "True" : "False"}`,
    `machine_heated_bed = ${p.bed?.heated ? "True" : "False"}`,
    `machine_heated_build_volume = ${p.chamber?.heated ? "True" : "False"}`,
    `machine_nozzle_size = ${ext?.nozzle_diameter ?? 0.4}`,
    `machine_nozzle_temp_enabled = True`,
    `machine_max_feedrate_x = ${p.axes.x.max_speed ?? 200}`,
    `machine_max_feedrate_y = ${p.axes.y.max_speed ?? 200}`,
    `machine_max_feedrate_z = ${p.axes.z.max_speed ?? 10}`,
    `machine_max_feedrate_e = 80`,
    `machine_max_acceleration_x = ${p.axes.x.max_accel ?? 2000}`,
    `machine_max_acceleration_y = ${p.axes.y.max_accel ?? 2000}`,
    `machine_max_acceleration_z = ${p.axes.z.max_accel ?? 100}`,
    `machine_max_jerk_xy = 8`,
    `machine_max_jerk_z = 2`,
    `machine_max_jerk_e = 2.5`,
    `machine_gcode_flavor = ${mapFirmwareToCura(p.firmware.flavor)}`,
    `material_print_temp_prepend = True`,
    `material_bed_temp_prepend = True`,
    `machine_nozzle_heat_up_speed = 2.0`,
    `machine_nozzle_cool_down_speed = 2.0`,
  ];
  return lines.join("\n");
}

export function toCuraProcess(proc: ProcessProfile): string {
  const lines = [
    `[general]`,
    `name = ${proc.name}`,
    `version = 4`,
    `definition = fdmprinter`,
    ``,
    `[metadata]`,
    `type = quality_changes`,
    `setting_version = 22`,
    `quality_type = normal`,
    `intent_category = default`,
    ``,
    `[values]`,
    `layer_height = ${proc.layer_height?.default ?? 0.2}`,
    `layer_height_0 = 0.2`,
    `wall_line_count = ${proc.wall_settings?.wall_count ?? 3}`,
    `top_layers = ${proc.wall_settings?.top_layers ?? 4}`,
    `bottom_layers = ${proc.wall_settings?.bottom_layers ?? 4}`,
    `wall_line_width_0 = 0.42`,
    `wall_line_width_x = 0.45`,
    `infill_line_width = 0.45`,
    `infill_sparse_density = ${proc.infill?.density_default ?? 20}`,
    `infill_pattern = ${mapInfillToCura(proc.infill?.recommended_patterns?.[0] ?? "grid")}`,
    `speed_print = ${proc.speed?.outer_wall ?? 50}`,
    `speed_wall_0 = ${proc.speed?.outer_wall ?? 50}`,
    `speed_wall_x = ${proc.speed?.inner_wall ?? 80}`,
    `speed_infill = ${proc.speed?.infill ?? 100}`,
    `speed_topbottom = ${proc.speed?.top_bottom ?? 40}`,
    `speed_travel = ${proc.speed?.travel ?? 150}`,
    `speed_layer_0 = 30`,
    `acceleration_enabled = True`,
    `acceleration_print = ${proc.accel?.default ?? 3000}`,
    `acceleration_wall_0 = ${proc.accel?.outer_wall ?? 2000}`,
    `acceleration_wall_x = ${proc.accel?.default ?? 3000}`,
    `acceleration_infill = ${proc.accel?.infill ?? proc.accel?.default ?? 5000}`,
    `acceleration_layer_0 = 500`,
    `acceleration_travel = ${proc.accel?.default ?? 3000}`,
    `jerk_enabled = True`,
    `jerk_print = 8`,
    `jerk_travel = 10`,
    `cool_fan_speed_min = ${proc.cooling?.fan_default ?? 100}`,
    `cool_fan_speed_max = ${proc.cooling?.fan_default ?? 100}`,
    `cool_min_layer_time = ${proc.cooling?.fan_min_layer_time ?? 8}`,
    `cool_fan_full_at_height = 0.6`,
    `retraction_enable = True`,
    `retraction_amount = ${proc.retraction?.distance ?? 0.8}`,
    `retraction_speed = ${proc.retraction?.speed ?? 40}`,
    `retraction_min_travel = 1`,
    `retract_at_layer_change = False`,
    `adhesion_type = ${mapAdhesionToCura(proc.adhesion?.default_type)}`,
    `brim_width = ${proc.adhesion?.default_type === "brim" ? (proc.adhesion.brim_width ?? 5) : 0}`,
    `skirt_line_count = ${proc.adhesion?.default_type === "skirt" ? 2 : 0}`,
    `support_enable = ${proc.supports?.enabled_default ? "True" : "False"}`,
    `support_angle = ${proc.supports?.overhang_threshold ?? 55}`,
    `support_type = everywhere`,
    `support_pattern = zigzag`,
    `z_seam_type = sharpest_corner`,
    `fill_outline_gaps = True`,
  ];
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════
// Mapping Helpers
// ═══════════════════════════════════════════════════════

function mapMaterialToOrca(material: string): string {
  const map: Record<string, string> = {
    PLA: "PLA", PETG: "PETG", ABS: "ABS", ASA: "ASA", TPU: "TPU",
    "PA-CF": "PA-CF", PA: "PA", PC: "PC", PVA: "PVA", HIPS: "HIPS",
    PP: "PP", PET: "PET",
  };
  return map[material] ?? material;
}

function mapMaterialToOrcaParent(material: string): string {
  const map: Record<string, string> = {
    PLA: "fdm_filament_pla", PETG: "fdm_filament_pet", ABS: "fdm_filament_abs",
    ASA: "fdm_filament_asa", TPU: "fdm_filament_tpu", "PA-CF": "fdm_filament_pa",
    PA: "fdm_filament_pa", PC: "fdm_filament_pc", PVA: "fdm_filament_pva",
    HIPS: "fdm_filament_hips",
  };
  return map[material] ?? "fdm_filament_common";
}

function mapFirmwareToGcode(flavor: string): string {
  const map: Record<string, string> = {
    marlin: "marlin2", klipper: "klipper", reprap: "reprapfirmware",
    bambu: "marlin2", proprietary: "marlin2", other: "marlin2",
  };
  return map[flavor] ?? "marlin2";
}

function mapFirmwareToPrusa(flavor: string): string {
  const map: Record<string, string> = {
    marlin: "marlin2", klipper: "klipper", reprap: "reprapfirmware",
    bambu: "marlin2", proprietary: "marlin2", other: "marlin2",
  };
  return map[flavor] ?? "marlin2";
}

function mapFirmwareToCura(flavor: string): string {
  const map: Record<string, string> = {
    marlin: "RepRap (Marlin/Sprinter)", klipper: "RepRap (Marlin/Sprinter)",
    reprap: "RepRap (RepRap)", bambu: "RepRap (Marlin/Sprinter)",
    proprietary: "RepRap (Marlin/Sprinter)", other: "RepRap (Marlin/Sprinter)",
  };
  return map[flavor] ?? "RepRap (Marlin/Sprinter)";
}

function mapInfillToOrca(pattern: string): string {
  const map: Record<string, string> = {
    gyroid: "gyroid", grid: "grid", cubic: "cubic", lines: "line",
    triangles: "triangles", honeycomb: "honeycomb",
  };
  return map[pattern] ?? "grid";
}

function mapInfillToPrusa(pattern: string): string {
  const map: Record<string, string> = {
    gyroid: "gyroid", grid: "grid", cubic: "cubic", lines: "rectilinear",
    triangles: "triangles", honeycomb: "honeycomb",
  };
  return map[pattern] ?? "grid";
}

function mapInfillToCura(pattern: string): string {
  const map: Record<string, string> = {
    gyroid: "gyroid", grid: "grid", cubic: "cubic", lines: "lines",
    triangles: "triangles", honeycomb: "tetrahedral",
  };
  return map[pattern] ?? "grid";
}

function mapAdhesionToCura(type?: string): string {
  const map: Record<string, string> = { none: "none", brim: "brim", raft: "raft", skirt: "skirt" };
  return map[type ?? "skirt"] ?? "skirt";
}

// ═══════════════════════════════════════════════════════
// YAML Export - OpenPrint3D Native Format
// ═══════════════════════════════════════════════════════

export function toYaml(obj: unknown): string {
  return yaml.dump(obj, {
    default_flow_style: false,
    sort_keys: false,
    allow_unicode: true,
    indent: 2,
  });
}

export function toJsonString(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// ═══════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════

export type SlicerTarget = "orcaslicer" | "prusaslicer" | "cura";
export type FormatTarget = "orcaslicer" | "prusaslicer" | "cura" | "yaml" | "json";

export function getFileExtension(format: FormatTarget, _profileType: string): string {
  if (format === "orcaslicer") return ".json";
  if (format === "prusaslicer") return ".ini";
  if (format === "cura") return ".cfg";
  if (format === "yaml") return ".yaml";
  if (format === "json") return ".json";
  return ".txt";
}

export function getFormatLabel(format: FormatTarget): string {
  const labels: Record<FormatTarget, string> = {
    orcaslicer: "OrcaSlicer / BambuStudio",
    prusaslicer: "PrusaSlicer / SuperSlicer",
    cura: "UltiMaker Cura 5.x",
    yaml: "YAML (OpenPrint3D)",
    json: "JSON (OpenPrint3D)",
  };
  return labels[format];
}

export function getAllFormats(): { id: FormatTarget; name: string; desc: string; icon: string }[] {
  return [
    { id: "yaml", name: "YAML", desc: "OpenPrint3D native YAML format — human-readable", icon: "📄" },
    { id: "json", name: "JSON", desc: "OpenPrint3D native JSON format", icon: "📋" },
    { id: "orcaslicer", name: "OrcaSlicer / BambuStudio", desc: "JSON format — compatible with OrcaSlicer, BambuStudio", icon: "🦈" },
    { id: "prusaslicer", name: "PrusaSlicer / SuperSlicer", desc: "INI config bundle format", icon: "🔶" },
    { id: "cura", name: "UltiMaker Cura", desc: "CFG profile format for Cura 5.x+", icon: "⬡" },
  ];
}

export function convertFilament(f: FilamentProfile, format: FormatTarget): string {
  switch (format) {
    case "yaml": return toYaml(f);
    case "json": return toJsonString(f);
    case "orcaslicer": return JSON.stringify(toOrcaFilament(f), null, 2);
    case "prusaslicer": return toPrusaFilament(f);
    case "cura": return toCuraFilament(f);
  }
}

export function convertPrinter(p: PrinterProfile, format: FormatTarget): string {
  switch (format) {
    case "yaml": return toYaml(p);
    case "json": return toJsonString(p);
    case "orcaslicer": return JSON.stringify(toOrcaPrinter(p), null, 2);
    case "prusaslicer": return toPrusaPrinter(p);
    case "cura": return toCuraPrinter(p);
  }
}

export function convertProcess(proc: ProcessProfile, format: FormatTarget): string {
  switch (format) {
    case "yaml": return toYaml(proc);
    case "json": return toJsonString(proc);
    case "orcaslicer": return JSON.stringify(toOrcaProcess(proc), null, 2);
    case "prusaslicer": return toPrusaProcess(proc);
    case "cura": return toCuraProcess(proc);
  }
}
