#!/usr/bin/env python3
"""
analyze_gcode.py

Analyze G-code files and extract key print information including:
- Layer height
- Print time estimate
- Filament used
- Temperature settings

Usage:
    python tools/analyze_gcode.py print.gcode
    python tools/analyze_gcode.py print.gcode --format json
    python tools/analyze_gcode.py *.gcode --summary
"""

import argparse
import re
import sys
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class GCodeAnalysis:
    layer_height: float = 0.0
    print_time_seconds: int = 0
    filament_used_mm: float = 0.0
    filament_used_grams: float = 0.0
    nozzle_temp: int = 0
    bed_temp: int = 0
    chamber_temp: int = 0
    layer_count: int = 0
    slicer_info: dict = field(default_factory=dict)


def parse_time_string(time_str: str) -> int:
    """Parse time string like '2h 30m' or '1h 45m 30s' into seconds."""
    total_seconds = 0
    
    hours_match = re.search(r'(\d+)\s*h', time_str, re.IGNORECASE)
    mins_match = re.search(r'(\d+)\s*m(?!s)', time_str, re.IGNORECASE)
    secs_match = re.search(r'(\d+)\s*s', time_str, re.IGNORECASE)
    
    if hours_match:
        total_seconds += int(hours_match.group(1)) * 3600
    if mins_match:
        total_seconds += int(mins_match.group(1)) * 60
    if secs_match:
        total_seconds += int(secs_match.group(1))
    
    return total_seconds


def format_time(seconds: int) -> str:
    """Format seconds into human-readable time string."""
    if seconds <= 0:
        return "Unknown"
    
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 and hours == 0:
        parts.append(f"{secs}s")
    
    return " ".join(parts) if parts else "0s"


