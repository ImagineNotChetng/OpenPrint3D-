#!/usr/bin/env python3
"""
retraction_calculator.py

Calculate optimal retraction settings based on filament diameter, nozzle size,
and hotend type.

Usage:
    python tools/retraction_calculator.py --filament 1.75 --nozzle 0.4 --hotend bowden
    python tools/retraction_calculator.py --filament 2.85 --nozzle 0.6 --hotend direct
    python tools/retraction_calculator.py --format json --filament 1.75 --nozzle 0.4 --hotend direct
"""

import argparse
import json
import sys
from dataclasses import dataclass
from enum import Enum


class HotendType(Enum):
    DIRECT = "direct"
    BOWDEN = "bowden"
    VOLCANO = "volcano"
    SUPER_VOLCANO = "super_volcano"
    CHT = "cht"
    MOSQUITO = "mosquito"


HOTEND_CONFIGS = {
    HotendType.DIRECT: {
        "base_distance": 1.0,
        "distance_range": (0.5, 2.0),
        "base_speed": 40,
        "speed_range": (30, 50),
        "description": "Direct drive extruder - short path, minimal retraction needed"
    },
    HotendType.BOWDEN: {
        "base_distance": 4.5,
        "distance_range": (3.0, 7.0),
        "base_speed": 35,
        "speed_range": (25, 45),
        "description": "Bowden setup - longer path, more retraction required"
    },
    HotendType.VOLCANO: {
        "base_distance": 1.5,
        "distance_range": (1.0, 2.5),
        "base_speed": 35,
        "speed_range": (25, 45),
        "description": "Volcano hotend - longer melt zone, moderate retraction"
    },
    HotendType.SUPER_VOLCANO: {
        "base_distance": 2.0,
        "distance_range": (1.5, 3.0),
        "base_speed": 30,
        "speed_range": (20, 40),
        "description": "Super Volcano - extra long melt zone, increased retraction"
    },
    HotendType.CHT: {
        "base_distance": 1.2,
        "distance_range": (0.8, 2.0),
        "base_speed": 45,
        "speed_range": (35, 55),
        "description": "CHT (CoNozzle Heat Technology) - efficient melt, moderate settings"
    },
    HotendType.MOSQUITO: {
        "base_distance": 0.8,
        "distance_range": (0.5, 1.5),
        "base_speed": 50,
        "speed_range": (40, 60),
        "description": "Mosquito hotend - minimal retraction due to efficient design"
    }
}


@dataclass
class RetractionSettings:
    distance_mm: float
    speed_mm_per_s: int
    min_distance_mm: float
    max_distance_mm: float
    min_speed_mm_per_s: int
    max_speed_mm_per_s: int
    extra_prime_mm: float
    z_hop_mm: float
    hotend_description: str


def calculate_retraction(
    filament_diameter: float,
    nozzle_diameter: float,
    hotend_type: HotendType
) -> RetractionSettings:
    """
    Calculate optimal retraction settings based on input parameters.
    
    Factors considered:
    - Hotend type determines base retraction distance and speed
    - Filament diameter affects volume calculations
    - Nozzle diameter affects flow rate and stringing tendency
    """
    config = HOTEND_CONFIGS[hotend_type]
    
    base_distance = config["base_distance"]
    base_speed = config["base_speed"]
    min_dist, max_dist = config["distance_range"]
    min_speed, max_speed = config["speed_range"]
    
    diameter_factor = filament_diameter / 1.75
    nozzle_factor = nozzle_diameter / 0.4
    
    distance_adjustment = (diameter_factor - 1.0) * 0.5 + (nozzle_factor - 1.0) * 0.3
    distance = base_distance * (1 + distance_adjustment)
    
    distance = max(min_dist, min(max_dist, distance))
    distance = round(distance * 10) / 10
    
    if hotend_type in [HotendType.BOWDEN, HotendType.VOLCANO, HotendType.SUPER_VOLCANO]:
        speed = base_speed - (diameter_factor - 1.0) * 5
    else:
        speed = base_speed + (nozzle_factor - 1.0) * 3
    
    speed = max(min_speed, min(max_speed, speed))
    speed = int(round(speed / 5) * 5)
    
    if hotend_type == HotendType.BOWDEN:
        extra_prime = 0.0
    elif hotend_type in [HotendType.VOLCANO, HotendType.SUPER_VOLCANO]:
        extra_prime = round(distance * 0.1, 2)
    else:
        extra_prime = round(distance * 0.05, 2)
    
    if nozzle_diameter >= 0.6:
        z_hop = 0.2
    elif nozzle_diameter >= 0.4:
        z_hop = 0.15
    else:
        z_hop = 0.1
    
    return RetractionSettings(
        distance_mm=distance,
        speed_mm_per_s=speed,
        min_distance_mm=min_dist,
        max_distance_mm=max_dist,
        min_speed_mm_per_s=min_speed,
        max_speed_mm_per_s=max_speed,
        extra_prime_mm=extra_prime,
        z_hop_mm=z_hop,
        hotend_description=config["description"]
    )


