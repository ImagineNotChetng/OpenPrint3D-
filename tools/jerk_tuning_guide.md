# Jerk Tuning Guide

## Overview

Jerk (also called "junction jerk" or "junction deviation") controls the instantaneous change in velocity at corners and direction changes during 3D printing. While acceleration controls how quickly velocity changes over time, jerk controls the *immediate* velocity change at the moment of direction changes.

Understanding and properly tuning jerk is essential for:
- Reducing ringing and ghosting on prints
- Achieving sharper corners
- Minimizing vibration and noise
- Maintaining print quality at higher speeds

## How Jerk Works

```
Without Jerk Control:           With Proper Jerk Control:
┌─────────────────────┐         ┌─────────────────────┐
│    ╱╲              │         │   ╱╲                  │
│   ╱  ╲             │         │  ╱  ╲                 │
│  ╱    ╲            │         │ ╱    ╲                │
│ ╱      ╲           │         │╱      ╲               │
│╱        ╲          │         │        ╲             │
│Direction ───►      │         │Direction ───►       │
│Change: Sudden      │         │Change: Smooth        │
└─────────────────────┘         └─────────────────────┘

Result: Ringing/Ghosting        Result: Clean Corners
```

- **Higher Jerk**: Faster direction changes, sharper corners, more ringing
- **Lower Jerk**: Smoother transitions, less vibration, potentially slower prints
- **Jerk = 0**: Uses pure acceleration-based motion (smoother but slower)

## Marlin vs Klipper Implementation

| Parameter | Marlin | Klipper |
|-----------|--------|---------|
| Setting Name | `JERK` | `square_corner_velocity` |
| Default | 8-10 mm/s | 5 mm/s |
| Units | mm/s | mm/s |
| Per-Axis | Yes | No (combined) |
| Pressure Advance | Separate setting | Integrates with input shaper |

## Direct Drive vs Bowden

| Parameter | Direct Drive | Bowden |
|-----------|-------------|--------|
| Typical Jerk Range | 8-15 mm/s | 5-10 mm/s |
| Response Time | Fast | Delayed |
| Vibration Potential | Lower | Higher |
| Recommended Start | 10 mm/s | 8 mm/s |

The shorter filament path in direct drive systems allows for tighter jerk settings without causing issues, while Bowden setups benefit from lower jerk values to reduce the momentum effects of the longer filament tube.

## Prerequisites

1. **Firmware with Jerk Control Enabled**
   - Marlin: `JERK` setting available in configuration
   - Klipper: `square_corner_velocity` in printer config

2. **Calibrated Steps and Acceleration**
   - Stepper motor steps should be calibrated first
   - Acceleration values should be set before tuning jerk

3. **Stable Power Supply**
   - Undervoltage can cause missed steps when using higher jerk
   - Ensure adequate stepper motor current

## Jerk Reference Charts

### Marlin - Recommended Jerk Values by Printer Type

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MARLIN JERK SETTINGS                                │
├──────────────────────┬──────────────┬──────────────┬────────────────────┤
│ Printer Type         │ X/Y Jerk     │ Z Jerk       │ E Jerk            │
├──────────────────────┼──────────────┼──────────────┼────────────────────┤
│ Ender 3 V2           │ 8-10         │ 0.3-0.5      │ 5-8               │
│ Ender 3 Pro          │ 8-10         │ 0.3-0.5      │ 5-8               │
│ Ender 5 Plus         │ 8-10         │ 0.3-0.5      │ 5-8               │
│ Creality K1          │ 12-15        │ 0.3-0.5      │ 8-10              │
│ Prusa i3 MK3S+       │ 8-10         │ 0.4-0.6      │ 5-8               │
│ Prusa MINI+          │ 10-12        │ 0.4-0.6      │ 5-8               │
│ Anycubic i3 Mega     │ 8-10         │ 0.3-0.5      │ 5-8               │
│ Artillery Genius     │ 10-12        │ 0.3-0.5      │ 5-8               │
│ Custom CoreXY        │ 15-20        │ 0.3-0.5      │ 8-12              │
│ Custom Delta         │ 10-15        │ 0.2-0.3      │ 5-8               │
└──────────────────────┴──────────────┴──────────────┴────────────────────┘
```

### Klipper - Recommended Square Corner Velocity

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KLIPPER SQUARE CORNER VELOCITY                       │
├──────────────────────┬─────────────────────┬───────────────────────────┤
│ Printer Type         │ SCV (mm/s)          │ Notes                     │
├──────────────────────┼─────────────────────┼───────────────────────────┤
│ Ender 3 V2           │ 5-8                │ Start conservative        │
│ Ender 3 Pro          │ 5-8                │ Start conservative        │
│ Ender 5 Plus         │ 5-8                │ Start conservative        │
│ Creality K1          │ 8-12               │ Faster response           │
│ Prusa i3 MK3S+       │ 5-8                │ Well-tuned stock         │
│ Prusa MINI+          │ 6-10               │ Good baseline            │
│ Anycubic i3 Mega     │ 5-8                │ Standard setup           │
│ Artillery Genius     │ 6-10               │ Moderate                 │
│ Custom CoreXY        │ 10-15              │ Higher performance       │
│ Custom Delta         │ 8-12               │ Delta-specific           │
└──────────────────────┴─────────────────────┴───────────────────────────┘
```

