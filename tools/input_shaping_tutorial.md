# Input Shaping Tutorial

## Overview

Input shaping is an advanced vibration control technique used in 3D printing to reduce ringing, ghosting, and resonance artifacts. Originally developed for aerospace applications, Klipper implements input shaping to smooth stepper motor movements and eliminate vibrations that cause quality issues.

## Why Input Shaping Matters

### The Problem: Resonances

```
WITHOUT INPUT SHAPING:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Stepper: ════════╗     ════════╗     ════════╗             │
│            Motion ──►     ──►     ──►                        │
│                                                                │
│  Bed/X-Axis Response:                                         │
│  ┌──────────────────────────────────────┐                    │
│  │        /\        /\        /\        │  ← Ringing        │
│  │      ╱  ╲      ╱  ╲      ╱  ╲      ╱  ╲                   │
│  │─────╲    ╲────╱    ╲────╱    ╲────╱    ╲──►               │
│  │      ╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱                      │
│  │       ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱                       │
│  └──────────────────────────────────────┘                    │
│                                                                │
│  Result: Ringing/ghosting visible on printed parts           │
│                                                                │
└────────────────────────────────────────────────────────────────┘

WITH INPUT SHAPING:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Stepper: ══════╔═══╗     ══╔═══╗     ══╔═══╗                │
│            Motion ──►     ──►     ──►                        │
│                                                                │
│  Bed/X-Axis Response:                                         │
│  ┌──────────────────────────────────────┐                    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← Minimal
│  │═══════════════════════════════════════│                    │
│  └──────────────────────────────────────┘                    │
│                                                                │
│  Result: Clean surfaces, no ringing                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### What Input Shaping Fixes

```
INPUT SHAPING SOLVES:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  □ Ringing/ghosting on flat surfaces                         │
│  □ Vibration marks at print corners                          │
│  □ Low-quality prints at high speeds                         │
│  □ Resonance issues on certain frequencies                  │
│  □ Inconsistent quality across print area                    │
│  □ Noise from printer frame vibrations                       │
│                                                                │
│  IMPROVES:                                                    │
│  □ Surface finish                                            │
│  □ Dimensional accuracy                                      │
│  □ Maximum usable print speed                                │
│  □ Print quality at high speeds                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## How Input Shaping Works

### The Algorithm

```
INPUT SHAPING PROCESS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. INPUT SIGNAL:                                              │
│     ──────────────────────►                                    │
│                                                                 │
│  2. SHAPING FILTER:                                            │
│     ────╔═══════╗──────╔═══════╗──────►                        │
│        ║ Shaped ║      ║ Shaped ║                             │
│        ║ Pulse  ║      ║ Pulse  ║                             │
│        ╚═══════╝      ╚═══════╝                              │
│                                                                 │
│  3. APPLIED TO STEPPER:                                        │
│     Instead of instant velocity change, uses                  │
│     multiple smaller movements to prevent ringing             │
│                                                                 │
│  SHAPING PULSE PATTERN (EI shaper):                           │
│                                                                 │
│     Time ─►                                                    │
│        │     █                                                   │
│        │    █ █                                                 │
│        │   █ █ █                                                │
│        │  █   █                                                │
│        │ █     █                                               │
│        ▼        ▼                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Types of Input Shapers

```
SHAPER TYPES:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  EI (Exponential Input):                                       │
│  ├─ Best overall performance                                   │
│  ├─ Good at multiple frequencies                               │
│  ├─ Recommended for most printers                            │
│  └─ Typical settling time: ~1.5 periods                       │
│                                                                 │
│  MZV (Minimal Zero Vibration):                                 │
│  ├─ Best vibration reduction                                  │
│  ├─ Slightly slower settling                                  │
│  ├─ Good for high-speed printing                              │
│  └─ Recommended for CoreXY printers                           │
│                                                                 │
│  ZV (Zero Vibration):                                          │
│  ├─ Simplest implementation                                   │
│  ├─ Good for single frequency                                  │
│  └─ Less flexible                                             │
│                                                                 │
│  2HUMP EI:                                                     │
│  ├─ Extended frequency range                                  │
│  ├─ Slightly more aggressive smoothing                        │
│  └─ Use when multiple resonances exist                        │
│                                                                 │
│  ZHIHUI:                                                       │
│  ├─ Chinese term for wisdom                                   │
│  ├─ Similar to 2HUMP EI                                       │
│  └─ Alternative name                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Finding Your Resonant Frequencies

