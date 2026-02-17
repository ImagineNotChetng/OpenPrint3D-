# Acceleration Tuning Guide for Print Quality

## Overview

Acceleration settings significantly impact print quality, surface finish, and dimensional accuracy. Proper tuning reduces:
- Ringing and ghosting on flat surfaces
- Layer shifting
- Artifacts on corners and detailed features
- Stringing and blobbing

This guide covers tuning for three acceleration types:
- **XY Acceleration**: Horizontal movement (walls, infill, perimeters)
- **Z Acceleration**: Vertical layer transitions
- **E Acceleration**: Extruder motor acceleration

## How Acceleration Affects Print Quality

```
High Acceleration:                    Low Acceleration:
┌─────────────────────┐              ┌─────────────────────┐
│ ████░░░░████████░░░ │ Ringing     │ ███████████████████ │ Clean
│ ████████████████████ │ Ghosting    │ ███████████████████ │ Surfaces
│ ████░░░░████████░░░ │              │ ███████████████████ │
└─────────────────────┘              └─────────────────────┘
```

## Acceleration Reference Charts

### Recommended XY Acceleration by Printer Type

| Printer Type | Direct Drive | Bowden | CoreXY | Notes |
|--------------|--------------|--------|--------|-------|
| Budget (Ender 3) | 500-1000 | 300-500 | - | Lower max speed |
| Mid-Range | 1000-2000 | 500-1000 | 1000-2000 | Balanced |
| High-Speed | 2000-4000 | - | 2000-4000 | Optimized for speed |
| Voron (DIY) | 2000-3000 | - | 2000-3000 | Rigid frame |

### Recommended XY Acceleration by Material

```
┌─────────────────────────────────────────────────────────────────┐
│                    XY ACCELERATION BY MATERIAL                   │
├──────────────────┬─────────────────┬────────────────────────────┤
│ Material         │ Acceleration    │ Notes                      │
├──────────────────┼─────────────────┼────────────────────────────┤
│ PLA              │ 1000-3000 mm/s² │ Good rigidity, crisp edges │
│ PLA+ / Tough PLA │ 800-2500 mm/s²  │ Slightly more flexible     │
│ PETG             │ 800-2000 mm/s²  │ Higher viscosity           │
│ ABS / ASA        │ 500-1500 mm/s²  │ Prone to warping           │
│ TPU (soft)       │ 200-800 mm/s²   │ Flexible, needs gentle acc │
│ TPU (firm)       │ 400-1200 mm/s²  │ Moderate flexibility       │
│ Nylon            │ 500-1500 mm/s²  │ High temp, flexible        │
│ PC (Polycarbonate)│ 400-1200 mm/s² │ Very rigid, high temp     │
│ Carbon Fiber PLA │ 800-2000 mm/s²  │ Abrasive, slightly stiff   │
│ Wood PLA         │ 800-2000 mm/s²  │ Filled, moderate stiffness │
│ PVB              │ 800-2000 mm/s²  │ Smooth finish, low temp    │
│ PP (Polypropylene)│ 400-1000 mm/s²  │ Very flexible, low adhesion│
└──────────────────┴─────────────────┴────────────────────────────┘
```

### Recommended Z Acceleration by Printer Type

| Printer Type | Z Acceleration | Notes |
|--------------|----------------|-------|
| Leadscrew (generic) | 100-300 mm/s² | Slower but stable |
| Leadscrew (high-quality) | 300-500 mm/s² | Better steppers |
| Trapezoidal screw | 200-400 mm/s² | Budget option |
| TMC Silent Stepper | 150-300 mm/s² | Quiet but limited |
| Independent Z (Voron) | 300-800 mm/s² | Each axis has own motor |

### Recommended E Acceleration (Extrusion)

| Extruder Type | E Acceleration | Notes |
|---------------|----------------|-------|
| Direct Drive | 1000-3000 mm/s² | Fast response |
| Titan Extruder | 500-1500 mm/s² | Good torque |
| Bondtech BMG | 1000-2500 mm/s² | High precision |
| Bowden + DD | 1500-4000 mm/s² | Compensates for compliance |
| Bowden (standard) | 300-1000 mm/s² | Limited by tube length |

