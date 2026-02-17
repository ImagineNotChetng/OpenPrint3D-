#!/usr/bin/env python3
"""
bed_adhesion_guide.py

Generate optimal bed adhesion settings based on filament type, bed material, and enclosure status.

Usage:
    python tools/bed_adhesion_guide.py --filament PLA --bed PEI --enclosure no
    python tools/bed_adhesion_guide.py --filament ABS --bed glass --enclosure yes
    python tools/bed_adhesion_guide.py --filament PETG --bed textured --enclosure no
    python tools/bed_adhesion_guide.py --filament TPU --bed smooth --enclosure no --format json
"""

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class AdhesionSettings:
    bed_temp_initial: int
    bed_temp_initial_range: str
    first_layer_bed_temp: int
    first_layer_bed_temp_range: str
    first_layer_height: float
    first_layer_speed: float
    first_layer_speed_range: str
    nozzle_temp_initial: int
    nozzle_temp_initial_range: str
    first_layer_nozzle_temp: int
    first_layer_nozzle_temp_range: str
    cooling_fan_speed: int
    z_offset: float
    brim_width: int
    skirt_distance: float
    skirt_height: int
    adhesion_type: str
    notes: list[str]


BED_MATERIALS = {
    "pei": {
        "smooth": ["smooth PEI", "Ultem", "PEI 9085"],
        "textured": ["textured PEI", "Powder-coated PEI"]
    },
    "glass": {
        "smooth": ["glass", "mirror", "float glass"],
        "textured": ["textured glass"]
    },
    "pc": {
        "smooth": ["polycarbonate", "PC", "smooth PC"],
        "textured": ["textured PC"]
    },
    "buildtak": {
        "smooth": ["BuildTak", "Nylon"],
        "textured": []
    },
    "tape": {
        "smooth": ["Kapton", "polyimide tape"],
        "textured": ["blue tape", "painter's tape"]
    },
    "spray": {
        "smooth": [" glue stick", "hair spray", "ABS slurry"],
        "textured": []
    },
    "flex": {
        "smooth": ["Flex plate", "magnetic flexible"],
        "textured": []
    }
}


FILAMENT_DATA = {
    "PLA": {
        "nozzle_temp": 210,
        "nozzle_temp_range": "200-230",
        "bed_temp": 60,
        "bed_temp_range": "50-70",
        "fan_speed": 100,
        "characteristics": "low shrinkage, good adhesion"
    },
    "PETG": {
        "nozzle_temp": 240,
        "nozzle_temp_range": "230-260",
        "bed_temp": 80,
        "bed_temp_range": "70-90",
        "fan_speed": 50,
        "characteristics": "strong adhesion, can string"
    },
    "ABS": {
        "nozzle_temp": 250,
        "nozzle_temp_range": "240-270",
        "bed_temp": 100,
        "bed_temp_range": "90-110",
        "fan_speed": 0,
        "characteristics": "high shrinkage, needs enclosure"
    },
    "ASA": {
        "nozzle_temp": 250,
        "nozzle_temp_range": "240-270",
        "bed_temp": 100,
        "bed_temp_range": "90-110",
        "fan_speed": 0,
        "characteristics": "UV resistant, similar to ABS"
    },
    "PC": {
        "nozzle_temp": 270,
        "nozzle_temp_range": "260-290",
        "bed_temp": 110,
        "bed_temp_range": "100-130",
        "fan_speed": 0,
        "characteristics": "high temp, very strong"
    },
    "Nylon": {
        "nozzle_temp": 260,
        "nozzle_temp_range": "240-280",
        "bed_temp": 90,
        "bed_temp_range": "70-110",
        "fan_speed": 30,
        "characteristics": "high moisture absorption"
    },
    "TPU": {
        "nozzle_temp": 220,
        "nozzle_temp_range": "210-240",
        "bed_temp": 50,
        "bed_temp_range": "40-60",
        "fan_speed": 80,
        "characteristics": "flexible, slow printing"
    },
    "PVB": {
        "nozzle_temp": 215,
        "nozzle_temp_range": "205-230",
        "bed_temp": 75,
        "bed_temp_range": "65-85",
        "fan_speed": 40,
        "characteristics": "clarity possible with annealing"
    },
    "PP": {
        "nozzle_temp": 240,
        "nozzle_temp_range": "230-260",
        "bed_temp": 100,
        "bed_temp_range": "85-110",
        "fan_speed": 30,
        "characteristics": "flexible, warps easily"
    },
    "CPE": {
        "nozzle_temp": 245,
        "nozzle_temp_range": "235-255",
        "bed_temp": 75,
        "bed_temp_range": "70-85",
        "fan_speed": 30,
        "characteristics": "good chemical resistance"
    },
    "HIPS": {
        "nozzle_temp": 240,
        "nozzle_temp_range": "230-250",
        "bed_temp": 100,
        "bed_temp_range": "90-110",
        "fan_speed": 0,
        "characteristics": "soluble in limonene"
    }
}