### Material-Specific Jerk Recommendations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MATERIAL JERK ADJUSTMENTS                          │
├──────────────────┬─────────────────────┬─────────────────────────────────┤
│ Material         │ Jerk Adjustment    │ Reason                         │
├──────────────────┼─────────────────────┼─────────────────────────────────┤
│ PLA              │ Standard (100%)    │ Low flex, predictable behavior │
│ PLA+             │ Standard (95-100%) │ Slightly higher flex           │
│ PETG             │ Reduce 10-20%      │ More flex, better adhesion     │
│ ABS              │ Reduce 15-25%       │ Shrinkage concerns             │
│ ASA              │ Reduce 15-25%       │ Similar to ABS                 │
│ TPU (soft)       │ Reduce 30-50%      │ High flex, prevents skipping   │
│ TPU (firm)       │ Reduce 20-30%       │ Moderate flex                  │
│ Nylon            │ Reduce 15-25%       │ High flex, moisture sensitive  │
│ PC               │ Reduce 10-20%       │ High temp, some flex           │
│ CF PLA           │ Standard (100%)    │ Carbon adds stiffness          │
│ Wood PLA         │ Standard (95-100%) │ Similar to standard PLA        │
└──────────────────┴─────────────────────┴─────────────────────────────────┘
```

### Combined Printer Type and Material Chart

```
┌─────────────────────────────────────────────────────────────────────────┐
│              QUICK REFERENCE: PRINTER + MATERIAL                       │
├───────────────────────┬─────────────┬─────────────┬───────────────────┤
│ Printer               │ PLA/PETG    │ ABS/ASA     │ TPU               │
├───────────────────────┼─────────────┼─────────────┼───────────────────┤
│ Ender 3 Series       │ 8-10        │ 6-8         │ 4-5               │
│ Creality K1          │ 12-15       │ 10-12       │ 8-10              │
│ Prusa MK3S+          │ 8-10        │ 6-8         │ 5-6               │
│ Prusa MINI+          │ 8-10        │ 6-8         │ 5-6               │
│ Custom CoreXY        │ 15-20       │ 12-15       │ 10-12             │
│ Custom Delta         │ 10-12       │ 8-10        │ 6-8               │
└───────────────────────┴─────────────┴─────────────┴───────────────────┘
```

## Marlin Configuration

### Configuration.h Settings

```cpp
// Minimum tolerated jerk speed (mm/s)
// Lower values = smoother but potentially slower
#define DEFAULT_XJERK 10.0
#define DEFAULT_YJERK 10.0
#define DEFAULT_ZJERK 0.3
#define DEFAULT_EJERK 5.0
```

### G-Code Commands (Marlin)

| Command | Description |
|---------|-------------|
| `M205 X10 Y10 Z0.3 E5` | Set jerk values (X, Y, Z, E) |
| `M205` | Display current jerk settings |
| `M500` | Save to EEPROM |
| `M501` | Load from EEPROM |
| `M502` | Reset to factory defaults |

### Live Tuning (Marlin)

```gcode
; Test different jerk values live
M205 X8 Y8 Z0.3 E5    ; Lower jerk - smoother
M205 X12 Y12 Z0.3 E8  ; Higher jerk - sharper