### E Acceleration by Material

```
┌─────────────────────────────────────────────────────────────────┐
│                    E ACCELERATION BY MATERIAL                    │
├──────────────────┬─────────────────┬────────────────────────────┤
│ Material         │ Acceleration    │ Notes                      │
├──────────────────┼─────────────────┼────────────────────────────┤
│ PLA              │ 1500-3000 mm/s² │ Fast extrusion, clean      │
│ PLA+ / Tough PLA │ 1200-2500 mm/s² │ Slightly slower            │
│ PETG             │ 1000-2000 mm/s² │ Higher viscosity, ooze     │
│ ABS / ASA        │ 800-1800 mm/s²  │ Warp-sensitive             │
│ TPU (soft)       │ 300-800 mm/s²   │ Needs gentle acceleration  │
│ TPU (firm)       │ 600-1200 mm/s²  │ More responsive            │
│ Nylon            │ 800-1500 mm/s²  │ High temp, variable        │
│ PC (Polycarbonate)│ 600-1200 mm/s² │ High viscosity, slow       │
│ Carbon Fiber PLA │ 1000-2000 mm/s² │ Abrasive, slight stiffness │
│ Wood PLA         │ 1000-2000 mm/s² │ Filled material            │
└──────────────────┴─────────────────┴────────────────────────────┘
```

## Direct Drive vs Bowden Recommendations

### Direct Drive Benefits
- Lower E acceleration needed (faster response)
- More precise extrusion control
- Better for flexible filaments
- Less stringing

### Bowden Considerations
- Higher E acceleration compensates for compliance
- Tube length affects responsiveness
- Longer tubes = lower effective acceleration
- Consider 1.5-2x the direct drive values

```
┌────────────────────────────────────────────────────┐
│ Bowden Tube Length │ E Acceleration Multiplier     │
├────────────────────┼───────────────────────────────┤
│ Short (200-300mm)  │ 1.0x (use direct drive values)│
│ Medium (400-500mm) │ 1.3-1.5x                       │
│ Long (600mm+)      │ 1.5-2.0x                       │
└────────────────────┴───────────────────────────────┘
```

## Testing Procedures

### XY Acceleration Test

#### Prerequisites
1. Calibrated steps-per-mm for all axes
2. Leveled bed
3. Clean nozzle
4. Stock firmware with M201 support

#### Test Pattern
Print a XYZ cube or acceleration test tower with varying acceleration values:

```gcode
; XY Acceleration Test Pattern
; Values to test: 500, 800, 1000, 1500, 2000, 2500, 3000, 4000 mm/s²
```

#### Evaluation Criteria

```
GOOD XY ACCELERATION:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Flat surfaces
│ ███████████████████████████████│ ← No visible ringing
│ ███████████████████████████████│ ← Sharp corners
│ ███████████████████████████████│ ← Consistent dimensions
└────────────────────────────────┘

ACCELERATION TOO HIGH:
┌────────────────────────────────┐
│ ▒▒▒▒▒░░░░▒▒▒▒▒▒▒▒▒░░░░▒▒▒▒▒▒▒ │ ← Ringing/ripples
│ ███████████████████████████████░│ ← Ghosting
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │ ← Layer shifting possible
│ ██████████████████████████████░░│ ← Blurred details
└────────────────────────────────┘

ACCELERATION TOO LOW:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Clean but
│ ███████████████████████████████│ ← Print time excessive
│ ███████████████████████████████│ ← Not utilizing printer
│ ███████████████████████████████│ ← May see retraction blobs
└────────────────────────────────┘
```

#### Test G-Code Generation

```python
# Test range: 500-4000 mm/s²
# Increment: 500 mm/s²
# Print speed: 60-80 mm/s for testing
```

### Z Acceleration Test

#### Test Method
1. Print a multi-layer test (20+ layers)
2. Use fast travel moves between perimeters
3. Check for:
   - Vertical banding
   - Layer inconsistencies
   - Z-wobble (if leadscrew issues)

