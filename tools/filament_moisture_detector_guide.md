# Filament Moisture Detector Guide

## Overview

Detecting moisture in 3D printing filament is crucial for maintaining print quality. Wet filament causes bubbling, popping, stringing, poor layer adhesion, and surface defects. This guide covers various methods to detect moisture in your filament.

## Signs of Wet Filament

### Visual Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                     WET FILAMENT SIGNS                          │
├─────────────────────────────────────────────────────────────────┤
│ • Popping/bubbling during extrusion (moisture evaporates)     │
│ • Excessive stringing between print sections                   │
│ │                                                                 │
│ │   DRY:     ════════════        WET:  ════════••••═══        │
│ │              Clean                        Bubbles/String     │
│ │                                                                 │
│ • Rough, uneven surface finish                                  │
│ │                                                                 │
│ │   DRY:     ████████████         WET:  ░▒▓▒░▒▓▒░▒▓▒░          │
│ │              Smooth                       Rough/Bumpy        │
│ │                                                                 │
│ • Poor layer adhesion (easy to separate layers)                │
│ • Inconsistent extrusion (flow variations)                      │
│ • Steam or vapor visible near nozzle during printing            │
└─────────────────────────────────────────────────────────────────┘
```

### Audio Indicators

- **Popping sounds**: Moisture expanding as it hits hot nozzle
- **Sizzling**: Water vapor escaping
- **Irregular extrusion noise**: Inconsistent flow

## Moisture Detection Methods

### Method 1: Print Test

The most practical test - print a simple object and observe:

```gcode
; Quick moisture test print
G28 ; Home all axes
G1 Z0.2 F600 ; Lift slightly
G1 X50 Y50 F1200 ; Move to center
M109 S200 ; Wait for 200°C (PLA)
G1 E20 F100 ; Extrude some filament
; Watch and listen for:
; - Bubbles in extruded filament
; - Popping sounds
; - Uneven extrusion
```

**Results Interpretation:**

```
GOOD (Dry):
┌────────────────────┐
│ ██████████████████ │
│ ██████████████████ │
│ ██████████████████ │
│ Smooth surface    │
└────────────────────┘

WET:
┌────────────────────┐
│ ░▓░▓░▓░▓░▓░▓░▓░▓░▓ │
│ ░▓░▓░▓░▓░▓░▓░▓░▓░▓ │
│ ░▓░▓░▓░▓░▓░▓░▓░▓░▓ │
│ Bubbles/rough      │
└────────────────────┘
```

### Method 2: Filament Straight Test

1. Heat nozzle to printing temperature
2. Manually push filament through
3. Observe the extruded filament

```
DRY:  Smooth, consistent diameter, no bubbles
WET:  Irregular diameter, bubbles visible, hissing sound
```

### Method 3: Drying Time Test

Print the same test object before and after drying:

```python
def moisture_test_result(before_drying: bool, pop_count: int, surface_quality: str) -> str:
    """Evaluate filament moisture based on test print"""
    if before_drying:
        if pop_count > 5 or surface_quality == "rough":
            return "WET - Dry before printing"
        else:
            return "Possibly dry - verify with other tests"
    else:
        if pop_count == 0 and surface_quality == "smooth":
            return "Dry and ready to print"
        else:
            return "May need more drying time"
```

### Method 4: Weight Measurement

Compare weight of suspected wet filament to known dry filament:

```
Formula: Moisture Content % = ((WetWeight - DryWeight) / DryWeight) × 100

Example:
- Dry spool weight: 1000g
- Suspected wet: 1020g
- Moisture: ((1020-1000)/1000) × 100 = 2%

Recommended: < 0.5% moisture for best printing
```

### Method 5: Professional Moisture Meters

For precise measurements, use specialized equipment:

| Meter Type | Accuracy | Cost | Use Case |
|------------|----------|------|----------|
| Wood moisture meter | ±0.5% | $20-50 | Rough estimate |
| Filament-specific meter | ±0.1% | $50-150 | Precise measurement |
| Laboratory balance + oven | ±0.01% | $200+ | Research grade |

**Using a wood moisture meter:**
```
1. Set meter to wood type (use generic setting)
2. Insert probes into filament or press against spool
3. Read moisture percentage
4. Compare to recommended levels

