#!/usr/bin/env python3
"""
print_cost_calculator.py

Calculate total print cost including filament, electricity, and time costs
based on profile data and G-code analysis.

Usage:
    python tools/print_cost_calculator.py print.gcode --filament filament/Generic/PLA.json --printer printer/Creality/Ender-3-V2.json
    python tools/print_cost_calculator.py --filament-used 150 --print-time 3.5 --filament filament/Generic/PLA.json
    python tools/print_cost_calculator.py print.gcode --filament-price 25 --electricity-rate 0.12 --hourly-rate 15
"""

import argparse
import json
import sys
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

DEFAULT_FILAMENT_PRICE_PER_KG = 20.0
DEFAULT_ELECTRICITY_RATE = 0.12
DEFAULT_HOURLY_RATE = 0.0
DEFAULT_PRINTER_POWER_WATTS = 200


@dataclass
class FilamentProfile:
    diameter: float = 1.75
    density: float = 1.24
    material: str = "PLA"
    brand: str = "Generic"
    name: str = ""


@dataclass
class PrinterProfile:
    manufacturer: str = ""
    model: str = ""
    max_nozzle_temp: int = 260
    heated_bed: bool = True


@dataclass
class ProcessProfile:
    name: str = ""
    layer_height: float = 0.2
    outer_wall_speed: int = 120
    infill_speed: int = 200


@dataclass
class PrintCosts:
    filament_used_mm: float = 0.0
    filament_used_grams: float = 0.0
    print_time_hours: float = 0.0
    filament_cost: float = 0.0
    electricity_cost: float = 0.0
    time_cost: float = 0.0
    total_cost: float = 0.0
    breakdown: dict = field(default_factory=dict)


def load_json_profile(filepath: Path) -> dict:
    if not filepath.exists():
        print(f"[ERR] Profile not found: {filepath}", file=sys.stderr)
        return {}
    try:
        with filepath.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"[ERR] Invalid JSON in {filepath}: {e}", file=sys.stderr)
        return {}


def parse_filament_profile(data: dict) -> FilamentProfile:
    return FilamentProfile(
        diameter=data.get("diameter", 1.75),
        density=data.get("density", 1.24),
        material=data.get("material", "PLA"),
        brand=data.get("brand", "Generic"),
        name=data.get("name", ""),
    )


def parse_printer_profile(data: dict) -> PrinterProfile:
    extruders = data.get("extruders", [{}])
    extruder = extruders[0] if extruders else {}
    bed = data.get("bed", {})
    return PrinterProfile(
        manufacturer=data.get("manufacturer", ""),
        model=data.get("model", ""),
        max_nozzle_temp=extruder.get("max_temp", 260),
        heated_bed=bed.get("heated", True),
    )


def parse_process_profile(data: dict) -> ProcessProfile:
    speed = data.get("speed", {})
    layer_height = data.get("layer_height", {})
    return ProcessProfile(
        name=data.get("name", ""),
        layer_height=layer_height.get("default", 0.2) if isinstance(layer_height, dict) else layer_height,
        outer_wall_speed=speed.get("outer_wall", 120),
        infill_speed=speed.get("infill", 200),
    )


def calculate_filament_weight(filament_mm: float, diameter: float, density: float) -> float:
    import math
    radius_mm = diameter / 2
    volume_mm3 = math.pi * (radius_mm ** 2) * filament_mm
    volume_cm3 = volume_mm3 / 1000
    weight_grams = volume_cm3 * density
    return weight_grams


def calculate_filament_cost(weight_grams: float, price_per_kg: float) -> float:
    weight_kg = weight_grams / 1000
    return weight_kg * price_per_kg


def calculate_electricity_cost(
    print_time_hours: float,
    electricity_rate: float,
    printer_power_watts: float = DEFAULT_PRINTER_POWER_WATTS,
    heated_bed: bool = True,
    nozzle_temp: int = 210,
) -> float:
    avg_power = printer_power_watts
    if heated_bed and nozzle_temp > 180:
        avg_power *= 1.2
    kwh = (avg_power / 1000) * print_time_hours
    return kwh * electricity_rate


def calculate_time_cost(print_time_hours: float, hourly_rate: float) -> float:
    return print_time_hours * hourly_rate


