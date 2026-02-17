# Bed Leveling Wizard

## Overview

Bed leveling is the process of ensuring your print bed is perfectly parallel to the nozzle's movement plane. Proper bed leveling is fundamental to achieving good first-layer adhesion and consistent print quality across the entire bed.

## Types of Bed Leveling

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BED LEVELING METHODS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MANUAL              →  Spring-loaded knobs + paper test               │
│  AUTO (BLTouch)      →  Probe measures distance to bed                 │
│  CR Touch            →  Creality's version of bed probing              │
│  INDuctive Sensor    →  Detects metal bed (fixed offset)              │
│  CAPACitive Sensor   →  Detects any surface (needs calibration)       │
│  MESH Leveling       →  Creates height map of uneven beds              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Manual Bed Leveling (Traditional)

### Tools Needed

- Paper (copy paper, ~80-100gsm)
- Or feeler gauge (0.1mm-0.5mm)
- Phillips screwdriver

### Step-by-Step Process

```
STEP 1: PREPARATION
┌─────────────────────────────────────────┐
│ 1. Heat bed to printing temperature     │
│    (PLA: 60°C, PETG: 70°C, ABS: 90°C)   │
│ 2. Home all axes (G28)                   │
│ 3. Disable steppers (M18) for manual    │
│ 4. Position at first corner              │
└─────────────────────────────────────────┘

STEP 2: FIND NOZZLE HEIGHT
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────────────────────┐              │
│    │         ░░          │ ← Paper      │
│    │    ════════════      │ ← Nozzle     │
│    │         ███         │ ← Bed        │
│    └─────────────────────┘              │
│                                         │
│  Drag paper back and forth              │
│  Should feel slight drag                │
│  Too tight = too close                  │
│  Too loose = too far                    │
│                                         │
└─────────────────────────────────────────┘

STEP 3: ADJUST CORNERS
┌─────────────────────────────────────────┐
│                                         │
│   Corner 1   →   Adjust →   Test        │
│       ↓                               │
│   Corner 2   →   Adjust →   Test        │
│       ↓                               │
│   Corner 3   →   Adjust →   Test        │
│       ↓                               │
│   Corner 4   →   Adjust →   Test        │
│                                         │
│  Repeat until all corners are level    │
│                                         │
└─────────────────────────────────────────┘

STEP 4: CHECK CENTER
┌─────────────────────────────────────────┐
│  Verify center is also at correct       │
│  height - beds can be warped            │
│                                         │
│      ┌───────────────┐                  │
│      │   ○  CENTER   │                  │
│      │  ○   ○   ○    │                  │
│      │ ○   ○   ○  ○  │                  │
│      └───────────────┘                  │
│                                         │
└─────────────────────────────────────────┘
```

### Paper Test Reference

| Paper Thickness | Feel | Adjustment |
|-----------------|------|------------|
| 0.1mm | Very light drag | Move nozzle closer |
| 0.2mm | Light drag | Reference point |
| 0.3mm | Medium drag | Move nozzle away |
| 0.5mm | Heavy drag | Too far |

## Automatic Bed Leveling (ABL)

### BLTouch Setup

#### Wiring Diagram

```
BLTouch Connector:
┌────────────────────────────┐
│  White  →  Signal (Zmin)   │
│  Black  →  GND             │
│  Red    →  +5V             │
│  Orange →  PWM (control)   │
│  Brown  →  GND (optional)  │
└────────────────────────────┘

Connect to board's Z-min probe header
```

#### Marlin Configuration

```cpp
// Enable BLTouch
#define BLTOUCH

// Set probe deployment mode
#define BLTOUCH_DEPLOY_MS 200
#define BLTOUCH_STOW_MS 200

// Use 5V mode (for 5V boards)
#define BLTOUCH_5V_MODE

// Define probe pin
#define Z_MIN_PROBE_PIN 19

// Enable bed leveling
#define AUTO_BED_LEVELING_3POINT
// Or for mesh:
#define MESH_BED_LEVELING
```

#### Klipper Configuration

```ini
[bltouch]
sensor_pin: ^P1.24
control_pin: P1.22
pin_move_time: 0.675
stow_on_each_sample: true
probe_with_touch_mode: false
 Thur_mode: false

[safe_z_home]
home_xy_position: 100, 100  # Adjust to your probe location
z_homing: move_to_bottom
```

### BLTouch Commands

| Command | Description |
|---------|-------------|
| `M119` | Check endstop status |
| `G28` | Home all axes |
| `G29` | Run auto bed leveling (Marlin) |
| `BED_MESH_CALIBRATE` | Run mesh leveling (Klipper) |
| `M420 S1` | Enable bed leveling (Marlin) |
| `BED_MESH_OUTPUT P=1` | Show mesh profile (Klipper) |

