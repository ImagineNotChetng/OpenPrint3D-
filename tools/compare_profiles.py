#!/usr/bin/env python3
"""
compare_profiles.py

Compare two OpenPrint3D profiles and show differences in settings.

Usage:
    python tools/compare_profiles.py printer/BambuLab/X1-Carbon.json printer/BambuLab/P1S.json
    python tools/compare_profiles.py filament/BambuLab/PLA-Basic.json filament/Hatchbox/PLA.json
    python tools/compare_profiles.py profile1.json profile2.json --format json
    python tools/compare_profiles.py profile1.json profile2.json --show-common
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def load_profile(path: Path) -> dict:
    """Load a JSON profile file."""
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[ERR] File not found: {path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[ERR] Invalid JSON in {path}: {e}", file=sys.stderr)
        sys.exit(1)


def flatten_dict(d: dict, parent_key: str = "", sep: str = ".") -> dict:
    """Flatten a nested dictionary into dot-notation keys."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def compare_values(v1: Any, v2: Any) -> bool:
    """Compare two values, treating None and missing similarly."""
    if v1 is None and v2 is None:
        return True
    if v1 is None or v2 is None:
        return False
    if isinstance(v1, dict) and isinstance(v2, dict):
        return v1 == v2
    if isinstance(v1, list) and isinstance(v2, list):
        return v1 == v2
    return v1 == v2


def compare_profiles(profile1: dict, profile2: dict, show_common: bool = False) -> dict:
    """Compare two profiles and return differences."""
    flat1 = flatten_dict(profile1)
    flat2 = flatten_dict(profile2)
    
    all_keys = set(flat1.keys()) | set(flat2.keys())
    
    differences = []
    common = []
    
    for key in sorted(all_keys):
        v1 = flat1.get(key)
        v2 = flat2.get(key)
        
        if key not in flat1:
            differences.append({
                "key": key,
                "profile1": None,
                "profile2": v2,
                "status": "only_in_profile2"
            })
        elif key not in flat2:
            differences.append({
                "key": key,
                "profile1": v1,
                "profile2": None,
                "status": "only_in_profile1"
            })
        elif not compare_values(v1, v2):
            differences.append({
                "key": key,
                "profile1": v1,
                "profile2": v2,
                "status": "different"
            })
        elif show_common:
            common.append({
                "key": key,
                "value": v1
            })
    
    return {
        "profile1_schema": profile1.get("op3d_schema", "unknown"),
        "profile2_schema": profile2.get("op3d_schema", "unknown"),
        "profile1_id": profile1.get("id", "unknown"),
        "profile2_id": profile2.get("id", "unknown"),
        "differences": differences,
        "common": common,
        "stats": {
            "total_keys": len(all_keys),
            "differences": len(differences),
            "common": len(common),
            "only_in_profile1": sum(1 for d in differences if d["status"] == "only_in_profile1"),
            "only_in_profile2": sum(1 for d in differences if d["status"] == "only_in_profile2"),
            "modified": sum(1 for d in differences if d["status"] == "different")
        }
    }


def format_value(v: Any, max_len: int = 40) -> str:
    """Format a value for display."""
    if v is None:
        return "<missing>"
    if isinstance(v, (dict, list)):
        s = json.dumps(v)
        if len(s) > max_len:
            return s[:max_len - 3] + "..."
        return s
    return str(v)


def format_text(result: dict, show_common: bool = False) -> None:
    """Format comparison result as text."""
    p1_id = result["profile1_id"]
    p2_id = result["profile2_id"]
    
    print(f"\n{'='*70}")
    print(f"Profile Comparison: {p1_id} vs {p2_id}")
    print(f"{'='*70}")
    
    stats = result["stats"]
    print(f"\nSummary:")
    print(f"  Total keys checked: {stats['total_keys']}")
    print(f"  Differences found:  {stats['differences']}")
    print(f"    - Only in Profile 1: {stats['only_in_profile1']}")
    print(f"    - Only in Profile 2: {stats['only_in_profile2']}")
    print(f"    - Modified values:   {stats['modified']}")
    print(f"  Common settings:    {stats['common']}")
    
    if result["differences"]:
        print(f"\n{'-'*70}")
        print("DIFFERENCES")
        print(f"{'-'*70}")
        print(f"{'Key':<40} {'Profile 1':<25} {'Profile 2':<25}")
        print(f"{'-'*40} {'-'*25} {'-'*25}")
        
        for diff in result["differences"]:
            key = diff["key"]
            v1 = format_value(diff["profile1"])
            v2 = format_value(diff["profile2"])
            
            status = diff["status"]
            if status == "only_in_profile1":
                print(f"{key:<40} {v1:<25} {'<missing>':<25}")
            elif status == "only_in_profile2":
                print(f"{key:<40} {'<missing>':<25} {v2:<25}")
            else:
                print(f"{key:<40} {v1:<25} {v2:<25}")
    
    if show_common and result["common"]:
        print(f"\n{'-'*70}")
        print("COMMON SETTINGS")
        print(f"{'-'*70}")
        print(f"{'Key':<40} {'Value':<25}")
        print(f"{'-'*40} {'-'*25}")
        
        for item in result["common"]:
            key = item["key"]
            val = format_value(item["value"])
            print(f"{key:<40} {val:<25}")
    
    print()


def format_json(result: dict) -> None:
    """Format comparison result as JSON."""
    print(json.dumps(result, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compare two OpenPrint3D profiles and show differences."
    )
    parser.add_argument(
        "profile1",
        type=Path,
        help="First profile file to compare"
    )
    parser.add_argument(
        "profile2",
        type=Path,
        help="Second profile file to compare"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    parser.add_argument(
        "--show-common", "-c",
        action="store_true",
        help="Also show settings that are the same in both profiles"
    )

    args = parser.parse_args()

    profile1 = load_profile(args.profile1)
    profile2 = load_profile(args.profile2)

    result = compare_profiles(profile1, profile2, args.show_common)

    if args.format == "json":
        format_json(result)
    else:
        format_text(result, args.show_common)

    if result["stats"]["differences"] > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()