Recommended moisture levels:
- PLA: < 0.2%
- PETG: < 0.2%
- ABS: < 0.1%
- Nylon: < 2.5%
- TPU: < 1.0%
```

## Material-Specific Moisture Thresholds

```
┌────────────────────────────────────────────────────────────────────────┐
│                    MOISTURE TOLERANCE BY MATERIAL                      │
├──────────────────┬───────────────┬────────────────────────────────────┤
│ Material         │ Max Moisture │ Signs of Excess Moisture           │
├──────────────────┼───────────────┼────────────────────────────────────┤
│ PLA              │ 0.2%          │ Popping, stringing                 │
│ PETG             │ 0.2%          │ Bubbling, poor adhesion            │
│ ABS              │ 0.1%          │ Severe bubbling, voids             │
│ ASA              │ 0.1%          │ Similar to ABS                     │
│ Nylon            │ 2.5%          │ Brittle prints, warping            │
│ PC               │ 0.2%          │ Cloudy print, bubbles              │
│ PEEK             │ 0.5%          │ Discoloration, voids               │
│ TPU              │ 1.0%          │ Stringing, inconsistent flow       │
│ PP               │ 0.3%          │ Poor adhesion, cracking            │
│ PMMA             │ 0.3%          │ Cracking, cloudiness               │
│ PVB              │ 0.5%          │ Cloudy, poor clarity               │
└──────────────────┴───────────────┴────────────────────────────────────┘
```

## Hygroroscopicity Chart

```
HIGHLY HYGROSCOPIC (absorbs moisture quickly):
┌────────────────────────────────────────────────┐
│ Nylon    ████████████████████ Very High       │
│ PEEK     ██████████████████    Very High      │
│ PC       ████████████████      High           │
│ ABS      ██████████████        High           │
│ PETG     ████████████          Moderate       │
│ TPU      ████████████          Moderate       │
│ PLA      ████████              Low            │
│ PP       ██████                Low             │
└────────────────────────────────────────────────┘
```

## Storage Recommendations

### For Dry Filament

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPER STORAGE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filament → Vacuum Bag → Desiccant → Seal                  │
│                    ↓                                        │
│              Or: Airtight container with silica gel          │
│                    ↓                                        │
│              Or: Dry box with active drying                 │
│                    ↓                                        │
│              Store in cool, dark location                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Desiccant Types

| Type | Reusable | Capacity | Cost |
|------|----------|----------|------|
| Silica gel | Yes (oven dry) | Medium | $ |
| Molecular sieve | Yes (regenerate) | High | $$ |
| Calcium chloride | No | High | $ |
| Rice (not recommended) | No | Low | $ |

### Desiccant Indicators

```
COLOR-CHANGING SILICA GEL:
Blue → Pink (wet) | Orange → Green (wet) | Orange (dry)

Color indicates saturation - replace/regenerate when fully changed
```

## Drying Guidelines

### When to Dry

```
□ Prints show moisture signs (popping, stringing)
□ Filament has been stored improperly
□ Filament is >1 week old after opening
□ High humidity environment (>60% RH)
□ Printing hygroscopic materials (Nylon, PC, etc.)
```

### Drying Parameters

```
See companion guide: filament_drying_guide.md

Quick Reference:
- PLA: 40-45°C for 4-6 hours
- PETG: 60-65°C for 4-6 hours  
- ABS/ASA: 70-80°C for 4-6 hours
- Nylon: 70-80°C for 8-12 hours
- PC: 80-100°C for 6-8 hours
- PEEK: 120-150°C for 4-6 hours
```

## Testing Procedure

### Complete Moisture Detection Workflow

```python
def diagnose_filament_moisture(filament_type: str, print_result: str) -> str:
    """
    Diagnose filament moisture issues
    
    Args:
        filament_type: Material type (PLA, PETG, etc.)
        print_result: Description of test print quality
        
    Returns:
        Diagnosis and recommended action
    """
    wet_signs = ['bubbling', 'popping', 'rough', 'stringing']
    dry_signs = ['smooth', 'clean', 'consistent']
    
    if any(sign in print_result.lower() for sign in wet_signs):
        return f"{filament_type} appears WET - dry before printing"
    elif any(sign in print_result.lower() for sign in dry_signs):
        return f"{filament_type} appears DRY - ready to print"
    else:
        return "Inconclusive - perform additional test"
```

### Step-by-Step Detection

```
1. VISUAL INSPECTION
   └─ Check filament for discoloration
   └─ Look for moisture droplets on spool

2. AUDIO TEST
   └─ Heat nozzle and listen for popping

3. EXTRUSION TEST
   └─ Manually extrude and observe
   └─ Check for bubbles or roughness

4. PRINT TEST
   └─ Print small test object
   └─ Evaluate surface quality

5. WEIGHT TEST (optional)
   └─ Compare to known dry weight
   └─ Calculate moisture percentage
```

## Troubleshooting

### Problem: Consistent Popping During Print

```
Causes:
├─ Filament too wet
├─ Drying temperature too low
├─ Insufficient drying time

Solutions:
├─ Increase drying temperature by 5-10°C
├─ Extend drying time by 2-4 hours
├─ Use fresh desiccant
├─ Print from dry box
```

### Problem: Intermittent Popping

```
Causes:
├─ Partial drying
├─ Inconsistent moisture in spool
├─ Humid storage between prints

Solutions:
├─ Dry entire spool again
├─ Use spool dryer during printing
├─ Improve storage conditions
```

### Problem: Surface Roughness Without Popping

```
Causes:
├─ Slightly wet filament
├─ Wrong temperature
├─ Extrusion issues

Solutions:
├─ Try drying filament
├─ Adjust nozzle temperature
├─ Check extruder calibration
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│            FILAMENT MOISTURE DETECTION QUICK GUIDE          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WET FILAMENT SIGNS:                                        │
│  □ Popping/bubbling during extrusion                       │
│  □ Excessive stringing                                     │
│  □ Rough surface finish                                     │
│  □ Poor layer adhesion                                      │
│  □ Steam from nozzle                                        │
│                                                             │
│  QUICK TEST:                                                │
│  1. Heat nozzle to print temp                               │
│  2. Manually extrude filament                               │
│  3. Watch for bubbles/listen for pops                      │
│                                                             │
│  IF WET:                                                    │
│  □ Dry according to material guidelines                     │
│  □ Store with desiccant after opening                       │
│  □ Consider dry box for hygroscopic materials              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Related Files

- `filament_drying_guide.md` - Comprehensive drying instructions
- `print_quality_troubleshooting.md` - Related quality issues

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