### Step 1: Identify Resonances

```bash
# In Klipper shell or Octoprint terminal:

# 1. Measure X axis resonances
RESONANCE_TEST AXIS=X

# 2. Measure Y axis resonances  
RESONANCE_TEST AXIS=Y
```

This command:
- Moves the axis at varying frequencies
- Measures acceleration via accelerometer
- Generates graphs showing resonance peaks

### Step 2: Analyze the Graph

```
EXAMPLE RESONANCE GRAPH:
┌─────────────────────────────────────────────────────────────────┐
│  Acceleration                                                  │
│     │                                                          │
│ 100 │    ██                                                    │
│     │  █  █                                                    │
│  80 │ █    █                  ██                              │
│     │█      █                █  █                             │
│  60 │        █      ██      █    █             ██            │
│     │         █    █  █    █      █           █  █           │
│  40 │          █  █    █  █        █         █    █         │
│     │           ██      ██          █       █      █         │
│  20 │                                        ██      ██       │
│     │                                                          │
│   0 └────────────────────────────────────────────────────────  │
│      0    20   40   60   80   100  120  140  160  180  200    │
│                      Frequency (Hz)                            │
│                                                                 │
│  Peaks at: ~35Hz, ~90Hz                                       │
│  Use shaper_freq below lowest peak                             │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Determine Optimal Shaper Frequency

```
GUIDELINES:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Rule 1: Shaper frequency should be below BOTH X and Y        │
│          resonance peaks                                       │
│                                                                 │
│  Rule 2: Choose frequency that gives best balance:            │
│                                                                 │
│    Higher shaper freq:                                        │
│    ├─ Faster settling                                         │
│    ├─ Less smoothing at corners                               │
│    └─ Better for detailed prints                              │
│                                                                 │
│    Lower shaper_freq:                                          │
│    ├─ More smoothing                                          │
│    ├─ Better vibration reduction                              │
│    └─ Better for high-speed prints                            │
│                                                                 │
│  Rule 3: Default starting point: 40-50 Hz for most printers   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Configuring Input Shaping

### Basic Klipper Configuration

```ini
# Add to printer.cfg

[input_shaper]
shaper_freq: 40      # Hz - primary shaper frequency
shaper_type: ei     # ei, mzv, zv, 2hump_ei, zhihui

# Optional: Different frequencies per axis
# [input_shaper]
# shaper_freq_x: 45
# shaper_freq_y: 40
# shaper_type: ei

# For dual resonance frequencies:
# [input_shaper]
# shaper_type: 2hump_ei
# shaper_freq: 35
# shaper_freq2: 120
```

### Advanced Configuration

```ini
[input_shaper]
shaper_type: ei
shaper_freq: 40

# Damping ratio (0.0 to 1.0)
# Higher = less vibration but more smoothing
damping_ratio: 0.0

# For testing, you can disable input shaping:
# shaper_type: none
```

### Per-Axis Different Frequencies

```ini
# Different frequencies for X and Y if needed
[input_shaper]
shaper_type: ei
shaper_freq_x: 45
shaper_freq_y: 40
```

## Tuning Input Shaping

### Automatic Calibration

Klipper can auto-tune input shaper settings:

```bash
# Run with test vibrations
INPUT_SHAPER_CALIBRATE

# This will:
# 1. Test various frequencies
# 2. Measure response
# 3. Suggest optimal settings
# 4. Save to config
```

### Manual Frequency Selection

```
FREQUENCY SELECTION GUIDE:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Start with these frequencies based on printer type:           │
│                                                                 │
│  Printer Type         │ Recommended Start │ Adjust To           │
│  ─────────────────────┼──────────────────┼────────────────────  │
│  Ender 3 (stock)     │ 40 Hz            │ 30-45 Hz            │
│  Ender 3 (upgraded)  │ 45 Hz            │ 35-50 Hz            │
│  Ender 5             │ 40 Hz            │ 30-45 Hz            │
│  Prusa MK3S+        │ 50 Hz            │ 40-55 Hz            │
│  Custom CoreXY       │ 50 Hz            │ 40-60 Hz            │
│  Delta               │ 60 Hz            │ 50-70 Hz            │
│                                                                 │
│  Start conservative, adjust based on test prints               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Testing Your Settings

```bash
# Print a ringing test cube
# Size: 50x50x50mm
# Speed: 100mm/s
# No infill
# 3 perimeters

