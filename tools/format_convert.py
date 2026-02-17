#!/usr/bin/env python3
"""
format_convert.py

Convert OpenPrint3D profiles between JSON and YAML formats.

Supports:
- JSON to YAML conversion
- YAML to JSON conversion
- Batch conversion of multiple profiles

Usage:
    # Convert JSON to YAML
    python tools/format_convert.py json2yaml filament/Hatchbox/PLA.json
    python tools/format_convert.py json2yaml filament/ printer/
    
    # Convert YAML to JSON
    python tools/format_convert.py yaml2json output/PLA.yaml
    
    # Specify output directory
    python tools/format_convert.py json2yaml filament/Hatchbox/PLA.json -o output/
    
    # Convert entire directories
    python tools/format_convert.py json2yaml filament/ -o yaml_profiles/
    python tools/format_convert.py yaml2json yaml_profiles/ -o json_profiles/

Requirements:
    pip install pyyaml
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("[ERR] PyYAML not installed. Run: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

# OpenPrint3D supported schema types
SCHEMA_TYPES = {"filament", "printer", "process"}


def is_profile_file(path: Path) -> bool:
    """Check if file is an OpenPrint3D profile."""
    if not path.suffix.lower() in {".json", ".yaml", ".yml"}:
        return False
    try:
        with path.open("r", encoding="utf-8") as f:
            if path.suffix.lower() == ".json":
                data = json.load(f)
            else:
                data = yaml.safe_load(f)
            return isinstance(data, dict) and data.get("op3d_schema") in SCHEMA_TYPES
    except Exception:
        return False


def load_profile(path: Path) -> dict:
    """Load a profile from JSON or YAML file."""
    try:
        with path.open("r", encoding="utf-8") as f:
            if path.suffix.lower() == ".json":
                return json.load(f)
            else:
                return yaml.safe_load(f)
    except FileNotFoundError:
        print(f"[ERR] File not found: {path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[ERR] Invalid JSON in {path}: {e}", file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"[ERR] Invalid YAML in {path}: {e}", file=sys.stderr)
        sys.exit(1)


def save_json(profile: dict, output_path: Path, indent: int = 2) -> None:
    """Save profile as JSON."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(profile, f, indent=indent, ensure_ascii=False)
    print(f"[OK] Saved JSON: {output_path}")


def save_yaml(profile: dict, output_path: Path) -> None:
    """Save profile as YAML."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(
            profile, 
            f, 
            default_flow_style=False, 
            sort_keys=False, 
            allow_unicode=True,
            indent=2
        )
    print(f"[OK] Saved YAML: {output_path}")


def json_to_yaml(input_path: Path, output_dir: Path | None = None) -> None:
    """Convert a JSON profile to YAML."""
    profile = load_profile(input_path)
    
    if output_dir:
        output_path = output_dir / f"{input_path.stem}.yaml"
    else:
        output_path = input_path.with_suffix(".yaml")
    
    save_yaml(profile, output_path)


def yaml_to_json(input_path: Path, output_dir: Path | None = None) -> None:
    """Convert a YAML profile to JSON."""
    profile = load_profile(input_path)
    
    if output_dir:
        output_path = output_dir / f"{input_path.stem}.json"
    else:
        output_path = input_path.with_suffix(".json")
    
    save_json(profile, output_path)


def process_path(path: Path, conversion_func, output_dir: Path | None = None, recursive: bool = True) -> int:
    """Process a file or directory."""
    count = 0
    
    if path.is_file():
        if is_profile_file(path):
            conversion_func(path, output_dir)
            count = 1
        else:
            print(f"[SKIP] Not an OpenPrint3D profile: {path}")
    elif path.is_dir():
        for item in path.rglob("*") if recursive else path.iterdir():
            if item.is_file() and is_profile_file(item):
                # Calculate relative path for output
                rel_path = item.relative_to(path)
                if output_dir:
                    func_output_dir = output_dir / rel_path.parent
                    conversion_func(item, func_output_dir)
                else:
                    conversion_func(item, None)
                count += 1
    
    return count


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert OpenPrint3D profiles between JSON and YAML formats.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert a single JSON file to YAML
  python tools/format_convert.py json2yaml filament/Hatchbox/PLA.json

  # Convert JSON to YAML with output directory
  python tools/format_convert.py json2yaml filament/Hatchbox/PLA.json -o output/

  # Convert entire filament folder to YAML
  python tools/format_convert.py json2yaml filament/ -o yaml_profiles/

  # Convert YAML back to JSON
  python tools/format_convert.py yaml2json yaml_profiles/ -o json_profiles/

  # Convert without recursion (top-level only)
  python tools/format_convert.py json2yaml filament/ --no-recursive
"""
    )
    parser.add_argument(
        "conversion",
        choices=["json2yaml", "yaml2json"],
        help="Conversion direction"
    )
    parser.add_argument(
        "input",
        type=Path,
        help="Input file or directory"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output directory (default: same as input with new extension)"
    )
    parser.add_argument(
        "--recursive", "-r",
        action="store_true",
        default=True,
        help="Recursively process directories (default: True)"
    )
    parser.add_argument(
        "--no-recursive",
        action="store_false",
        dest="recursive",
        help="Do not recursively process subdirectories"
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="JSON indentation spaces (default: 2)"
    )

    args = parser.parse_args()
    
    # Validate input exists
    if not args.input.exists():
        print(f"[ERR] Input path does not exist: {args.input}", file=sys.stderr)
        sys.exit(1)
    
    # Determine conversion function
    if args.conversion == "json2yaml":
        conversion_func = json_to_yaml
    else:
        conversion_func = yaml_to_json
    
    # Process input
    print(f"Converting {args.input} ({args.conversion})...")
    
    count = process_path(
        args.input, 
        conversion_func, 
        args.output,
        args.recursive
    )
    
    if count > 0:
        print(f"\n[OK] Converted {count} profile(s)")
    else:
        print("[WARN] No profiles found to convert")


if __name__ == "__main__":
    main()