## Mesh Leveling

### When to Use Mesh Leveling

```
USE MESH LEVELING WHEN:
┌─────────────────────────────────────────────────────┐
│ □ Bed is not perfectly flat (warped)               │
│ □ Using thick glass bed                             │
│ □ PEI sheet has slight variations                 │
│ □ Printing on various surfaces                     │
│ □ First layer varies across bed                    │
│                                                     │
│ SKIP MESH IF:                                       │
│ □ Bed is already perfectly flat                    │
│ □ Using high-quality machined bed                  │
│ □ Only printing in small area                       │
└─────────────────────────────────────────────────────┘
```

### Klipper Mesh Calibration

```ini
[bed_mesh]
speed: 120
horizontal_move_z: 5
mesh_min: 10, 10
mesh_max: 190, 190
probe_count: 5,5  # 5x5 grid = 25 points
mesh_pps: 2,2
algorithm: lagrange
fade_start: 1.0
fade_end: 10.0
```

### Marlin Mesh Configuration

```cpp
#define MESH_BED_LEVELING
#define MESH_MIN_X 10
#define MESH_MAX_X 190
#define MESH_MIN_Y 10
#define MESH_MAX_Y 190
#define MESH_PROBE_Z_RANGE 4
#define Z_AFTER_PROBING 2
#define GRID_MAX_POINTS_X 5
#define GRID_MAX_POINTS_Y 5
```

### Interpreting Mesh Results

```
EXAMPLE MESH HEIGHT MAP (values in mm):
┌─────────────────────────────────────────────────────┐
│     +0.15   +0.12   +0.08   +0.10   +0.18          │
│     +0.10   +0.05   +0.02   +0.04   +0.12          │
│     +0.08   +0.02   0.00   +0.02   +0.08          │
│     +0.10   +0.04   +0.02   +0.05   +0.10          │
│     +0.14   +0.10   +0.06   +0.08   +0.14          │
└─────────────────────────────────────────────────────┘
              (0.00 = reference point)

Interpretation:
- Center is lowest (0.00)
- Corners are higher (up to +0.18mm)
- Mesh compensation will raise nozzle at corners
```

### Visualizing Mesh (Klipper)

```bash
# Display current mesh
BED_MESH_OUTPUT

# Show mesh with visual representation
BED_MESH_PROFILE SAVE=default
```

## Bed Leveling Troubleshooting

### Problem: First Layer Not Sticking

```
DIAGNOSIS:
┌────────────────────────────────────────┐
│                                        │
│  □ Nozzle too far from bed             │
│  □ Bed not level (corners vs center)   │
│  □ Z-offset incorrect                  │
│  □ Temperature too low                 │
│  □ Bed surface dirty                   │
│                                        │
│ SOLUTIONS:                              │
│ 1. Run G29/BED_MESH_CALIBRATE         │
│ 2. Adjust Z-offset                     │
│ 3. Clean bed with IPA (70%)            │
│ 4. Increase bed temperature           │
│                                        │
└────────────────────────────────────────┘
```

### Problem: Nozzle Crashes Into Bed

```
CAUSES:
┌────────────────────────────────────────┐
│ ├─ Probe not triggering                │
│ ├─ Z-endstop wrong position           │
│ ├─ Probe offset incorrect              │
│ └─ Z-min set to wrong pin              │
│                                        │
│ FIXES:                                 │
│ 1. Check M119 for probe status        │
│ 2. Verify probe wiring                 │
│ 3. Add Z_SAFE_HOMING in Marlin        │
│ 4. Check probe offset (M851)           │
└────────────────────────────────────────┘
```

### Problem: Inconsistent First Layer

```
POSSIBLE CAUSES:
┌────────────────────────────────────────┐
│ ├─ Warped bed not corrected            │
│ ├─ Mesh resolution too low             │
│ ├─ Temperature fluctuations           │
│ ├─ Drafts affecting cooling           │
│ └─ Z-wobble from lead screw           │
│                                        │
│ SOLUTIONS:                             │
│ 1. Use finer mesh (7x7 or 10x10)      │
│ 2. Add enclosure or draft shield       │
│ 3. Check lead screw for wobble        │
│ 4. Use thermal compensation            │
└────────────────────────────────────────┘
```

## Z-Offset Tuning

### Finding Correct Z-Offset

