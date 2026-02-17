#!/usr/bin/env python3
"""
input_shaping_wizard.py

Interactive wizard for configuring Klipper input shaping based on resonance
measurements. Helps select optimal shaper type and frequency.

Usage:
    python tools/input_shaping_wizard.py --freq-x 35 --freq-y 40
    python tools/input_shaping_wizard.py --freq-x 35 --freq-y 40 --damping 0.1
    python tools/input_shaping_wizard.py --auto-detect --data resonance_data.csv
    python tools/input_shaping_wizard.py --shaper ei --freq 45
"""

import argparse
import json
import math
import sys
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ShaperType(Enum):
    ZV = "zv"
    ZVD = "zvd"
    MZV = "mzv"
    EI = "ei"
    TWO_HUMP_EI = "2hump_ei"
    THREE_HUMP_EI = "3hump_ei"
    MZV_EI = "mzv_ei"


@dataclass
class ShaperInfo:
    name: str
    min_freq: float
    max_freq: float
    damping_ratio: float
    vibrations_reduction: float
    smoothing: float
    recommended_use: str


SHAPER_DATA = {
    ShaperType.ZV: ShaperInfo(
        name="ZV",
        min_freq=20.0,
        max_freq=100.0,
        damping_ratio=0.05,
        vibrations_reduction=0.707,
        smoothing=1.0,
        recommended_use="Simple shaper, minimal smoothing, but sensitive to frequency errors. Good for very rigid printers."
    ),
    ShaperType.ZVD: ShaperInfo(
        name="ZVD",
        min_freq=20.0,
        max_freq=80.0,
        damping_ratio=0.05,
        vibrations_reduction=0.5,
        smoothing=2.0,
        recommended_use="More robust than ZV. Better for printers with some frequency variation."
    ),
    ShaperType.MZV: ShaperInfo(
        name="MZV",
        min_freq=25.0,
        max_freq=100.0,
        damping_ratio=0.15,
        vibrations_reduction=0.45,
        smoothing=1.5,
        recommended_use="Good balance of robustness and smoothing. Often best default choice."
    ),
    ShaperType.EI: ShaperInfo(
        name="EI",
        min_freq=20.0,
        max_freq=150.0,
        damping_ratio=0.10,
        vibrations_reduction=0.20,
        smoothing=1.5,
        recommended_use="Extra insensitive. Robust to frequency errors. Good general-purpose shaper."
    ),
    ShaperType.TWO_HUMP_EI: ShaperInfo(
        name="2HUMP_EI",
        min_freq=25.0,
        max_freq=150.0,
        damping_ratio=0.10,
        vibrations_reduction=0.18,
        smoothing=2.5,
        recommended_use="Very robust, handles multiple resonances. Higher smoothing."
    ),
    ShaperType.THREE_HUMP_EI: ShaperInfo(
        name="3HUMP_EI",
        min_freq=30.0,
        max_freq=150.0,
        damping_ratio=0.12,
        vibrations_reduction=0.12,
        smoothing=3.5,
        recommended_use="Maximum robustness. Use when other shapers don't eliminate ringing. Most smoothing."
    ),
    ShaperType.MZV_EI: ShaperInfo(
        name="MZV_EI",
        min_freq=30.0,
        max_freq=150.0,
        damping_ratio=0.12,
        vibrations_reduction=0.25,
        smoothing=2.0,
        recommended_use="Hybrid of MZV and EI. Good for printers with varying resonances."
    )
}


@dataclass
class PrinterType:
    name: str
    typical_freq_x: tuple
    typical_freq_y: tuple
    notes: str


