#!/usr/bin/env python3
"""
material_blend_calculator.py

Calculate material blend ratios for mixing filaments or adding modifiers.
Includes presets for carbon fiber, wood fill, glow in the dark, and more.

Usage:
    python tools/material_blend_calculator.py --base PLA --modifier carbon-fiber --weight 500
    python tools/material_blend_calculator.py --base ABS --modifier wood-fill --weight 1000 --json
    python tools/material_blend_calculator.py --list-presets
"""

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class ModifierPreset:
    name: str
    description: str
    recommended_ratio: float
    max_ratio: float
    min_ratio: float
    temp_offset: int
    density_modifier: float
    notes: list[str]


MODIFIER_PRESETS: dict[str, ModifierPreset] = {
    "carbon-fiber": ModifierPreset(
        name="Carbon Fiber",
        description="High strength, stiffness, and heat resistance",
        recommended_ratio=0.15,
        max_ratio=0.20,
        min_ratio=0.05,
        temp_offset=-10,
        density_modifier=1.15,
        notes=[
            "Reding and improvesuces string layer adhesion",
            "Requires hardened steel nozzle (abrasive)",
            "Can cause nozzle clogs at high ratios",
        ],
    ),
    "wood-fill": ModifierPreset(
        name="Wood Fill",
        description="Natural wood appearance and grain",
        recommended_ratio=0.20,
        max_ratio=0.40,
        min_ratio=0.10,
        temp_offset=0,
        density_modifier=0.85,
        notes=[
            "Print at 190-220C for best wood grain effect",
            "Higher ratios create darker prints",
            "Can clog brass nozzles over time",
        ],
    ),
    "glow-dark": ModifierPreset(
        name="Glow in the Dark",
        description="Phosphorescent material that glows after light exposure",
        recommended_ratio=0.25,
        max_ratio=0.50,
        min_ratio=0.15,
        temp_offset=-5,
        density_modifier=1.10,
        notes=[
            "Requires UV light charging for best glow",
            "Higher ratios = brighter glow but rougher surface",
            "May cause nozzle wear due to particle content",
        ],
    ),
    "glow-blue": ModifierPreset(
        name="Blue Glow",
        description="Blue phosphorescent glow effect",
        recommended_ratio=0.25,
        max_ratio=0.50,
        min_ratio=0.15,
        temp_offset=-5,
        density_modifier=1.10,
        notes=[
            "Bright blue glow after UV exposure",
            "Similar properties to standard glow-in-the-dark",
        ],
    ),
    "glow-green": ModifierPreset(
        name="Green Glow",
        description="Green phosphorescent glow effect",
        recommended_ratio=0.25,
        max_ratio=0.50,
        min_ratio=0.15,
        temp_offset=-5,
        density_modifier=1.10,
        notes=[
            "Classic green glow, longest lasting",
            "Most common glow-in-the-dark variant",
        ],
    ),
    "copper-fill": ModifierPreset(
        name="Copper Fill",
        description="Metallic copper appearance with conductivity",
        recommended_ratio=0.20,
        max_ratio=0.35,
        min_ratio=0.10,
        temp_offset=-10,
        density_modifier=1.40,
        notes=[
            "Slight electrical conductivity",
            "Requires hardened nozzle for repeated use",
            "Heavy - significantly increases print weight",
        ],
    ),
    "bronze-fill": ModifierPreset(
        name="Bronze Fill",
        description="Metallic bronze appearance",
        recommended_ratio=0.20,
        max_ratio=0.35,
        min_ratio=0.10,
        temp_offset=-10,
        density_modifier=1.35,
        notes=[
            "Beautiful metallic finish with post-processing",
            "Can be polished for extra shine",
        ],
    ),
    "steel-fill": ModifierPreset(
        name="Stainless Steel Fill",
        description="Metallic steel appearance",
        recommended_ratio=0.20,
        max_ratio=0.35,
        min_ratio=0.10,
        temp_offset=-10,
        density_modifier=1.30,
        notes=[
            "Magnetic (attracted to magnets)",
            "Heavy and dense prints",
        ],
    ),
    "aluminum-fill": ModifierPreset(
        name="Aluminum Fill",
        description="Lightweight metallic aluminum appearance",
        recommended_ratio=0.15,
        max_ratio=0.30,
        min_ratio=0.05,
        temp_offset=-10,
        density_modifier=0.95,
        notes=[
            "Lighter than other metal fills",
            "Good thermal conductivity",
        ],
    ),
    "glass-fill": ModifierPreset(
        name="Glass Fiber",
        description="Increased strength and stiffness",
        recommended_ratio=0.15,
        max_ratio=0.25,
        min_ratio=0.05,
        temp_offset=-10,
        density_modifier=1.05,
        notes=[
            "Excellent dimensional stability",
            "Reduces warping significantly",
            "Requires hardened steel nozzle",
        ],
    ),
    "kevlar-fill": ModifierPreset(
        name="Kevlar/Aramid",
        description="Extreme durability and impact resistance",
        recommended_ratio=0.10,
        max_ratio=0.15,
        min_ratio=0.05,
        temp_offset=-10,
        density_modifier=0.95,
        notes=[
            "Excellent impact and abrasion resistance",
            "Difficult to print - low ratio recommended",
            "Expensive but extremely durable",
        ],
    ),
    "nylon-fill": ModifierPreset(
        name="Nylon Blend",
        description="Improved toughness and flexibility",
        recommended_ratio=0.20,
        max_ratio=0.35,
        min_ratio=0.10,
        temp_offset=-5,
        density_modifier=0.98,
        notes=[
            "More flexible and impact resistant",
            "Lower printing temperature recommended",
            "Higher layer adhesion",
        ],
    ),
    "polycarbonate-fill": ModifierPreset(
        name="Polycarbonate Blend",
        description="Enhanced heat resistance and strength",
        recommended_ratio=0.15,
        max_ratio=0.30,
        min_ratio=0.05,
        temp_offset=5,
        density_modifier=1.08,
        notes=[
            "Higher glass transition temperature",
            "Requires enclosed print chamber",
            "Very strong and durable",
        ],
    ),
    "mica-pearl": ModifierPreset(
        name="Mica/Pearl",
        description="Shimmering pearlescent finish",
        recommended_ratio=0.20,
        max_ratio=0.35,
        min_ratio=0.10,
        temp_offset=-5,
        density_modifier=1.02,
        notes=[
            "Color-shifting effect depending on angle",
            "Smooth, glossy finish",
        ],
    ),
    "stone-marble": ModifierPreset(
        name="Stone/Marble",
        description="Natural stone or marble appearance",
        recommended_ratio=0.25,
        max_ratio=0.40,
        min_ratio=0.15,
        temp_offset=0,
        density_modifier=1.20,
        notes=[
            "Realistic stone texture",
            "Varying ratios create different patterns",
        ],
    ),
    "conductive": ModifierPreset(
        name="Conductive",
        description="Electrically conductive for circuits",
        recommended_ratio=0.20,
        max_ratio=0.30,
        min_ratio=0.10,
        temp_offset=-10,
        density_modifier=1.15,
        notes=[
            "Low electrical resistance for simple circuits",
            "Not as conductive as metal fills",
            "Use for traces, not power delivery",
        ],
    ),
    "magnetic": ModifierPreset(
        name="Magnetic",
        description="Ferromagnetic material attracts magnets",
        recommended_ratio=0.20,
        max_ratio=0.35,
        min_ratio=0.10,
        temp_offset=-5,
        density_modifier=1.25,
        notes=[
            "Attracted to magnets after printing",
            "Iron-based additive",
            "May oxidize over time",
        ],
    ),
    "color-shift": ModifierPreset(
        name="Color Shift",
        description="Color changes based on viewing angle",
        recommended_ratio=0.15,
        max_ratio=0.25,
        min_ratio=0.05,
        temp_offset=0,
        density_modifier=1.00,
        notes=[
            "Iridescent color-shifting effect",
            "Works best with light base colors",
        ],
    ),
    "glitter": ModifierPreset(
        name="Glitter",
        description="Sparkling glitter effect",
        recommended_ratio=0.15,
        max_ratio=0.30,
        min_ratio=0.05,
        temp_offset=-5,
        density_modifier=1.05,
        notes=[
            "Sparkling appearance from embedded glitter",
            "Requires larger nozzle (0.4mm+) for best results",
            "Can cause minor nozzle wear",
        ],
    ),
    "silk": ModifierPreset(
        name="Silk/Shiny",
        description="Glossy, satin-like finish",
        recommended_ratio=0.10,
        max_ratio=0.20,
        min_ratio=0.05,
        temp_offset=0,
        density_modifier=1.00,
        notes=[
            "Highly glossy, silk-like surface",
            "Reduces visible layer lines",
            "Popular for decorative prints",
        ],
    ),
    "soft-touch": ModifierPreset(
        name="Soft Touch",
        description="Rubber-like soft feel",
        recommended_ratio=0.15,
        max_ratio=0.25,
        min_ratio=0.05,
        temp_offset=-10,
        density_modifier=0.95,
        notes=[
            "Softer, more tactile surface",
            "Reduces hardness of base material",
        ],
    ),
}


