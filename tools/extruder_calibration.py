#!/usr/bin/env python3
"""
extruder_calibration.py

Tools for calibrating extruder steps-per-mm (E-steps) and verifying
extruder performance. Includes both measurement-based calibration and
test pattern generation.

Usage:
    python tools/extruder_calibration.py --method measure
    python tools/extruder_calibration.py --method test --output extruder_test.gcode
    python tools/extruder_calibration.py --calculate --marked 120 --extruded 100
    python tools/extruder_calibration.py --current-steps 400 --marked 120 --extruded 100
"""

import argparse
import json
import math
import sys
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class CalibrationMethod(Enum):
    MEASURE = "measure"
    TEST = "test"
    BOTH = "both"


class ExtruderType(Enum):
    DIRECT = "direct"
    BOWDEN = "bowden"
    GEARED_DIRECT = "geared_direct"


@dataclass
class ExtruderStepsConfig:
    name: str
    typical_steps: float
    steps_range: tuple
    gear_ratio: float
    microsteps: int
    notes: str


EXTRUDER_CONFIGS = {
    ExtruderType.DIRECT: ExtruderStepsConfig(
        name="Direct Drive",
        typical_steps=400.0,
        steps_range=(350, 450),
        gear_ratio=1.0,
        microsteps=16,
        notes="Direct drive - stepper directly drives the hobbed gear. Typical values 380-420 steps/mm."
    ),
    ExtruderType.BOWDEN: ExtruderStepsConfig(
        name="Bowden",
        typical_steps=400.0,
        steps_range=(350, 500),
        gear_ratio=1.0,
        microsteps=16,
        notes="Bowden - similar to direct but may vary based on drive gear. Check manufacturer specs."
    ),
    ExtruderType.GEARED_DIRECT: ExtruderStepsConfig(
        name="Geared Direct (BMG/Titan)",
        typical_steps=415.0,
        steps_range=(380, 450),
        gear_ratio=3.0,
        microsteps=16,
        notes="Geared extruders have reduction. BMG: ~415 steps/mm, Titan: ~469 steps/mm."
    )
}

KNOWN_EXTRUDER_STEPS = {
    "bmg": 415.0,
    "titan": 469.0,
    "h2": 467.0,
    "hemera": 409.0,
    "lgx_lite": 628.0,
    "lgx": 562.0,
    "sherpa_mini": 424.0,
    "sherpa": 400.0,
    "orbiter": 842.0,
    "orbiter_v2": 598.0,
    "clockwork2": 421.0,
    "ngsb": 456.0,
    "mini_stealthburner": 424.0,
    "generic_mk8": 420.0,
    "generic_mk7": 380.0
}


@dataclass
class CalibrationResult:
    current_steps: float
    new_steps: float
    adjustment_percent: float
    actual_extrusion: float
    requested_extrusion: float
    accuracy_percent: float


@dataclass
class TestPatternConfig:
    test_length: float
    test_speed: float
    retract_distance: float
    retract_speed: float
    prime_amount: float
    layer_height: float
    nozzle_diameter: float


DEFAULT_TEST_CONFIG = TestPatternConfig(
    test_length=100.0,
    test_speed=60.0,
    retract_distance=2.0,
    retract_speed=35.0,
    prime_amount=5.0,
    layer_height=0.2,
    nozzle_diameter=0.4
)


def calculate_new_steps(
    current_steps: float,
    marked_length: float,
    extruded_length: float
) -> CalibrationResult:
    if extruded_length <= 0:
        raise ValueError("Extruded length must be positive")
    
    actual_extrusion = marked_length
    requested_extrusion = extruded_length
    
    new_steps = current_steps * (extruded_length / marked_length)
    
    adjustment = ((new_steps - current_steps) / current_steps) * 100
    
    accuracy = (marked_length / extruded_length) * 100
    
    return CalibrationResult(
        current_steps=current_steps,
        new_steps=round(new_steps, 2),
        adjustment_percent=round(adjustment, 2),
        actual_extrusion=actual_extrusion,
        requested_extrusion=requested_extrusion,
        accuracy_percent=round(accuracy, 2)
    )


