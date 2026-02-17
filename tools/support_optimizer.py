#!/usr/bin/env python3
"""
support_optimizer.py

Suggest optimal support settings based on overhang angle, layer height, and material.

Usage:
    python tools/support_optimizer.py --angle 60 --layer-height 0.2 --material PLA
    python tools/support_optimizer.py --angle 45 --layer-height 0.12 --material ABS --format json
    python tools/support_optimizer.py --angle 70 --layer-height 0.28 --material PETG --density high
"""

import argparse
import json
import sys
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Material(Enum):
    PLA = "PLA"
    ABS = "ABS"
    PETG = "PETG"
    TPU = "TPU"
    ASA = "ASA"
    PC = "PC"
    PP = "PP"
    NYLON = "NYLON"


class DensityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


MATERIAL_PROPERTIES = {
    Material.PLA: {
        "adhesion": "excellent",
        "support_adhesion": 1.0,
        "recommended_angle_threshold": 45,
        "support_density_range": (10, 25),
        "default_support_density": 15,
        "support_material_bridge": 1.0,
        "temp_range": (190, 220),
        "bed_temp": 60,
        "notes": "PLA has excellent adhesion to most support materials. Lower angles need support."
    },
    Material.ABS: {
        "adhesion": "moderate",
        "support_adhesion": 0.85,
        "recommended_angle_threshold": 50,
        "support_density_range": (15, 30),
        "default_support_density": 20,
        "support_material_bridge": 0.9,
        "temp_range": (230, 250),
        "bed_temp": 100,
        "notes": "ABS requires higher temperature. Supports harder to remove - consider soluble."
    },
    Material.PETG: {
        "adhesion": "good",
        "support_adhesion": 0.75,
        "recommended_angle_threshold": 50,
        "support_density_range": (15, 30),
        "default_support_density": 20,
        "support_material_bridge": 0.85,
        "temp_range": (230, 250),
        "bed_temp": 70,
        "notes": "PETG tends to string. Moderate support adhesion - may need denser supports."
    },
    Material.TPU: {
        "adhesion": "good",
        "support_adhesion": 0.7,
        "recommended_angle_threshold": 55,
        "support_density_range": (20, 35),
        "default_support_density": 25,
        "support_material_bridge": 0.8,
        "temp_range": (210, 230),
        "bed_temp": 50,
        "notes": "TPU is flexible - supports may indent surface. Use lower density."
    },
    Material.ASA: {
        "adhesion": "moderate",
        "support_adhesion": 0.8,
        "recommended_angle_threshold": 50,
        "support_density_range": (15, 30),
        "default_support_density": 20,
        "support_material_bridge": 0.9,
        "temp_range": (240, 260),
        "bed_temp": 95,
        "notes": "Similar to ABS. Good UV resistance but requires heated enclosure."
    },
    Material.PC: {
        "adhesion": "poor",
        "support_adhesion": 0.65,
        "recommended_angle_threshold": 55,
        "support_density_range": (20, 40),
        "default_support_density": 25,
        "support_material_bridge": 0.75,
        "temp_range": (270, 310),
        "bed_temp": 110,
        "notes": "PC is strong but tricky. Requires high temps - use soluble supports if possible."
    },
    Material.PP: {
        "adhesion": "poor",
        "support_adhesion": 0.6,
        "recommended_angle_threshold": 55,
        "support_density_range": (20, 40),
        "default_support_density": 30,
        "support_material_bridge": 0.7,
        "temp_range": (240, 270),
        "bed_temp": 85,
        "notes": "PP is flexible and warp-resistant. Supports stick poorly - use high density."
    },
    Material.NYLON: {
        "adhesion": "moderate",
        "support_adhesion": 0.7,
        "recommended_angle_threshold": 55,
        "support_density_range": (20, 35),
        "default_support_density": 25,
        "support_material_bridge": 0.8,
        "temp_range": (250, 275),
        "bed_temp": 90,
        "notes": "Nylon absorbs moisture. Dry thoroughly - supports may be difficult to remove."
    }
}