BASE_MATERIALS: dict[str, dict] = {
    "PLA": {
        "density": 1.24,
        "base_temp": 200,
        "bed_temp": 60,
        "notes": ["Easy to print", "Low warping", "Biodegradable"],
    },
    "PLA+": {
        "density": 1.26,
        "base_temp": 205,
        "bed_temp": 60,
        "notes": ["Improved PLA with better impact resistance"],
    },
    "ABS": {
        "density": 1.04,
        "base_temp": 240,
        "bed_temp": 100,
        "notes": ["Strong, durable", "Requires heated bed", "Can warp"],
    },
    "PETG": {
        "density": 1.27,
        "base_temp": 230,
        "bed_temp": 80,
        "notes": ["Good strength and flexibility", "Low warping"],
    },
    "TPU": {
        "density": 1.21,
        "base_temp": 220,
        "bed_temp": 50,
        "notes": ["Flexible", "Harder to print", "Slow print speed"],
    },
    "Nylon": {
        "density": 1.14,
        "base_temp": 250,
        "bed_temp": 90,
        "notes": ["Very strong", "Absorbs moisture", "High temp"],
    },
    "PC": {
        "density": 1.20,
        "base_temp": 270,
        "bed_temp": 110,
        "notes": ["High heat resistance", "Very strong", "Needs enclosure"],
    },
    "ASA": {
        "density": 1.07,
        "base_temp": 240,
        "bed_temp": 100,
        "notes": ["UV resistant ABS alternative", "Low warping"],
    },
    "PVB": {
        "density": 1.20,
        "base_temp": 215,
        "bed_temp": 75,
        "notes": ["Clear when smoothed", "Requires IPA post-process"],
    },
    "HIPS": {
        "density": 1.04,
        "base_temp": 230,
        "bed_temp": 100,
        "notes": ["Soluble in limonene", "Support material"],
    },
}