def analyze_gcode(filepath: Path) -> GCodeAnalysis:
    """Parse a G-code file and extract print information."""
    analysis = GCodeAnalysis()
    
    try:
        with filepath.open("r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"[ERR] File not found: {filepath}", file=sys.stderr)
        return analysis
    
    lines = content.split("\n")
    
    current_z = 0.0
    layer_z_values = set()
    total_extrusion = 0.0
    last_e = 0.0
    
    for line in lines:
        line = line.strip()
        
        if line.startswith(";"):
            comment = line[1:].strip()
            
            if "layer_height" in comment.lower():
                match = re.search(r'layer_height\s*[=:]\s*([\d.]+)', comment, re.IGNORECASE)
                if match:
                    analysis.layer_height = float(match.group(1))
            
            if "layer height" in comment.lower() and analysis.layer_height == 0:
                match = re.search(r'layer height\s*[=:]\s*([\d.]+)', comment, re.IGNORECASE)
                if match:
                    analysis.layer_height = float(match.group(1))
            
            if "estimated printing time" in comment.lower():
                time_match = re.search(r'estimated printing time\s*[=:]\s*(.+)', comment, re.IGNORECASE)
                if time_match:
                    analysis.print_time_seconds = parse_time_string(time_match.group(1))
            
            if "time:" in comment.lower() and analysis.print_time_seconds == 0:
                time_match = re.search(r'time\s*:\s*(.+)', comment, re.IGNORECASE)
                if time_match:
                    analysis.print_time_seconds = parse_time_string(time_match.group(1))
            
            if "filament used" in comment.lower():
                match = re.search(r'filament used\s*[=:]\s*([\d.]+)\s*m?m', comment, re.IGNORECASE)
                if match:
                    analysis.filament_used_mm = float(match.group(1))
                
                grams_match = re.search(r'filament used.*?(\d+\.?\d*)\s*g', comment, re.IGNORECASE)
                if grams_match:
                    analysis.filament_used_grams = float(grams_match.group(1))
            
            if "filament" in comment.lower() and "mm" in comment.lower():
                match = re.search(r'([\d.]+)\s*mm', comment)
                if match and analysis.filament_used_mm == 0:
                    analysis.filament_used_mm = float(match.group(1))
            
            if "nozzle" in comment.lower() and "temp" in comment.lower():
                match = re.search(r'(\d+)', comment)
                if match:
                    analysis.nozzle_temp = int(match.group(1))
            
            if "bed" in comment.lower() and "temp" in comment.lower():
                match = re.search(r'(\d+)', comment)
                if match:
                    analysis.bed_temp = int(match.group(1))
            
            if "chamber" in comment.lower() and "temp" in comment.lower():
                match = re.search(r'(\d+)', comment)
                if match:
                    analysis.chamber_temp = int(match.group(1))
            
            if "generated by" in comment.lower() or "slicer" in comment.lower():
                analysis.slicer_info["generator"] = comment
            
            if match := re.match(r'(\w+)\s*[:=]\s*(.+)', comment):
                key, value = match.groups()
                analysis.slicer_info[key.strip()] = value.strip()
        
        else:
            if line.startswith("G0") or line.startswith("G1"):
                z_match = re.search(r'Z([\d.]+)', line)
                if z_match:
                    z = float(z_match.group(1))
                    if z > 0 and z != current_z:
                        layer_z_values.add(z)
                        current_z = z
                
                e_match = re.search(r'E([\d.]+)', line)
                if e_match:
                    new_e = float(e_match.group(1))
                    if new_e > last_e:
                        total_extrusion += new_e - last_e
                    last_e = new_e
            
            if line.startswith("M104") or line.startswith("M109"):
                match = re.search(r'S(\d+)', line)
                if match:
                    analysis.nozzle_temp = int(match.group(1))
            
            if line.startswith("M140") or line.startswith("M190"):
                match = re.search(r'S(\d+)', line)
                if match:
                    analysis.bed_temp = int(match.group(1))
            
            if line.startswith("M141") or line.startswith("M191"):
                match = re.search(r'S(\d+)', line)
                if match:
                    analysis.chamber_temp = int(match.group(1))
    
    analysis.layer_count = len(layer_z_values)
    
    if analysis.layer_height == 0 and layer_z_values:
        sorted_z = sorted(layer_z_values)
        if len(sorted_z) >= 2:
            diffs = [sorted_z[i+1] - sorted_z[i] for i in range(min(10, len(sorted_z)-1))]
            if diffs:
                analysis.layer_height = round(sum(diffs) / len(diffs), 3)
    
    if analysis.filament_used_mm == 0 and total_extrusion > 0:
        analysis.filament_used_mm = total_extrusion
    
    return analysis


def print_analysis(filepath: Path, analysis: GCodeAnalysis, format: str = "text") -> None:
    """Print the analysis results."""
    if format == "json":
        import json
        result = {
            "file": str(filepath),
            "layer_height": analysis.layer_height,
            "layer_count": analysis.layer_count,
            "print_time_seconds": analysis.print_time_seconds,
            "print_time_formatted": format_time(analysis.print_time_seconds),
            "filament_used_mm": round(analysis.filament_used_mm, 2),
            "filament_used_grams": round(analysis.filament_used_grams, 2),
            "nozzle_temp": analysis.nozzle_temp,
            "bed_temp": analysis.bed_temp,
            "chamber_temp": analysis.chamber_temp,
            "slicer_info": analysis.slicer_info
        }
        print(json.dumps(result, indent=2))
    else:
        print(f"\n{'='*50}")
        print(f"File: {filepath}")
        print(f"{'='*50}")
        print(f"Layer Height:    {analysis.layer_height} mm")
        print(f"Layer Count:     {analysis.layer_count}")
        print(f"Print Time:      {format_time(analysis.print_time_seconds)}")
        print(f"Filament Used:   {analysis.filament_used_mm:.2f} mm ({analysis.filament_used_grams:.2f} g)")
        print(f"Nozzle Temp:     {analysis.nozzle_temp}°C")
        print(f"Bed Temp:        {analysis.bed_temp}°C")
        if analysis.chamber_temp > 0:
            print(f"Chamber Temp:    {analysis.chamber_temp}°C")
        if analysis.slicer_info:
            print(f"\nSlicer Info:")
            for key, value in analysis.slicer_info.items():
                print(f"  {key}: {value}")


def print_summary(results: list[tuple[Path, GCodeAnalysis]]) -> None:
    """Print a summary table of multiple G-code analyses."""
    print(f"\n{'File':<35} {'Layers':<8} {'Time':<12} {'Filament':<15} {'Nozzle':<8}")
    print("-" * 78)
    
    total_time = 0
    total_filament = 0
    
    for filepath, analysis in results:
        time_str = format_time(analysis.print_time_seconds)
        filament_str = f"{analysis.filament_used_mm:.1f}mm"
        
        filename = filepath.name
        if len(filename) > 33:
            filename = filename[:30] + "..."
        
        print(f"{filename:<35} {analysis.layer_count:<8} {time_str:<12} {filament_str:<15} {analysis.nozzle_temp}°C")
        
        total_time += analysis.print_time_seconds
        total_filament += analysis.filament_used_mm
    
    print("-" * 78)
    print(f"Total: {len(results)} files, {format_time(total_time)} print time, {total_filament:.1f}mm filament")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Analyze G-code files and extract print information."
    )
    parser.add_argument(
        "files",
        type=Path,
        nargs="+",
        help="One or more G-code files to analyze"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    parser.add_argument(
        "--summary", "-s",
        action="store_true",
        help="Show summary table for multiple files"
    )
    
    args = parser.parse_args()
    
    files = args.files
    results = []
    
    for filepath in files:
        if not filepath.exists():
            print(f"[ERR] File not found: {filepath}", file=sys.stderr)
            continue
        
        if not filepath.suffix.lower() == ".gcode":
            print(f"[WARN] Skipping non-G-code file: {filepath}", file=sys.stderr)
            continue
        
        analysis = analyze_gcode(filepath)
        results.append((filepath, analysis))
        
        if not args.summary or len(files) == 1:
            print_analysis(filepath, analysis, args.format)
    
    if args.summary and len(results) > 1:
        print_summary(results)


if __name__ == "__main__":
    main()