def extract_gcode_info(filepath: Path) -> tuple[float, float, int, int]:
    filament_mm = 0.0
    print_time_seconds = 0
    nozzle_temp = 0
    bed_temp = 0
    
    try:
        with filepath.open("r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"[ERR] G-code file not found: {filepath}", file=sys.stderr)
        return filament_mm, print_time_seconds, nozzle_temp, bed_temp
    
    import re
    
    lines = content.split("\n")
    total_extrusion = 0.0
    last_e = 0.0
    
    for line in lines:
        line = line.strip()
        
        if line.startswith(";"):
            comment = line[1:].strip()
            
            if "estimated printing time" in comment.lower():
                time_str = comment
                hours = re.search(r'(\d+)\s*h', time_str, re.IGNORECASE)
                mins = re.search(r'(\d+)\s*m(?!s)', time_str, re.IGNORECASE)
                secs = re.search(r'(\d+)\s*s', time_str, re.IGNORECASE)
                
                if hours:
                    print_time_seconds += int(hours.group(1)) * 3600
                if mins:
                    print_time_seconds += int(mins.group(1)) * 60
                if secs:
                    print_time_seconds += int(secs.group(1))
            
            if "filament used" in comment.lower():
                mm_match = re.search(r'([\d.]+)\s*mm', comment)
                if mm_match:
                    filament_mm = float(mm_match.group(1))
                
                m_match = re.search(r'([\d.]+)\s*m\s', comment)
                if m_match:
                    filament_mm = float(m_match.group(1)) * 1000
        else:
            if line.startswith("G0") or line.startswith("G1"):
                e_match = re.search(r'E([\d.]+)', line)
                if e_match:
                    new_e = float(e_match.group(1))
                    if new_e > last_e:
                        total_extrusion += new_e - last_e
                    last_e = new_e
            
            if line.startswith("M104") or line.startswith("M109"):
                match = re.search(r'S(\d+)', line)
                if match:
                    nozzle_temp = int(match.group(1))
            
            if line.startswith("M140") or line.startswith("M190"):
                match = re.search(r'S(\d+)', line)
                if match:
                    bed_temp = int(match.group(1))
    
    if filament_mm == 0 and total_extrusion > 0:
        filament_mm = total_extrusion
    
    return filament_mm, print_time_seconds, nozzle_temp, bed_temp


def format_currency(amount: float) -> str:
    return f"${amount:.2f}"


def format_time(seconds: int) -> str:
    if seconds <= 0:
        return "0s"
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


def print_cost_report(costs: PrintCosts, filament: FilamentProfile, printer: PrinterProfile) -> None:
    print("\n" + "=" * 60)
    print("PRINT COST CALCULATOR")
    print("=" * 60)
    
    print(f"\n{'-' * 60}")
    print("INPUT PARAMETERS")
    print(f"{'-' * 60}")
    print(f"Filament:        {filament.brand} {filament.name or filament.material}")
    print(f"Material:        {filament.material}")
    print(f"Diameter:        {filament.diameter} mm")
    print(f"Density:         {filament.density} g/cm3")
    if printer.model:
        print(f"Printer:         {printer.manufacturer} {printer.model}")
    
    print(f"\n{'-' * 60}")
    print("PRINT STATISTICS")
    print(f"{'-' * 60}")
    print(f"Filament Used:   {costs.filament_used_mm:.2f} mm ({costs.filament_used_mm/1000:.2f} m)")
    print(f"Filament Weight: {costs.filament_used_grams:.2f} g")
    print(f"Print Time:      {format_time(int(costs.print_time_hours * 3600))} ({costs.print_time_hours:.2f} hours)")
    
    print(f"\n{'-' * 60}")
    print("COST BREAKDOWN")
    print(f"{'-' * 60}")
    print(f"Filament Cost:   {format_currency(costs.filament_cost)}")
    print(f"Electricity:     {format_currency(costs.electricity_cost)}")
    if costs.time_cost > 0:
        print(f"Labor/Time:      {format_currency(costs.time_cost)}")
    print(f"{'-' * 60}")
    print(f"TOTAL COST:      {format_currency(costs.total_cost)}")
    print(f"{'-' * 60}")
    
    if costs.breakdown:
        print(f"\n{'-' * 60}")
        print("COST PARAMETERS USED")
        print(f"{'-' * 60}")
        for key, value in costs.breakdown.items():
            print(f"{key}: {value}")


def print_json_output(costs: PrintCosts, filament: FilamentProfile, printer: PrinterProfile) -> None:
    result = {
        "filament": {
            "brand": filament.brand,
            "material": filament.material,
            "diameter_mm": filament.diameter,
            "density_g_cm3": filament.density,
        },
        "printer": {
            "manufacturer": printer.manufacturer,
            "model": printer.model,
        },
        "print_statistics": {
            "filament_used_mm": round(costs.filament_used_mm, 2),
            "filament_used_m": round(costs.filament_used_mm / 1000, 4),
            "filament_weight_g": round(costs.filament_used_grams, 2),
            "print_time_hours": round(costs.print_time_hours, 2),
            "print_time_formatted": format_time(int(costs.print_time_hours * 3600)),
        },
        "costs": {
            "filament_cost": round(costs.filament_cost, 4),
            "electricity_cost": round(costs.electricity_cost, 4),
            "time_cost": round(costs.time_cost, 4),
            "total_cost": round(costs.total_cost, 4),
        },
        "parameters": costs.breakdown,
    }
    print(json.dumps(result, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate print cost based on filament, electricity, and time.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s print.gcode --filament filament/Generic/PLA.json
  %(prog)s print.gcode --filament-price 30 --electricity-rate 0.15
  %(prog)s --filament-used 5000 --print-time 4 --filament filament/Generic/PLA.json
        """
    )
    
    parser.add_argument(
        "gcode",
        type=Path,
        nargs="?",
        help="G-code file to analyze (optional if --filament-used and --print-time provided)"
    )
    
    parser.add_argument(
        "--filament", "-f",
        type=Path,
        help="Path to filament profile JSON"
    )
    
    parser.add_argument(
        "--printer", "-p",
        type=Path,
        help="Path to printer profile JSON"
    )
    
    parser.add_argument(
        "--process",
        type=Path,
        help="Path to process profile JSON"
    )
    
    parser.add_argument(
        "--filament-used",
        type=float,
        help="Filament used in mm (overrides G-code analysis)"
    )
    
    parser.add_argument(
        "--print-time",
        type=float,
        help="Print time in hours (overrides G-code analysis)"
    )
    
    parser.add_argument(
        "--filament-weight",
        type=float,
        help="Filament weight in grams (alternative to --filament-used)"
    )
    
    parser.add_argument(
        "--filament-price",
        type=float,
        default=DEFAULT_FILAMENT_PRICE_PER_KG,
        help=f"Filament price per kg (default: ${DEFAULT_FILAMENT_PRICE_PER_KG})"
    )
    
    parser.add_argument(
        "--electricity-rate",
        type=float,
        default=DEFAULT_ELECTRICITY_RATE,
        help=f"Electricity rate per kWh (default: ${DEFAULT_ELECTRICITY_RATE})"
    )
    
    parser.add_argument(
        "--hourly-rate",
        type=float,
        default=DEFAULT_HOURLY_RATE,
        help="Labor/hourly rate for print time (default: $0)"
    )
    
    parser.add_argument(
        "--printer-power",
        type=float,
        default=DEFAULT_PRINTER_POWER_WATTS,
        help=f"Average printer power consumption in watts (default: {DEFAULT_PRINTER_POWER_WATTS}W)"
    )
    
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    
    args = parser.parse_args()
    
    filament = FilamentProfile()
    printer = PrinterProfile()
    process = ProcessProfile()
    
    if args.filament:
        data = load_json_profile(args.filament)
        if data:
            filament = parse_filament_profile(data)
    
    if args.printer:
        data = load_json_profile(args.printer)
        if data:
            printer = parse_printer_profile(data)
    
    if args.process:
        data = load_json_profile(args.process)
        if data:
            process = parse_process_profile(data)
    
    costs = PrintCosts()
    
    filament_mm = 0.0
    print_time_hours = 0.0
    nozzle_temp = 0
    bed_temp = 0
    
    if args.gcode:
        filament_mm, print_time_seconds, nozzle_temp, bed_temp = extract_gcode_info(args.gcode)
        print_time_hours = print_time_seconds / 3600
    
    if args.filament_used is not None:
        filament_mm = args.filament_used
    
    if args.filament_weight is not None:
        costs.filament_used_grams = args.filament_weight
        import math
        radius_mm = filament.diameter / 2
        volume_mm3 = (args.filament_weight / filament.density) * 1000
        filament_mm = volume_mm3 / (math.pi * radius_mm ** 2)
    
    if args.print_time is not None:
        print_time_hours = args.print_time
    
    if filament_mm == 0 and print_time_hours == 0:
        print("[ERR] No input provided. Specify a G-code file or use --filament-used and --print-time", file=sys.stderr)
        sys.exit(1)
    
    if filament_mm == 0:
        print("[WARN] No filament usage data. Provide G-code file or --filament-used", file=sys.stderr)
    
    costs.filament_used_mm = filament_mm
    
    if costs.filament_used_grams == 0:
        costs.filament_used_grams = calculate_filament_weight(
            filament_mm, filament.diameter, filament.density
        )
    
    costs.print_time_hours = print_time_hours
    
    costs.filament_cost = calculate_filament_cost(
        costs.filament_used_grams, args.filament_price
    )
    
    costs.electricity_cost = calculate_electricity_cost(
        print_time_hours,
        args.electricity_rate,
        args.printer_power,
        printer.heated_bed,
        nozzle_temp if nozzle_temp > 0 else 210,
    )
    
    costs.time_cost = calculate_time_cost(print_time_hours, args.hourly_rate)
    
    costs.total_cost = costs.filament_cost + costs.electricity_cost + costs.time_cost
    
    costs.breakdown = {
        "Filament price": f"${args.filament_price:.2f}/kg",
        "Electricity rate": f"${args.electricity_rate:.3f}/kWh",
        "Printer power": f"{args.printer_power:.0f}W",
    }
    if args.hourly_rate > 0:
        costs.breakdown["Hourly rate"] = f"${args.hourly_rate:.2f}/hr"
    
    if args.format == "json":
        print_json_output(costs, filament, printer)
    else:
        print_cost_report(costs, filament, printer)


if __name__ == "__main__":
    main()