def generate_measurement_instructions() -> str:
    lines = [
        "",
        "=" * 60,
        "E-STEP CALIBRATION PROCEDURE",
        "=" * 60,
        "",
        "This calibration determines the correct steps-per-mm for your",
        "extruder to ensure accurate filament feeding.",
        "",
        "REQUIRED MATERIALS:",
        "  - Ruler or calipers (mm scale)",
        "  - Filament loaded in extruder",
        "",
        "PROCEDURE:",
        "",
        "1. PREPARE THE FILAMENT:",
        "   - Heat nozzle to printing temperature",
        "   - Extrude a small amount to ensure flow",
        "   - Retract filament 50-100mm from nozzle",
        "",
        "2. MARK THE FILAMENT:",
        "   - Use a marker to put a visible mark on the filament",
        "   - Position the mark exactly 100mm from the extruder entry",
        "     (or as close to extruder as you can measure)",
        "",
        "3. EXTRUDE TEST AMOUNT:",
        "   - Command: G92 E0 (reset extruder position)",
        "   - Command: G1 E100 F180 (extrude 100mm at 3mm/s)",
        "   - Or use your printer's extrude menu for 100mm",
        "",
        "4. MEASURE:",
        "   - Measure distance from extruder to your mark",
        "   - If mark disappeared: extruded >100mm (under steps)",
        "   - If mark still visible: extruded <100mm (over steps)",
        "",
        "5. CALCULATE NEW STEPS:",
        "   New Steps = Current Steps × (Requested / Actual)",
        "   Example: 400 × (100/95) = 421.05",
        "",
        "=" * 60,
    ]
    return "\n".join(lines)


def generate_test_pattern_gcode(
    config: TestPatternConfig,
    bed_temp: float = 60.0,
    nozzle_temp: float = 210.0
) -> str:
    lines = [
        "; Extruder Calibration Test Pattern",
        "; Generated by OpenPrint3D extruder_calibration.py",
        "; ========================================",
        ";",
        "; This pattern tests extruder consistency and accuracy.",
        "; Multiple extrusion moves with retraction tests.",
        ";",
        "; ========================================",
        "",
        "G90 ; Absolute positioning",
        "M82 ; Absolute extrusion mode",
        "",
        "; Set temperatures",
        f"M104 S{nozzle_temp:.0f} ; Set nozzle temperature",
        f"M109 S{nozzle_temp:.0f} ; Wait for nozzle temperature",
        f"M140 S{bed_temp:.0f} ; Set bed temperature",
        f"M190 S{bed_temp:.0f} ; Wait for bed temperature",
        "",
        "; Test Configuration:",
        f";   Test length: {config.test_length:.0f}mm per pass",
        f";   Test speed: {config.test_speed:.0f}mm/s",
        f";   Retraction: {config.retract_distance:.1f}mm @ {config.retract_speed:.0f}mm/s",
        "",
    ]
    return "\n".join(lines)


def generate_extrusion_consistency_test(
    config: TestPatternConfig,
    num_tests: int = 10
) -> str:
    lines = [
        "",
        "; ========================================",
        "; EXTRUSION CONSISTENCY TEST",
        "; Tests steady extrusion over time",
        "; ========================================",
        "",
    ]
    
    e_pos = 0.0
    
    for test_num in range(num_tests):
        lines.append(f"; Consistency test {test_num + 1}/{num_tests}")
        lines.append("")
        
        lines.append(f"G1 E{e_pos + config.prime_amount:.2f} F{config.test_speed * 60:.0f} ; Prime")
        e_pos += config.prime_amount
        
        lines.append(f"G1 E{e_pos - config.retract_distance:.2f} F{config.retract_speed * 60:.0f} ; Retract")
        e_pos -= config.retract_distance
        
        lines.append("; Dwell for retraction test")
        lines.append("G4 P500 ; Wait 500ms")
        
        lines.append(f"G1 E{e_pos + config.retract_distance + config.test_length:.2f} F{config.test_speed * 60:.0f} ; Extrude test length")
        e_pos += config.retract_distance + config.test_length
        
        lines.append(f"G1 E{e_pos - config.retract_distance:.2f} F{config.retract_speed * 60:.0f} ; Retract")
        e_pos -= config.retract_distance
        
        lines.append("")
    
    lines.append("; End consistency test")
    lines.append("")
    
    return "\n".join(lines)


def generate_speed_test(
    config: TestPatternConfig,
    speeds: list = None
) -> str:
    if speeds is None:
        speeds = [20, 40, 60, 80, 100, 120]
    
    lines = [
        "",
        "; ========================================",
        "; EXTRUSION SPEED TEST",
        "; Tests extruder at various speeds",
        "; ========================================",
        "",
    ]
    
    e_pos = 0.0
    
    for speed in speeds:
        lines.append(f"; Speed test: {speed} mm/s")
        lines.append(f"G1 E{e_pos + config.test_length:.2f} F{speed * 60:.0f}")
        e_pos += config.test_length
        lines.append(f"G1 E{e_pos - config.retract_distance:.2f} F{config.retract_speed * 60:.0f}")
        e_pos -= config.retract_distance
        lines.append("")
    
    return "\n".join(lines)


