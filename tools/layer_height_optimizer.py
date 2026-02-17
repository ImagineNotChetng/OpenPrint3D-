#!/usr/bin/env python3
"""
layer_height_optimizer.py

Calculate optimal layer height based on nozzle diameter, print quality needs,
and print time constraints.

Usage:
    python tools/layer_height_optimizer.py --nozzle 0.4 --quality standard
    python tools/layer_height_optimizer.py --nozzle 0.6 --quality draft --time-factor 0.5
    python tools/layer_height_optimizer.py --nozzle 0.25 --quality high --format json
    python tools/layer_height_optimizer.py --nozzle 0.4 --quality standard --lead-screw 8
"""

import argparse
import json
import sys
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class QualityLevel(Enum):
    DRAFT = "draft"
    STANDARD = "standard"
    HIGH = "high"
    ULTRA = "ultra"


QUALITY_CONFIGS = {
    QualityLevel.DRAFT: {
        "layer_height_ratio": 0.75,
        "description": "Fast prints with visible layer lines. Good for prototypes and functional parts where appearance is not critical.",
        "speed_multiplier": 1.5,
        "typical_use": "Prototypes, functional parts, quick iterations"
    },
    QualityLevel.STANDARD: {
        "layer_height_ratio": 0.50,
        "description": "Balanced quality and speed. Good for most everyday prints.",
        "speed_multiplier": 1.0,
        "typical_use": "General purpose prints, decorative objects"
    },
    QualityLevel.HIGH: {
        "layer_height_ratio": 0.35,
        "description": "High quality with minimal visible layer lines. Good for display pieces.",
        "speed_multiplier": 0.75,
        "typical_use": "Display models, miniatures, detailed parts"
    },
    QualityLevel.ULTRA: {
        "layer_height_ratio": 0.25,
        "description": "Maximum quality, very slow prints. Minimal layer visibility.",
        "speed_multiplier": 0.5,
        "typical_use": "Photography subjects, master patterns, presentation models"
    }
}

NOZZLE_DATA = {
    0.2: {"min_layer": 0.05, "max_layer": 0.15, "typical_first_layer": 0.15},
    0.25: {"min_layer": 0.06, "max_layer": 0.18, "typical_first_layer": 0.18},
    0.3: {"min_layer": 0.08, "max_layer": 0.22, "typical_first_layer": 0.2},
    0.35: {"min_layer": 0.09, "max_layer": 0.26, "typical_first_layer": 0.22},
    0.4: {"min_layer": 0.1, "max_layer": 0.30, "typical_first_layer": 0.25},
    0.5: {"min_layer": 0.12, "max_layer": 0.38, "typical_first_layer": 0.28},
    0.6: {"min_layer": 0.15, "max_layer": 0.45, "typical_first_layer": 0.30},
    0.8: {"min_layer": 0.2, "max_layer": 0.60, "typical_first_layer": 0.35},
    1.0: {"min_layer": 0.25, "max_layer": 0.75, "typical_first_layer": 0.40}
}

Z_STEP_RECOMMENDATIONS = {
    2: [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40],
    4: [0.04, 0.08, 0.12, 0.16, 0.20, 0.24, 0.28, 0.32, 0.36, 0.40],
    8: [0.04, 0.08, 0.12, 0.16, 0.20, 0.24, 0.28, 0.32, 0.36, 0.40],
    12: [0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48]
}


@dataclass
class LayerHeightResult:
    optimal_layer_height: float
    quality_level: str
    nozzle_diameter: float
    layer_height_range: tuple[float, float]
    first_layer_height: float
    recommended_step_layers: list[float]
    time_estimate_factor: float
    print_speed_recommendation: int
    top_bottom_layers: int
    wall_layers: int
    infill_density_recommendation: int
    notes: list[str]


def round_to_step(value: float, step: float = 0.01) -> float:
    """Round value to nearest step increment."""
    return round(value / step) * step


def find_nearest_magic_height(target: float, lead_screw_pitch: int) -> float:
    """Find the nearest 'magic' layer height for smoother Z movement."""
    if lead_screw_pitch not in Z_STEP_RECOMMENDATIONS:
        return target
    
    magic_heights = Z_STEP_RECOMMENDATIONS[lead_screw_pitch]
    nearest = min(magic_heights, key=lambda x: abs(x - target))
    
    if abs(nearest - target) <= 0.02:
        return nearest
    return target


