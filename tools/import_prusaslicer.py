#!/usr/bin/env python3
"""
import_prusaslicer.py

Import PrusaSlicer .ini profile files and convert to OpenPrint3D JSON format.

Supports:
- Printer profiles ([printer] section)
- Filament profiles ([filament] section)
- Print/process profiles ([print] section)

Usage:
    python tools/import_prusaslicer.py input.ini --output profiles/
    python tools/import_prusaslicer.py input.ini --type printer
    python tools/import_prusaslicer.py input.ini --type filament
    python tools/import_prusaslicer.py input.ini --type process
"""

import argparse
import configparser
import json
import re
import sys
from pathlib import Path
from typing import Any, Optional


PRINTER_MAPPINGS = {
    "printer_model": ("model", str),
    "printer_make": ("manufacturer", str),
    "printer_variant": ("variant", str),
    "bed_shape": ("build_volume.shape", str),
    "max_print_height": ("build_volume.z", float),
    "printable_area": ("build_volume.dimensions", str),
    "nozzle_diameter": ("extruders.0.nozzle_diameter", float),
    "min_layer_height": ("layer_height.min", float),
    "max_layer_height": ("layer_height.max", float),
    "retract_length": ("retraction.distance", float),
    "retract_speed": ("retraction.speed", float),
    "max_print_speed": ("speed.max", float),
    "machine_max_speed_x": ("axes.x.max_speed", float),
    "machine_max_speed_y": ("axes.y.max_speed", float),
    "machine_max_speed_z": ("axes.z.max_speed", float),
    "machine_max_acceleration_x": ("axes.x.max_accel", float),
    "machine_max_acceleration_y": ("axes.y.max_accel", float),
    "machine_max_acceleration_z": ("axes.z.max_accel", float),
    "printer_notes": ("notes", str),
}

FILAMENT_MAPPINGS = {
    "filament_type": ("material", str),
    "filament_vendor": ("brand", str),
    "filament_colour": ("color", str),
    "filament_diameter": ("diameter", float),
    "filament_density": ("density", float),
    "temperature": ("nozzle.recommended", float),
    "first_layer_temperature": ("nozzle.first_layer", float),
    "bed_temperature": ("bed.recommended", float),
    "first_layer_bed_temperature": ("bed.first_layer", float),
    "fan_min_speed": ("fan.min", float),
    "fan_max_speed": ("fan.max", float),
    "bridge_fan_speed": ("fan.bridge", float),
    "disable_fan_first_layers": ("fan.disable_first_layers", int),
    "min_print_speed": ("printing_speed.min", float),
    "max_print_speed": ("printing_speed.max", float),
    "filament_max_volumetric_speed": ("volumetric_speed", float),
    "filament_notes": ("notes", str),
    "filament_cost": ("cost", float),
    "filament_spool_weight": ("spool_weight", float),
}

PROCESS_MAPPINGS = {
    "layer_height": ("layer_height.default", float),
    "first_layer_height": ("layer_height.first_layer", float),
    "perimeters": ("wall_settings.wall_count", int),
    "top_solid_layers": ("wall_settings.top_layers", int),
    "bottom_solid_layers": ("wall_settings.bottom_layers", int),
    "fill_density": ("infill.density_default", float),
    "fill_pattern": ("infill.pattern", str),
    "perimeter_speed": ("speed.outer_wall", float),
    "infill_speed": ("speed.infill", float),
    "internal_infills_speed": ("speed.infill_internal", float),
    "solid_infill_speed": ("speed.solid_infill", float),
    "top_solid_infill_speed": ("speed.top_bottom", float),
    "bottom_solid_infill_speed": ("speed.top_bottom", float),
    "travel_speed": ("speed.travel", float),
    "first_layer_speed": ("speed.first_layer", float),
    "bridge_speed": ("speed.bridge", float),
    "external_perimeter_speed": ("speed.outer_wall", float),
    "retract_length": ("retraction.distance", float),
    "retract_speed": ("retraction.speed", float),
    "retract_before_travel": ("retraction.min_travel", float),
    "cooling": ("cooling.enabled", lambda v: v == "1"),
    "fan_below_layer_time": ("cooling.fan_min_layer_time", int),
    "slow_down_layer_time": ("cooling.slow_down_layer_time", int),
    "min_fan_speed": ("cooling.fan_min", float),
    "max_fan_speed": ("cooling.fan_max", float),
    "bridge_fan_speed": ("cooling.fan_bridge", float),
    "support_material": ("supports.enabled_default", lambda v: v == "1"),
    "support_material_angle": ("supports.angle", float),
    "support_material_threshold": ("supports.overhang_threshold", float),
    "support_material_pattern": ("supports.pattern", str),
    "raft_layers": ("adhesion.raft_layers", int),
    "brim_width": ("adhesion.brim_width", float),
    "skirts": ("adhesion.skirt_count", int),
    "skirt_distance": ("adhesion.skirt_distance", float),
    "notes": ("notes", str),
}