DENSITY_MULTIPLIERS = {
    DensityLevel.LOW: 0.6,
    DensityLevel.MEDIUM: 1.0,
    DensityLevel.HIGH: 1.4,
    DensityLevel.VERY_HIGH: 1.8
}

ANGLE_THRESHOLDS = {
    (0, 30): {"needs_support": True, "density_modifier": 1.3, "tip_diameter": "fine"},
    (30, 45): {"needs_support": True, "density_modifier": 1.15, "tip_diameter": "fine"},
    (45, 55): {"needs_support": True, "density_modifier": 1.0, "tip_diameter": "standard"},
    (55, 65): {"needs_support": False, "density_modifier": 0.9, "tip_diameter": "standard"},
    (65, 75): {"needs_support": False, "density_modifier": 0.8, "tip_diameter": "coarse"},
    (75, 90): {"needs_support": False, "density_modifier": 0.7, "tip_diameter": "coarse"}
}


@dataclass
class SupportSettings:
    needs_support: bool
    support_angle: float
    support_density: int
    support_pattern: str
    support_line_spacing: float
    support_xy_distance: float
    support_z_distance: float
    support_roof_density: int
    support_roof_pattern: str
    support_interface_density: int
    support_interface_spacing: float
    support_tip_diameter: float
    support_walls: int
    support_bridges: bool
    recommended_material: str
    material_notes: str
    notes: list[str]


def get_angle_category(angle: float) -> dict:
    """Get the support configuration for an overhang angle."""
    for (min_angle, max_angle), config in ANGLE_THRESHOLDS.items():
        if min_angle <= angle < max_angle:
            return config
    return ANGLE_THRESHOLDS[(75, 90)]