```gcode
; Z Acceleration Test
; Test values: 50, 100, 150, 200, 300, 400, 500 mm/s²
```

#### Evaluation

```
GOOD Z ACCELERATION:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Consistent layer lines
│ ███████████████████████████████│ ← No banding
│ ███████████████████████████████│ ← Smooth vertical surfaces
│ ███████████████████████████████│ ← Good layer adhesion
└────────────────────────────────┘

Z ACCELERATION TOO HIGH:
┌────────────────────────────────┐
│ ░░░████████████████████████████│ ← Visible layer lines
│ ███████████████████████████▒▒▒│ ← Inconsistent extrusion
│ █████████████████████████████░░│ ← Rough surface
│ ░░░████████████████████░░░░░░░│ ← Possible skipped steps
└────────────────────────────────┘
```

### E Acceleration Test

#### Test Method
1. Print test with many retractions or direction changes
2. Use materials prone to stringing (PETG, TPU)
3. Check for:
   - Uneven extrusion at direction changes
   - Stringing
   - Blob formation

```gcode
; E Acceleration Test
; Test values: 300, 500, 800, 1000, 1500, 2000, 2500, 3000 mm/s²
```

#### Evaluation

```
GOOD E ACCELERATION:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Even extrusion
│ ███████████████████████████████│ ← No blobs at direction changes
│ ███████████████████████████████│ ← Clean retractions
│ ███████████████████████████████│ ← Consistent walls
└────────────────────────────────┘

E ACCELERATION TOO LOW:
┌────────────────────────────────┐
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓ │ ← Under-extrusion during accel
│ ███████████████████████████████░│ ← Stringing
│ ██████████████████████████████░░│ ← Uneven extrusion
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Slow pressure buildup
└────────────────────────────────┘

E ACCELERATION TOO HIGH:
┌────────────────────────────────┐
│ ████░░░░░░░░░░░░░░░░██████████ │ ← Over-extrusion bursts
│ ████████████████████████████░░░│ ← Blobs at direction changes
│ ░░░████████████████████████████ │ ← Uneven walls
│ ███████████░░░░███████████████ │ ← Inconsistent flow
└────────────────────────────────┘
```

## G-Code Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `M201 X## Y## Z## E##` | Set max acceleration | `M201 X2000 Y2000 Z300 E1500` |
| `M204 P##` | Set print acceleration | `M204 P1500` |
| `M204 R##` | Set retract acceleration | `M204 R3000` |
| `M204 T##` | Set travel acceleration | `M204 T3000` |
| `M503` | Display current settings | `M503` |
| `M500` | Save to EEPROM | `M500` |
| `M501` | Load from EEPROM | `M501` |

### Slicer-Specific Commands

#### PrusaSlicer / SuperSlicer
```
; In Printer Settings > General:
Max acceleration X: 2000
Max acceleration Y: 2000
Max acceleration Z: 300
Max acceleration E: 1500
Max acceleration M: 2000 (travel)
```

#### Cura
```
; In Machine Settings:
Max acceleration X: 2000
Max acceleration Y: 2000
Max acceleration Z: 300
Max acceleration E: 1500
```

#### OrcaSlicer
```
; In Machine Settings:
Max acceleration X: 2000
Max acceleration Y: 2000
Max acceleration Z: 300
Max acceleration E: 1500
```

## Optimal Values Per Material

### PLA

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 1500-2500 mm/s² | Good balance of speed/quality |
| Z Acceleration | 150-300 mm/s² | Depends on leadscrew quality |
| E Acceleration | 1500-2500 mm/s² | Direct drive baseline |
| Jerk | 8-15 mm/s | Low jerk reduces ringing |

### PETG

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 800-1500 mm/s² | Lower due to viscosity |
| Z Acceleration | 100-200 mm/s² | Slower for better layer adhesion |
| E Acceleration | 1000-1800 mm/s² | Requires slower pressure buildup |
| Jerk | 5-10 mm/s | Lower jerk helps with stringing |

### ABS / ASA

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 500-1200 mm/s² | Lower to reduce warping |
| Z Acceleration | 100-200 mm/s² | Stable layers important |
| E Acceleration | 800-1500 mm/s² | Moderate for consistent flow |
| Jerk | 5-8 mm/s | Low jerk reduces warping stress |