MATERIAL_MAP = {
    "pla": "PLA",
    "pet": "PETG",
    "petg": "PETG",
    "abs": "ABS",
    "asa": "ASA",
    "tpu": "TPU",
    "tpe": "TPE",
    "pa": "PA6",
    "nylon": "PA6",
    "pc": "PC",
    "pp": "PP",
    "pva": "PVA",
    "hips": "HIPS",
    "pvb": "PVB",
}

KINEMATICS_MAP = {
    "cartesian": "cartesian",
    "corexy": "corexy",
    "corexz": "corexz",
    "delta": "delta",
    "hybrid_corexy": "hybrid_corexy",
}


def parse_bool(value: str) -> bool:
    return value.lower() in ("1", "true", "yes", "on")


def parse_float_list(value: str) -> list:
    return [float(v.strip()) for v in value.split(",") if v.strip()]


def set_nested(d: dict, path: str, value: Any) -> None:
    keys = path.split(".")
    for key in keys[:-1]:
        if key.isdigit():
            key = int(key)
            if not isinstance(d, list):
                d = []
        if isinstance(key, int):
            while len(d) <= key:
                d.append({})
            d = d[key]
        else:
            if key not in d:
                d[key] = {}
            d = d[key]
    final_key = keys[-1]
    if final_key.isdigit():
        final_key = int(final_key)
    d[final_key] = value


def infer_kinematics(config: configparser.ConfigParser, section: str) -> str:
    printer_type = config.get(section, "printer_type", fallback="")
    printer_notes = config.get(section, "printer_notes", fallback="")
    
    for key, kinematic in KINEMATICS_MAP.items():
        if key in printer_type.lower() or key in printer_notes.lower():
            return kinematic
    return "cartesian"


def parse_bed_dimensions(bed_shape: str) -> dict:
    if not bed_shape:
        return {"x": 200, "y": 200}
    
    coords = re.findall(r"[-\d.]+,[-\d.]+", bed_shape)
    if coords:
        x_coords = []
        y_coords = []
        for coord in coords:
            x, y = coord.split(",")
            x_coords.append(float(x))
            y_coords.append(float(y))
        return {
            "x": max(x_coords) - min(x_coords),
            "y": max(y_coords) - min(y_coords)
        }
    return {"x": 200, "y": 200}


def normalize_material(material: str) -> str:
    mat_lower = material.lower().replace("-", "").replace("_", "")
    return MATERIAL_MAP.get(mat_lower, material.upper() if material else "PLA")


def parse_percentage(value: str) -> float:
    if "%" in value:
        return float(value.replace("%", "").strip())
    return float(value)