; Save after finding optimal values
M500
```

## Klipper Configuration

### Printer.cfg Settings

```ini
[printer]
kinematics: corexy
max_velocity: 300
square_corner_velocity: 8

# Individual axis limits (optional, affects jerk)
[stepper_x]
max_accel: 3000

[stepper_y]
max_accel: 3000

[stepper_z]
max_accel: 100
```

### Klipper Commands

| Command | Description |
|---------|-------------|
| `SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=8` | Set SCV live |
| `GET_VELOCITY_LIMIT` | Display current limits |
| `SAVE_CONFIG` | Save configuration |

### Live Tuning (Klipper)

```gcode
; Test different jerk values live
SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=5    ; Lower - smoother
SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=12  ; Higher - sharper

; Save after finding optimal
SAVE_CONFIG
```

## Calibration Procedure

### Step 1: Prepare Printer

```
1. Ensure all mechanical components are secure
2. Check belt tension (should be firm but not excessive)
3. Verify stepper motor currents are correct
4. Warm up printer to operating temperature
5. Load test filament (PLA recommended for first test)
```

### Step 2: Print Test Object

Use a test object designed for jerk calibration:
- **Ringing test cube**: Check for ringing on sides
- **Corner test**: Check for corner quality
- **Speed tower**: Test at various speeds

### Step 3: Evaluate Results

```
GOOD JERK:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Clean vertical lines
│ ███████████████████████████████│ ← No visible ringing
│ ███████████████████████████████│ ← Sharp corners
└────────────────────────────────┘

JERK TOO HIGH:
┌────────────────────────────────┐
│ ░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓ │ ← Visible ringing/ghosting
│ ░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓ │
│ ░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓░▓▓ │
└────────────────────────────────┘

JERK TOO LOW:
┌────────────────────────────────┐
│ ███████████████████████████████│ ← Clean but...
│ ███████████████████████████████│ ← May appear slightly
│ ███████████████████████████████│ ← "rounded" at corners
└────────────────────────────────┘
```

### Step 4: Adjust and Retest

1. If ringing visible: Reduce jerk by 2-3 mm/s
2. If corners appear rounded: Increase jerk by 1-2 mm/s
3. Repeat until optimal balance found

### Step 5: Save Settings

**Marlin:**
```gcode
M205 X[optimal] Y[optimal] Z0.3 E5
M500
```

**Klipper:**
```ini
[printer]
square_corner_velocity: [optimal]
```
```bash
SAVE_CONFIG
```

## Troubleshooting

### Ringing/Ghosting Persists After Jerk Adjustment

```
Possible Causes:
├─ Acceleration too high
├─ Belt tension issues
├─ Insufficient frame rigidity
└─ Speed too high for system

Solutions:
├─ Reduce acceleration (try 1000-1500 mm/s²)
├─ Check and adjust belt tension
├─ Add vibration dampening
├─ Reduce print speed
├─ Consider input shaper (Klipper)
```

### Corners Appear Rounded Despite High Jerk

```
Possible Causes:
├─ Jerk still too low for the speed
├─ Acceleration limiting corner speed
├─ Mechanical binding in axis
└─ Insufficient motor torque

Solutions:
├─ Increase jerk in small increments
├─ Increase acceleration (if not causing issues)
├─ Check axes for smooth movement
├─ Verify stepper current is adequate
```

### Different Optimal Jerk for Different Print Speeds

```
This is expected behavior. Higher speeds benefit from
different jerk settings than lower speeds.

Solutions:
├─ Tune at your typical print speed
├─ Use slicer to adjust per-profile
├─ Consider Klipper input shaper for comprehensive solution
└─ Find a middle-ground that works for most speeds
```

### Motors Stalling at High Jerk Values

```
Possible Causes:
├─ Jerk too high for motor capability
├─ Insufficient stepper current
├─ Power supply limiting
└─ Mechanical binding