BED_MATERIAL_ADJUSTMENTS = {
    ("smooth pei", False): {"z_offset": -0.02, "brim_width": 0},
    ("smooth pei", True): {"z_offset": -0.02, "brim_width": 0},
    ("textured pei", False): {"z_offset": 0.02, "brim_width": 3},
    ("textured pei", True): {"z_offset": 0.02, "brim_width": 3},
    ("glass", False): {"z_offset": 0, "brim_width": 5},
    ("glass", True): {"z_offset": 0, "brim_width": 5},
    ("pc", False): {"z_offset": -0.01, "brim_width": 5},
    ("pc", True): {"z_offset": -0.01, "brim_width": 5},
    ("buildtak", False): {"z_offset": -0.02, "brim_width": 3},
    ("buildtak", True): {"z_offset": -0.02, "brim_width": 3},
    ("tape", False): {"z_offset": 0, "brim_width": 5},
    ("tape", True): {"z_offset": 0, "brim_width": 5},
    ("spray", False): {"z_offset": 0.01, "brim_width": 5},
    ("spray", True): {"z_offset": 0.01, "brim_width": 5},
    ("flex", False): {"z_offset": -0.03, "brim_width": 0},
    ("flex", True): {"z_offset": -0.03, "brim_width": 0}
}


def normalize_bed_material(bed_type: str) -> str:
    """Normalize bed material input to standard format."""
    bed_type = bed_type.lower().strip()
    
    for material, variants in BED_MATERIALS.items():
        if bed_type == material:
            return material, "smooth"
        for variant in variants.get("smooth", []) + variants.get("textured", []):
            if variant in bed_type or bed_type in variant:
                texture = "textured" if variant in variants.get("textured", []) else "smooth"
                return material, texture
    
    if "textured" in bed_type or "powder" in bed_type:
        return bed_type.split()[0] if " " in bed_type else bed_type, "textured"
    return bed_type, "smooth"


def normalize_filament(filament: str) -> str:
    """Normalize filament type input."""
    filament = filament.upper().strip()
    
    mapping = {
        "PLA": "PLA",
        "POLYLACTIC": "PLA",
        "PETG": "PETG",
        "POLYETHYLENE": "PETG",
        "ABS": "ABS",
        "ASA": "ASA",
        "ACRYLONITRILE": "ABS",
        "PC": "PC",
        "POLYCARBONATE": "PC",
        "NYLON": "Nylon",
        "TPU": "TPU",
        "THERMOPOLYURETHANE": "TPU",
        "PVB": "PVB",
        "PP": "PP",
        "POLYPROPYLENE": "PP",
        "CPE": "CPE",
        "HIPS": "HIPS",
        "POLYSTYRENE": "HIPS"
    }
    
    return mapping.get(filament, filament)