def convert_printer(config: configparser.ConfigParser, section: str = "printer") -> dict:
    profile = {
        "op3d_schema": "printer",
        "op3d_schema_version": "0.1.0",
        "id": "Unknown/Unknown",
        "maintainer": {
            "name": "Imported from PrusaSlicer",
            "maintainer_type": "community"
        },
        "manufacturer": "Unknown",
        "model": "Unknown",
        "variant": "Stock",
        "build_volume": {
            "x": 200,
            "y": 200,
            "z": 200,
            "shape": "rectangular",
            "origin": "front_left"
        },
        "kinematics": "cartesian",
        "axes": {
            "x": {"max_speed": 300, "max_accel": 3000},
            "y": {"max_speed": 300, "max_accel": 3000},
            "z": {"max_speed": 12, "max_accel": 500}
        },
        "extruders": [
            {
                "id": "tool0",
                "nozzle_diameter": 0.4,
                "nozzle_material": "brass",
                "max_temp": 300,
                "min_temp": 0,
                "retraction_supported": True
            }
        ],
        "bed": {
            "heated": True,
            "max_temp": 120
        },
        "chamber": {
            "heated": False,
            "passive": False
        },
        "firmware": {
            "flavor": "other"
        },
        "network": {
            "has_wifi": False,
            "has_ethernet": False,
            "supports_lan_api": False
        },
        "external_ids": {},
        "links": {},
        "tags": [],
        "notes": "",
        "x_prusaslicer": {}
    }
    
    for ps_key, (op3d_path, converter) in PRINTER_MAPPINGS.items():
        if config.has_option(section, ps_key):
            try:
                raw_value = config.get(section, ps_key)
                if callable(converter):
                    value = converter(raw_value)
                else:
                    value = converter(raw_value)
                set_nested(profile, op3d_path, value)
            except (ValueError, TypeError):
                pass
    
    bed_shape = config.get(section, "bed_shape", fallback="")
    if bed_shape:
        dims = parse_bed_dimensions(bed_shape)
        profile["build_volume"]["x"] = dims.get("x", 200)
        profile["build_volume"]["y"] = dims.get("y", 200)
    
    profile["kinematics"] = infer_kinematics(config, section)
    
    if config.has_option(section, "printer_model"):
        model = config.get(section, "printer_model")
        make = config.get(section, "printer_make", fallback="Unknown")
        profile["id"] = f"{make}/{model}".replace(" ", "-")
        if not profile.get("manufacturer") or profile["manufacturer"] == "Unknown":
            profile["manufacturer"] = make
        if not profile.get("model") or profile["model"] == "Unknown":
            profile["model"] = model
    
    raw_settings = {}
    for key in config.options(section):
        if key not in PRINTER_MAPPINGS:
            raw_settings[key] = config.get(section, key)
    if raw_settings:
        profile["x_prusaslicer"] = raw_settings
    
    return profile


def convert_filament(config: configparser.ConfigParser, section: str = "filament") -> dict:
    profile = {
        "op3d_schema": "filament",
        "op3d_schema_version": "0.1.0",
        "id": "Unknown/Unknown",
        "maintainer": {
            "name": "Imported from PrusaSlicer",
            "maintainer_type": "community"
        },
        "brand": "Unknown",
        "name": "Unknown",
        "material": "PLA",
        "diameter": 1.75,
        "nozzle": {
            "min": 180,
            "max": 250,
            "recommended": 200
        },
        "bed": {
            "min": 0,
            "max": 100,
            "recommended": 50
        },
        "fan": {
            "min": 0,
            "max": 100,
            "recommended": 100
        },
        "volumetric_speed": 8,
        "external_ids": {},
        "links": {},
        "tags": [],
        "notes": "",
        "x_prusaslicer": {}
    }
    
    for ps_key, (op3d_path, converter) in FILAMENT_MAPPINGS.items():
        if config.has_option(section, ps_key):
            try:
                raw_value = config.get(section, ps_key)
                if callable(converter):
                    value = converter(raw_value)
                else:
                    value = converter(raw_value)
                set_nested(profile, op3d_path, value)
            except (ValueError, TypeError):
                pass
    
    if config.has_option(section, "filament_type"):
        material = config.get(section, "filament_type")
        profile["material"] = normalize_material(material)
    
    if config.has_option(section, "temperature"):
        temp = float(config.get(section, "temperature"))
        profile["nozzle"]["recommended"] = temp
        profile["nozzle"]["min"] = max(150, temp - 20)
        profile["nozzle"]["max"] = min(300, temp + 20)
    
    if config.has_option(section, "bed_temperature"):
        temp = float(config.get(section, "bed_temperature"))
        profile["bed"]["recommended"] = temp
        profile["bed"]["min"] = max(0, temp - 10)
        profile["bed"]["max"] = min(150, temp + 10)
    
    if config.has_option(section, "max_fan_speed"):
        profile["fan"]["recommended"] = float(config.get(section, "max_fan_speed"))
    
    brand = config.get(section, "filament_vendor", fallback="Unknown")
    name = config.get(section, "filament_name", fallback=config.get(section, "filament_type", fallback="Unknown"))
    
    if brand and brand != "Unknown":
        profile["brand"] = brand
    if name and name != "Unknown":
        profile["name"] = name
    
    profile["id"] = f"{profile['brand']}/{profile['name']}".replace(" ", "-").replace("/", "-")
    
    raw_settings = {}
    for key in config.options(section):
        if key not in FILAMENT_MAPPINGS:
            raw_settings[key] = config.get(section, key)
    if raw_settings:
        profile["x_prusaslicer"] = raw_settings
    
    return profile


