#!/usr/bin/env python3
"""
infill_optimizer.py

Suggests optimal infill patterns and densities based on part strength requirements,
print time constraints, and material properties.

Usage:
    python tools/infill_optimizer.py --strength high --material PLA
    python tools/infill_optimizer.py --strength low --material PETG --priority speed
    python tools/infill_optimizer.py --strength medium --material ABS --priority balanced
    python tools/infill_optimizer.py --part-type functional --load vertical --material PLA
"""

import argparse
import json
import sys
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class StrengthRequirement(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class Priority(Enum):
    SPEED = "speed"
    STRENGTH = "strength"
    BALANCED = "balanced"
    MATERIAL = "material"


class MaterialType(Enum):
    PLA = "PLA"
    PETG = "PETG"
    ABS = "ABS"
    ASA = "ASA"
    TPU = "TPU"
    NYLON = "NYLON"
    PC = "PC"
    CARBON_FIBER = "CARBON_FIBER"
    WOOD = "WOOD"


class InfillPattern(Enum):
    GRID = "grid"
    LINES = "lines"
    TRIANGULAR = "triangular"
    HONEYCOMB = "honeycomb"
    GYROID = "gyroid"
    CUBIC = "cubic"
    QUARTER_CUBIC = "quarter_cubic"
    LIGHTNING = "lightning"
    RECTILINEAR = "rectilinear"
    CONCENTRIC = "concentric"
    CROSS = "cross"
    CROSS_3D = "cross_3d"


class PartType(Enum):
    DECORATIVE = "decorative"
    FUNCTIONAL = "functional"
    STRUCTURAL = "structural"
    FLEXIBLE = "flexible"
    PROTOTYPE = "prototype"


class LoadDirection(Enum):
    VERTICAL = "vertical"
    HORIZONTAL = "horizontal"
    MULTI_DIRECTIONAL = "multi_directional"
    ISOTROPIC = "isotropic"


INFILL_PATTERNS = {
    InfillPattern.GRID: {
        "name": "Grid",
        "description": "Simple grid pattern, good for general use",
        "strength_modifier": 1.0,
        "speed_modifier": 1.1,
        "material_usage": 1.0,
        "anisotropic": True,
        "best_for": [PartType.DECORATIVE, PartType.PROTOTYPE],
        "layer_time": "low"
    },
    InfillPattern.LINES: {
        "name": "Lines",
        "description": "Parallel lines, fastest printing option",
        "strength_modifier": 0.85,
        "speed_modifier": 1.2,
        "material_usage": 0.95,
        "anisotropic": True,
        "best_for": [PartType.DECORATIVE, PartType.PROTOTYPE],
        "layer_time": "lowest"
    },
    InfillPattern.TRIANGULAR: {
        "name": "Triangular",
        "description": "Triangle pattern, excellent for horizontal loads",
        "strength_modifier": 1.15,
        "speed_modifier": 0.95,
        "material_usage": 1.05,
        "anisotropic": True,
        "best_for": [PartType.FUNCTIONAL, PartType.STRUCTURAL],
        "layer_time": "medium"
    },
    InfillPattern.HONEYCOMB: {
        "name": "Honeycomb",
        "description": "Hexagonal pattern, excellent strength-to-weight ratio",
        "strength_modifier": 1.2,
        "speed_modifier": 0.85,
        "material_usage": 1.0,
        "anisotropic": False,
        "best_for": [PartType.FUNCTIONAL, PartType.STRUCTURAL],
        "layer_time": "medium"
    },
    InfillPattern.GYROID: {
        "name": "Gyroid",
        "description": "3D infill with excellent isotropic strength",
        "strength_modifier": 1.25,
        "speed_modifier": 0.75,
        "material_usage": 1.1,
        "anisotropic": False,
        "best_for": [PartType.STRUCTURAL, PartType.FUNCTIONAL],
        "layer_time": "high"
    },
    InfillPattern.CUBIC: {
        "name": "Cubic",
        "description": "3D cubic structure, good all-around strength",
        "strength_modifier": 1.1,
        "speed_modifier": 0.9,
        "material_usage": 1.05,
        "anisotropic": False,
        "best_for": [PartType.FUNCTIONAL, PartType.STRUCTURAL],
        "layer_time": "medium"
    },
    InfillPattern.QUARTER_CUBIC: {
        "name": "Quarter Cubic",
        "description": "Dense 3D pattern, excellent compressive strength",
        "strength_modifier": 1.3,
        "speed_modifier": 0.7,
        "material_usage": 1.15,
        "anisotropic": False,
        "best_for": [PartType.STRUCTURAL],
        "layer_time": "high"
    },
    InfillPattern.LIGHTNING: {
        "name": "Lightning",
        "description": "Tree-like structure, minimal material for support",
        "strength_modifier": 0.6,
        "speed_modifier": 1.3,
        "material_usage": 0.7,
        "anisotropic": True,
        "best_for": [PartType.DECORATIVE],
        "layer_time": "lowest"
    },
    InfillPattern.RECTILINEAR: {
        "name": "Rectilinear",
        "description": "Alternating perpendicular lines",
        "strength_modifier": 0.9,
        "speed_modifier": 1.15,
        "material_usage": 0.95,
        "anisotropic": True,
        "best_for": [PartType.DECORATIVE, PartType.PROTOTYPE],
        "layer_time": "low"
    },
    InfillPattern.CONCENTRIC: {
        "name": "Concentric",
        "description": "Concentric rings following part outline",
        "strength_modifier": 0.95,
        "speed_modifier": 1.0,
        "material_usage": 1.0,
        "anisotropic": True,
        "best_for": [PartType.DECORATIVE, PartType.FLEXIBLE],
        "layer_time": "low"
    },
    InfillPattern.CROSS: {
        "name": "Cross",
        "description": "Cross pattern, good for flexible materials",
        "strength_modifier": 0.85,
        "speed_modifier": 1.05,
        "material_usage": 0.9,
        "anisotropic": True,
        "best_for": [PartType.FLEXIBLE],
        "layer_time": "low"
    },
    InfillPattern.CROSS_3D: {
        "name": "Cross 3D",
        "description": "3D cross pattern for flexible prints",
        "strength_modifier": 0.9,
        "speed_modifier": 0.95,
        "material_usage": 0.95,
        "anisotropic": False,
        "best_for": [PartType.FLEXIBLE],
        "layer_time": "medium"
    }
}


MATERIAL_PROPERTIES = {
    MaterialType.PLA: {
        "name": "PLA",
        "base_strength": 1.0,
        "flexibility": 0.3,
        "recommended_density_range": (10, 25),
        "optimal_density": 18,
        "max_useful_density": 40,
        "recommended_patterns": [InfillPattern.GYROID, InfillPattern.HONEYCOMB, InfillPattern.GRID],
        "notes": "Brittle, not suitable for high-stress applications"
    },
    MaterialType.PETG: {
        "name": "PETG",
        "base_strength": 1.1,
        "flexibility": 0.5,
        "recommended_density_range": (15, 30),
        "optimal_density": 20,
        "max_useful_density": 45,
        "recommended_patterns": [InfillPattern.GYROID, InfillPattern.TRIANGULAR, InfillPattern.HONEYCOMB],
        "notes": "Good balance of strength and flexibility"
    },
    MaterialType.ABS: {
        "name": "ABS",
        "base_strength": 1.05,
        "flexibility": 0.4,
        "recommended_density_range": (15, 35),
        "optimal_density": 22,
        "max_useful_density": 50,
        "recommended_patterns": [InfillPattern.GYROID, InfillPattern.CUBIC, InfillPattern.QUARTER_CUBIC],
        "notes": "Good impact resistance, requires enclosure"
    },
    MaterialType.ASA: {
        "name": "ASA",
        "base_strength": 1.08,
        "flexibility": 0.45,
        "recommended_density_range": (15, 35),
        "optimal_density": 22,
        "max_useful_density": 50,
        "recommended_patterns": [InfillPattern.GYROID, InfillPattern.CUBIC, InfillPattern.HONEYCOMB],
        "notes": "UV resistant, similar to ABS"
    },
    MaterialType.TPU: {
        "name": "TPU",
        "base_strength": 0.8,
        "flexibility": 1.0,
        "recommended_density_range": (10, 25),
        "optimal_density": 15,
        "max_useful_density": 35,
        "recommended_patterns": [InfillPattern.CROSS, InfillPattern.CROSS_3D, InfillPattern.CONCENTRIC],
        "notes": "Flexible material, use patterns that allow compression"
    },
    MaterialType.NYLON: {
        "name": "Nylon",
        "base_strength": 1.3,
        "flexibility": 0.6,
        "recommended_density_range": (20, 40),
        "optimal_density": 28,
        "max_useful_density": 55,
        "recommended_patterns": [InfillPattern.GYROID, InfillPattern.QUARTER_CUBIC, InfillPattern.HONEYCOMB],
        "notes": "Excellent strength and durability"
    },
    MaterialType.PC: {
        "name": "Polycarbonate",
        "base_strength": 1.4,
        "flexibility": 0.5,
        "recommended_density_range": (20, 45),
        "optimal_density": 30,
        "max_useful_density": 60,
        "recommended_patterns": [InfillPattern.GYROID, InfillPattern.QUARTER_CUBIC, InfillPattern.CUBIC],
        "notes": "Highest strength, requires high temps"
    },
    MaterialType.CARBON_FIBER: {
        "name": "Carbon Fiber",
        "base_strength": 1.5,
        "flexibility": 0.25,
        "recommended_density_range": (15, 35),
        "optimal_density": 25,
        "max_useful_density": 45,
        "recommended_patterns": [InfillPattern.TRIANGULAR, InfillPattern.GYROID, InfillPattern.HONEYCOMB],
        "notes": "Stiff and strong, abrasive to nozzles"
    },
    MaterialType.WOOD: {
        "name": "Wood PLA",
        "base_strength": 0.85,
        "flexibility": 0.35,
        "recommended_density_range": (10, 20),
        "optimal_density": 15,
        "max_useful_density": 30,
        "recommended_patterns": [InfillPattern.GRID, InfillPattern.LINES, InfillPattern.RECTILINEAR],
        "notes": "Decorative material, lower structural strength"
    }
}


STRENGTH_DENSITY_MAP = {
    StrengthRequirement.LOW: {"density": 10, "range": (5, 15)},
    StrengthRequirement.MEDIUM: {"density": 20, "range": (15, 25)},
    StrengthRequirement.HIGH: {"density": 35, "range": (30, 45)},
    StrengthRequirement.VERY_HIGH: {"density": 50, "range": (45, 70)}
}


@dataclass
class InfillRecommendation:
    pattern: InfillPattern
    density_percent: int
    density_range: tuple
    wall_count: int
    top_bottom_layers: int
    score: float
    reasons: list = field(default_factory=list)


@dataclass
class OptimizationResult:
    primary: InfillRecommendation
    alternatives: list
    material: MaterialType
    strength_requirement: StrengthRequirement
    priority: Priority
    estimated_relative_time: float
    estimated_material_usage: float
    notes: list = field(default_factory=list)


def calculate_pattern_score(
    pattern: InfillPattern,
    material: MaterialType,
    strength: StrengthRequirement,
    priority: Priority,
    part_type: Optional[PartType],
    load_direction: Optional[LoadDirection]
) -> tuple[float, list]:
    score = 0.0
    reasons = []
    
    pattern_data = INFILL_PATTERNS[pattern]
    material_data = MATERIAL_PROPERTIES[material]
    
    if priority == Priority.STRENGTH:
        score += pattern_data["strength_modifier"] * 50
        if not pattern_data["anisotropic"]:
            score += 15
            reasons.append("Isotropic strength distribution")
    elif priority == Priority.SPEED:
        score += pattern_data["speed_modifier"] * 50
        if pattern_data["layer_time"] in ["lowest", "low"]:
            score += 20
            reasons.append("Fast layer printing")
    elif priority == Priority.BALANCED:
        score += pattern_data["strength_modifier"] * 25
        score += pattern_data["speed_modifier"] * 25
        if not pattern_data["anisotropic"]:
            score += 10
    elif priority == Priority.MATERIAL:
        score += (1.1 - pattern_data["material_usage"]) * 50
        reasons.append("Material efficient")
    
    if pattern in material_data["recommended_patterns"]:
        score += 20
        reasons.append(f"Recommended for {material_data['name']}")
    
    if part_type and part_type in pattern_data["best_for"]:
        score += 15
        reasons.append(f"Ideal for {part_type.value} parts")
    
    if load_direction:
        if load_direction == LoadDirection.ISOTROPIC and not pattern_data["anisotropic"]:
            score += 20
            reasons.append("Uniform strength in all directions")
        elif load_direction == LoadDirection.VERTICAL and pattern in [InfillPattern.CUBIC, InfillPattern.QUARTER_CUBIC]:
            score += 15
            reasons.append("Good vertical load support")
        elif load_direction == LoadDirection.HORIZONTAL and pattern in [InfillPattern.TRIANGULAR, InfillPattern.HONEYCOMB]:
            score += 15
            reasons.append("Excellent horizontal load resistance")
        elif load_direction == LoadDirection.MULTI_DIRECTIONAL and not pattern_data["anisotropic"]:
            score += 15
            reasons.append("Multi-directional strength")
    
    if strength in [StrengthRequirement.HIGH, StrengthRequirement.VERY_HIGH]:
        if pattern in [InfillPattern.GYROID, InfillPattern.QUARTER_CUBIC, InfillPattern.HONEYCOMB]:
            score += 15
            reasons.append("High-strength pattern")
    
    if material == MaterialType.TPU and pattern in [InfillPattern.CROSS, InfillPattern.CROSS_3D, InfillPattern.CONCENTRIC]:
        score += 25
        reasons.append("Optimized for flexible materials")
    
    return score, reasons


def calculate_density(
    strength: StrengthRequirement,
    material: MaterialType,
    priority: Priority,
    wall_count: int
) -> tuple[int, tuple]:
    material_data = MATERIAL_PROPERTIES[material]
    strength_data = STRENGTH_DENSITY_MAP[strength]
    
    base_density = strength_data["density"]
    min_density, max_density = strength_data["range"]
    
    mat_min, mat_max = material_data["recommended_density_range"]
    min_density = max(min_density, mat_min)
    max_density = min(max_density, material_data["max_useful_density"])
    
    if priority == Priority.SPEED:
        density = min_density
    elif priority == Priority.STRENGTH:
        density = min(max_density, base_density + 10)
    elif priority == Priority.MATERIAL:
        density = min_density
    else:
        density = max(min_density, min(max_density, base_density))
    
    if wall_count >= 4:
        density = max(min_density, density - 5)
    
    density = max(5, min(70, density))
    
    range_min = max(5, density - 5)
    range_max = min(70, density + 10)
    
    return int(density), (range_min, range_max)


def recommend_wall_count(strength: StrengthRequirement, material: MaterialType) -> int:
    base_walls = {
        StrengthRequirement.LOW: 2,
        StrengthRequirement.MEDIUM: 3,
        StrengthRequirement.HIGH: 4,
        StrengthRequirement.VERY_HIGH: 5
    }
    
    walls = base_walls[strength]
    
    if material in [MaterialType.TPU, MaterialType.NYLON]:
        walls = max(2, walls - 1)
    
    return walls


def recommend_layers(strength: StrengthRequirement, density: int) -> int:
    if strength == StrengthRequirement.LOW:
        return max(2, 3 if density < 15 else 2)
    elif strength == StrengthRequirement.MEDIUM:
        return 3 if density < 25 else 4
    elif strength == StrengthRequirement.HIGH:
        return 4 if density < 40 else 5
    else:
        return 5 if density < 50 else 6


def optimize_infill(
    material: MaterialType,
    strength: StrengthRequirement,
    priority: Priority,
    part_type: Optional[PartType] = None,
    load_direction: Optional[LoadDirection] = None,
    wall_count: Optional[int] = None
) -> OptimizationResult:
    
    scores = []
    
    for pattern in InfillPattern:
        score, reasons = calculate_pattern_score(
            pattern, material, strength, priority, part_type, load_direction
        )
        scores.append((pattern, score, reasons))
    
    scores.sort(key=lambda x: x[1], reverse=True)
    
    best_pattern, best_score, best_reasons = scores[0]
    
    if wall_count is None:
        wall_count = recommend_wall_count(strength, material)
    
    density, density_range = calculate_density(strength, material, priority, wall_count)
    top_bottom_layers = recommend_layers(strength, density)
    
    primary = InfillRecommendation(
        pattern=best_pattern,
        density_percent=density,
        density_range=density_range,
        wall_count=wall_count,
        top_bottom_layers=top_bottom_layers,
        score=best_score,
        reasons=best_reasons
    )
    
    alternatives = []
    for pattern, score, reasons in scores[1:4]:
        alt_density, alt_range = calculate_density(strength, material, priority, wall_count)
        alternatives.append(InfillRecommendation(
            pattern=pattern,
            density_percent=alt_density,
            density_range=alt_range,
            wall_count=wall_count,
            top_bottom_layers=top_bottom_layers,
            score=score,
            reasons=reasons
        ))
    
    pattern_data = INFILL_PATTERNS[best_pattern]
    material_data = MATERIAL_PROPERTIES[material]
    
    estimated_time = 1.0 / pattern_data["speed_modifier"]
    if density > 20:
        estimated_time *= 1 + (density - 20) * 0.01
    
    estimated_material = pattern_data["material_usage"] * (density / 20)
    
    notes = [material_data["notes"]]
    if pattern_data["anisotropic"] and load_direction == LoadDirection.ISOTROPIC:
        notes.append("Consider gyroid or cubic for better isotropic strength")
    if density > material_data["max_useful_density"] - 5:
        notes.append(f"Density approaching max useful for {material_data['name']}")
    
    return OptimizationResult(
        primary=primary,
        alternatives=alternatives,
        material=material,
        strength_requirement=strength,
        priority=priority,
        estimated_relative_time=round(estimated_time, 2),
        estimated_material_usage=round(estimated_material, 2),
        notes=notes
    )


def print_results(result: OptimizationResult, format: str = "text") -> None:
    if format == "json":
        output = {
            "primary_recommendation": {
                "pattern": result.primary.pattern.value,
                "pattern_name": INFILL_PATTERNS[result.primary.pattern]["name"],
                "density_percent": result.primary.density_percent,
                "density_range": list(result.primary.density_range),
                "wall_count": result.primary.wall_count,
                "top_bottom_layers": result.primary.top_bottom_layers,
                "score": round(result.primary.score, 1),
                "reasons": result.primary.reasons
            },
            "alternatives": [
                {
                    "pattern": alt.pattern.value,
                    "pattern_name": INFILL_PATTERNS[alt.pattern]["name"],
                    "density_percent": alt.density_percent,
                    "score": round(alt.score, 1),
                    "reasons": alt.reasons
                }
                for alt in result.alternatives
            ],
            "material": result.material.value,
            "strength_requirement": result.strength_requirement.value,
            "priority": result.priority.value,
            "estimates": {
                "relative_print_time": result.estimated_relative_time,
                "relative_material_usage": result.estimated_material_usage
            },
            "notes": result.notes
        }
        print(json.dumps(output, indent=2))
        return
    
    print(f"\n{'=' * 65}")
    print("INFILL OPTIMIZATION RESULTS")
    print(f"{'=' * 65}")
    
    print(f"\n{'-' * 65}")
    print("INPUT PARAMETERS")
    print(f"-" * 65)
    print(f"Material:             {MATERIAL_PROPERTIES[result.material]['name']}")
    print(f"Strength Requirement: {result.strength_requirement.value}")
    print(f"Priority:             {result.priority.value}")
    
    print(f"\n" + "-" * 65)
    print("PRIMARY RECOMMENDATION")
    print(f"-" * 65)
    pattern_data = INFILL_PATTERNS[result.primary.pattern]
    print(f"Pattern:              {pattern_data['name']}")
    print(f"Description:          {pattern_data['description']}")
    print(f"Infill Density:       {result.primary.density_percent}% (range: {result.primary.density_range[0]}-{result.primary.density_range[1]}%)")
    print(f"Wall Count:           {result.primary.wall_count} perimeters")
    print(f"Top/Bottom Layers:    {result.primary.top_bottom_layers}")
    
    if result.primary.reasons:
        print(f"\nReasons for recommendation:")
        for reason in result.primary.reasons:
            print(f"  - {reason}")
    
    print(f"\n" + "-" * 65)
    print("ALTERNATIVE PATTERNS")
    print(f"-" * 65)
    for i, alt in enumerate(result.alternatives, 1):
        alt_data = INFILL_PATTERNS[alt.pattern]
        print(f"{i}. {alt_data['name']} ({alt.density_percent}% density)")
        print(f"   Score: {alt.score:.1f} - {alt_data['description']}")
    
    print(f"\n" + "-" * 65)
    print("ESTIMATES")
    print(f"-" * 65)
    print(f"Relative Print Time:   {result.estimated_relative_time}x (vs baseline)")
    print(f"Relative Material:     {result.estimated_material_usage}x (vs 20% grid)")
    
    if result.notes:
        print(f"\n" + "-" * 65)
        print("NOTES")
        print(f"-" * 65)
        for note in result.notes:
            print(f"  - {note}")
    
    print("=" * 65 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Optimize infill settings based on strength, material, and priorities.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --strength high --material PLA
  %(prog)s --strength medium --material PETG --priority speed
  %(prog)s --strength very_high --material NYLON --part-type structural
  %(prog)s --strength low --material TPU --part-type flexible --format json

Strength levels: low, medium, high, very_high
Materials: PLA, PETG, ABS, ASA, TPU, NYLON, PC, CARBON_FIBER, WOOD
Priorities: speed, strength, balanced, material
        """
    )
    
    parser.add_argument(
        "--strength", "-s",
        type=str,
        required=True,
        choices=[s.value for s in StrengthRequirement],
        help="Required part strength level"
    )
    
    parser.add_argument(
        "--material", "-m",
        type=str,
        required=True,
        choices=[m.value for m in MaterialType],
        help="Filament material type"
    )
    
    parser.add_argument(
        "--priority", "-p",
        type=str,
        default="balanced",
        choices=[p.value for p in Priority],
        help="Optimization priority (default: balanced)"
    )
    
    parser.add_argument(
        "--part-type",
        type=str,
        choices=[pt.value for pt in PartType],
        help="Type of part being printed"
    )
    
    parser.add_argument(
        "--load",
        type=str,
        choices=[ld.value for ld in LoadDirection],
        help="Expected load direction on the part"
    )
    
    parser.add_argument(
        "--wall-count",
        type=int,
        help="Override recommended wall/perimeter count"
    )
    
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    
    args = parser.parse_args()
    
    try:
        strength = StrengthRequirement(args.strength.lower())
        material = MaterialType(args.material.upper())
        priority = Priority(args.priority.lower())
        
        part_type = PartType(args.part_type.lower()) if args.part_type else None
        load_direction = LoadDirection(args.load.lower()) if args.load else None
    except ValueError as e:
        print(f"[ERR] Invalid parameter: {e}", file=sys.stderr)
        sys.exit(1)
    
    if args.wall_count is not None and args.wall_count < 1:
        print("[ERR] Wall count must be at least 1", file=sys.stderr)
        sys.exit(1)
    
    result = optimize_infill(
        material=material,
        strength=strength,
        priority=priority,
        part_type=part_type,
        load_direction=load_direction,
        wall_count=args.wall_count
    )
    
    print_results(result, args.format)


if __name__ == "__main__":
    main()