def generate_retraction_test(
    config: TestPatternConfig,
    distances: list = None,
    speeds: list = None
) -> str:
    if distances is None:
        distances = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]
    if speeds is None:
        speeds = [25, 35, 45, 60]
    
    lines = [
        "",
        "; ========================================",
        "; RETRACTION CALIBRATION TEST",
        "; Tests various retraction distances and speeds",
        "; ========================================",
        "",
    ]
    
    e_pos = 0.0
    
    lines.append("; Testing retraction distances")
    for dist in distances:
        lines.append(f"; Retraction distance: {dist}mm")
        lines.append(f"G1 E{e_pos + config.prime_amount:.2f} F{config.test_speed * 60:.0f}")
        e_pos += config.prime_amount
        lines.append(f"G1 E{e_pos - dist:.2f} F{config.retract_speed * 60:.0f}")
        e_pos -= dist
        lines.append("G4 P500")
        lines.append(f"G1 E{e_pos + dist:.2f} F{config.retract_speed * 60:.0f}")
        e_pos += dist
        lines.append("")
    
    lines.append("; Testing retraction speeds")
    for speed in speeds:
        lines.append(f"; Retraction speed: {speed} mm/s")
        lines.append(f"G1 E{e_pos + config.prime_amount:.2f} F{config.test_speed * 60:.0f}")
        e_pos += config.prime_amount
        lines.append(f"G1 E{e_pos - config.retract_distance:.2f} F{speed * 60:.0f}")
        e_pos -= config.retract_distance
        lines.append("G4 P500")
        lines.append(f"G1 E{e_pos + config.retract_distance:.2f} F{speed * 60:.0f}")
        e_pos += config.retract_distance
        lines.append("")
    
    return "\n".join(lines)


def generate_pressure_test(
    config: TestPatternConfig
) -> str:
    lines = [
        "",
        "; ========================================",
        "; PRESSURE BUILDUP TEST",
        "; Tests extruder behavior with pressure",
        "; ========================================",
        "",
    ]
    
    e_pos = 0.0
    
    lines.append("; High speed extrusion - pressure buildup")
    for i in range(5):
        lines.append(f"G1 E{e_pos + 50:.2f} F{100 * 60:.0f} ; Fast extrusion")
        e_pos += 50
        lines.append("G4 P200 ; Short pause")
        lines.append("")
    
    lines.append("; Slow extrusion - pressure release")
    for i in range(5):
        lines.append(f"G1 E{e_pos + 20:.2f} F{20 * 60:.0f} ; Slow extrusion")
        e_pos += 20
        lines.append("")
    
    return "\n".join(lines)


def generate_end_gcode() -> str:
    lines = [
        "",
        "; ========================================",
        "; END G-CODE",
        "; ========================================",
        "",
        "M104 S0 ; Turn off nozzle heater",
        "M140 S0 ; Turn off bed heater",
        "",
        "G1 E-5 F1800 ; Retract slightly",
        "",
        "; Park extruder",
        "G92 E0 ; Reset extruder",
        "",
        "M84 ; Disable motors",
        "",
        "; ========================================",
        "; EXTRUDER CALIBRATION TEST COMPLETE",
        "; ========================================",
        ";",
        "; Results analysis:",
        ";",
        "; CONSISTENCY TEST:",
        ";  - Filament should be consistent thickness",
        ";  - No grinding or slipping marks",
        ";  - Smooth, even extrusion throughout",
        ";",
        "; SPEED TEST:",
        ";  - Watch for clicking/skipping at high speeds",
        ";  - Note maximum reliable speed",
        ";  - Higher speeds may need higher temps",
        ";",
        "; RETRACTION TEST:",
        ";  - Find distance with no stringing",
        ";  - Find speed that works without jamming",
        ";  - Bowden needs more retraction than direct",
        ";",
        "; PRESSURE TEST:",
        ";  - Check for oozing during pauses",
        ";  - Check for under-extrusion after fast moves",
        ";",
        "; If extruder skips/grinds:",
        ";  - Reduce max speed in firmware",
        ";  - Check extruder tension",
        ";  - Verify filament path is clear",
        ";",
        "; ========================================",
    ]
    return "\n".join(lines)