Solutions:
├─ Reduce jerk values immediately
├─ Increase stepper current (within limits)
├─ Check power supply voltage under load
├─ Verify axes move freely
```

### No Noticeable Difference When Changing Jerk

```
Possible Causes:
├─ Acceleration is limiting factor
├─ Jerk values already optimized
├─ Test object not suitable for jerk evaluation
└─ Print speed too low

Solutions:
├─ Print at higher speeds (60+ mm/s)
├─ Use proper test object (corner/ringing test)
├─ Try more aggressive jerk changes
└─ Check acceleration settings first
```

## Input Shaper (Klipper)

Klipper offers advanced vibration control through input shaping, which works alongside jerk settings:

```ini
[input_shaper]
shaper_freq: 40  # Hz - adjust based on resonance testing
shaper_type: ei

# Or for multiple resonance frequencies:
[input_shaper]
shaper_type: mzv
shaper_freq: 50
```

Input shaper can reduce the need for low jerk values by actively dampening vibrations.

## Slicer Integration

### PrusaSlicer / SuperSlicer

```
; In Printer Settings > Custom G-code > Start G-code:
; Marlin
M205 X10 Y10 Z0.3 E5

; Or Klipper (via virtual SD card or startup script)
SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=8
```

### Cura

```
; In Machine Settings > Start G-code:
; Marlin
M205 X10 Y10 Z0.3 E5

; Note: Cura doesn't directly support Klipper commands
; Use Klipper's moonraker for Cura integration
```

### Simplify3D

```
; In Process > Scripts > Starting Script:
; Marlin
M205 X10 Y10 Z0.3 E5
```

## Advanced Tips

### Finding Your Printer's Jerk Limit

```
1. Start with conservative values (5-6 mm/s)
2. Print a speed/jerk test tower
3. Gradually increase jerk until:
   - Ringing appears, OR
   - Motors stall/click, OR
   - Print quality degrades
4. Back off 10-15% from the limit
```

### Balancing Jerk with Other Settings

```
Jerk and acceleration work together:
- High jerk + high acceleration = aggressive
- Low jerk + high acceleration = smooth
- High jerk + low acceleration = limited benefit
- Low jerk + low acceleration = very smooth but slow

Optimal balance depends on:
- Frame rigidity
- Motor quality
- Belt tension
- Print speed requirements
```

### Jerk and Pressure Advance

When using pressure advance (Klipper) or Linear Advance (Marlin):

```
High jerk can cause:
- More pressure fluctuations
- Reduced effectiveness of pressure advance
- Increased stringing

Recommendations:
- Lower jerk when using pressure advance
- Re-tune pressure advance after changing jerk
- Find balance between corner quality and extrusion
```

## Quick Reference Cards

### Marlin Quick Start

```
┌────────────────────────────────────────────────────┐
│ MARLIN JERK QUICK START                             │
├────────────────────────────────────────────────────┤
│ 1. Test current: M205                             │
│ 2. Try: M205 X8 Y8 Z0.3 E5 (conservative)         │
│ 3. Or: M205 X12 Y12 Z0.3 E8 (aggressive)          │
│ 4. Save: M500                                     │
│ 5. Verify: M503                                   │
└────────────────────────────────────────────────────┘
```

### Klipper Quick Start

```
┌────────────────────────────────────────────────────┐
│ KLIPPER SQUARE CORNER VELOCITY QUICK START         │
├────────────────────────────────────────────────────┤
│ 1. Check: GET_VELOCITY_LIMIT                       │
│ 2. Try: SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=5│
│ 3. Or: SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=10│
│ 4. Save: SAVE_CONFIG                              │
└────────────────────────────────────────────────────┘
```

## Related Files

- `vibration_compensation_guide.md` - For advanced vibration control
- `linear_advance_calibration_guide.md` - For extrusion tuning

## References

- [Marlin Jerk Documentation](https://marlinfw.org/docs/configuration/configuration.html#jerk)
- [Klipper Kinematics](https://www.klipper3d.org/Kinematics.html)
- [Klipper Input Shaper](https://www.klipper3d.org/Input_shaping.html)

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