def calculate_support_settings(
    overhang_angle: float,
    layer_height: float,
    material: Material,
    density_level: Optional[DensityLevel] = None,
    enable_bridges: bool = True,
    build_volume: Optional[tuple[float, float, float]] = None
) -> SupportSettings:
    """
    Calculate optimal support settings based on input parameters.
    
    Factors considered:
    - Overhang angle: Lower angles require more support
    - Layer height: Affects support density and spacing
    - Material: Different materials have different adhesion properties
    - Density level: User preference for support density
    - Enable bridges: Whether to use bridge layers for support
    """
    mat_props = MATERIAL_PROPERTIES[material]
    
    angle_config = get_angle_category(overhang_angle)
    needs_support = angle_config["needs_support"]
    
    if overhang_angle < mat_props["recommended_angle_threshold"]:
        needs_support = True
    
    base_density = mat_props["default_support_density"]
    
    if density_level:
        density_mult = DENSITY_MULTIPLIERS[density_level]
    else:
        density_mult = 1.0
    
    density_mult *= angle_config["density_modifier"]
    
    if overhang_angle < 45:
        density_mult *= 1.2
    elif overhang_angle < 30:
        density_mult *= 1.4
    
    layer_height_factor = layer_height / 0.2
    if layer_height > 0.25:
        density_mult *= 1.15
    elif layer_height < 0.16:
        density_mult *= 0.9
    
    support_density = int(base_density * density_mult)
    support_density = max(10, min(50, support_density))
    
    support_line_spacing = layer_height * (100 / support_density) * 0.8
    support_line_spacing = max(layer_height * 2, min(layer_height * 6, support_line_spacing))
    support_line_spacing = round(support_line_spacing, 2)
    
    support_xy_distance = layer_height * 0.8
    if material == Material.TPU:
        support_xy_distance *= 1.3
    elif material in (Material.PC, Material.PP):
        support_xy_distance *= 1.2
    support_xy_distance = round(support_xy_distance, 2)
    
    support_z_distance = layer_height * 4
    if material == Material.TPU:
        support_z_distance *= 1.5
    support_z_distance = round(support_z_distance, 2)
    
    support_roof_density = max(30, support_density + 15)
    support_roof_pattern = "auto" if overhang_angle < 40 else "rectilinear"
    
    support_interface_density = max(50, support_density + 25)
    support_interface_spacing = layer_height * 1.5
    
    tip_diameter_type = angle_config["tip_diameter"]
    if tip_diameter_type == "fine":
        support_tip_diameter = layer_height * 0.4
    elif tip_diameter_type == "coarse":
        support_tip_diameter = layer_height * 0.8
    else:
        support_tip_diameter = layer_height * 0.6
    support_tip_diameter = round(support_tip_diameter, 2)
    
    support_walls = 2 if overhang_angle < 40 else 1
    
    support_bridges = enable_bridges and overhang_angle > 35
    
    if material in (Material.ABS, Material.ASA, Material.PC):
        recommended_material = "soluble (PVA/HIPS)"
        if material == Material.ABS:
            recommended_material = "soluble (HIPS) or breakaway"
    elif material == Material.PLA:
        recommended_material = "breakaway or same material"
    elif material == Material.PETG:
        recommended_material = "breakaway (PETG) or soluble (PVA)"
    elif material in (Material.TPU, Material.NYLON, Material.PP):
        recommended_material = "soluble (PVA) preferred"
    else:
        recommended_material = "breakaway or soluble"
    
    notes = []
    
    if needs_support:
        notes.append(f"Overhang angle {overhang_angle}° requires support structures")
    else:
        notes.append(f"Overhang angle {overhang_angle}° typically does not require support")
    
    notes.append(f"Material: {material.value} - {mat_props['adhesion']} adhesion, {mat_props['notes']}")
    
    if overhang_angle < mat_props["recommended_angle_threshold"]:
        notes.append(f"WARNING: {overhang_angle}° is below recommended threshold for {material.value} ({mat_props['recommended_angle_threshold']}°)")
        notes.append("Consider using denser supports or increasing overhang angle in model")
    
    if layer_height > 0.25:
        notes.append(f"Layer height {layer_height}mm is thick - may need increased support density")
    elif layer_height < 0.16:
        notes.append(f"Layer height {layer_height}mm is fine - standard support density should suffice")
    
    if support_density > 35:
        notes.append("High support density - may be difficult to remove, consider soluble supports")
    elif support_density < 15:
        notes.append("Low support density - may result in drooping or failed bridges")
    
    if support_bridges:
        notes.append("Bridge layers enabled for improved overhang quality")
    
    if material == Material.TPU:
        notes.append("TPU: Increased Z distance to prevent surface indentation")
    
    return SupportSettings(
        needs_support=needs_support,
        support_angle=overhang_angle,
        support_density=support_density,
        support_pattern="zigzag" if overhang_angle < 50 else "rectilinear",
        support_line_spacing=support_line_spacing,
        support_xy_distance=support_xy_distance,
        support_z_distance=support_z_distance,
        support_roof_density=support_roof_density,
        support_roof_pattern=support_roof_pattern,
        support_interface_density=support_interface_density,
        support_interface_spacing=support_interface_spacing,
        support_tip_diameter=support_tip_diameter,
        support_walls=support_walls,
        support_bridges=support_bridges,
        recommended_material=recommended_material,
        material_notes=mat_props["notes"],
        notes=notes
    )


