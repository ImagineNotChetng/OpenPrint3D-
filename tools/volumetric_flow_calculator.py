#!/usr/bin/env python3
"""
volumetric_flow_calculator.py

Calculate maximum volumetric flow rate based on nozzle size and hotend capabilities.
Includes suggestions for optimal print speeds.

Usage:
    python tools/volumetric_flow_calculator.py --nozzle 0.4 --hotend standard
    python tools/volumetric_flow_calculator.py --nozzle 0.6 --hotend volcano --layer-height 0.3
    python tools/volumetric_flow_calculator.py --nozzle 0.8 --hotend supervolcano --format json
"""

import argparse
import json
import math
import sys
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class HotendType(Enum):
    STANDARD = "standard"
    VOLCANO = "volcano"
    SUPER_VOLCANO = "super_volcano"
    CHT = "cht"
    MOSQUITO = "mosquito"
    MOSQUITO_MAGNUM = "mosquito_magnum"
    RAPIDO = "rapido"
    REVO_SIX = "revo_six"
    REVO_VORON = "revo_voron"
    DRAGON = "dragon"
    DRAGON_HOTEND = "dragon_hotend"


HOTEND_FLOW_LIMITS = {
    HotendType.STANDARD: {
        "max_flow_mm3_s": 15,
        "typical_flow_mm3_s": 10,
        "optimal_temp_range": (200, 240),
        "description": "Standard V6-style hotend - moderate melt zone, good for everyday printing",
        "max_speed_recommendation": "Suitable for speeds up to 100mm/s with 0.4mm nozzle"
    },
    HotendType.VOLCANO: {
        "max_flow_mm3_s": 30,
        "typical_flow_mm3_s": 22,
        "optimal_temp_range": (210, 260),
        "description": "E3D Volcano - extended melt zone for high flow applications",
        "max_speed_recommendation": "Supports speeds up to 150mm/s with 0.4mm nozzle, excellent for larger nozzles"
    },
    HotendType.SUPER_VOLCANO: {
        "max_flow_mm3_s": 45,
        "typical_flow_mm3_s": 35,
        "optimal_temp_range": (210, 260),
        "description": "E3D Super Volcano - maximum melt zone for extreme flow rates",
        "max_speed_recommendation": "Supports speeds up to 200mm/s, ideal for 0.6mm+ nozzles and production printing"
    },
    HotendType.CHT: {
        "max_flow_mm3_s": 35,
        "typical_flow_mm3_s": 25,
        "optimal_temp_range": (200, 260),
        "description": "CHT (Copper Heat Technology) - efficient melting with bi-metal design",
        "max_speed_recommendation": "Excellent thermal transfer, supports 120mm/s+ with good quality"
    },
    HotendType.MOSQUITO: {
        "max_flow_mm3_s": 20,
        "typical_flow_mm3_s": 14,
        "optimal_temp_range": (200, 260),
        "description": "Slice Engineering Mosquito - lightweight, efficient heat break",
        "max_speed_recommendation": "Precise temperature control, great for detailed prints at 80-100mm/s"
    },
    HotendType.MOSQUITO_MAGNUM: {
        "max_flow_mm3_s": 50,
        "typical_flow_mm3_s": 40,
        "optimal_temp_range": (210, 280),
        "description": "Slice Engineering Mosquito Magnum - high flow variant",
        "max_speed_recommendation": "Extreme flow capability, designed for high-speed and large nozzle printing"
    },
    HotendType.RAPIDO: {
        "max_flow_mm3_s": 40,
        "typical_flow_mm3_s": 30,
        "optimal_temp_range": (200, 270),
        "description": "Phaetus Rapido - high flow hotend with long melt zone",
        "max_speed_recommendation": "Great balance of speed and quality, supports 120mm/s+ easily"
    },
    HotendType.REVO_SIX: {
        "max_flow_mm3_s": 18,
        "typical_flow_mm3_s": 12,
        "optimal_temp_range": (200, 260),
        "description": "E3D Revo Six - rapid change nozzle system",
        "max_speed_recommendation": "Convenient nozzle changes, suitable for speeds up to 80mm/s"
    },
    HotendType.REVO_VORON: {
        "max_flow_mm3_s": 30,
        "typical_flow_mm3_s": 22,
        "optimal_temp_range": (210, 260),
        "description": "E3D Revo Voron - high flow variant for Voron printers",
        "max_speed_recommendation": "Designed for high-speed printers, supports 120mm/s+"
    },
    HotendType.DRAGON: {
        "max_flow_mm3_s": 20,
        "typical_flow_mm3_s": 14,
        "optimal_temp_range": (200, 260),
        "description": "Trianglelab Dragon - Mosquito clone with good performance",
        "max_speed_recommendation": "Good value option, supports 80-100mm/s reliably"
    },
    HotendType.DRAGON_HOTEND: {
        "max_flow_mm3_s": 35,
        "typical_flow_mm3_s": 26,
        "optimal_temp_range": (210, 270),
        "description": "Trianglelab Dragon Hotend - high flow variant",
        "max_speed_recommendation": "High flow at lower cost, supports 120mm/s+"
    }
}