# Look for:
# - Ringing on flat surfaces
# - Ghosting at corners
# - Surface texture consistency
```

## Input Shaping and Speed

### Speed vs Quality Tradeoffs

```
INPUT SHAPING EFFECT BY SPEED:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  LOW SPEED (30-50mm/s):                                         │
│  ├─ Input shaping has minimal effect                            │
│  ├─ Vibrations don't develop fully                              │
│  └─ Good quality without shaper                                 │
│                                                                 │
│  MEDIUM SPEED (50-100mm/s):                                     │
│  ├─ Input shaping very beneficial                               │
│  ├─ Major improvement in surface finish                         │
│  └─ Recommended to enable                                        │
│                                                                 │
│  HIGH SPEED (100-150mm/s+):                                     │
│  ├─ Input shaping essential                                     │
│  ├─ Reduces ringing significantly                                │
│  ├─ Allows higher speeds with good quality                     │
│  └─ Must tune shaper_freq properly                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Optimizing for Speed

```
HIGH SPEED PRINTING TIPS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Increase shaper_freq slightly (5-10 Hz)                    │
│     └─ Less smoothing, faster settling                         │
│                                                                 │
│  2. Consider 2HUMP_EI for multiple resonances                 │
│     └─ Better at higher frequencies                            │
│                                                                 │
│  3. Adjust acceleration alongside input shaper                │
│     └─ Balance between speed and quality                      │
│                                                                 │
│  4. Test with real prints at target speed                     │
│     └─ Graphs don't tell the whole story                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Problem: Ringing Still Visible

```
DIAGNOSIS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  □ Shaper frequency too high                                   │
│  □ Multiple resonance frequencies not addressed                │
│  □ Wrong shaper type                                           │
│  □ Belt tension issues                                         │
│                                                                 │
│  SOLUTIONS:                                                     │
│                                                                 │
│  1. Lower shaper_freq by 5-10 Hz                                │
│     shaper_freq: 35  (was 40)                                  │
│                                                                 │
│  2. Use 2HUMP_EI for multiple peaks:                          │
│     shaper_type: 2hump_ei                                      │
│     shaper_freq: 30                                            │
│     shaper_freq2: 90                                           │
│                                                                 │
│  3. Check and adjust belt tension                              │
│                                                                 │
│  4. Verify shaper is actually enabled                          │
│     shaper_type should NOT be "none"                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Problem: Corners Appear Rounded

```
DIAGNOSIS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  □ Shaper frequency too low                                     │
│  □ Damping ratio too high                                      │
│  □ Combined with low square_corner_velocity                    │
│                                                                 │
│  SOLUTIONS:                                                     │
│                                                                 │
│  1. Increase shaper_freq slightly                              │
│     └─ Less smoothing at corners                               │
│                                                                 │
│  2. Adjust square_corner_velocity:                             │
│     └─ Try 8-10 mm/s with shaper                               │
│                                                                 │
│  3. Try different shaper type:                                │
│     └─ MZV has less corner smoothing                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Problem: Print Speed Reduced

```
DIAGNOSIS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  □ Shaper adds small delay to motion                           │
│  □ Settling time too long                                      │
│                                                                 │
│  SOLUTIONS:                                                     │
│                                                                 │
│  1. Increase shaper_freq (less delay)                         │
│                                                                 │
│  2. Try faster shaper type:                                    │
│     zv > ei > mzv > 2hump_ei (least smoothing)                 │
│                                                                 │
│  3. Accept small speed reduction                               │
│     └─ Usually only 2-5% maximum                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Problem: Different Quality at Different Bed Locations

```
DIAGNOSIS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  □ Bed not level                                               │
│  □ Mesh not configured                                         │
│  □ Z-wobble                                                    │
│                                                                 │
│  INPUT SHAPING DOESN'T FIX:                                     │
│  ├─ Bed leveling issues                                       │
│  ├─ Z-axis problems                                            │
│  └─ Uneven bed surface                                         │
│                                                                 │
│  SOLUTIONS:                                                     │
│  ├─ Run BED_MESH_CALIBRATE                                     │
│  ├─ Level bed manually                                         │
│  └─ Check lead screw for wobble                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Input Shaping with Other Settings

### Combined with Pressure Advance

```
INTERACTION:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Input shaping smooths motion                                  │
│  Pressure advance handles extrusion                             │
│                                                                 │
│  They work WELL together:                                       │
│  ├─ Shaper reduces mechanical vibrations                      │
│  ├─ PA handles filament pressure                               │
│  └─ Both should be tuned                                       │
│                                                                 │
│  TUNING ORDER:                                                  │
│  1. First tune input shaper                                    │
│  2. Then tune pressure advance                                 │
│  3. Re-verify both work together                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Combined with Acceleration