### TPU (Soft)

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 200-600 mm/s² | Very gentle handling |
| Z Acceleration | 50-100 mm/s² | Slow for flexible material |
| E Acceleration | 300-600 mm/s² | Low to prevent skipping |
| Jerk | 2-5 mm/s | Minimal jerk for flexible filament |

### TPU (Firm)

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 500-1000 mm/s² | Moderate acceleration |
| Z Acceleration | 100-200 mm/s² | Standard Z settings |
| E Acceleration | 600-1200 mm/s² | Better response than soft |
| Jerk | 4-8 mm/s | Medium jerk acceptable |

### Nylon

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 500-1200 mm/s² | Similar to ABS |
| Z Acceleration | 100-200 mm/s² | Stable layers critical |
| E Acceleration | 800-1500 mm/s² | High viscosity requires care |
| Jerk | 5-8 mm/s | Lower jerk helps with stringing |

### PC (Polycarbonate)

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 400-1000 mm/s² | Rigid but prone to issues |
| Z Acceleration | 100-200 mm/s² | Stable for high temp |
| E Acceleration | 600-1200 mm/s² | High viscosity |
| Jerk | 5-8 mm/s | Moderate jerk |

### Carbon Fiber PLA

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 800-1800 mm/s² | Slightly stiffer than regular PLA |
| Z Acceleration | 100-250 mm/s² | Standard with quality leadscrew |
| E Acceleration | 1000-2000 mm/s² | Similar to regular PLA |
| Jerk | 6-12 mm/s | Similar to PLA |

### Wood PLA

| Setting | Value | Notes |
|---------|-------|-------|
| XY Acceleration | 800-1800 mm/s² | Filled material, slightly stiffer |
| Z Acceleration | 100-250 mm/s² | Standard |
| E Acceleration | 1000-2000 mm/s² | Similar to regular PLA |
| Jerk | 6-12 mm/s | Similar to PLA |

## Troubleshooting

### Ringing / Ghosting

```
Symptoms: Wavy patterns on flat surfaces, especially near corners

Possible Causes:
├─ XY acceleration too high
├─ Jerk setting too high
├─ Insufficient motor current
├─ Loose belts or pulleys
└─ Frame resonance

Solutions:
├─ Reduce XY acceleration by 25-50%
├─ Lower jerk setting (try half current value)
├─ Check belt tension
├─ Verify pulleys are secured
└─ Consider adding dampers
```

### Layer Shifting

```
Symptoms: Layers offset horizontally, stair-step effect

Possible Causes:
├─ XY acceleration too high for stepper motors
├─ Insufficient stepper current
├─ Loose belts
├─ Thin/weak stepper drivers
├─ Power supply issues under load

Solutions:
├─ Reduce XY acceleration by 30-50%
├─ Increase stepper current (within safe limits)
├─ Tighten belts
├─ Check for skipped steps with M119
├─ Verify power supply can handle peak currents
└─ Reduce print speed alongside acceleration
```

### Inconsistent Extrusion

```
Symptoms: Varying line width, gaps in walls, blobs

Possible Causes:
├─ E acceleration mismatched to extruder
├─ Filament slipping in extruder
├─ Extruder gear wear
├─ Inconsistent hotend pressure

Solutions:
├─ Adjust E acceleration up or down
├─ Check extruder gear condition
├─ Increase extruder temperature slightly
├─ Verify extruder steps are calibrated
└─ Consider Linear Advance (M900)
```

### Stringing

```
Symptoms: Fine strands between print features

Possible Causes:
├─ E acceleration too low (slow pressure response)
├─ Retraction settings conflicting
├─ Temperature too high
├─ E acceleration too high (overshoot)

Solutions:
├─ For slow stringing: INCREASE E acceleration
├─ For blobbing stringing: DECREASE E acceleration
├─ Balance with temperature tuning
├─ Check retraction length and speed
└─ Test Linear Advance K-factor
```

### Poor Surface Finish