def calculate_layer_height(
    nozzle_diameter: float,
    quality: QualityLevel,
    time_factor: Optional[float] = None,
    lead_screw_pitch: int = 8
) -> LayerHeightResult:
    """
    Calculate optimal layer height based on input parameters.
    
    Factors considered:
    - Nozzle diameter determines min/max layer height range
    - Quality level affects layer height ratio
    - Time factor can adjust layer height for faster/slower prints
    - Lead screw pitch affects 'magic' layer heights for smoother movement
    """
    nozzle_data = NOZZLE_DATA.get(nozzle_diameter)
    if not nozzle_data:
        closest_nozzle = min(NOZZLE_DATA.keys(), key=lambda x: abs(x - nozzle_diameter))
        nozzle_data = NOZZLE_DATA[closest_nozzle]
    
    quality_config = QUALITY_CONFIGS[quality]
    
    base_ratio = quality_config["layer_height_ratio"]
    
    if time_factor is not None:
        if time_factor < 0.5:
            base_ratio = min(0.80, base_ratio + 0.20)
        elif time_factor < 0.8:
            base_ratio = min(0.70, base_ratio + 0.10)
        elif time_factor > 1.5:
            base_ratio = max(0.20, base_ratio - 0.10)
        elif time_factor > 2.0:
            base_ratio = max(0.15, base_ratio - 0.20)
    
    target_height = round_to_step(nozzle_diameter * base_ratio)
    
    min_layer = nozzle_data["min_layer"]
    max_layer = nozzle_data["max_layer"]
    
    target_height = max(min_layer, min(max_layer, target_height))
    
    optimal_height = find_nearest_magic_height(target_height, lead_screw_pitch)
    optimal_height = max(min_layer, min(max_layer, optimal_height))
    
    first_layer_height = nozzle_data["typical_first_layer"]
    first_layer_height = max(first_layer_height, optimal_height * 1.2)
    
    magic_heights = Z_STEP_RECOMMENDATIONS.get(lead_screw_pitch, [])
    recommended_steps = [h for h in magic_heights if min_layer <= h <= max_layer]
    if not recommended_steps:
        recommended_steps = [
            round_to_step(min_layer),
            round_to_step((min_layer + max_layer) / 2),
            round_to_step(max_layer)
        ]
    
    base_speed = 50
    speed_multiplier = quality_config["speed_multiplier"]
    if time_factor and time_factor < 1.0:
        speed_multiplier *= (1 + (1 - time_factor) * 0.3)
    print_speed = int(base_speed * speed_multiplier)
    print_speed = max(20, min(100, print_speed))
    
    if quality == QualityLevel.ULTRA:
        top_bottom_layers = 6
        wall_layers = 3
        infill = 20
    elif quality == QualityLevel.HIGH:
        top_bottom_layers = 5
        wall_layers = 3
        infill = 15
    elif quality == QualityLevel.STANDARD:
        top_bottom_layers = 4
        wall_layers = 2
        infill = 15
    else:
        top_bottom_layers = 3
        wall_layers = 2
        infill = 10
    
    notes = []
    notes.append(f"Quality preset: {quality_config['description']}")
    notes.append(f"Typical use: {quality_config['typical_use']}")
    
    if time_factor is not None:
        if time_factor < 0.8:
            notes.append(f"Time optimization active: Reduced quality for faster printing ({time_factor:.1f}x speed goal)")
        elif time_factor > 1.2:
            notes.append(f"Quality boost active: Increased quality for slower printing ({time_factor:.1f}x time allowed)")
    
    if optimal_height != target_height:
        notes.append(f"Adjusted to 'magic' layer height for smoother Z movement (lead screw pitch: {lead_screw_pitch}mm)")
    
    if optimal_height > nozzle_diameter * 0.75:
        notes.append("WARNING: Layer height is at maximum recommended ratio. May cause poor layer adhesion.")
    elif optimal_height < nozzle_diameter * 0.20:
        notes.append("Layer height is very low. Print time will be significantly increased.")
    
    return LayerHeightResult(
        optimal_layer_height=optimal_height,
        quality_level=quality.value,
        nozzle_diameter=nozzle_diameter,
        layer_height_range=(min_layer, max_layer),
        first_layer_height=round_to_step(first_layer_height),
        recommended_step_layers=recommended_steps,
        time_estimate_factor=1 / base_ratio,
        print_speed_recommendation=print_speed,
        top_bottom_layers=top_bottom_layers,
        wall_layers=wall_layers,
        infill_density_recommendation=infill,
        notes=notes
    )


