# Linear Advance Calibration Guide

## Overview

Linear Advance (LA) is a Marlin firmware feature that anticipates pressure changes in the hotend during printing. By pre-emptively adjusting extrusion flow rate based on upcoming acceleration/deceleration, it significantly improves print quality by eliminating:

- Bulging at layer start points
- Under-extrusion at the start of lines
- Over-extrusion at the end of lines
- Inconsistent wall widths

## How Linear Advance Works

```
Without Linear Advance:          With Linear Advance:
┌─────────────────────┐         ┌─────────────────────┐
│ Start: Under-extrude│         │ Start: Flow matched │
│   ↓                 │         │   ↓                 │
│ ═══════════════════ │         │ ═══════════════════ │
│              ↓      │         │              ↓      │
│ End: Over-extrude   │         │ End: Flow matched   │
└─────────────────────┘         └─────────────────────┘
```

The K-factor (linear advance coefficient) determines how much the extruder motor advances or retreats to compensate for pressure changes:

- **Higher K**: More compensation for pressure buildup
- **Lower K**: Less compensation
- **K = 0**: Linear Advance disabled

## Direct Drive vs Bowden

| Parameter | Direct Drive | Bowden |
|-----------|-------------|--------|
| Typical K Range | 0.01 - 0.20 | 0.04 - 1.50 |
| Pressure Hysteresis | Low | High |
| Filament Path | Short (direct to hotend) | Long (tube to hotend) |
| Responsiveness | Fast | Slower |
| K Tuning Sensitivity | Higher (small changes matter) | Lower (wider acceptable range) |

## Prerequisites

1. **Marlin firmware with LINEAR_ADVANCE enabled**
   - Check via terminal: `M503` - look for `M900 K` in output
   - Firmware must have `LIN_ADVANCE` compiled in

2. **Calibrated extruder steps**
   - E-steps must be accurate before tuning LA
   - Run `M92 E###` to verify/set

3. **Calibrated flow rate**
   - Flow multiplier should be dialed in
   - Typically 95-100% for most filaments

4. **Working retraction settings**
   - Retraction should already be tuned
   - LA works alongside retraction, not replacing it

## K-Factor Reference Charts

### Direct Drive K-Factor Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIRECT DRIVE K-FACTOR                        │
├──────────────────┬─────────────────┬────────────────────────────┤
│ Material         │ K-Factor Range  │ Recommended Starting Point │
├──────────────────┼─────────────────┼────────────────────────────┤
│ PLA              │ 0.01 - 0.10     │ 0.04                       │
│ PLA+ / Tough PLA │ 0.02 - 0.12     │ 0.05                       │
│ PETG             │ 0.03 - 0.15     │ 0.06                       │
│ ABS / ASA        │ 0.02 - 0.12     │ 0.05                       │
│ TPU (soft)       │ 0.00 - 0.05     │ 0.02                       │
│ TPU (firm)       │ 0.01 - 0.08     │ 0.03                       │
│ Nylon            │ 0.03 - 0.12     │ 0.06                       │
│ PC (Polycarbonate)│ 0.04 - 0.15    │ 0.08                       │
│ Carbon Fiber PLA │ 0.02 - 0.10     │ 0.04                       │
│ Wood PLA         │ 0.03 - 0.12     │ 0.05                       │
└──────────────────┴─────────────────┴────────────────────────────┘

Direct Drive K-Factor Test Range: 0.00 - 0.20
Recommended Test Increment: 0.01 - 0.02
```

### Bowden K-Factor Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                      BOWDEN K-FACTOR                            │
├──────────────────┬─────────────────┬────────────────────────────┤
│ Material         │ K-Factor Range  │ Recommended Starting Point │
├──────────────────┼─────────────────┼────────────────────────────┤
│ PLA              │ 0.04 - 0.80     │ 0.30                       │
│ PLA+ / Tough PLA │ 0.05 - 0.90     │ 0.35                       │
│ PETG             │ 0.10 - 1.20     │ 0.50                       │
│ ABS / ASA        │ 0.08 - 1.00     │ 0.40                       │
│ TPU (soft)       │ 0.00 - 0.20     │ 0.05                       │
│ TPU (firm)       │ 0.02 - 0.40     │ 0.15                       │
│ Nylon            │ 0.15 - 1.30     │ 0.60                       │
│ PC (Polycarbonate)│ 0.20 - 1.40    │ 0.70                       │
│ Carbon Fiber PLA │ 0.04 - 0.70     │ 0.25                       │
│ Wood PLA         │ 0.08 - 0.90     │ 0.35                       │
└──────────────────┴─────────────────┴────────────────────────────┘

Bowden K-Factor Test Range: 0.00 - 1.50
Recommended Test Increment: 0.05 - 0.10
```

### Bowden Tube Length Impact

```
┌────────────────────────────────────────────────────┐
│ Bowden Tube Length │ K-Factor Adjustment           │
├────────────────────┼───────────────────────────────┤
│ Short (200-300mm)  │ Reduce K by 10-20%            │
│ Medium (400-500mm) │ Use standard K values         │
│ Long (600mm+)      │ Increase K by 10-30%          │
└────────────────────┴───────────────────────────────┘
```

## Calibration Procedure

### Step 1: Prepare Printer