```
BALANCING SETTINGS:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Input Shaper + Acceleration:                                  │
│                                                                 │
│  High accel + low shaper_freq = Over smoothing                 │
│  Low accel + high shaper_freq = Good quality                   │
│                                                                 │
│  RECOMMENDED:                                                  │
│  Acceleration: 1500-3000 mm/s²                                │
│  Shaper freq: 40-50 Hz                                         │
│                                                                 │
│  Both reduce ringing, use together for best results            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Reference Charts

### Shaper Type Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│  SHAPER TYPE     │ VIBRATION │ SETTLING │ FREQUENCY │ COMPLEX │
│                 │ REDUCTION │   TIME   │   RANGE   │  ITY    │
├─────────────────┼───────────┼──────────┼───────────┼────────┤
│  ZV             │    ★★★    │   ★★★    │    ★★     │  Low   │
│  EI             │    ★★★★   │   ★★★    │   ★★★     │ Medium │
│  MZV            │    ★★★★★  │   ★★     │   ★★★     │ Medium │
│  2HUMP_EI       │    ★★★★   │   ★★     │   ★★★★★   │  High  │
│  ZHIHUI         │    ★★★★   │   ★★     │   ★★★★★   │  High  │
└─────────────────┴───────────┴──────────┴───────────┴────────┘

★★★★★ = Best        ★ = Good
```

### Recommended Settings by Printer

```
┌─────────────────────────────────────────────────────────────────┐
│  PRINTER              │ SHAPER TYPE │ FREQ  │ NOTES          │
├───────────────────────┼──────────────┼───────┼────────────────┤
│  Ender 3 V2          │     EI       │  40Hz │ Good baseline  │
│  Ender 3 Pro         │     EI       │  40Hz │ Stock springs  │
│  Ender 5             │     EI       │  40Hz │                │
│  Creality K1         │     EI       │  50Hz │ Fast response  │
│  Prusa MK3S+         │     MZV      │  50Hz │ Well-tuned    │
│  Prusa MINI+        │     EI       │  45Hz │                │
│  Anycubic V0        │     EI       │  45Hz │ Small bed      │
│  Custom CoreXY      │    MZV       │  50Hz │ High speed    │
│  Custom Delta       │    2HUMP     │  60Hz │ Multiple freq  │
└───────────────────────┴──────────────┴───────┴────────────────┘
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              INPUT SHAPING QUICK GUIDE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ENABLE INPUT SHAPING:                                     │
│  1. Add to printer.cfg:                                    │
│     [input_shaper]                                         │
│     shaper_type: ei                                        │
│     shaper_freq: 40                                        │
│  2. SAVE_CONFIG                                            │
│                                                             │
│  FIND OPTIMAL FREQUENCY:                                   │
│  1. RESONANCE_TEST AXIS=X                                  │
│  2. RESONANCE_TEST AXIS=Y                                  │
│  3. Look at graph peaks                                     │
│  4. Set shaper_freq below lowest peak                      │
│  5. Or run: INPUT_SHAPER_CALIBRATE                         │
│                                                             │
│  TEST PRINT:                                                │
│  - Print 50mm cube at 100mm/s                              │
│  - Check sides for ringing                                  │
│  - Adjust frequency as needed                               │
│                                                             │
│  TROUBLESHOOTING:                                           │
│  - Ringing visible → Lower freq                            │
│  - Corners rounded → Raise freq                            │
│  - Multiple peaks → 2HUMP_EI                               │
│                                                             │
│  RECOMMENDED STARTS:                                       │
│  - EI shaper, 40Hz (most printers)                        │
│  - MZV shaper, 50Hz (CoreXY)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Related Files

- `vibration_compensation_guide.md` - Related vibration topics
- `jerk_tuning_guide.md` - Corner quality settings
- `acceleration_tuning_guide.md` - Acceleration settings
- `pressure_advance_guide.md` - Extrusion tuning

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