NOZZLE_DATA = {
    0.2: {"typical_layer": 0.12, "typical_width": 0.24, "line_width_factor": 1.2},
    0.25: {"typical_layer": 0.15, "typical_width": 0.30, "line_width_factor": 1.2},
    0.3: {"typical_layer": 0.18, "typical_width": 0.36, "line_width_factor": 1.2},
    0.35: {"typical_layer": 0.20, "typical_width": 0.42, "line_width_factor": 1.2},
    0.4: {"typical_layer": 0.20, "typical_width": 0.45, "line_width_factor": 1.125},
    0.5: {"typical_layer": 0.25, "typical_width": 0.55, "line_width_factor": 1.1},
    0.6: {"typical_layer": 0.30, "typical_width": 0.65, "line_width_factor": 1.08},
    0.8: {"typical_layer": 0.40, "typical_width": 0.85, "line_width_factor": 1.06},
    1.0: {"typical_layer": 0.50, "typical_width": 1.05, "line_width_factor": 1.05},
    1.2: {"typical_layer": 0.60, "typical_width": 1.25, "line_width_factor": 1.04}
}

MATERIAL_FLOW_FACTORS = {
    "PLA": {"flow_factor": 1.0, "temp_offset": 0, "notes": "Standard reference material"},
    "PLA+": {"flow_factor": 0.95, "temp_offset": 5, "notes": "Slightly higher viscosity"},
    "PETG": {"flow_factor": 0.85, "temp_offset": 20, "notes": "Higher viscosity, needs more heat"},
    "ABS": {"flow_factor": 0.90, "temp_offset": 30, "notes": "Good flow at higher temps"},
    "ASA": {"flow_factor": 0.88, "temp_offset": 30, "notes": "Similar to ABS"},
    "TPU": {"flow_factor": 0.70, "temp_offset": 10, "notes": "High viscosity, slow printing recommended"},
    "TPU_SOFT": {"flow_factor": 0.60, "temp_offset": 15, "notes": "Very soft TPU, very slow printing"},
    "NYLON": {"flow_factor": 0.80, "temp_offset": 40, "notes": "High temp, moderate viscosity"},
    "PC": {"flow_factor": 0.75, "temp_offset": 60, "notes": "Very high temp, needs capable hotend"},
    "CF_PLA": {"flow_factor": 0.90, "temp_offset": 5, "notes": "Carbon fiber filled - watch for abrasion"},
    "CF_NYLON": {"flow_factor": 0.70, "temp_offset": 40, "notes": "Carbon fiber nylon - abrasive"},
    "WOOD": {"flow_factor": 0.85, "temp_offset": 0, "notes": "Wood filled - watch for clogging"},
    "SILK": {"flow_factor": 0.90, "temp_offset": 5, "notes": "Silk PLA - slightly different flow"},
    "MARBLE": {"flow_factor": 0.85, "temp_offset": 0, "notes": "Marble filled - watch nozzle wear"}
}


@dataclass
class SpeedSuggestion:
    speed_mm_s: int
    purpose: str
    flow_rate_mm3_s: float
    flow_percentage: float


@dataclass
class VolumetricFlowResult:
    nozzle_diameter: float
    hotend_type: str
    layer_height: float
    line_width: float
    max_flow_rate_mm3_s: float
    typical_flow_rate_mm3_s: float
    recommended_flow_rate_mm3_s: float
    flow_limited: bool
    max_print_speed_mm_s: float
    optimal_print_speed_mm_s: float
    speed_suggestions: list[SpeedSuggestion]
    material: str
    material_notes: str
    temperature_recommendation: tuple[int, int]
    hotend_description: str
    warnings: list[str]
    notes: list[str]