def print_results(result: LayerHeightResult, format_type: str = "text") -> None:
    """Output layer height optimization results."""
    if format_type == "json":
        output = {
            "optimal_layer_height_mm": result.optimal_layer_height,
            "quality_level": result.quality_level,
            "nozzle_diameter_mm": result.nozzle_diameter,
            "layer_height_range_mm": list(result.layer_height_range),
            "first_layer_height_mm": result.first_layer_height,
            "recommended_layer_heights": result.recommended_step_layers,
            "time_estimate_factor": round(result.time_estimate_factor, 2),
            "print_speed_recommendation_mm_s": result.print_speed_recommendation,
            "top_bottom_layers": result.top_bottom_layers,
            "wall_layers": result.wall_layers,
            "infill_density_percent": result.infill_density_recommendation,
            "notes": result.notes
        }
        print(json.dumps(output, indent=2))
    else:
        print(f"\n{'='*60}")
        print("LAYER HEIGHT OPTIMIZATION")
        print(f"{'='*60}")
        print(f"\n  Nozzle Diameter:     {result.nozzle_diameter} mm")
        print(f"  Quality Level:       {result.quality_level.upper()}")
        print(f"\n  OPTIMAL SETTINGS")
        print(f"  {'-'*40}")
        print(f"  Layer Height:        {result.optimal_layer_height} mm")
        print(f"  First Layer Height:  {result.first_layer_height} mm")
        print(f"  Valid Range:         {result.layer_height_range[0]} - {result.layer_height_range[1]} mm")
        print(f"\n  PRINT SETTINGS")
        print(f"  {'-'*40}")
        print(f"  Print Speed:         {result.print_speed_recommendation} mm/s")
        print(f"  Top/Bottom Layers:   {result.top_bottom_layers}")
        print(f"  Wall Layers:         {result.wall_layers}")
        print(f"  Infill Density:      {result.infill_density_recommendation}%")
        print(f"\n  TIME ESTIMATE")
        print(f"  {'-'*40}")
        print(f"  Time Factor:         {result.time_estimate_factor:.2f}x")
        print(f"  (Higher = longer print time)")
        print(f"\n  RECOMMENDED LAYER HEIGHTS FOR Z-STEPPING")
        print(f"  {'-'*40}")
        heights_str = ", ".join(f"{h:.2f}" for h in result.recommended_step_layers)
        print(f"  {heights_str} mm")
        print(f"\n  NOTES")
        print(f"  {'-'*40}")
        for note in result.notes:
            print(f"  • {note}")
        print(f"{'='*60}\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate optimal layer height for 3D printing."
    )
    parser.add_argument(
        "--nozzle", "-n",
        type=float,
        required=True,
        help="Nozzle diameter in mm (e.g., 0.2, 0.4, 0.6, 0.8)"
    )
    parser.add_argument(
        "--quality", "-q",
        type=str,
        required=True,
        choices=[q.value for q in QualityLevel],
        help="Print quality level: draft, standard, high, ultra"
    )
    parser.add_argument(
        "--time-factor", "-t",
        type=float,
        default=None,
        help="Time factor (0.5=fast, 1.0=normal, 2.0=quality focus). Adjusts layer height for time constraints."
    )
    parser.add_argument(
        "--lead-screw", "-l",
        type=int,
        default=8,
        choices=[2, 4, 8, 12],
        help="Lead screw pitch in mm for Z-axis. Affects 'magic' layer heights. Default: 8"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    
    args = parser.parse_args()
    
    if args.nozzle <= 0:
        print("[ERR] Nozzle diameter must be positive", file=sys.stderr)
        sys.exit(1)
    
    if args.time_factor is not None and args.time_factor <= 0:
        print("[ERR] Time factor must be positive", file=sys.stderr)
        sys.exit(1)
    
    try:
        quality = QualityLevel(args.quality.lower())
    except ValueError:
        print(f"[ERR] Invalid quality level: {args.quality}", file=sys.stderr)
        sys.exit(1)
    
    result = calculate_layer_height(
        nozzle_diameter=args.nozzle,
        quality=quality,
        time_factor=args.time_factor,
        lead_screw_pitch=args.lead_screw
    )
    
    print_results(result, args.format)


if __name__ == "__main__":
    main()