def print_results(result: SupportSettings, format_type: str = "text") -> None:
    """Output support optimization results."""
    if format_type == "json":
        output = {
            "needs_support": result.needs_support,
            "overhang_angle_deg": result.support_angle,
            "support_density_percent": result.support_density,
            "support_pattern": result.support_pattern,
            "support_line_spacing_mm": result.support_line_spacing,
            "support_xy_distance_mm": result.support_xy_distance,
            "support_z_distance_mm": result.support_z_distance,
            "support_roof_density_percent": result.support_roof_density,
            "support_roof_pattern": result.support_roof_pattern,
            "support_interface_density_percent": result.support_interface_density,
            "support_interface_spacing_mm": result.support_interface_spacing,
            "support_tip_diameter_mm": result.support_tip_diameter,
            "support_walls": result.support_walls,
            "support_bridges_enabled": result.support_bridges,
            "recommended_support_material": result.recommended_material,
            "notes": result.notes
        }
        print(json.dumps(output, indent=2))
    else:
        print(f"\n{'='*60}")
        print("SUPPORT STRUCTURE OPTIMIZATION")
        print(f"{'='*60}")
        
        support_status = "YES - Support Required" if result.needs_support else "NO - Support Optional"
        print(f"\n  Overhang Angle:      {result.support_angle}°")
        print(f"  Support Needed:      {support_status}")
        
        print(f"\n  SUPPORT DENSITY")
        print(f"  {'-'*40}")
        print(f"  Density:             {result.support_density}%")
        print(f"  Pattern:             {result.support_pattern}")
        print(f"  Line Spacing:        {result.support_line_spacing} mm")
        
        print(f"\n  SUPPORT POSITIONING")
        print(f"  {'-'*40}")
        print(f"  XY Distance:         {result.support_xy_distance} mm")
        print(f"  Z Distance:          {result.support_z_distance} mm")
        print(f"  Tip Diameter:        {result.support_tip_diameter} mm")
        print(f"  Walls:               {result.support_walls}")
        
        print(f"\n  SUPPORT ROOF/INTERFACE")
        print(f"  {'-'*40}")
        print(f"  Roof Density:        {result.support_roof_density}%")
        print(f"  Roof Pattern:        {result.support_roof_pattern}")
        print(f"  Interface Density:   {result.support_interface_density}%")
        print(f"  Interface Spacing:   {result.support_interface_spacing} mm")
        
        print(f"\n  ADVANCED OPTIONS")
        print(f"  {'-'*40}")
        bridges_str = "Enabled" if result.support_bridges else "Disabled"
        print(f"  Bridge Layers:       {bridges_str}")
        print(f"  Recommended Material: {result.recommended_material}")
        
        print(f"\n  NOTES")
        print(f"  {'-'*40}")
        for note in result.notes:
            print(f"  • {note}")
        print(f"{'='*60}\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate optimal support settings for 3D printing."
    )
    parser.add_argument(
        "--angle", "-a",
        type=float,
        required=True,
        help="Overhang angle in degrees (0-90)"
    )
    parser.add_argument(
        "--layer-height", "-l",
        type=float,
        required=True,
        help="Layer height in mm (e.g., 0.12, 0.2, 0.28)"
    )
    parser.add_argument(
        "--material", "-m",
        type=str,
        required=True,
        choices=[m.value for m in Material],
        help="Filament material: PLA, ABS, PETG, TPU, ASA, PC, PP, NYLON"
    )
    parser.add_argument(
        "--density", "-d",
        type=str,
        choices=["low", "medium", "high", "very_high"],
        default=None,
        help="Support density level (default: auto-calculated)"
    )
    parser.add_argument(
        "--no-bridges",
        action="store_true",
        help="Disable bridge layers for support"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    
    args = parser.parse_args()
    
    if args.angle < 0 or args.angle > 90:
        print("[ERR] Overhang angle must be between 0 and 90 degrees", file=sys.stderr)
        sys.exit(1)
    
    if args.layer_height <= 0:
        print("[ERR] Layer height must be positive", file=sys.stderr)
        sys.exit(1)
    
    if args.layer_height > 1.0:
        print("[ERR] Layer height seems too large (max ~1.0mm)", file=sys.stderr)
        sys.exit(1)
    
    try:
        material = Material(args.material.upper())
    except ValueError:
        print(f"[ERR] Invalid material: {args.material}", file=sys.stderr)
        sys.exit(1)
    
    density_level = None
    if args.density:
        density_level = DensityLevel(args.density)
    
    enable_bridges = not args.no_bridges
    
    result = calculate_support_settings(
        overhang_angle=args.angle,
        layer_height=args.layer_height,
        material=material,
        density_level=density_level,
        enable_bridges=enable_bridges
    )
    
    print_results(result, args.format)


if __name__ == "__main__":
    main()