def calculate_flow_rate(speed_mm_s: float, layer_height: float, line_width: float) -> float:
    return speed_mm_s * layer_height * line_width


def calculate_max_speed(flow_rate_mm3_s: float, layer_height: float, line_width: float) -> float:
    if layer_height <= 0 or line_width <= 0:
        return 0
    return flow_rate_mm3_s / (layer_height * line_width)


def get_nozzle_data(nozzle_diameter: float) -> dict:
    if nozzle_diameter in NOZZLE_DATA:
        return NOZZLE_DATA[nozzle_diameter]
    
    closest = min(NOZZLE_DATA.keys(), key=lambda x: abs(x - nozzle_diameter))
    data = NOZZLE_DATA[closest].copy()
    
    ratio = nozzle_diameter / closest
    data["typical_layer"] = data["typical_layer"] * ratio
    data["typical_width"] = nozzle_diameter * data["line_width_factor"]
    
    return data


def calculate_volumetric_flow(
    nozzle_diameter: float,
    hotend_type: HotendType,
    layer_height: Optional[float] = None,
    line_width: Optional[float] = None,
    material: str = "PLA"
) -> VolumetricFlowResult:
    hotend_config = HOTEND_FLOW_LIMITS[hotend_type]
    nozzle_data = get_nozzle_data(nozzle_diameter)
    
    if layer_height is None:
        layer_height = nozzle_data["typical_layer"]
    
    if line_width is None:
        line_width = nozzle_data["typical_width"]
    
    max_layer_height = nozzle_diameter * 0.8
    min_layer_height = nozzle_diameter * 0.2
    
    max_flow = hotend_config["max_flow_mm3_s"]
    typical_flow = hotend_config["typical_flow_mm3_s"]
    
    material_config = MATERIAL_FLOW_FACTORS.get(material.upper(), MATERIAL_FLOW_FACTORS["PLA"])
    material_flow_factor = material_config["flow_factor"]
    material_notes = material_config["notes"]
    
    effective_max_flow = max_flow * material_flow_factor
    effective_typical_flow = typical_flow * material_flow_factor
    
    recommended_flow = effective_typical_flow * 0.85
    
    theoretical_max_speed = calculate_max_speed(effective_max_flow, layer_height, line_width)
    optimal_speed = calculate_max_speed(recommended_flow, layer_height, line_width)
    
    speed_suggestions = []
    
    speed_suggestions.append(SpeedSuggestion(
        speed_mm_s=int(optimal_speed * 0.5),
        purpose="High quality / Fine detail",
        flow_rate_mm3_s=round(calculate_flow_rate(optimal_speed * 0.5, layer_height, line_width), 1),
        flow_percentage=round((calculate_flow_rate(optimal_speed * 0.5, layer_height, line_width) / effective_max_flow) * 100, 1)
    ))
    
    speed_suggestions.append(SpeedSuggestion(
        speed_mm_s=int(optimal_speed * 0.75),
        purpose="Standard quality (Recommended)",
        flow_rate_mm3_s=round(calculate_flow_rate(optimal_speed * 0.75, layer_height, line_width), 1),
        flow_percentage=round((calculate_flow_rate(optimal_speed * 0.75, layer_height, line_width) / effective_max_flow) * 100, 1)
    ))
    
    speed_suggestions.append(SpeedSuggestion(
        speed_mm_s=int(optimal_speed),
        purpose="Balanced speed/quality",
        flow_rate_mm3_s=round(recommended_flow, 1),
        flow_percentage=round((recommended_flow / effective_max_flow) * 100, 1)
    ))
    
    speed_suggestions.append(SpeedSuggestion(
        speed_mm_s=int(min(theoretical_max_speed * 0.9, optimal_speed * 1.3)),
        purpose="High speed / Draft",
        flow_rate_mm3_s=round(calculate_flow_rate(min(theoretical_max_speed * 0.9, optimal_speed * 1.3), layer_height, line_width), 1),
        flow_percentage=round((calculate_flow_rate(min(theoretical_max_speed * 0.9, optimal_speed * 1.3), layer_height, line_width) / effective_max_flow) * 100, 1)
    ))
    
    if theoretical_max_speed > 150:
        speed_suggestions.append(SpeedSuggestion(
            speed_mm_s=int(min(theoretical_max_speed * 0.95, 200)),
            purpose="Maximum speed (Quality may suffer)",
            flow_rate_mm3_s=round(calculate_flow_rate(min(theoretical_max_speed * 0.95, 200), layer_height, line_width), 1),
            flow_percentage=round((calculate_flow_rate(min(theoretical_max_speed * 0.95, 200), layer_height, line_width) / effective_max_flow) * 100, 1)
        ))
    
    warnings = []
    notes = []
    
    flow_limited = theoretical_max_speed < optimal_speed * 1.5
    if flow_limited:
        warnings.append(f"Flow rate limited by hotend capacity. Consider upgrading to a high-flow hotend for faster printing.")
    
    if layer_height > max_layer_height:
        warnings.append(f"Layer height {layer_height}mm exceeds recommended maximum of {max_layer_height:.2f}mm for this nozzle.")
    elif layer_height < min_layer_height:
        warnings.append(f"Layer height {layer_height}mm is below recommended minimum of {min_layer_height:.2f}mm for this nozzle.")
    
    if material.upper() in ["TPU", "TPU_SOFT"]:
        warnings.append("TPU materials require slower speeds for consistent extrusion. Reduce speeds by 30-50%.")
    
    if material.upper() in ["CF_PLA", "CF_NYLON"]:
        warnings.append("Carbon fiber materials are abrasive. Use hardened steel or ruby nozzle.")
    
    base_temp_min, base_temp_max = hotend_config["optimal_temp_range"]
    temp_offset = material_config["temp_offset"]
    temp_recommendation = (base_temp_min + temp_offset, base_temp_max + temp_offset)
    
    if material.upper() == "PC" and hotend_type in [HotendType.STANDARD, HotendType.REVO_SIX]:
        warnings.append("PC requires very high temperatures. Ensure hotend is rated for 280C+.")
    
    notes.append(f"Material: {material} - {material_notes}")
    notes.append(f"Optimal temperature range: {temp_recommendation[0]}-{temp_recommendation[1]}C")
    notes.append(f"Layer height: {layer_height}mm ({(layer_height/nozzle_diameter)*100:.0f}% of nozzle diameter)")
    notes.append(f"Line width: {line_width}mm ({(line_width/nozzle_diameter)*100:.0f}% of nozzle diameter)")
    
    return VolumetricFlowResult(
        nozzle_diameter=nozzle_diameter,
        hotend_type=hotend_type.value,
        layer_height=layer_height,
        line_width=line_width,
        max_flow_rate_mm3_s=round(effective_max_flow, 1),
        typical_flow_rate_mm3_s=round(effective_typical_flow, 1),
        recommended_flow_rate_mm3_s=round(recommended_flow, 1),
        flow_limited=flow_limited,
        max_print_speed_mm_s=round(theoretical_max_speed, 1),
        optimal_print_speed_mm_s=round(optimal_speed, 1),
        speed_suggestions=speed_suggestions,
        material=material,
        material_notes=material_notes,
        temperature_recommendation=temp_recommendation,
        hotend_description=hotend_config["description"],
        warnings=warnings,
        notes=notes
    )