def get_adhesion_settings(
    filament: str,
    bed_material: str,
    enclosure: bool
) -> AdhesionSettings:
    """Calculate optimal adhesion settings based on inputs."""
    filament = normalize_filament(filament)
    bed_material, bed_texture = normalize_bed_material(bed_material)
    
    if filament not in FILAMENT_DATA:
        raise ValueError(f"Unknown filament: {filament}. Supported: {', '.join(FILAMENT_DATA.keys())}")
    
    fil = FILAMENT_DATA[filament]
    bed_key = (f"{bed_texture} {bed_material}", enclosure)
    adjustments = BED_MATERIAL_ADJUSTMENTS.get(bed_key, {"z_offset": 0, "brim_width": 5})
    
    nozzle_temp = fil["nozzle_temp"]
    nozzle_temp_range = fil["nozzle_temp_range"]
    bed_temp = fil["bed_temp"]
    bed_temp_range = fil["bed_temp_range"]
    fan_speed = fil["fan_speed"]
    
    notes = []
    
    if filament in ["ABS", "ASA", "PC", "HIPS", "Nylon", "PP"]:
        nozzle_temp += 10
        bed_temp += 10
        if not enclosure:
            notes.append("WARNING: High warping risk. Consider using enclosure or brim/raft.")
    
    if enclosure:
        bed_temp -= 10
        nozzle_temp -= 5
        notes.append("Enclosure reduces warping, allowing slightly lower temperatures.")
    else:
        if filament in ["ABS", "ASA"]:
            notes.append("CRITICAL: Use enclosure to prevent warping and cracking.")
    
    if bed_texture == "textured":
        notes.append("Textured beds provide better adhesion for first layer.")
        fan_speed = min(fan_speed + 20, 100)
    else:
        notes.append("Smooth beds may require glue or higher temperatures.")
    
    if filament == "TPU":
        notes.append("Use slower first layer speed for better adhesion.")
        notes.append("Consider using a brim with more lines (8-10).")
    elif filament == "PETG":
        notes.append("PETG can adhere too strongly - use PEI separator or reduce temp.")
    elif filament == "Nylon":
        notes.append("Nylon absorbs moisture - dry filament before printing.")
    
    if bed_material == "tape":
        notes.append("Ensure tape is clean and without bubbles.")
        brim_width = adjustments.get("brim_width", 5)
    else:
        brim_width = adjustments.get("brim_width", 5)
    
    z_offset = adjustments.get("z_offset", 0)
    
    return AdhesionSettings(
        bed_temp_initial=bed_temp,
        bed_temp_initial_range=bed_temp_range,
        first_layer_bed_temp=bed_temp + 5,
        first_layer_bed_temp_range=bed_temp_range,
        first_layer_height=0.2,
        first_layer_speed=30.0,
        first_layer_speed_range="20-40",
        nozzle_temp_initial=nozzle_temp,
        nozzle_temp_initial_range=nozzle_temp_range,
        first_layer_nozzle_temp=nozzle_temp - 5,
        first_layer_nozzle_temp_range=nozzle_temp_range,
        cooling_fan_speed=fan_speed,
        z_offset=z_offset,
        brim_width=brim_width,
        skirt_distance=6.0,
        skirt_height=1,
        adhesion_type="Brim" if brim_width > 0 else "None",
        notes=notes
    )


