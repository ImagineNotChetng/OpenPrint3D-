#!/usr/bin/env python3
"""
first_layer_calibration.py

Generate comprehensive first layer calibration guide with gcode suggestions
and z-offset recommendations for different bed surfaces.

Usage:
    python tools/first_layer_calibration.py --surface smooth_pei
    python tools/first_layer_calibration.py --surface glass --format json
    python tools/first_layer_calibration.py --surface textured_pei
"""

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class ZOffsetRecommendation:
    surface: str
    base_offset: float
    range_min: float
    range_max: float
    notes: list[str] = field(default_factory=list)


@dataclass
class GCodeTemplate:
    name: str
    description: str
    gcode: str


@dataclass
class FirstLayerCalibration:
    surface: str
    z_offset: ZOffsetRecommendation
    recommended_temps: dict
    recommended_speeds: dict
    first_layer_height: float
    gcode_templates: list[GCodeTemplate]
    inspection_criteria: list[str]
    troubleshooting: list[dict]


SURFACE_DATA = {
    "smooth_pei": {
        "aliases": ["smooth pei", "pei smooth", "ultem", "pei 9085", "smooth pei"],
        "z_offset": -0.02,
        "z_range": (-0.05, 0.02),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Smooth PEI provides excellent adhesion but can cause part to stick too firmly",
            "Use printer's柔性分离片 or PEI separator for easy removal",
            "Clean with isopropyl alcohol (IPA) between prints",
            "Avoid touching surface with bare hands - oils reduce adhesion"
        ]
    },
    "textured_pei": {
        "aliases": ["textured pei", "powder coated", "textured pei"],
        "z_offset": 0.02,
        "z_range": (-0.02, 0.06),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Textured surface provides mechanical grip for better first layer",
            "More forgiving on z-offset errors than smooth PEI",
            "Can achieve better first layer squish with slight positive offset",
            "Clean with IPA, avoid abrasive cleaning"
        ]
    },
    "glass": {
        "aliases": ["glass", "mirror", "float glass", "glass bed"],
        "z_offset": 0.0,
        "z_range": (-0.03, 0.04),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Glass provides very flat, level surface",
            "Requires adhesion aids: glue stick, hairspray, or PEI sheet",
            "Easy part removal once cooled below 40C",
            "Clean thoroughly with glass cleaner or IPA"
        ]
    },
    "textured_glass": {
        "aliases": ["textured glass", "textured glass bed"],
        "z_offset": 0.02,
        "z_range": (-0.01, 0.05),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Textured glass offers better adhesion than smooth glass",
            "Provides more grip for the first layer",
            "Still benefits from glue or other adhesion aids",
            "Good compromise between glass smoothness and PEI grip"
        ]
    },
    "pc": {
        "aliases": ["pc", "polycarbonate", "polycarbonate bed"],
        "z_offset": -0.01,
        "z_range": (-0.04, 0.02),
        "first_layer_temp": 100,
        "nozzle_temp": 250,
        "notes": [
            "Polycarbonate bed requires high temperatures",
            "Excellent for high-temp filaments (ABS, PC, Nylon)",
            "Can be difficult to remove parts - use spatula",
            "Allow to fully cool before removal"
        ]
    },
    "buildtak": {
        "aliases": ["buildtak", "nylon buildtak"],
        "z_offset": -0.02,
        "z_range": (-0.05, 0.01),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "BuildTak provides good adhesion for most filaments",
            "Avoid using glue or release agents - can damage surface",
            "Replace when worn or damaged",
            "Clean with warm water and mild soap if needed"
        ]
    },
    "tape": {
        "aliases": ["tape", "kapton", "blue tape", "painters tape", "masking tape"],
        "z_offset": 0.0,
        "z_range": (-0.02, 0.03),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Apply tape with no bubbles or wrinkles",
            "Replace tape when it starts lifting or tearing",
            "Works best with PLA and PETG",
            "Can use multiple layers for better adhesion"
        ]
    },
    "flex": {
        "aliases": ["flex", "magnetic", "flex plate", "magnetic flex"],
        "z_offset": -0.03,
        "z_range": (-0.06, 0.0),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Flexible magnetic plates allow easy part removal",
            "May need slight negative z-offset due to plate flex",
            "Ensure plate is fully seated before printing",
            "Clean magnetic surface - debris affects adhesion"
        ]
    },
    "spray": {
        "aliases": ["spray", "adhesive spray", "hair spray", "abs slurry"],
        "z_offset": 0.01,
        "z_range": (-0.02, 0.04),
        "first_layer_temp": 60,
        "nozzle_temp": 210,
        "notes": [
            "Apply thin, even coat - too much causes issues",
            "Allow spray to dry before printing",
            "Reapply when adhesion decreases",
            "Use in well-ventilated area"
        ]
    }
}