PRINTER_TYPES = {
    "corexy": PrinterType(
        name="CoreXY",
        typical_freq_x=(30, 60),
        typical_freq_y=(30, 60),
        notes="CoreXY printers often have similar X and Y resonances due to symmetric design."
    ),
    "cartesian": PrinterType(
        name="Cartesian (bed slinger)",
        typical_freq_x=(25, 45),
        typical_freq_y=(15, 35),
        notes="Bed slingers typically have lower Y frequency due to moving bed mass."
    ),
    "delta": PrinterType(
        name="Delta",
        typical_freq_x=(35, 70),
        typical_freq_y=(35, 70),
        notes="Delta printers usually have similar frequencies on all axes."
    ),
    "i3": PrinterType(
        name="Prusa i3 style",
        typical_freq_x=(25, 45),
        typical_freq_y=(15, 30),
        notes="Moving bed on Y typically has lower resonance than X."
    )
}


@dataclass
class InputShaperConfig:
    shaper_type_x: ShaperType
    shaper_type_y: ShaperType
    freq_x: float
    freq_y: float
    damping_x: float
    damping_y: float
    accel_limit: float


def calculate_shaper_smoothing(shaper: ShaperType, freq: float) -> float:
    info = SHAPER_DATA[shaper]
    return info.smoothing * (50.0 / freq)


def calculate_max_accel(shaper: ShaperType, freq: float, corner_v: float = 5.0) -> float:
    smoothing = calculate_shaper_smoothing(shaper, freq)
    return (math.pi * corner_v ** 2) / (smoothing * 0.001)


def recommend_shaper(freq: float, damping: float = 0.1, prioritize: str = "balanced") -> tuple:
    candidates = []
    
    for shaper_type, info in SHAPER_DATA.items():
        if info.min_freq <= freq <= info.max_freq:
            freq_fit = 1.0 - abs(freq - (info.min_freq + info.max_freq) / 2) / ((info.max_freq - info.min_freq) / 2)
            smoothing = calculate_shaper_smoothing(shaper_type, freq)
            vibration_reduction = info.vibrations_reduction
            
            if prioritize == "low_smoothing":
                score = freq_fit * (1.0 / smoothing) * (1.0 - vibration_reduction)
            elif prioritize == "robustness":
                score = freq_fit * (1.0 - vibration_reduction) / smoothing
            else:
                score = freq_fit * (1.5 - smoothing / 5.0) * (1.0 - vibration_reduction)
            
            candidates.append((shaper_type, score, smoothing))
    
    if not candidates:
        return (ShaperType.EI, 0, calculate_shaper_smoothing(ShaperType.EI, freq))
    
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0]


def generate_klipper_config(config: InputShaperConfig, include_comments: bool = True) -> str:
    lines = []
    
    if include_comments:
        lines.append("# Input Shaper Configuration")
        lines.append("# Generated by OpenPrint3D input_shaping_wizard.py")
        lines.append("# ========================================")
        lines.append("#")
        lines.append("# Add this to your printer.cfg [input_shaper] section")
        lines.append("# or include in a separate config file.")
        lines.append("#")
        lines.append(f"# X-axis: {config.shaper_type_x.value.upper()} shaper at {config.freq_x:.1f} Hz")
        lines.append(f"# Y-axis: {config.shaper_type_y.value.upper()} shaper at {config.freq_y:.1f} Hz")
        lines.append("#")
        lines.append("")
    
    lines.append("[input_shaper]")
    lines.append(f"shaper_type_x: {config.shaper_type_x.value}")
    lines.append(f"shaper_type_y: {config.shaper_type_y.value}")
    lines.append(f"shaper_freq_x: {config.freq_x:.1f}")
    lines.append(f"shaper_freq_y: {config.freq_y:.1f}")
    
    if config.damping_x != 0.1 or config.damping_y != 0.1:
        lines.append(f"damping_ratio_x: {config.damping_x:.3f}")
        lines.append(f"damping_ratio_y: {config.damping_y:.3f}")
    
    if include_comments:
        lines.append("")
        lines.append(f"# Recommended max accel (based on smoothing): ~{config.accel_limit:.0f} mm/s²")
        lines.append("")
        lines.append("# Shaper info:")
        x_info = SHAPER_DATA[config.shaper_type_x]
        y_info = SHAPER_DATA[config.shaper_type_y]
        lines.append(f"# X: {x_info.recommended_use}")
        lines.append(f"# Y: {y_info.recommended_use}")
    
    return "\n".join(lines)