def format_guide(settings: AdhesionSettings, filament: str, bed: str, enclosure: bool) -> str:
    """Format the adhesion guide as text."""
    enclosure_str = "Yes" if enclosure else "No"
    
    output = []
    output.append("=" * 60)
    output.append("BED ADHESION GUIDE")
    output.append("=" * 60)
    output.append(f"Filament: {filament}")
    output.append(f"Bed Material: {bed}")
    output.append(f"Enclosure: {enclosure_str}")
    output.append("=" * 60)
    output.append("")
    output.append("TEMPERATURE SETTINGS")
    output.append("-" * 40)
    output.append(f"Initial Bed Temperature:     {settings.bed_temp_initial}°C ({settings.bed_temp_initial_range}°C)")
    output.append(f"First Layer Bed Temp:        {settings.first_layer_bed_temp}°C ({settings.first_layer_bed_temp_range}°C)")
    output.append(f"Initial Nozzle Temperature:  {settings.nozzle_temp_initial}°C ({settings.nozzle_temp_initial_range}°C)")
    output.append(f"First Layer Nozzle Temp:     {settings.first_layer_nozzle_temp}°C ({settings.first_layer_nozzle_temp_range}°C)")
    output.append("")
    output.append("FIRST LAYER SETTINGS")
    output.append("-" * 40)
    output.append(f"First Layer Height:           {settings.first_layer_height}mm")
    output.append(f"First Layer Speed:            {settings.first_layer_speed}mm/s ({settings.first_layer_speed_range}mm/s)")
    output.append(f"Z Offset:                     {settings.z_offset:.2f}mm")
    output.append(f"Cooling Fan Speed:            {settings.cooling_fan_speed}%")
    output.append("")
    output.append("ADHESION HELPERS")
    output.append("-" * 40)
    output.append(f"Adhesion Type:                {settings.adhesion_type}")
    output.append(f"Brim Width:                   {settings.brim_width} lines")
    output.append(f"Skirt Distance:              {settings.skirt_distance}mm")
    output.append(f"Skirt Height:                 {settings.skirt_height} layer(s)")
    
    if settings.notes:
        output.append("")
        output.append("NOTES")
        output.append("-" * 40)
        for note in settings.notes:
            output.append(f"  • {note}")
    
    output.append("")
    return "\n".join(output)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate optimal bed adhesion settings for 3D printing."
    )
    parser.add_argument(
        "--filament", "-f",
        required=True,
        help="Filament type (PLA, PETG, ABS, ASA, PC, Nylon, TPU, PVB, PP, CPE, HIPS)"
    )
    parser.add_argument(
        "--bed", "-b",
        required=True,
        help="Bed material (PEI, glass, PC, BuildTak, tape, spray, flex)"
    )
    parser.add_argument(
        "--enclosure", "-e",
        required=True,
        choices=["yes", "no", "y", "n"],
        help="Whether printer has enclosure"
    )
    parser.add_argument(
        "--format", "-fo",
        choices=["text", "json", "simple"],
        default="text",
        help="Output format"
    )
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Base directory (default: project root)"
    )

    args = parser.parse_args()
    
    enclosure = args.enclosure.lower() in ["yes", "y"]
    
    try:
        settings = get_adhesion_settings(args.filament, args.bed, enclosure)
        
        if args.format == "json":
            output = {
                "input": {
                    "filament": args.filament.upper(),
                    "bed_material": args.bed.lower(),
                    "enclosure": enclosure
                },
                "temperature_settings": {
                    "bed_temp_initial": settings.bed_temp_initial,
                    "bed_temp_initial_range": settings.bed_temp_initial_range,
                    "first_layer_bed_temp": settings.first_layer_bed_temp,
                    "first_layer_bed_temp_range": settings.first_layer_bed_temp_range,
                    "nozzle_temp_initial": settings.nozzle_temp_initial,
                    "nozzle_temp_initial_range": settings.nozzle_temp_initial_range,
                    "first_layer_nozzle_temp": settings.first_layer_nozzle_temp,
                    "first_layer_nozzle_temp_range": settings.first_layer_nozzle_temp_range
                },
                "first_layer_settings": {
                    "height_mm": settings.first_layer_height,
                    "speed_mm_s": settings.first_layer_speed,
                    "speed_range": settings.first_layer_speed_range,
                    "z_offset_mm": settings.z_offset,
                    "cooling_fan_percent": settings.cooling_fan_speed
                },
                "adhesion_helpers": {
                    "type": settings.adhesion_type,
                    "brim_width_lines": settings.brim_width,
                    "skirt_distance_mm": settings.skirt_distance,
                    "skirt_height_layers": settings.skirt_height
                },
                "notes": settings.notes
            }
            print(json.dumps(output, indent=2))
        elif args.format == "simple":
            print(f"bed_temp={settings.bed_temp_initial}")
            print(f"nozzle_temp={settings.nozzle_temp_initial}")
            print(f"first_layer_height={settings.first_layer_height}")
            print(f"first_layer_speed={settings.first_layer_speed}")
            print(f"z_offset={settings.z_offset}")
            print(f"brim_width={settings.brim_width}")
            print(f"fan_speed={settings.cooling_fan_speed}")
        else:
            print(format_guide(settings, args.filament.upper(), args.bed.lower(), enclosure))
            
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