FILAMENT_TEMPS = {
    "PLA": {"nozzle": 210, "bed": 60, "fan": 100},
    "PETG": {"nozzle": 240, "bed": 80, "fan": 50},
    "ABS": {"nozzle": 250, "bed": 100, "fan": 0},
    "ASA": {"nozzle": 250, "bed": 100, "fan": 0},
    "PC": {"nozzle": 270, "bed": 110, "fan": 0},
    "Nylon": {"nozzle": 260, "bed": 90, "fan": 30},
    "TPU": {"nozzle": 220, "bed": 50, "fan": 80},
    "PVB": {"nozzle": 215, "bed": 75, "fan": 40},
    "PP": {"nozzle": 240, "bed": 100, "fan": 30},
    "CPE": {"nozzle": 245, "bed": 75, "fan": 30}
}


GCODES = {
    "first_layer_test": GCodeTemplate(
        name="First Layer Test Square",
        description="Simple square for testing first layer adhesion and squish",
        gcode="""
; First Layer Test Square
; Size: 50x50mm
; Height: 0.2mm (single layer)

G28 ; Home all axes
G90 ; Absolute positioning
G1 Z5 ; Lift nozzle

; Set first layer temperatures
M140 S60 ; Bed temp
M104 S210 ; Nozzle temp
M190 S60 ; Wait for bed temp
M109 S210 ; Wait for nozzle temp

; First layer settings
G1 Z0.2 ; First layer height (adjust for your setup)
G1 E2 ; Extrude small amount to prime
G1 X0 Y0 F3000 ; Move to start position

; 50mm square perimeter
G1 X50 Y0 E5
G1 X50 Y50 E5
G1 X0 Y50 E5
G1 X0 Y0 E5

; Internal infill for visual inspection
G1 X10 Y10 E2
G1 X40 Y10 E2
G1 X40 Y40 E2
G1 X10 Y40 E2
G1 X10 Y10 E2

G1 Z5 ; Lift nozzle
M104 S0 ; Turn off nozzle
M140 S0 ; Turn off bed
"""
    ),
    "temp_calibration": GCodeTemplate(
        name="Temperature Calibration Tower",
        description="Print tower with changing temperatures for optimal adhesion",
        gcode="""
; Temperature Tower (simplified single-layer version)
; Prints multiple sections at different temperatures

G28
G90
M140 S60
M104 S200
M190 S60
M109 S200

G1 Z0.2

; Section 1: 200C
G1 X0 Y0
G1 X20 Y0 E5
G1 X20 Y20 E5
G1 X0 Y20 E5
G1 X0 Y0 E5
G1 X10 Y10 E1

; Section 2: 210C (move without extrusion)
G1 X30 Y0
G1 X50 Y0 E5
G1 X50 Y20 E5
G1 X30 Y20 E5
G1 X30 Y0 E5
G1 X40 Y10 E1

; Section 3: 220C
G1 X60 Y0
G1 X80 Y0 E5
G1 X80 Y20 E5
G1 X60 Y20 E5
G1 X60 Y0 E5
G1 X70 Y10 E1

; Section 4: 230C
G1 X90 Y0
G1 X110 Y0 E5
G1 X110 Y20 E5
G1 X90 Y20 E5
G1 X90 Y0 E5
G1 X100 Y10 E1

G1 Z10
M104 S0
M140 S0
"""
    ),
    "z_offset_calibration": GCodeTemplate(
        name="Z-Offset Calibration Strip",
        description="Multiple passes at different Z heights to find optimal offset",
        gcode="""
; Z-Offset Calibration Strip
; Prints 5 strips at different Z heights
; Adjust M851 Z value based on best result

G28
G90
M140 S60
M104 S210
M190 S60
M109 S210

; Strip 1: Z = -0.1mm (too close)
G1 Z0.1
G1 X0 Y5
G1 X100 Y5 E10
G1 Z0.3

; Strip 2: Z = -0.05mm (slightly close)
G1 X0 Y15
G1 X100 Y15 E10
G1 Z0.25

; Strip 3: Z = 0mm (baseline)
G1 X0 Y25
G1 X100 Y25 E10
G1 Z0.3

; Strip 4: Z = +0.05mm (slightly far)
G1 X0 Y35
G1 X100 Y35 E10
G1 Z0.35

; Strip 5: Z = +0.1mm (too far)
G1 X0 Y45
G1 X100 Y45 E10

G1 Z10
M104 S0
M140 S0
"""
    ),
    "flow_calibration": GCodeTemplate(
        name="Flow Rate Calibration",
        description="Single layer squares to calibrate extrusion flow",
        gcode="""
; Flow Rate Calibration Squares
; Print at 90%, 100%, 110% flow rates
; Measure and compare to find optimal

G28
G90
M140 S60
M104 S210
M190 S60
M109 S210

G1 Z0.2

; Square 1: 20x20mm at 90% flow
; Set your slicer to 90% flow or use M221
G1 X10 Y10
G1 X30 Y10 E3
G1 X30 Y30 E3
G1 X10 Y30 E3
G1 X10 Y10 E3

; Square 2: 20x20mm at 100% flow
G1 X40 Y10
G1 X60 Y10 E3
G1 X60 Y30 E3
G1 X40 Y30 E3
G1 X40 Y10 E3

; Square 3: 20x20mm at 110% flow
G1 X70 Y10
G1 X90 Y10 E3
G1 X90 Y30 E3
G1 X70 Y30 E3
G1 X70 Y10 E3

G1 Z10
M104 S0
M140 S0
"""
    ),
    "bed_leveling": GCodeTemplate(
        name="Bed Leveling Pattern",
        description="Grid pattern to check and adjust bed level",
        gcode="""
; Bed Leveling Check Pattern
; Prints lines at each corner and center

G28
G90
M140 S60
M104 S210
M190 S60
M109 S210

G1 Z0.2

; Front left corner
G1 X10 Y10
G1 X30 Y10 E3

; Front right corner  
G1 X170 Y10
G1 X190 Y10 E3

; Back left corner
G1 X10 Y190
G1 X30 Y190 E3

; Back right corner
G1 X170 Y190
G1 X190 Y190 E3

; Center X
G1 X95 Y10
G1 X95 Y190 E3

; Center Y
G1 X10 Y95
G1 X190 Y95 E3

G1 Z10
M104 S0
M140 S0
"""
    )
}