def convert_process(config: configparser.ConfigParser, section: str = "print") -> dict:
    profile = {
        "op3d_schema": "process",
        "op3d_schema_version": "0.1.0",
        "id": "Standard/Imported",
        "maintainer": {
            "name": "Imported from PrusaSlicer",
            "maintainer_type": "community"
        },
        "name": "Imported Profile",
        "intent": "standard",
        "layer_height": {
            "min": 0.05,
            "max": 0.4,
            "default": 0.2
        },
        "wall_settings": {
            "wall_count": 2,
            "top_layers": 3,
            "bottom_layers": 3
        },
        "infill": {
            "density_default": 20,
            "density_range": {"min": 0, "max": 100},
            "recommended_patterns": ["gyroid", "grid", "cubic"]
        },
        "speed": {
            "outer_wall": 30,
            "inner_wall": 60,
            "infill": 60,
            "top_bottom": 30,
            "travel": 150
        },
        "accel": {
            "default": 3000,
            "outer_wall": 1000,
            "infill": 3000
        },
        "retraction": {
            "distance": 0.8,
            "speed": 35
        },
        "cooling": {
            "fan_default": 100,
            "fan_min_layer_time": 10
        },
        "supports": {
            "enabled_default": False,
            "overhang_threshold": 45
        },
        "adhesion": {
            "default_type": "skirt",
            "brim_width": 0
        },
        "quality_bias": {
            "priority": "balanced"
        },
        "external_ids": {},
        "links": {},
        "tags": [],
        "notes": "",
        "x_prusaslicer": {}
    }
    
    for ps_key, (op3d_path, converter) in PROCESS_MAPPINGS.items():
        if config.has_option(section, ps_key):
            try:
                raw_value = config.get(section, ps_key)
                if callable(converter):
                    value = converter(raw_value)
                else:
                    value = converter(raw_value)
                set_nested(profile, op3d_path, value)
            except (ValueError, TypeError):
                pass
    
    if config.has_option(section, "layer_height"):
        layer_h = float(config.get(section, "layer_height"))
        profile["layer_height"]["default"] = layer_h
        profile["layer_height"]["min"] = max(0.05, layer_h * 0.25)
        profile["layer_height"]["max"] = min(0.4, layer_h * 2)
    
    if config.has_option(section, "fill_density"):
        fill = config.get(section, "fill_density")
        try:
            if "%" in fill:
                density = parse_percentage(fill)
            else:
                density = float(fill) * 100
            profile["infill"]["density_default"] = density
        except ValueError:
            pass
    
    if config.has_option(section, "perimeter_speed"):
        profile["speed"]["outer_wall"] = float(config.get(section, "perimeter_speed"))
    
    if config.has_option(section, "infill_speed"):
        profile["speed"]["infill"] = float(config.get(section, "infill_speed"))
    
    if config.has_option(section, "travel_speed"):
        profile["speed"]["travel"] = float(config.get(section, "travel_speed"))
    
    if config.has_option(section, "retract_length"):
        profile["retraction"]["distance"] = float(config.get(section, "retract_length"))
    
    if config.has_option(section, "retract_speed"):
        profile["retraction"]["speed"] = float(config.get(section, "retract_speed"))
    
    name = config.get(section, "name", fallback="Imported Profile")
    profile["name"] = name
    
    layer_h = profile["layer_height"]["default"]
    profile["id"] = f"Standard/{layer_h}mm-{name}".replace(" ", "-")
    
    layer_h = profile["layer_height"]["default"]
    if layer_h <= 0.1:
        profile["intent"] = "high_detail"
    elif layer_h <= 0.15:
        profile["intent"] = "quality"
    elif layer_h <= 0.25:
        profile["intent"] = "standard"
    else:
        profile["intent"] = "draft"
    
    raw_settings = {}
    for key in config.options(section):
        if key not in PROCESS_MAPPINGS:
            raw_settings[key] = config.get(section, key)
    if raw_settings:
        profile["x_prusaslicer"] = raw_settings
    
    return profile