@dataclass
class BlendResult:
    base_material: str
    modifier: str
    base_weight_grams: float
    modifier_weight_grams: float
    total_weight_grams: float
    ratio: float
    base_temp: int
    adjusted_temp: int
    bed_temp: int
    adjusted_density: float
    final_density: float


def calculate_blend(
    base_material: str,
    modifier: str,
    base_weight_grams: float,
    ratio: Optional[float] = None,
) -> BlendResult:
    if base_material not in BASE_MATERIALS:
        raise ValueError(f"Unknown base material: {base_material}")
    if modifier not in MODIFIER_PRESETS:
        raise ValueError(f"Unknown modifier: {modifier}")

    base = BASE_MATERIALS[base_material]
    mod = MODIFIER_PRESETS[modifier]

    if ratio is None:
        ratio = mod.recommended_ratio
    elif ratio < mod.min_ratio or ratio > mod.max_ratio:
        print(
            f"[WARN] Ratio {ratio*100:.1f}% is outside recommended range "
            f"({mod.min_ratio*100:.0f}%-{mod.max_ratio*100:.0f}%)",
            file=sys.stderr,
        )

    modifier_weight = base_weight_grams * (ratio / (1 - ratio))
    total_weight = base_weight_grams + modifier_weight

    adjusted_temp = base["base_temp"] + mod.temp_offset
    final_density = base["density"] * mod.density_modifier

    return BlendResult(
        base_material=base_material,
        modifier=mod.name,
        base_weight_grams=base_weight_grams,
        modifier_weight_grams=modifier_weight,
        total_weight_grams=total_weight,
        ratio=ratio,
        base_temp=base["base_temp"],
        adjusted_temp=adjusted_temp,
        bed_temp=base["bed_temp"],
        adjusted_density=mod.density_modifier,
        final_density=final_density,
    )


def print_blend_report(result: BlendResult) -> None:
    base = BASE_MATERIALS[result.base_material]
    mod = MODIFIER_PRESETS.get(result.modifier.lower().replace(" ", "-"), None)

    print("\n" + "=" * 60)
    print("MATERIAL BLEND CALCULATOR")
    print("=" * 60)

    print(f"\n{'-' * 60}")
    print("BLEND DETAILS")
    print(f"{'-' * 60}")
    print(f"Base Material:   {result.base_material}")
    print(f"Modifier:        {result.modifier}")
    print(f"Blend Ratio:     {result.ratio*100:.1f}% modifier / {(1-result.ratio)*100:.1f}% base")

    print(f"\n{'-' * 60}")
    print("WEIGHT CALCULATION")
    print(f"{'-' * 60}")
    print(f"Base Weight:     {result.base_weight_grams:.2f} g")
    print(f"Modifier Weight:{result.modifier_weight_grams:.2f} g")
    print(f"Total Weight:   {result.total_weight_grams:.2f} g")

    print(f"\n{'-' * 60}")
    print("PRINT SETTINGS")
    print(f"{'-' * 60}")
    print(f"Nozzle Temp:     {result.adjusted_temp}°C (base: {result.base_temp}°C + offset: {result.adjusted_temp - result.base_temp:+d}°C)")
    print(f"Bed Temp:       {result.bed_temp}°C")
    print(f"Base Density:   {base['density']} g/cm³")
    print(f"Density Factor: {result.adjusted_density:.2f}x")
    print(f"Final Density:  {result.final_density} g/cm³")

    if mod:
        print(f"\n{'-' * 60}")
        print("RECOMMENDATIONS")
        print(f"{'-' * 60}")
        for note in mod.notes:
            print(f"  - {note}")

    print(f"\n{'-' * 60}")
    print("BASE MATERIAL NOTES")
    print(f"{'-' * 60}")
    for note in base["notes"]:
        print(f"  - {note}")