INSPECTION_CRITERIA = [
    "Layer is fully attached with no lifting or peeling at edges",
    "No gaps or voids between extrusion lines",
    "Lines are smooth and properly squished together",
    "Single extrusion width is consistent (not vary in width)",
    "No scarring or ripples on the surface",
    "Corners are sharp and well-defined",
    "Filament is not pushed up around nozzle (indicates too close)",
    "No stringing or blobs on the layer",
    "Surface has slight glossy sheen (too cold = matte, too hot = droopy)"
]


TROUBLESHOOTING = [
    {
        "issue": "Edges lifting/peeling",
        "causes": ["Bed temperature too low", "Z-offset too high (nozzle too far)", "Poor bed adhesion", "Drafts/cold environment"],
        "solutions": [
            "Increase bed temperature by 5-10C",
            "Decrease Z-offset by 0.02mm",
            "Clean bed with IPA, apply adhesion aid",
            "Print with enclosure or cover printer"
        ]
    },
    {
        "issue": "Nozzle scraping/pushing filament",
        "causes": ["Z-offset too low (nozzle too close)", "Bed not level", "First layer height too low"],
        "solutions": [
            "Increase Z-offset by 0.02mm",
            "Level bed more precisely",
            "Increase first layer height to 0.25mm"
        ]
    },
    {
        "issue": "Gaps between lines",
        "causes": ["Extrusion width too narrow", "Flow rate too low", "Nozzle temperature too low"],
        "solutions": [
            "Increase extrusion width in slicer",
            "Increase flow rate by 5-10%",
            "Increase nozzle temperature by 5-10C"
        ]
    },
    {
        "issue": "Overly squished/wavy lines",
        "causes": ["Z-offset too low", "Nozzle temperature too high", "First layer too thick"],
        "solutions": [
            "Increase Z-offset by 0.01-0.02mm",
            "Decrease nozzle temperature by 5C",
            "Reduce first layer height"
        ]
    },
    {
        "issue": "Inconsistent line width",
        "causes": ["Bed not level", "Belt tension issues", "Extruder skipping"],
        "solutions": [
            "Re-level bed with paper method or probe",
            "Check and adjust belt tension",
            "Clean extruder gear, check for filament grinding"
        ]
    },
    {
        "issue": "Part stuck too firmly",
        "causes": ["Smooth PEI surface", "Too much adhesion", "No release agent"],
        "solutions": [
            "Use PEI separator/柔性片",
            "Apply thin layer of glue stick before print",
            "Allow bed to cool below 40C before removal"
        ]
    }
]


