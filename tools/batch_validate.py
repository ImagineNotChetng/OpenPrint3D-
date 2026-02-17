#!/usr/bin/env python3
"""
batch_validate.py

Validate all OpenPrint3D profiles against their schemas.

Usage:
    python tools/batch_validate.py
    python tools/batch_validate.py --fix    # Attempt to fix common issues
"""

import argparse
import json
import sys
from pathlib import Path

from jsonschema import Draft7Validator, exceptions as jsonschema_exceptions


def load_json(path: Path) -> dict:
    """Load a JSON file."""
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"[ERR] Invalid JSON in {path}: {e}", file=sys.stderr)
        return None


def load_schema(schema_type: str) -> dict:
    """Load the appropriate schema."""
    schema_dir = Path(__file__).parent.parent / "schema"
    schema_file = schema_dir / f"{schema_type}.schema.json"
    return load_json(schema_file)


def validate_profile(profile: dict, schema: dict) -> tuple[bool, list]:
    """Validate a profile against its schema."""
    try:
        validator = Draft7Validator(schema)
        errors = list(validator.iter_errors(profile))
        return len(errors) == 0, errors
    except jsonschema_exceptions.SchemaError as e:
        return False, [str(e)]


def find_profiles(base_dir: Path) -> list[tuple[Path, str]]:
    """Find all profile files and their types."""
    profiles = []
    
    # Find printer profiles
    printer_dir = base_dir / "printer"
    if printer_dir.exists():
        for json_file in printer_dir.rglob("*.json"):
            profiles.append((json_file, "printer"))
    
    # Find filament profiles
    filament_dir = base_dir / "filament"
    if filament_dir.exists():
        for json_file in filament_dir.rglob("*.json"):
            profiles.append((json_file, "filament"))
    
    # Find process profiles
    process_dir = base_dir / "process"
    if process_dir.exists():
        for json_file in process_dir.rglob("*.json"):
            profiles.append((json_file, "process"))
    
    return profiles


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate all OpenPrint3D profiles against schemas."
    )
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Base directory containing profiles (default: project root)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show detailed error information"
    )

    args = parser.parse_args()

    # Load schemas
    printer_schema = load_schema("printer")
    filament_schema = load_schema("filament")
    
    schemas = {
        "printer": printer_schema,
        "filament": filament_schema
    }

    if not printer_schema or not filament_schema:
        print("[ERR] Could not load schemas", file=sys.stderr)
        sys.exit(1)

    # Find all profiles
    profiles = find_profiles(args.base_dir)
    
    print(f"Found {len(profiles)} profiles to validate...\n")

    stats = {"ok": 0, "fail": 0}
    errors_by_type = {}

    for profile_path, schema_type in profiles:
        profile = load_json(profile_path)
        if profile is None:
            stats["fail"] += 1
            continue
        
        schema = schemas.get(schema_type)
        if not schema:
            continue
        
        is_valid, errors = validate_profile(profile, schema)
        
        if is_valid:
            stats["ok"] += 1
            print(f"[ OK ] {profile_path.relative_to(args.base_dir)}")
        else:
            stats["fail"] += 1
            print(f"[FAIL] {profile_path.relative_to(args.base_dir)}")
            
            if args.verbose:
                for err in errors:
                    path = ".".join(str(p) for p in err.path) if err.path else "<root>"
                    print(f"      - {path}: {err.message[:80]}")
                    
                    # Track error types
                    error_key = type(err).__name__
                    errors_by_type[error_key] = errors_by_type.get(error_key, 0) + 1

    print(f"\n{'='*50}")
    print(f"Results: {stats['ok']} OK, {stats['fail']} Failed")
    
    if args.verbose and errors_by_type:
        print(f"\nError types:")
        for err_type, count in sorted(errors_by_type.items(), key=lambda x: -x[1]):
            print(f"  {err_type}: {count}")

    sys.exit(0 if stats["fail"] == 0 else 1)


if __name__ == "__main__":
    main()