def generate_extruder_calibration_gcode(
    config: TestPatternConfig,
    bed_temp: float = 60.0,
    nozzle_temp: float = 210.0,
    include_consistency: bool = True,
    include_speed: bool = True,
    include_retraction: bool = True,
    include_pressure: bool = True
) -> str:
    gcode_parts = []
    
    gcode_parts.append(generate_test_pattern_gcode(
        config=config,
        bed_temp=bed_temp,
        nozzle_temp=nozzle_temp
    ))
    
    if include_consistency:
        gcode_parts.append(generate_extrusion_consistency_test(config))
    
    if include_speed:
        gcode_parts.append(generate_speed_test(config))
    
    if include_retraction:
        gcode_parts.append(generate_retraction_test(config))
    
    if include_pressure:
        gcode_parts.append(generate_pressure_test(config))
    
    gcode_parts.append(generate_end_gcode())
    
    return "\n".join(gcode_parts)


def generate_klipper_extruder_config(
    new_steps: float,
    extruder_type: ExtruderType,
    max_speed: float = 50.0,
    rotation_distance: Optional[float] = None
) -> str:
    extruder_config = EXTRUDER_CONFIGS[extruder_type]
    
    if rotation_distance is None:
        full_steps_per_rotation = 200
        gear_ratio = extruder_config.gear_ratio
        microsteps = extruder_config.microsteps
        rotation_distance = (full_steps_per_rotation * microsteps * gear_ratio) / new_steps
    
    lines = [
        "# Extruder Configuration",
        "# Generated by OpenPrint3D extruder_calibration.py",
        "# ========================================",
        "",
        "[extruder]",
        f"step_pin: <your_step_pin>",
        f"dir_pin: <your_dir_pin>",
        f"enable_pin: !<your_enable_pin>",
        f"microsteps: {extruder_config.microsteps}",
        f"rotation_distance: {rotation_distance:.4f}",
        "",
        "# If using geared extruder, specify gear_ratio:",
    ]
    
    if extruder_config.gear_ratio != 1.0:
        lines.append(f"gear_ratio: {extruder_config.gear_ratio}:1")
    
    lines.extend([
        "",
        "# Alternative: use step_distance (deprecated but works)",
        f"# step_distance: {1/new_steps:.6f}",
        "",
        f"nozzle_diameter: 0.400",
        f"filament_diameter: 1.750",
        "",
        f"max_extrude_only_distance: 100.0",
        f"max_extrude_only_velocity: {max_speed * 60:.0f}",
        "",
        "# Your calibrated E-steps:",
        f"# steps_per_mm: {new_steps:.2f}",
        "",
        "# ========================================",
    ])
    
    return "\n".join(lines)