def normalize_surface(surface: str) -> str:
    """Normalize surface input to standard key."""
    surface = surface.lower().strip()
    
    for key, data in SURFACE_DATA.items():
        if surface == key:
            return key
        for alias in data["aliases"]:
            if alias in surface or surface in alias:
                return key
    
    return "smooth_pei"


def get_calibration(surface: str, filament: str = "PLA") -> FirstLayerCalibration:
    """Generate first layer calibration data."""
    surface = normalize_surface(surface)
    surf_data = SURFACE_DATA[surface]
    fil_data = FILAMENT_TEMPS.get(filament, FILAMENT_TEMPS["PLA"])
    
    z_offset = ZOffsetRecommendation(
        surface=surface,
        base_offset=surf_data["z_offset"],
        range_min=surf_data["z_range"][0],
        range_max=surf_data["z_range"][1],
        notes=surf_data["notes"]
    )
    
    recommended_temps = {
        "nozzle_first_layer": fil_data["nozzle"] - 5,
        "nozzle_range": f"{fil_data['nozzle']-15}-{fil_data['nozzle']+10}",
        "bed_first_layer": surf_data["first_layer_temp"],
        "bed_range": f"{surf_data['first_layer_temp']-10}-{surf_data['first_layer_temp']+15}",
        "fan_percent": fil_data["fan"],
        "filament": filament
    }
    
    recommended_speeds = {
        "first_layer": 30,
        "first_layer_range": "20-40",
        "perimeters": 25,
        "infill": 45
    }
    
    return FirstLayerCalibration(
        surface=surface,
        z_offset=z_offset,
        recommended_temps=recommended_temps,
        recommended_speeds=recommended_speeds,
        first_layer_height=0.2,
        gcode_templates=list(GCODES.values()),
        inspection_criteria=INSPECTION_CRITERIA,
        troubleshooting=TROUBLESHOOTING
    )