def generate_macro_config(config: InputShaperConfig) -> str:
    lines = [
        "# Input Shaper Calibration Macros",
        "# Generated by OpenPrint3D input_shaping_wizard.py",
        "# ========================================",
        "",
        "[gcode_macro SET_INPUT_SHAPER]",
        "description: Set input shaper parameters",
        "gcode:",
        f"    SET_INPUT_SHAPER SHAPER_TYPE_X={config.shaper_type_x.value} SHAPER_TYPE_Y={config.shaper_type_y.value}",
        f"    SET_INPUT_SHAPER SHAPER_FREQ_X={config.freq_x:.1f} SHAPER_FREQ_Y={config.freq_y:.1f}",
        "",
        "[gcode_macro INPUT_SHAPER_CALIBRATION]",
        "description: Run input shaper calibration test",
        "gcode:",
        "    {% set FREQ_X = params.FREQ_X|default(" + str(config.freq_x) + ") %}",
        "    {% set FREQ_Y = params.FREQ_Y|default(" + str(config.freq_y) + ") %}",
        "    {% set SHAPER = params.SHAPER|default('" + config.shaper_type_x.value + "') %}",
        "    SET_INPUT_SHAPER SHAPER_TYPE_X={SHAPER} SHAPER_TYPE_Y={SHAPER}",
        "    SET_INPUT_SHAPER SHAPER_FREQ_X={FREQ_X} SHAPER_FREQ_Y={FREQ_Y}",
        "    M117 Shaper {SHAPER} X={FREQ_X} Y={FREQ_Y}",
        "",
        "[gcode_macro TEST_INPUT_SHAPER]",
        "description: Test print with current input shaper settings",
        "gcode:",
        "    G28",
        "    G1 Z5 F3000",
        "    G1 X100 Y100 F6000",
        "    ; Print test pattern",
        "    G1 X50 Y50 Z0.3 F3000",
        "    G1 X150 Y50 E10 F3000",
        "    G1 X150 Y150 E20",
        "    G1 X50 Y150 E30",
        "    G1 X50 Y50 E40",
        "    G1 Z10 F3000",
        "    M117 Test complete",
        ""
    ]
    return "\n".join(lines)


def generate_calibration_gcode(
    freq_x: float,
    freq_y: float,
    test_type: str = "speed"
) -> str:
    lines = [
        "; Input Shaper Calibration G-code",
        "; Generated by OpenPrint3D input_shaping_wizard.py",
        "; ========================================",
        f"; Detected resonances: X={freq_x:.1f}Hz, Y={freq_y:.1f}Hz",
        "; ========================================",
        "",
        "G90 ; Absolute positioning",
        "M82 ; Absolute extrusion",
        "",
        "G28 ; Home axes",
        "G1 Z5 F3000",
        "",
    ]
    
    shapers_to_test = ["mzv", "ei", "2hump_ei"]
    
    lines.append("; Test different shapers at detected frequencies")
    lines.append("; Each section tests one shaper type")
    lines.append("")
    
    for i, shaper in enumerate(shapers_to_test):
        lines.append(f"; Shaper test {i+1}: {shaper.upper()}")
        lines.append(f"SET_INPUT_SHAPER SHAPER_TYPE_X={shaper} SHAPER_TYPE_Y={shaper}")
        lines.append(f"SET_INPUT_SHAPER SHAPER_FREQ_X={freq_x:.1f} SHAPER_FREQ_Y={freq_y:.1f}")
        
        y_start = 20 + (i * 40)
        lines.append(f"G1 X10 Y{y_start} F6000")
        lines.append(f"G1 Z0.3 F3000")
        lines.append(f"G1 X150 Y{y_start} E15 F{80 * 60}")
        lines.append(f"G1 X150 Y{y_start + 30} E30")
        lines.append(f"G1 X10 Y{y_start + 30} E45")
        lines.append(f"G1 X10 Y{y_start} E60")
        lines.append("G1 Z2 F3000")
        lines.append("")
    
    lines.append("G1 Z50 F3000")
    lines.append("M104 S0")
    lines.append("M140 S0")
    lines.append("M84")
    lines.append("")
    lines.append("; ========================================")
    lines.append("; Compare surfaces for ringing artifacts")
    lines.append("; Best shaper has least visible ringing")
    lines.append("; ========================================")
    
    return "\n".join(lines)