def print_results(settings: RetractionSettings, format: str = "text") -> None:
    """Output retraction settings in the specified format."""
    if format == "json":
        result = {
            "retraction_distance_mm": settings.distance_mm,
            "retraction_speed_mm_s": settings.speed_mm_per_s,
            "recommended_range": {
                "distance_mm": [settings.min_distance_mm, settings.max_distance_mm],
                "speed_mm_s": [settings.min_speed_mm_per_s, settings.max_speed_mm_per_s]
            },
            "extra_prime_mm": settings.extra_prime_mm,
            "z_hop_mm": settings.z_hop_mm,
            "hotend_description": settings.hotend_description
        }
        print(json.dumps(result, indent=2))
    else:
        print(f"\n{'='*55}")
        print("RETRACTION SETTINGS")
        print(f"{'='*55}")
        print(f"\n  Retraction Distance: {settings.distance_mm} mm")
        print(f"  Retraction Speed:    {settings.speed_mm_per_s} mm/s")
        print(f"\n  Recommended Range:")
        print(f"    Distance: {settings.min_distance_mm} - {settings.max_distance_mm} mm")
        print(f"    Speed:    {settings.min_speed_mm_per_s} - {settings.max_speed_mm_per_s} mm/s")
        print(f"\n  Additional Settings:")
        print(f"    Extra Prime: {settings.extra_prime_mm} mm")
        print(f"    Z-Hop:       {settings.z_hop_mm} mm")
        print(f"\n  Hotend Info: {settings.hotend_description}")
        print(f"{'='*55}\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate optimal retraction settings for 3D printing."
    )
    parser.add_argument(
        "--filament", "-f",
        type=float,
        required=True,
        help="Filament diameter in mm (e.g., 1.75, 2.85)"
    )
    parser.add_argument(
        "--nozzle", "-n",
        type=float,
        required=True,
        help="Nozzle diameter in mm (e.g., 0.2, 0.4, 0.6, 0.8)"
    )
    parser.add_argument(
        "--hotend", "-e",
        type=str,
        required=True,
        choices=[h.value for h in HotendType],
        help="Hotend type: direct, bowden, volcano, super_volcano, cht, mosquito"
    )
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    
    args = parser.parse_args()
    
    if args.filament <= 0:
        print("[ERR] Filament diameter must be positive", file=sys.stderr)
        sys.exit(1)
    
    if args.nozzle <= 0:
        print("[ERR] Nozzle diameter must be positive", file=sys.stderr)
        sys.exit(1)
    
    try:
        hotend_type = HotendType(args.hotend.lower())
    except ValueError:
        print(f"[ERR] Invalid hotend type: {args.hotend}", file=sys.stderr)
        sys.exit(1)
    
    settings = calculate_retraction(
        filament_diameter=args.filament,
        nozzle_diameter=args.nozzle,
        hotend_type=hotend_type
    )
    
    print_results(settings, args.format)


if __name__ == "__main__":
    main()