```
METHOD 1: PAPER TEST
┌─────────────────────────────────────────┐
│ 1. Home (G28)                          │
│ 2. Move to center (G1 X100 Y100)       │
│ 3. Lower nozzle slowly:                │
│    G1 Z0                                │
│    G1 Z-0.1                             │
│    G1 Z-0.2                             │
│    ... until paper drags               │
│ 4. Note the Z value                     │
│ 5. Adjust Z-offset to that position    │
└─────────────────────────────────────────┘

METHOD 2: BABYSTEPPING (Live)
┌─────────────────────────────────────────┐
│ 1. Print first layer                    │
│ 2. If too far: move nozzle down         │
│    M290 Z-0.05 (Marlin)                │
│    BABYSTEP_Z -0.05 (Klipper)          │
│ 3. If too close: move nozzle up         │
│    M290 Z0.05                          │
│    BABYSTEP_Z 0.05                     │
│ 4. Save when perfect                    │
└─────────────────────────────────────────┘
```

### Setting Z-Offset

**Marlin:**
```gcode
; Set Z-offset
M851 Z-1.2

; Save to EEPROM
M500

; Verify
M503
```

**Klipper:**
```ini
[probe]
z_offset: 1.2
```

```gcode
; Or adjust live
SET_PROBE_Z_OFFSET Z_OFFSET=1.2
SAVE_CONFIG
```

## Calibration Checklist

```
BEFORE PRINTING - VERIFY:
┌────────────────────────────────────────────────────────┐
│ □ Bed cleaned with IPA                                │
│ □ Bed heated to printing temperature                   │
│ □ Probe cleaned (if using ABL)                        │
│ □ Leveling run (G29/BED_MESH_CALIBRATE)              │
│ □ Z-offset verified                                    │
│ □ First layer test printed                            │
│ □ Temperature verified                                 │
└────────────────────────────────────────────────────────┘
```

## Firmware Settings Reference

### Marlin Bed Leveling G-Codes

| Code | Description |
|------|-------------|
| `G28` | Home all axes |
| `G29` | Auto bed leveling (3-point or linear) |
| `G29 P1` | Auto bed leveling (bi-linear) start |
| `G29 P2` | Auto bed leveling continue |
| `G29 P3` | Auto bed leveling done |
| `G29 P4` | Auto fine tune |
| `G29 P5` | Auto leveling fade |
| `G29 V` | Verbose leveling info |
| `M420 S1` | Enable bed leveling from EEPROM |
| `M420 V` | Show current mesh |
| `M851` | Set Z-probe offset |
| `M500` | Save to EEPROM |
| `M502` | Reset to defaults |

### Klipper Bed Leveling Commands

| Command | Description |
|---------|-------------|
| `PROBE` | Single probe |
| `PROBE_ACCURACY` | Test probe consistency |
| `BED_MESH_CALIBRATE` | Run full mesh calibration |
| `BED_MESH_OUTPUT` | Display mesh results |
| `BED_MESH_PROFILE` | Save/load mesh profiles |
| `SET_GCODE_OFFSET` | Adjust Z offset |
| `SAVE_CONFIG` | Save configuration |

## Advanced Techniques

### Multi-Bed Mesh

```ini
; Save multiple bed meshes for different setups
[bed_mesh default]
mesh_min: 10, 10
mesh_max: 190, 190

[bed_mesh pei]
mesh_min: 10, 10
mesh_max: 190, 190
```

```gcode
; Switch between meshes
BED_MESH_PROFILE LOAD=default
BED_MESH_PROFILE LOAD=pei
```

### Radial Compensation

For severely warped beds:

```ini
[bed_tilt]
x_adjust: 0.0
y_adjust: 0.0
z_adjust: 0.0  # Points to adjust
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                  BED LEVELING QUICK GUIDE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MANUAL LEVELING:                                           │
│  1. Heat bed to print temp                                 │
│  2. Home (G28), disable steppers (M18)                    │
│  3. Test each corner with paper                            │
│  4. Adjust springs until consistent drag                  │
│                                                             │
│  BLTOUCH/ABL:                                              │
│  1. Clean probe tip                                        │
│  2. G28 to home                                            │
│  3. G29 (Marlin) or BED_MESH_CALIBRATE (Klipper)          │
│  4. M420 S1 to enable (Marlin)                             │
│                                                             │
│  Z-OFFSET:                                                 │
│  1. Print first layer                                      │
│  2. Babystep until perfect                                 │
│  3. M500 (Marlin) or SAVE_CONFIG (Klipper)                │
│                                                             │
│  IF FIRST LAYER FAILS:                                     │
│  □ Clean bed with IPA                                      │
│  □ Verify Z-offset                                         │
│  □ Re-run mesh calibration                                  │
│  □ Check bed temperature                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Related Files

- `first_layer_calibration.py` - First layer tuning tool
- `print_bed_surface_comparison.md` - Bed surface options
- `bed_adhesion_guide.py` - Adhesion troubleshooting

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