def print_json_output(result: BlendResult) -> None:
    mod = MODIFIER_PRESETS.get(result.modifier.lower().replace(" ", "-"), None)
    base = BASE_MATERIALS[result.base_material]

    output = {
        "blend": {
            "base_material": result.base_material,
            "modifier": result.modifier,
            "ratio": round(result.ratio, 4),
            "ratio_percent": f"{result.ratio*100:.1f}%",
        },
        "weight": {
            "base_grams": round(result.base_weight_grams, 2),
            "modifier_grams": round(result.modifier_weight_grams, 2),
            "total_grams": round(result.total_weight_grams, 2),
        },
        "print_settings": {
            "nozzle_temp_c": result.adjusted_temp,
            "bed_temp_c": result.bed_temp,
            "base_temp_c": result.base_temp,
            "temp_offset_c": result.adjusted_temp - result.base_temp,
        },
        "density": {
            "base_density": base["density"],
            "density_modifier": result.adjusted_density,
            "final_density": round(result.final_density, 4),
        },
        "recommendations": {
            "notes": mod.notes if mod else [],
            "base_notes": base["notes"],
        },
    }
    print(json.dumps(output, indent=2))


def list_presets() -> None:
    print("\n" + "=" * 60)
    print("AVAILABLE MODIFIER PRESETS")
    print("=" * 60)

    for key, preset in MODIFIER_PRESETS.items():
        print(f"\n{preset.name} ({key})")
        print(f"  Description: {preset.description}")
        print(f"  Recommended: {preset.recommended_ratio*100:.0f}%")
        print(f"  Range:       {preset.min_ratio*100:.0f}%-{preset.max_ratio*100:.0f}%")
        print(f"  Temp Offset: {preset.temp_offset:+d}°C")

    print("\n" + "=" * 60)
    print("AVAILABLE BASE MATERIALS")
    print("=" * 60)

    for name, mat in BASE_MATERIALS.items():
        print(f"\n{name}")
        print(f"  Density: {mat['density']} g/cm³")
        print(f"  Nozzle:  {mat['base_temp']}°C")
        print(f"  Bed:     {mat['bed_temp']}°C")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate material blend ratios for 3D printing filaments.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --base PLA --modifier carbon-fiber --weight 500
  %(prog)s --base PETG --modifier wood-fill --weight 1000 --ratio 0.25
  %(prog)s --base ABS --modifier glow-dark --weight 250 --json
  %(prog)s --list-presets
        """,
    )

    parser.add_argument(
        "--base",
        "-b",
        type=str,
        help="Base material (PLA, PETG, ABS, etc.)",
    )

    parser.add_argument(
        "--modifier",
        "-m",
        type=str,
        help="Modifier/additive (carbon-fiber, wood-fill, glow-dark, etc.)",
    )

    parser.add_argument(
        "--weight",
        "-w",
        type=float,
        help="Weight of base material in grams",
    )

    parser.add_argument(
        "--ratio",
        "-r",
        type=float,
        help="Custom modifier ratio (0.0-1.0). Uses recommended if not specified.",
    )

    parser.add_argument(
        "--format",
        "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)",
    )

    parser.add_argument(
        "--list-presets",
        action="store_true",
        help="List all available presets and exit",
    )

    args = parser.parse_args()

    if args.list_presets:
        list_presets()
        return

    if not args.base or not args.modifier or not args.weight:
        print(
            "[ERR] --base, --modifier, and --weight are required. "
            "Use --list-presets to see available options.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        result = calculate_blend(args.base, args.modifier, args.weight, args.ratio)
    except ValueError as e:
        print(f"[ERR] {e}", file=sys.stderr)
        print("\nUse --list-presets to see available options.", file=sys.stderr)
        sys.exit(1)

    if args.format == "json":
        print_json_output(result)
    else:
        print_blend_report(result)


if __name__ == "__main__":
    main()