def detect_profile_type(config: configparser.ConfigParser) -> list:
    detected = []
    if config.has_section("printer"):
        detected.append("printer")
    if config.has_section("filament"):
        detected.append("filament")
    if config.has_section("print"):
        detected.append("process")
    return detected


def load_ini_file(path: Path) -> configparser.ConfigParser:
    config = configparser.ConfigParser(interpolation=None)
    config.optionxform = str
    
    try:
        with path.open("r", encoding="utf-8") as f:
            content = f.read()
        config.read_string(content)
    except FileNotFoundError:
        print(f"[ERR] File not found: {path}", file=sys.stderr)
        sys.exit(1)
    except configparser.Error as e:
        print(f"[ERR] Invalid INI format in {path}: {e}", file=sys.stderr)
        sys.exit(1)
    
    return config


def convert_profile(config: configparser.ConfigParser, profile_type: str) -> dict:
    converters = {
        "printer": convert_printer,
        "filament": convert_filament,
        "process": convert_process
    }
    
    if profile_type not in converters:
        raise ValueError(f"Unknown profile type: {profile_type}")
    
    return converters[profile_type](config)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import PrusaSlicer .ini profiles to OpenPrint3D JSON format."
    )
    parser.add_argument(
        "input",
        type=Path,
        help="PrusaSlicer .ini file to import"
    )
    parser.add_argument(
        "--type", "-t",
        choices=["printer", "filament", "process", "auto"],
        default="auto",
        help="Profile type to import (default: auto-detect)"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output directory (default: stdout)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Import all detected profile types"
    )

    args = parser.parse_args()
    
    config = load_ini_file(args.input)
    
    if args.type == "auto":
        detected = detect_profile_type(config)
        if not detected:
            print("[ERR] No recognizable profile sections found in input file", file=sys.stderr)
            sys.exit(1)
    else:
        detected = [args.type]
    
    if not args.all and len(detected) > 1:
        print(f"[INFO] Multiple profile types detected: {', '.join(detected)}")
        print("[INFO] Use --all to export all, or --type to specify one")
        detected = [detected[0]]
    
    for profile_type in detected:
        try:
            profile = convert_profile(config, profile_type)
        except Exception as e:
            print(f"[ERR] Failed to convert {profile_type}: {e}", file=sys.stderr)
            continue
        
        if args.output:
            args.output.mkdir(parents=True, exist_ok=True)
            output_name = f"{profile_type}_{args.input.stem}.json"
            output_path = args.output / output_name
            with output_path.open("w", encoding="utf-8") as f:
                json.dump(profile, f, indent=2)
            print(f"[ OK ] Saved {profile_type}: {output_path}")
        else:
            print(f"# {profile_type.upper()} - {args.input.name}")
            print(json.dumps(profile, indent=2))
            print()


if __name__ == "__main__":
    main()