def print_results(result: VolumetricFlowResult, format_type: str = "text") -> None:
    if format_type == "json":
        output = {
            "nozzle_diameter_mm": result.nozzle_diameter,
            "hotend_type": result.hotend_type,
            "layer_height_mm": result.layer_height,
            "line_width_mm": result.line_width,
            "flow_rates": {
                "max_mm3_s": result.max_flow_rate_mm3_s,
                "typical_mm3_s": result.typical_flow_rate_mm3_s,
                "recommended_mm3_s": result.recommended_flow_rate_mm3_s
            },
            "speeds": {
                "max_mm_s": result.max_print_speed_mm_s,
                "optimal_mm_s": result.optimal_print_speed_mm_s
            },
            "speed_suggestions": [
                {
                    "speed_mm_s": s.speed_mm_s,
                    "purpose": s.purpose,
                    "flow_rate_mm3_s": s.flow_rate_mm3_s,
                    "flow_percentage": s.flow_percentage
                }
                for s in result.speed_suggestions
            ],
            "material": result.material,
            "temperature_range_c": list(result.temperature_recommendation),
            "hotend_description": result.hotend_description,
            "warnings": result.warnings,
            "notes": result.notes,
            "flow_limited": result.flow_limited
        }
        print(json.dumps(output, indent=2))
    else:
        print(f"\n{'='*65}")
        print("VOLUMETRIC FLOW RATE CALCULATOR")
        print(f"{'='*65}")
        
        print(f"\n{'-'*65}")
        print("HARDWARE CONFIGURATION")
        print(f"{'-'*65}")
        print(f"  Nozzle Diameter:    {result.nozzle_diameter} mm")
        print(f"  Hotend Type:        {result.hotend_type.upper().replace('_', ' ')}")
        print(f"  Layer Height:       {result.layer_height} mm")
        print(f"  Line Width:         {result.line_width} mm")
        print(f"  Material:           {result.material}")
        
        print(f"\n{'-'*65}")
        print("FLOW RATE LIMITS")
        print(f"{'-'*65}")
        print(f"  Maximum Flow:       {result.max_flow_rate_mm3_s} mm3/s")
        print(f"  Typical Flow:       {result.typical_flow_rate_mm3_s} mm3/s")
        print(f"  Recommended Flow:   {result.recommended_flow_rate_mm3_s} mm3/s")
        
        print(f"\n{'-'*65}")
        print("SPEED LIMITS (at current layer height & line width)")
        print(f"{'-'*65}")
        print(f"  Maximum Speed:      {result.max_print_speed_mm_s} mm/s")
        print(f"  Optimal Speed:      {result.optimal_print_speed_mm_s} mm/s")
        
        print(f"\n{'-'*65}")
        print("SPEED SUGGESTIONS")
        print(f"{'-'*65}")
        print(f"  {'Speed':<10} {'Purpose':<30} {'Flow':<10} {'% Max':<8}")
        print(f"  {'-'*58}")
        for s in result.speed_suggestions:
            print(f"  {s.speed_mm_s:<10} {s.purpose:<30} {s.flow_rate_mm3_s} mm3/s  {s.flow_percentage}%")
        
        print(f"\n{'-'*65}")
        print("TEMPERATURE RECOMMENDATION")
        print(f"{'-'*65}")
        print(f"  Range: {result.temperature_recommendation[0]}-{result.temperature_recommendation[1]}C")
        
        if result.warnings:
            print(f"\n{'-'*65}")
            print("WARNINGS")
            print(f"{'-'*65}")
            for warning in result.warnings:
                print(f"  [!] {warning}")
        
        print(f"\n{'-'*65}")
        print("NOTES")
        print(f"{'-'*65}")
        for note in result.notes:
            print(f"  • {note}")
        
        print(f"\n{'-'*65}")
        print("HOTEND INFO")
        print(f"{'-'*65}")
        print(f"  {result.hotend_description}")
        
        print(f"{'='*65}\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate volumetric flow rate and optimal print speeds."
    )
    
    parser.add_argument(
        "--nozzle", "-n",
        type=float,
        required=True,
        help="Nozzle diameter in mm (e.g., 0.2, 0.4, 0.6, 0.8, 1.0)"
    )
    
    parser.add_argument(
        "--hotend", "-e",
        type=str,
        required=True,
        choices=[h.value for h in HotendType],
        help="Hotend type (e.g., standard, volcano, mosquito, rapido)"
    )
    
    parser.add_argument(
        "--layer-height", "-l",
        type=float,
        default=None,
        help="Layer height in mm (default: auto-calculated based on nozzle)"
    )
    
    parser.add_argument(
        "--line-width", "-w",
        type=float,
        default=None,
        help="Line width in mm (default: auto-calculated, typically 1.1-1.2x nozzle)"
    )
    
    parser.add_argument(
        "--material", "-m",
        type=str,
        default="PLA",
        choices=list(MATERIAL_FLOW_FACTORS.keys()),
        help="Filament material (default: PLA)"
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
    
    if args.layer_height is not None and args.layer_height <= 0:
        print("[ERR] Layer height must be positive", file=sys.stderr)
        sys.exit(1)
    
    if args.line_width is not None and args.line_width <= 0:
        print("[ERR] Line width must be positive", file=sys.stderr)
        sys.exit(1)
    
    try:
        hotend_type = HotendType(args.hotend.lower())
    except ValueError:
        print(f"[ERR] Invalid hotend type: {args.hotend}", file=sys.stderr)
        sys.exit(1)
    
    result = calculate_volumetric_flow(
        nozzle_diameter=args.nozzle,
        hotend_type=hotend_type,
        layer_height=args.layer_height,
        line_width=args.line_width,
        material=args.material
    )
    
    print_results(result, args.format)


if __name__ == "__main__":
    main()