def format_guide(cal: FirstLayerCalibration) -> str:
    """Format calibration guide as text."""
    output = []
    output.append("=" * 65)
    output.append("FIRST LAYER CALIBRATION GUIDE")
    output.append("=" * 65)
    output.append(f"Surface: {cal.surface.replace('_', ' ').title()}")
    output.append("")
    
    output.append("Z-OFFSET RECOMMENDATIONS")
    output.append("-" * 40)
    output.append(f"Base Z-Offset:        {cal.z_offset.base_offset:+.2f}mm")
    output.append(f"Valid Range:          {cal.z_offset.range_min:+.2f}mm to {cal.z_offset.range_max:+.2f}mm")
    output.append("")
    output.append("Notes:")
    for note in cal.z_offset.notes:
        output.append(f"  • {note}")
    output.append("")
    
    output.append("TEMPERATURE SETTINGS")
    output.append("-" * 40)
    output.append(f"Filament:             {cal.recommended_temps['filament']}")
    output.append(f"Nozzle (First Layer): {cal.recommended_temps['nozzle_first_layer']}°C ({cal.recommended_temps['nozzle_range']}°C)")
    output.append(f"Bed (First Layer):   {cal.recommended_temps['bed_first_layer']}°C ({cal.recommended_temps['bed_range']}°C)")
    output.append(f"Fan Speed:            {cal.recommended_temps['fan_percent']}%")
    output.append("")
    
    output.append("SPEED SETTINGS")
    output.append("-" * 40)
    output.append(f"First Layer Speed:   {cal.recommended_speeds['first_layer']}mm/s ({cal.recommended_speeds['first_layer_range']}mm/s)")
    output.append(f"First Layer Height:  {cal.first_layer_height}mm")
    output.append("")
    
    output.append("GCODE TEMPLATES FOR CALIBRATION")
    output.append("-" * 40)
    for i, g in enumerate(cal.gcode_templates, 1):
        output.append(f"{i}. {g.name}")
        output.append(f"   {g.description}")
    output.append("")
    
    output.append("INSPECTION CRITERIA")
    output.append("-" * 40)
    for crit in cal.inspection_criteria:
        output.append(f"  ✓ {crit}")
    output.append("")
    
    output.append("TROUBLESHOOTING")
    output.append("-" * 40)
    for item in cal.troubleshooting:
        output.append(f"Issue: {item['issue']}")
        output.append(f"  Causes: {', '.join(item['causes'][:2])}")
        output.append(f"  Solutions: {item['solutions'][0]}")
        output.append("")
    
    return "\n".join(output)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate first layer calibration guide with gcode suggestions."
    )
    parser.add_argument(
        "--surface", "-s",
        default="smooth_pei",
        help="Bed surface type (smooth_pei, textured_pei, glass, textured_glass, pc, buildtak, tape, flex, spray)"
    )
    parser.add_argument(
        "--filament", "-f",
        default="PLA",
        help="Filament type for temperature recommendations"
    )
    parser.add_argument(
        "--format", "-fo",
        choices=["text", "json", "simple"],
        default="text",
        help="Output format"
    )
    parser.add_argument(
        "--gcode", "-g",
        choices=["all", "first_layer_test", "temp_calibration", "z_offset_calibration", "flow_calibration", "bed_leveling"],
        default="all",
        help="Gcode template to output"
    )

    args = parser.parse_args()
    
    try:
        cal = get_calibration(args.surface, args.filament)
        
        if args.format == "json":
            gcode_dict = {}
            for g in cal.gcode_templates:
                gcode_dict[g.name.lower().replace(" ", "_")] = {
                    "description": g.description,
                    "gcode": g.gcode.strip()
                }
            
            output = {
                "surface": cal.surface,
                "z_offset": {
                    "base_mm": cal.z_offset.base_offset,
                    "range_min_mm": cal.z_offset.range_min,
                    "range_max_mm": cal.z_offset.range_max,
                    "notes": cal.z_offset.notes
                },
                "temperatures": cal.recommended_temps,
                "speeds": cal.recommended_speeds,
                "first_layer_height_mm": cal.first_layer_height,
                "gcode_templates": gcode_dict,
                "inspection_criteria": cal.inspection_criteria,
                "troubleshooting": cal.troubleshooting
            }
            print(json.dumps(output, indent=2))
            
        elif args.format == "simple":
            print(f"surface={cal.surface}")
            print(f"z_offset={cal.z_offset.base_offset}")
            print(f"z_offset_range={cal.z_offset.range_min},{cal.z_offset.range_max}")
            print(f"nozzle_temp={cal.recommended_temps['nozzle_first_layer']}")
            print(f"bed_temp={cal.recommended_temps['bed_first_layer']}")
            print(f"first_layer_speed={cal.recommended_speeds['first_layer']}")
            print(f"first_layer_height={cal.first_layer_height}")
            
        else:
            if args.gcode == "all":
                print(format_guide(cal))
            else:
                g = GCODES.get(args.gcode)
                if g:
                    print(f"; {g.name}")
                    print(f"; {g.description}")
                    print(g.gcode)
                else:
                    print(format_guide(cal))
                    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