def analyze_resonance_data(data_file: str) -> tuple:
    try:
        with open(data_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        freq_x = data.get("freq_x", 35.0)
        freq_y = data.get("freq_y", 40.0)
        damping_x = data.get("damping_x", 0.1)
        damping_y = data.get("damping_y", 0.1)
        peaks_x = data.get("peaks_x", [])
        peaks_y = data.get("peaks_y", [])
        
        return freq_x, freq_y, damping_x, damping_y, peaks_x, peaks_y
    except (FileNotFoundError, json.JSONDecodeError):
        return 35.0, 40.0, 0.1, 0.1, [], []


def format_wizard_output(config: InputShaperConfig, verbose: bool = True) -> str:
    output = []
    output.append("=" * 60)
    output.append("INPUT SHAPER CONFIGURATION")
    output.append("=" * 60)
    output.append("")
    output.append(f"X-axis: {config.shaper_type_x.value.upper()} @ {config.freq_x:.1f} Hz")
    output.append(f"Y-axis: {config.shaper_type_y.value.upper()} @ {config.freq_y:.1f} Hz")
    output.append("")
    
    if verbose:
        output.append("SHAPER DETAILS")
        output.append("-" * 40)
        
        x_info = SHAPER_DATA[config.shaper_type_x]
        output.append(f"X ({config.shaper_type_x.value.upper()}):")
        output.append(f"  Frequency range: {x_info.min_freq:.0f}-{x_info.max_freq:.0f} Hz")
        output.append(f"  Smoothing: {calculate_shaper_smoothing(config.shaper_type_x, config.freq_x):.2f}")
        output.append(f"  Vibration reduction: {x_info.vibrations_reduction*100:.0f}%")
        output.append(f"  Use case: {x_info.recommended_use}")
        output.append("")
        
        y_info = SHAPER_DATA[config.shaper_type_y]
        output.append(f"Y ({config.shaper_type_y.value.upper()}):")
        output.append(f"  Frequency range: {y_info.min_freq:.0f}-{y_info.max_freq:.0f} Hz")
        output.append(f"  Smoothing: {calculate_shaper_smoothing(config.shaper_type_y, config.freq_y):.2f}")
        output.append(f"  Vibration reduction: {y_info.vibrations_reduction*100:.0f}%")
        output.append(f"  Use case: {y_info.recommended_use}")
        output.append("")
        
        output.append("RECOMMENDED ACCELERATION")
        output.append("-" * 40)
        output.append(f"Max suggested accel: {config.accel_limit:.0f} mm/s²")
        output.append("(Based on smoothing and corner velocity limits)")
        output.append("")
        
        output.append("KLIPPER CONFIG")
        output.append("-" * 40)
        output.append(generate_klipper_config(config, include_comments=False))
        output.append("")
    
    return "\n".join(output)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Interactive wizard for configuring Klipper input shaping."
    )
    parser.add_argument(
        "--freq-x",
        type=float,
        help="Measured X-axis resonant frequency (Hz)"
    )
    parser.add_argument(
        "--freq-y",
        type=float,
        help="Measured Y-axis resonant frequency (Hz)"
    )
    parser.add_argument(
        "--freq",
        type=float,
        help="Use same frequency for both axes"
    )
    parser.add_argument(
        "--damping",
        type=float,
        default=0.1,
        help="Damping ratio (default: 0.1)"
    )
    parser.add_argument(
        "--shaper",
        type=str,
        choices=[s.value for s in ShaperType],
        help="Force specific shaper type"
    )
    parser.add_argument(
        "--printer-type",
        type=str,
        choices=list(PRINTER_TYPES.keys()),
        help="Printer type for default frequency estimates"
    )
    parser.add_argument(
        "--prioritize",
        type=str,
        choices=["low_smoothing", "robustness", "balanced"],
        default="balanced",
        help="Optimization priority (default: balanced)"
    )
    parser.add_argument(
        "--data",
        type=str,
        help="Path to resonance measurement data file (JSON)"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Output config file path"
    )
    parser.add_argument(
        "--format", "-f",
        type=str,
        choices=["config", "macro", "gcode", "json", "text"],
        default="text",
        help="Output format"
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Minimal output (config only)"
    )
    
    args = parser.parse_args()
    
    freq_x = args.freq_x
    freq_y = args.freq_y
    
    if args.freq is not None:
        freq_x = args.freq
        freq_y = args.freq
    
    if args.data:
        freq_x, freq_y, damping_x, damping_y, peaks_x, peaks_y = analyze_resonance_data(args.data)
        print(f"Loaded resonance data: X={freq_x:.1f}Hz, Y={freq_y:.1f}Hz", file=sys.stderr)
    
    if freq_x is None:
        if args.printer_type:
            printer = PRINTER_TYPES[args.printer_type]
            freq_x = (printer.typical_freq_x[0] + printer.typical_freq_x[1]) / 2
            freq_y = (printer.typical_freq_y[0] + printer.typical_freq_y[1]) / 2
            print(f"Using {printer.name} defaults: X={freq_x:.0f}Hz, Y={freq_y:.0f}Hz", file=sys.stderr)
        else:
            freq_x = 35.0
            freq_y = 40.0
            print("Using default frequencies: X=35Hz, Y=40Hz", file=sys.stderr)
    
    if freq_y is None:
        freq_y = freq_x
    
    if args.shaper:
        try:
            shaper_x = ShaperType(args.shaper.lower())
            shaper_y = shaper_x
        except ValueError:
            print(f"[ERR] Invalid shaper type: {args.shaper}", file=sys.stderr)
            sys.exit(1)
    else:
        shaper_x, score_x, smooth_x = recommend_shaper(freq_x, args.damping, args.prioritize)
        shaper_y, score_y, smooth_y = recommend_shaper(freq_y, args.damping, args.prioritize)
    
    config = InputShaperConfig(
        shaper_type_x=shaper_x,
        shaper_type_y=shaper_y,
        freq_x=freq_x,
        freq_y=freq_y,
        damping_x=args.damping,
        damping_y=args.damping,
        accel_limit=min(
            calculate_max_accel(shaper_x, freq_x),
            calculate_max_accel(shaper_y, freq_y)
        )
    )
    
    if args.format == "config":
        output = generate_klipper_config(config, include_comments=not args.quiet)
    elif args.format == "macro":
        output = generate_macro_config(config)
    elif args.format == "gcode":
        output = generate_calibration_gcode(freq_x, freq_y)
    elif args.format == "json":
        output = json.dumps({
            "shaper_x": config.shaper_type_x.value,
            "shaper_y": config.shaper_type_y.value,
            "freq_x": config.freq_x,
            "freq_y": config.freq_y,
            "damping_x": config.damping_x,
            "damping_y": config.damping_y,
            "accel_limit": config.accel_limit,
            "smoothing_x": calculate_shaper_smoothing(config.shaper_type_x, config.freq_x),
            "smoothing_y": calculate_shaper_smoothing(config.shaper_type_y, config.freq_y)
        }, indent=2)
    else:
        output = format_wizard_output(config, verbose=not args.quiet)
    
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"Config written to: {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()