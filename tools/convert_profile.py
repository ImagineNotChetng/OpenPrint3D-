#!/usr/bin/env python3
"""
convert_profile.py

Convert OpenPrint3D profiles to various slicer formats.

Supports:
- Cura
- PrusaSlicer
- OrcaSlicer
- Bambu Studio

Usage:
    python tools/convert_profile.py --slicer cura filament/Hatchbox/PLA.json
    python tools/convert_profile.py --slicer prusaslicer printer/BambuLab/X1-Carbon.json
    python tools/convert_profile.py --slicer orca printer/Creality/Ender-3-S1-Pro.json --output output/
"""

import argparse
import json
import sys
from pathlib import Path


def load_profile(path: Path) -> dict:
    """Load a JSON profile file."""
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[ERR] File not found: {path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[ERR] Invalid JSON in {path}: {e}", file=sys.stderr)
        sys.exit(1)


def convert_to_cura(profile: dict) -> dict:
    """Convert OpenPrint3D profile to Cura format."""
    schema = profile.get("op3d_schema", "")
    result = {}
    
    if schema == "filament":
        # Extract Cura-specific settings
        x_cura = profile.get("x_cura", {})
        if x_cura:
            result = x_cura
        else:
            # Generate from standard fields
            nozzle = profile.get("nozzle", {})
            bed = profile.get("bed", {})
            fan = profile.get("fan", {})
            result = {
                "material": profile.get("material", "pla").lower(),
                "print_temperature": nozzle.get("recommended", 200),
                "print_temperature_layer_0": nozzle.get("min", 180),
                "bed_temperature": bed.get("recommended", 50),
                "bed_temperature_layer_0": bed.get("min", 40),
                "fan_speed": fan.get("recommended", 100),
                "fan_speed_layer_0": 0,
                "cooling": "enabled"
            }
    elif schema == "printer":
        x_cura = profile.get("x_cura", {})
        if x_cura:
            result = x_cura.get("definition_changes", {})
        else:
            bv = profile.get("build_volume", {})
            result = {
                "machine_width": bv.get("x", 200),
                "machine_depth": bv.get("y", 200),
                "machine_height": bv.get("z", 200),
                "nozzle_size": 0.4,
                "heated_bed": profile.get("bed", {}).get("heated", True)
            }
    
    return result


def convert_to_prusaslicer(profile: dict) -> dict:
    """Convert OpenPrint3D profile to PrusaSlicer format."""
    schema = profile.get("op3d_schema", "")
    result = {}
    
    if schema == "filament":
        x_ps = profile.get("x_prusaslicer", {})
        if x_ps:
            result = x_ps
        else:
            nozzle = profile.get("nozzle", {})
            bed = profile.get("bed", {})
            fan = profile.get("fan", {})
            result = {
                "filament_type": profile.get("material", "PLA"),
                "temperature": nozzle.get("recommended", 200),
                "bed_temperature": bed.get("recommended", 50),
                "fan_speed": fan.get("recommended", 100)
            }
    elif schema == "printer":
        x_ps = profile.get("x_prusaslicer", {})
        if x_ps:
            result = x_ps
        else:
            bv = profile.get("build_volume", {})
            extruder = profile.get("extruders", [{}])[0]
            result = {
                "printer_model": f"{profile.get('manufacturer', '')} {profile.get('model', '')}",
                "vendor": profile.get("manufacturer", "Unknown"),
                "filament_diameter": 1.75,
                "nozzle_diameter": extruder.get("nozzle_diameter", 0.4),
                "bed_shape": bv.get("shape", "rectangular"),
                "bed_size": f"{bv.get('x', 200)}x{bv.get('y', 200)}",
                "print_height": bv.get("z", 200)
            }
    
    return result


def convert_to_orca(profile: dict) -> dict:
    """Convert OpenPrint3D profile to OrcaSlicer format."""
    schema = profile.get("op3d_schema", "")
    result = {}
    
    if schema == "filament":
        x_orca = profile.get("x_orca", {})
        if x_orca:
            result = x_orca
        else:
            nozzle = profile.get("nozzle", {})
            bed = profile.get("bed", {})
            fan = profile.get("fan", {})
            result = {
                "filament_type": profile.get("material", "PLA"),
                "nozzle_temperature": nozzle.get("recommended", 200),
                "nozzle_temperature_initial_layer": nozzle.get("min", 180),
                "bed_temperature": bed.get("recommended", 50),
                "bed_temperature_initial_layer": bed.get("min", 40),
                "fan_speed": fan.get("recommended", 100),
                "fan_speed_initial_layer": 0
            }
    elif schema == "printer":
        x_orca = profile.get("x_orca", {})
        if x_orca:
            result = x_orca
        else:
            bv = profile.get("build_volume", {})
            extruder = profile.get("extruders", [{}])[0]
            result = {
                "machine_name": f"{profile.get('manufacturer', '')} {profile.get('model', '')}",
                "machine_manufacturer": profile.get("manufacturer", "Unknown"),
                "bed_x": bv.get("x", 200),
                "bed_y": bv.get("y", 200),
                "height": bv.get("z", 200),
                "nozzle_diameter": extruder.get("nozzle_diameter", 0.4),
                "filament_diameter": 1.75
            }
    
    return result


def convert_to_bambu(profile: dict) -> dict:
    """Convert OpenPrint3D profile to Bambu Studio format."""
    schema = profile.get("op3d_schema", "")
    result = {}
    
    if schema == "filament":
        x_bambu = profile.get("x_bambu", {})
        if x_bambu:
            result = x_bambu
        else:
            nozzle = profile.get("nozzle", {})
            bed = profile.get("bed", {})
            fan = profile.get("fan", {})
            result = {
                "filament_type_id": f"G{profile.get('material', 'PLA')[:4]}00",
                "drying_temperature": 55,
                "drying_time": 4,
                "nozzle_temperature": [nozzle.get("min", 190), nozzle.get("max", 230)],
                "bed_temperature": [bed.get("min", 40), bed.get("max", 60)],
                "fan_speed": [fan.get("min", 50), fan.get("max", 100)]
            }
    elif schema == "printer":
        x_bambu = profile.get("x_bambu", {})
        if x_bambu:
            result = x_bambu
        else:
            result = {
                "product_id": f"{profile.get('manufacturer', '').lower()}_{profile.get('model', '').lower().replace('-', '').replace(' ', '')}_00",
                "series": profile.get("model", "Unknown"),
                "support_lidar": False,
                "support_ams": False,
                "support_ams_lite": False
            }
    
    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert OpenPrint3D profiles to various slicer formats."
    )
    parser.add_argument(
        "--slicer",
        choices=["cura", "prusaslicer", "orca", "bambu"],
        required=True,
        help="Target slicer format"
    )
    parser.add_argument(
        "profiles",
        type=Path,
        nargs="+",
        help="One or more profile files to convert."
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output directory (default: stdout)"
    )

    args = parser.parse_args()

    converters = {
        "cura": convert_to_cura,
        "prusaslicer": convert_to_prusaslicer,
        "orca": convert_to_orca,
        "bambu": convert_to_bambu
    }

    converter = converters[args.slicer]

    for profile_path in args.profiles:
        profile = load_profile(profile_path)
        converted = converter(profile)
        
        if args.output:
            # Save to output directory
            args.output.mkdir(parents=True, exist_ok=True)
            output_name = f"{profile_path.stem}_{args.slicer}.json"
            output_path = args.output / output_name
            with output_path.open("w", encoding="utf-8") as f:
                json.dump(converted, f, indent=2)
            print(f"[ OK ] Saved: {output_path}")
        else:
            # Print to stdout
            print(f"# {args.slicer.upper()} - {profile_path.name}")
            print(json.dumps(converted, indent=2))
            print()


if __name__ == "__main__":
    main()
