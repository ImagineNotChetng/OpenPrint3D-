#!/usr/bin/env python3
"""
list_profiles.py

List all available printer and filament profiles.

Usage:
    python tools/list_profiles.py
    python tools/list_profiles.py --type printer
    python tools/list_profiles.py --type filament --brand BambuLab
    python tools/list_profiles.py --format json
"""

import argparse
import json
import sys
from pathlib import Path


def load_json(path: Path) -> dict:
    """Load a JSON file."""
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return None


def find_profiles(base_dir: Path, profile_type: str = None) -> list[dict]:
    """Find all profiles of the specified type."""
    profiles = []
    
    if profile_type in (None, "printer"):
        printer_dir = base_dir / "printer"
        if printer_dir.exists():
            for brand_dir in printer_dir.iterdir():
                if brand_dir.is_dir():
                    for json_file in brand_dir.glob("*.json"):
                        profile = load_json(json_file)
                        if profile:
                            profiles.append({
                                "type": "printer",
                                "brand": brand_dir.name,
                                "model": profile.get("model", "Unknown"),
                                "id": profile.get("id", ""),
                                "path": str(json_file.relative_to(base_dir)),
                                "kinematics": profile.get("kinematics", ""),
                                "build_volume": profile.get("build_volume", {})
                            })
    
    if profile_type in (None, "filament"):
        filament_dir = base_dir / "filament"
        if filament_dir.exists():
            for brand_dir in filament_dir.iterdir():
                if brand_dir.is_dir():
                    for json_file in brand_dir.glob("*.json"):
                        profile = load_json(json_file)
                        if profile:
                            profiles.append({
                                "type": "filament",
                                "brand": brand_dir.name,
                                "name": profile.get("name", ""),
                                "material": profile.get("material", ""),
                                "id": profile.get("id", ""),
                                "path": str(json_file.relative_to(base_dir)),
                                "diameter": profile.get("diameter", 1.75)
                            })
    
    return profiles


def format_table(profiles: list[dict], profile_type: str = None) -> None:
    """Format profiles as a table."""
    if profile_type == "printer":
        print(f"{'Brand':<15} {'Model':<25} {'Kinematics':<15} {'Build Volume':<15}")
        print("-" * 70)
        for p in profiles:
            bv = p.get("build_volume", {})
            vol = f"{bv.get('x', '?')}x{bv.get('y', '?')}x{bv.get('z', '?')}"
            print(f"{p['brand']:<15} {p['model']:<25} {p.get('kinematics', '?'):<15} {vol:<15}")
    elif profile_type == "filament":
        print(f"{'Brand':<15} {'Name':<30} {'Material':<10} {'Diameter':<10}")
        print("-" * 65)
        for p in profiles:
            print(f"{str(p['brand']):<15} {p.get('name', '?')[:30]:<30} {p.get('material', '?'):<10} {p.get('diameter', 1.75):<10}")
    else:
        # Mixed
        for p in profiles:
            if p["type"] == "printer":
                bv = p.get("build_volume", {})
                vol = f"{bv.get('x', '?')}x{bv.get('y', '?')}x{bv.get('z', '?')}"
                print(f"[PRINTER] {p['brand']} {p['model']} ({p.get('kinematics', '?')}) - {vol}")
            else:
                print(f"[FILAMENT] {p['brand']} {p.get('name', '?')} ({p.get('material', '?')})")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="List all available OpenPrint3D profiles."
    )
    parser.add_argument(
        "--type", "-t",
        choices=["printer", "filament"],
        help="Filter by profile type"
    )
    parser.add_argument(
        "--brand", "-b",
        help="Filter by brand name"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["table", "json", "simple"],
        default="table",
        help="Output format"
    )
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Base directory (default: project root)"
    )

    args = parser.parse_args()

    profiles = find_profiles(args.base_dir, args.type)
    
    # Filter by brand if specified
    if args.brand:
        profiles = [p for p in profiles if p.get("brand", "").lower() == args.brand.lower()]

    if args.format == "json":
        print(json.dumps(profiles, indent=2))
    elif args.format == "simple":
        for p in profiles:
            print(p["path"])
    else:
        format_table(profiles, args.type)

    print(f"\nTotal: {len(profiles)} profiles")


if __name__ == "__main__":
    main()