def format_calibration_result(result: CalibrationResult, verbose: bool = True) -> str:
    output = []
    output.append("=" * 50)
    output.append("E-STEP CALIBRATION RESULT")
    output.append("=" * 50)
    output.append("")
    output.append(f"Current E-steps:     {result.current_steps:.2f}")
    output.append(f"New E-steps:         {result.new_steps:.2f}")
    output.append(f"Adjustment:          {result.adjustment_percent:+.2f}%")
    output.append("")
    output.append(f"Requested extrusion: {result.requested_extrusion:.1f}mm")
    output.append(f"Actual extrusion:    {result.actual_extrusion:.1f}mm")
    output.append(f"Accuracy:            {result.accuracy_percent:.1f}%")
    output.append("")
    
    if verbose:
        output.append("-" * 50)
        output.append("CONFIGURATION UPDATE")
        output.append("-" * 50)
        output.append("")
        output.append("For Marlin firmware:")
        output.append(f"  M92 E{result.new_steps:.2f}")
        output.append(f"  M500 ; Save to EEPROM")
        output.append("")
        output.append("For Klipper firmware:")
        output.append(f"  [extruder]")
        output.append(f"  rotation_distance: <calculate from {result.new_steps:.2f}>")
        output.append("")
        output.append("For Prusa firmware:")
        output.append(f"  Settings -> Extruder -> Steps per mm: {result.new_steps:.2f}")
        output.append("")
    
    return "\n".join(output)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calibrate extruder steps-per-mm and test extruder performance."
    )
    parser.add_argument(
        "--method", "-m",
        type=str,
        choices=[m.value for m in CalibrationMethod],
        default=CalibrationMethod.MEASURE.value,
        help="Calibration method: measure (interactive), test (gcode), or both"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Output G-code file path (for test method)"
    )
    parser.add_argument(
        "--current-steps",
        type=float,
        help="Current E-steps per mm"
    )
    parser.add_argument(
        "--marked",
        type=float,
        help="Marked filament length remaining after test (mm)"
    )
    parser.add_argument(
        "--extruded",
        type=float,
        help="Requested extrusion amount (mm)"
    )
    parser.add_argument(
        "--extruder-type",
        type=str,
        choices=[e.value for e in ExtruderType],
        help="Extruder type for default values"
    )
    parser.add_argument(
        "--extruder-model",
        type=str,
        choices=list(KNOWN_EXTRUDER_STEPS.keys()),
        help="Known extruder model for starting steps"
    )
    parser.add_argument(
        "--calculate", "-c",
        action="store_true",
        help="Calculate new steps from marked/extruded values"
    )
    parser.add_argument(
        "--bed-temp",
        type=float,
        default=60.0,
        help="Bed temperature for test pattern (default: 60)"
    )
    parser.add_argument(
        "--nozzle-temp",
        type=float,
        default=210.0,
        help="Nozzle temperature for test pattern (default: 210)"
    )
    parser.add_argument(
        "--test-length",
        type=float,
        default=100.0,
        help="Test extrusion length in mm (default: 100)"
    )
    parser.add_argument(
        "--test-speed",
        type=float,
        default=60.0,
        help="Test speed in mm/s (default: 60)"
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["text", "json"],
        default="text",
        help="Output format for calculation results"
    )
    
    args = parser.parse_args()
    
    if args.calculate or (args.marked and args.extruded):
        current_steps = args.current_steps
        
        if current_steps is None:
            if args.extruder_model:
                current_steps = KNOWN_EXTRUDER_STEPS[args.extruder_model]
                print(f"Using {args.extruder_model} default: {current_steps} steps/mm", file=sys.stderr)
            elif args.extruder_type:
                extruder_type = ExtruderType(args.extruder_type)
                current_steps = EXTRUDER_CONFIGS[extruder_type].typical_steps
                print(f"Using {extruder_type.value} default: {current_steps} steps/mm", file=sys.stderr)
            else:
                current_steps = 400.0
                print("Using default: 400 steps/mm", file=sys.stderr)
        
        if args.marked is None or args.extruded is None:
            print("[ERR] Both --marked and --extruded required for calculation", file=sys.stderr)
            sys.exit(1)
        
        try:
            result = calculate_new_steps(
                current_steps=current_steps,
                marked_length=args.marked,
                extruded_length=args.extruded
            )
            
            if args.format == "json":
                print(json.dumps({
                    "current_steps": result.current_steps,
                    "new_steps": result.new_steps,
                    "adjustment_percent": result.adjustment_percent,
                    "actual_extrusion_mm": result.actual_extrusion,
                    "requested_extrusion_mm": result.requested_extrusion,
                    "accuracy_percent": result.accuracy_percent
                }, indent=2))
            else:
                print(format_calibration_result(result))
            
            return
        except ValueError as e:
            print(f"[ERR] {e}", file=sys.stderr)
            sys.exit(1)
    
    if args.method in [CalibrationMethod.MEASURE.value, CalibrationMethod.BOTH.value]:
        print(generate_measurement_instructions())
        print()
        print("After measuring, run:")
        print(f"  python tools/extruder_calibration.py --calculate --marked <remaining_mm> --extruded <requested_mm>")
        print()
        if args.method == CalibrationMethod.MEASURE.value:
            return
    
    if args.method in [CalibrationMethod.TEST.value, CalibrationMethod.BOTH.value]:
        config = TestPatternConfig(
            test_length=args.test_length,
            test_speed=args.test_speed,
            retract_distance=DEFAULT_TEST_CONFIG.retract_distance,
            retract_speed=DEFAULT_TEST_CONFIG.retract_speed,
            prime_amount=DEFAULT_TEST_CONFIG.prime_amount,
            layer_height=DEFAULT_TEST_CONFIG.layer_height,
            nozzle_diameter=DEFAULT_TEST_CONFIG.nozzle_diameter
        )
        
        gcode = generate_extruder_calibration_gcode(
            config=config,
            bed_temp=args.bed_temp,
            nozzle_temp=args.nozzle_temp
        )
        
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(gcode)
            print(f"G-code written to: {args.output}", file=sys.stderr)
        else:
            print(gcode)


if __name__ == "__main__":
    main()