```
1. Clean nozzle (cold pull recommended)
2. Load filament to be calibrated
3. Ensure bed is leveled
4. Preheat to material's printing temperature
```

### Step 2: Print Test Pattern

Use the provided G-code files or generate your own:

- **Direct Drive**: Use `linear_advance_test_direct.gcode`
- **Bowden**: Use `linear_advance_test_bowden.gcode`

### Step 3: Evaluate Results

Look for these indicators on each K-factor section:

```
GOOD K-FACTOR:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Consistent line width
│ ███████████████████████████████│ ← No gaps or bulges
│ ███████████████████████████████│ ← Sharp corners
└────────────────────────────────┘

K TOO LOW:
┌────────────────────────────────┐
│ ▓▓▓▓░░░░▓▓▓▓▓▓▓▓░░░░▓▓▓▓▓▓▓▓▓▓│ ← Under-extrusion at line starts
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← Bulging at line ends
└────────────────────────────────┘

K TOO HIGH:
┌────────────────────────────────┐
│ ██████████░░░░░░░░░░░░████████│ ← Over-extrusion at line starts
│ ██████████████████████████████░│
│ ░░░░██████████████████████████│ ← Under-extrusion at line ends
└────────────────────────────────┘
```

### Step 4: Fine-Tune

1. Identify the best-looking section from the test
2. Run a narrower test around that K value
3. Repeat until optimal K is found

### Step 5: Save Settings

```gcode
; Set K-factor (example: K=0.08)
M900 K0.08

; Save to EEPROM
M500

; Verify saved
M501
```

## G-Code Commands Reference

| Command | Description |
|---------|-------------|
| `M900 K0.05` | Set K-factor to 0.05 |
| `M900 K0` | Disable Linear Advance |
| `M503` | Display current settings |
| `M500` | Save settings to EEPROM |
| `M501` | Load settings from EEPROM |
| `M502` | Reset to firmware defaults |

## Troubleshooting

### Test Print Shows No Difference Between K Values

```
Possible Causes:
├─ LINEAR_ADVANCE not enabled in firmware
├─ K-factor test range too narrow
├─ Extruder has significant backlash
└─ Firmware may need recompilation with LIN_ADVANCE

Solutions:
├─ Verify with M503 - should show M900 K value
├─ Widen test range (try 0.00 to 0.30 for direct drive)
├─ Check extruder gear for wear/play
└─ Recompile Marlin with #define LIN_ADVANCE
```

### Layers Look Worse After Enabling LA

```
Possible Causes:
├─ K-factor set too high
├─ Conflicting with retraction settings
├─ Print speed too high for LA to compensate
└─ Extruder cannot keep up with rapid movements

Solutions:
├─ Reduce K-factor by 50% and retest
├─ Review retraction settings (LA and retraction work together)
├─ Reduce print speed to 40-50mm/s for calibration
└─ Check extruder motor current and gearing
```

### Different K-Factor Needed for Different Speeds

```
This is expected behavior. LA compensates for pressure,
which varies with acceleration and speed.

Solutions:
├─ Calibrate at your typical print speed
├─ For variable speeds, use average K value
├─ Some firmwares support speed-dependent K
└─ Use slicer to set K per print profile
```

### PETG/TPU Not Responding to LA

```
Possible Causes:
├─ Material compressibility affects pressure modeling
├─ Higher viscosity materials behave differently
├─ K-factor range for material is different
└─ Temperature affects pressure dynamics

Solutions:
├─ Increase K-factor range for test (up to 2.0 for soft TPU)
├─ Ensure temperature is optimized first
├─ Consider disabling LA for soft TPU
└─ For PETG, try 2x the PLA K-factor
```

## Slicer Integration

### PrusaSlicer / SuperSlicer

```
; In Printer Settings > Custom G-code > Start G-code:
M900 K0.08 ; Set your calibrated K-factor

; Or use placeholder for per-filament settings:
; Add to filament's custom G-code section
M900 K[factor]
```

### Cura

```
; In Manage Printers > Machine Settings > Start G-code:
M900 K0.08

; Or use the "Linear Advance" plugin for per-material settings
```

### Simplify3D

```
; In Process > Scripts > Starting Script:
M900 K0.08
```

## Material-Specific Notes

### PLA
- Most responsive to LA tuning
- Start at K=0.04 (direct) or K=0.30 (bowden)
- Fine-tune in 0.01 increments

### PETG
- Higher viscosity requires higher K
- Start at K=0.06 (direct) or K=0.50 (bowden)
- Stringing issues often improve with proper LA

### TPU
- Soft TPU may not benefit from LA
- Compression in bowden tube makes tuning difficult
- Consider direct drive for flexible materials

### ABS/ASA
- Similar K values to PLA
- Heat management more critical than LA tuning
- LA helps with layer consistency

### Nylon
- High pressure buildup benefits from LA
- K values 1.5-2x PLA equivalents
- Hygroscopic nature affects pressure dynamics

## Related Files

- `linear_advance_test_direct.gcode` - Test pattern for direct drive (K: 0.00-0.20)
- `linear_advance_test_bowden.gcode` - Test pattern for bowden (K: 0.00-1.50)

## References

- [Marlin Linear Advance Documentation](https://marlinfw.org/docs/features/lin_advance.html)
- [Linear Advance K-Factor Guide by Marlin](https://marlinfw.org/tools/lin_advance/k-factor.html)

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