```
Symptoms: Rough top surfaces, visible layer lines

Possible Causes:
├─ XY acceleration too high for quality
├─ Z acceleration affecting layer consistency
├─ Print speed too variable
├─ Inconsistent extrusion

Solutions:
├─ Reduce XY acceleration for top surfaces
├─ Verify Z acceleration is stable
├─ Use variable layer height for details
├─ Reduce jerk for smoother deceleration
└─ Enable "coasting" in slicer
```

## Tuning Workflow

### Step 1: Start Conservative
```gcode
; Safe starting point for most printers
M201 X1000 Y1000 Z200 E1000
M204 P1000 R2000 T2000
```

### Step 2: Test XY Acceleration
1. Print XY test at 500, 1000, 1500, 2000 mm/s²
2. Evaluate ringing and ghosting
3. Find highest acceleration with acceptable quality

### Step 3: Tune Z Acceleration
1. Test with rapid Z movements
2. Check for skipped steps or noise
3. Increase to max stable value

### Step 4: Optimize E Acceleration
1. Test with material prone to stringing
2. Adjust for clean retractions
3. Balance with print speed

### Step 5: Fine-Tune Jerk
```gcode
; Jerk is acceleration threshold, not max acceleration
M205 X8 Y8 Z0.2 E5 ; Lower values = smoother deceleration
```

### Step 6: Save and Document
```gcode
M500 ; Save to EEPROM
```

## Slicer Integration Examples

### PrusaSlicer - Filament-Specific

```
; Filament Custom G-code:
M201 X{acceleration_x} Y{acceleration_y} E{acceleration_e}
M204 P{print_acceleration}
```

### Cura - Material Custom

```
; In Material > Custom:
SET_ACCELERATION X={acceleration_x}
SET_ACCELERATION Y={acceleration_y}
SET_ACCELERATION E={acceleration_e}
```

### OrcaSlicer - Per-Filament

```
; Add to Filament Start G-code:
M201 X1500 Y1500 Z200 E1200
M204 P1200
```

## Related Settings

### Jerk vs Acceleration

| Aspect | Jerk | Acceleration |
|--------|------|--------------|
| What it controls | Velocity change rate | Speed change over time |
| Impact | Sudden direction changes | Overall speed buildup |
| Visible effect | Corner quality | Surface ringing |
| Typical values | 5-20 mm/s | 500-3000 mm/s² |

### Travel vs Print Acceleration

| Setting | Purpose | Recommended Ratio |
|---------|---------|-------------------|
| Print (P) | During extrusion | 1x baseline |
| Travel (T) | Non-extrusion moves | 1.5-2x print |
| Retract (R) | Retraction moves | 2-3x print |

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                    ACCELERATION QUICK START                    │
├─────────────────────┬──────────────────────────────────────────┤
│ Printer Type        │ XY Accel (mm/s²)                         │
├─────────────────────┼──────────────────────────────────────────┤
│ Budget Ender        │ 500-1000                                 │
│ Mid-Range           │ 1000-2000                                │
│ High-Speed/CoreXY   │ 2000-4000                                 │
│ Voron/DIY           │ 2000-3000                                 │
├─────────────────────┼──────────────────────────────────────────┤
│ Material            │ XY Accel (mm/s²)                         │
├─────────────────────┼──────────────────────────────────────────┤
│ PLA                 │ 1500-3000                                 │
│ PETG                │ 800-2000                                  │
│ ABS/ASA             │ 500-1500                                  │
│ TPU Soft            │ 200-800                                   │
│ TPU Firm            │ 400-1200                                  │
│ Nylon               │ 500-1500                                  │
│ PC                  │ 400-1200                                  │
├─────────────────────┼──────────────────────────────────────────┤
│ Axis                │ Recommended (mm/s²)                      │
├─────────────────────┼──────────────────────────────────────────┤
│ Z Leadscrew         │ 100-300                                   │
│ Z Trapezoidal       │ 150-400                                   │
│ E Direct Drive      │ 1000-3000                                 │
│ E Bowden            │ 500-1500                                  │
└─────────────────────┴──────────────────────────────────────────┘
```

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
