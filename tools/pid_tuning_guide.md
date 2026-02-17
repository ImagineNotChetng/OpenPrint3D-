# PID Tuning Guide

## Overview

PID (Proportional-Integral-Derivative) control is an algorithm used to maintain stable temperatures for the hotend and heated bed. Proper PID tuning ensures:
- Stable temperatures without overshooting or oscillating
- Faster heating times
- Consistent print quality
- Reduced wear on heating elements

## Understanding PID

### The Three Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      PID CONTROL LOOP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Setpoint ──►    ┌─────────────┐    ┌─────────────┐           │
│   (Target Temp)   │             │    │             │           │
│        │         │   PID       │───►│  Heater     │───►        │
│        │         │  Algorithm  │    │  Output     │            │
│        ▼         │             │    │             │           │
│   ┌─────────┐    └─────────────┘    └─────────────┘           │
│   │  Temp   │           ▲                    │                │
│   │ Sensor  │           │                    │                │
│   │ (Therm) │───────────┘                    ▼                │
│   └─────────┘                              Heater              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  P (Proportional):  Responds to current error                 │
│  I (Integral):      Responds to accumulated error             │
│  D (Derivative):    Responds to rate of change                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Representation

```
GOOD PID TUNING:                    POOR PID TUNING:
┌─────────────────────────┐        ┌─────────────────────────┐
│ 220°C ┤                        220°C ┤
│       │    ╭──╮                    │  ╭────╮     ╭──╮
│       │   ╱    ╲                   │ ╱      ╲   ╱    ╲
│       │  ╱      ╲                  │╱        ╲╱        ╲
│       │─╯        ╲───►            │          ╲        ╲───►
│ 210°C │                     210°C │
│       └──────────────→             └──────────────→
│         Time →                      Time →
│       Stable, minimal               Oscillating, overshooting
│       overshoot                     unstable
└─────────────────────────┘        └─────────────────────────┘
```

## When to Tune PID

```
TIMES TO RETUNE PID:
┌─────────────────────────────────────────────────────────────┐
│ □ New thermistor or heater cartridge installed            │
│ □ Changing from 24V to 12V or vice versa                  │
│ □ Temperature overshoots by >5°C                           │
│ □ Temperature oscillates during print                      │
│ □ Switching from PLA to ABS or high-temp materials        │
│ □ After firmware update                                    │
│ □ New heated bed or hotend                                 │
│ □ Persistent temperature errors                            │
│ □ Print quality issues with temperature stability         │
└─────────────────────────────────────────────────────────────┘
```

## PID Tuning Process

### Marlin PID Tuning

#### Hotend PID Autotune

```gcode
; Start PID tuning for hotend
; Format: M303 E<extruder> C<cycles> S<temperature>

M303 E0 C8 S200   ; Tuner extruder 0, 8 cycles, 200°C (PLA)
M303 E0 C8 S240   ; For PETG
M303 E0 C8 S260   ; For ABS

; For dual extruders:
M303 E1 C8 S200   ; Tune extruder 1
```

#### Bed PID Autotune

```gcode
; Start PID tuning for bed
; Format: M304 P<value> I<value> D<value> (bed uses M304)

M303 E-1 C8 S60    ; Tune bed to 60°C (PLA)
M303 E-1 C8 S100   ; Tune bed to 100°C (ABS)

; Note: E-1 targets the bed in Marlin
```

#### Autotune Results

```
EXAMPLE PID AUTOTUNE OUTPUT:
┌─────────────────────────────────────────┐
│ PID Autotune: finished!                  │
│Kp: 19.88                                │
│Ki: 1.34                                 │
│Kd: 93.21                                │
│                                          │
│Use these with M301 in configuration.h  │
└─────────────────────────────────────────┘
```

#### Applying PID Values

**Marlin (Hotend):**
```gcode
; Apply to hotend
M301 P19.88 I1.34 D93.21

; Save to EEPROM
M500
```

**Marlin (Bed):**
```gcode
; Apply to bed
M304 P123.45 I12.34 D567.89

; Save to EEPROM
M500
```

**Configuration.h (Permanent):**
```cpp
// Hotend PID
#define DEFAULT_Kp 19.88
#define DEFAULT_Ki 1.34
#define DEFAULT_Kd 93.21

// Bed PID
#define DEFAULT_bedKp 123.45
#define DEFAULT_bedKi 12.34
#define DEFAULT_bedKd 567.89
```

### Klipper PID Tuning

#### Hotend PID Autotune

```gcode
; Tune hotend to target temperature
; Format: PID_TUNE_HOTEND TARGET=<temp>

PID_TUNE_HOTEND TARGET=200    ; PLA
PID_TUNE_HOTEND TARGET=240    ; PETG
PID_TUNE_HOTEND TARGET=260    ; ABS
```

#### Bed PID Autotune

```gcode
; Tune bed to target temperature
; Format: PID_TUNE_BED TARGET=<temp>

PID_TUNE_BED TARGET=60     ; PLA
PID_TUNE_BED TARGET=80     ; PETG
PID_TUNE_BED TARGET=100    ; ABS
```

#### Applying PID Values

```ini
[extruder]
heater_pin: P2.3
sensor_type: EPCOS_100K_B57560
sensor_pin: P0.24
pid_Kp: 19.88
pid_Ki: 1.34
pid_Kd: 93.21
control: pid
pid_dt: 2.5
min_temp: 0
max_temp: 300

[heater_bed]
heater_pin: P2.5
sensor_type: EPCOS_100K_B57560
sensor_pin: P0.23
pid_Kp: 123.45
pid_Ki: 12.34
pid_Kd: 567.89
control: pid
pid_dt: 2.5
min_temp: 0
max_temp: 150
```

```bash
; Save configuration
SAVE_CONFIG
```

## Temperature Tuning Parameters

### Material-Specific Settings

```
RECOMMENDED TUNING TEMPERATURES:
┌──────────────────┬────────────────┬───────────────────────────┐
│ Material         │ Hotend Temp    │ Bed Temp                  │
├──────────────────┼────────────────┼───────────────────────────┤
│ PLA              │ 200-210°C      │ 50-60°C                   │
│ PLA+             │ 210-220°C      │ 55-65°C                   │
│ PETG             │ 230-250°C      │ 70-85°C                   │
│ ABS              │ 240-260°C      │ 90-110°C                  │
│ ASA              │ 240-260°C      │ 90-110°C                  │
│ TPU              │ 210-230°C      │ 40-50°C                   │
│ Nylon            │ 250-280°C      │ 70-100°C                  │
│ PC               │ 270-300°C      │ 100-120°C                 │
│ PEEK             │ 300-350°C      │ 120-150°C                 │
│ PP               │ 230-250°C      │ 80-100°C                  │
└──────────────────┴────────────────┴───────────────────────────┘
```

## Manual PID Tuning

### Understanding PID Values

```
PID VALUE EFFECTS:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  KP (Proportional):                                              │
│  ├─ Too HIGH → Temperature overshoots, oscillates              │
│  ├─ Too LOW  → Slow to reach target, sluggish                  │
│  ├─ Purpose → Primary response to temperature error           │
│                                                                  │
│  KI (Integral):                                                  │
│  ├─ Too HIGH → Unstable, overshoots repeatedly                │
│  ├─ Too LOW  → Never reaches exact target (droops)            │
│  ├─ Purpose → Eliminates steady-state error                    │
│                                                                  │
│  KD (Derivative):                                                │
│  ├─ Too HIGH → Overreacts to noise, jittery                   │
│  ├─ Too LOW  → Slow response to changes                       │
│  ├─ Purpose → Dampens oscillations, smooths response          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Manual Tuning Process

**Step 1: Reset to Defaults**
```gcode
; Marlin
M301 I1 D0 P20    ; Reset hotend
M304 I1 D0 P200   ; Reset bed
M500

; Klipper
SET_HEATER_TEMP EXTRUDER=100
PID_TUNE_HOTEND TARGET=0
```

**Step 2: Tune Proportional (P)**
```
1. Set I and D to 0
2. Start with P=10
3. Watch temperature response

If temperature:
- Overshoots significantly → Reduce P
- Reaches but slowly → Increase P
- Stable but low → Target too low, increase
```

**Step 3: Tune Integral (I)**
```
1. Keep P from step 2
2. Set I=1
3. Watch for reaching target

If temperature:
- Never reaches target → Increase I
- Oscillates around target → Reduce I
```

**Step 4: Tune Derivative (D)**
```
1. Keep P and I
2. Start with D=50
3. Watch for smoothness

If temperature:
- Jittery → Reduce D
- Slow response → Increase D
- Good → Done
```

## Troubleshooting PID Issues

### Problem: Temperature Overshoots Target

```
CAUSES:
┌────────────────────────────────────────┐
│ ├─ Kp too high                         │
│ ├─ Ki too high                         │
│ ├─ Heating too fast (power too high)  │
│ └─ Sensor placement issues             │
│                                        │
│ SOLUTIONS:                             │
│ 1. Retune with more cycles            │
│ 2. Reduce heating power               │
│ 3. Check sensor position              │
│ 4. Increase PID cycle time            │
└────────────────────────────────────────┘
```

### Problem: Temperature Oscillates

```
CAUSES:
┌────────────────────────────────────────┐
│ ├─ PID values not tuned                │
│ ├─ Temperature sensor noise           │
│ ├─ Heater wiring issues               │
│ └─ Power supply instability           │
│                                        │
│ SOLUTIONS:                             │
│ 1. Run PID autotune                   │
│ 2. Check sensor connections           │
│ 3. Verify heater wires secure         │
│ 4. Add PID_D_TERM in Marlin          │
│ 5. Increase PID_I_DAMP                │
└────────────────────────────────────────┘
```

### Problem: Temperature Never Reaches Target

```
CAUSES:
┌────────────────────────────────────────┐
│ ├─ Heater cartridge failing            │
│ ├─ PID values wrong (Ki too low)      │
│ ├─ Power supply insufficient          │
│ ├─ Thermistor wrong type               │
│ └─ PID not enabled                    │
│                                        │
│ SOLUTIONS:                             │
│ 1. Check heater cartridge resistance  │
│ 2. Retune PID                         │
│ 3. Verify power supply voltage       │
│ 4. Check sensor type configuration    │
│ 5. Ensure PID control is enabled     │
└────────────────────────────────────────┘
```

### Problem: Temperature Drops During Print

```
CAUSES:
┌────────────────────────────────────────┐
│ ├─ Cooling fan affecting thermistor   │
│ ├─ Part cooling fan blowing on hotend │
│ ├─ Insufficient heater power         │
│ └─ PID not tuned for active cooling  │
│                                        │
│ SOLUTIONS:                             │
│ 1. Shield thermistor from fans       │
│ 2. Enable fan\_during\_print option  │
│ 3. Retune PID with fans on           │
│ 4. Increase heater power              │
└────────────────────────────────────────┘
```

## PID Configuration Examples

### Ender 3 Series (Stock)

```
HOTEND:
Kp: 19.88
Ki: 1.34  
Kd: 93.21

BED:
Kp: 123.45
Ki: 12.34
Kd: 567.89
```

### Prusa i3 MK3S+

```
HOTEND:
Kp: 22.2
Ki: 1.6
Kd: 114

BED:
Kp: 188
Ki: 16.8
Kd: 956
```

### Custom CoreXY (High-Temp)

```
HOTEND (for 300°C):
Kp: 30.0
Ki: 2.0
Kd: 150.0

BED (for 120°C):
Kp: 200.0
Ki: 20.0
Kd: 800.0
```

## Advanced PID Settings

### Marlin Advanced Options

```cpp
// PID settings
#define PIDTEMP
#define PIDTEMPBED

// PID d-term
#define PID_D_TERM

// Auto tune parameters
#define PID_AUTOTUNE_FACTOR 0.25
#define PID_AUTOTUNE_CYCLES 8

// BED settings
#define MAX_BED_POWER 255
#define BED_DUTY_CYCLES 10
```

### Klipper Advanced Options

```ini
[extruder]
# Standard PID
pid_Kp: 19.88
pid_Ki: 1.34
pid_Kd: 93.21

# Fine-tune control
pid_Kp: 30.0
pid_Ki: 2.0
pid_Kd: 150.0
pid_max: 100
control: pid
pid_dt: 2.5

# Bang-bang fallback
#pid_Kp: 0
#pid_Ki: 0
#pid_Kd: 0
#control: watermark

[heater_bed]
pid_Kp: 123.45
pid_Ki: 12.34
pid_Kd: 567.89
pid_max: 100
control: pid
pid_dt: 5.0
```

## Verification Process

### Testing PID Stability

```gcode
; Print test showing temperature stability
M104 S200        ; Set hotend to 200°C
M190 S60         ; Wait for bed 60°C

; Monitor temperature via:
; Marlin: M105
; Klipper: QUERY_ADC

; Watch for:
; - Temperature within ±1°C of target
; - No constant oscillation
; - Quick recovery after door open/close
```

### Temperature Graph Analysis

```
GOOD STABILITY:                      POOR STABILITY:
┌──────────────────────────────┐     ┌──────────────────────────────┐
│                              │     │                              │
│    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │     │   /\  /\  /\  /\  /\  /\    │
│  ═══════════════════════    │     │  ╱  ╲╱  ╲╱  ╲╱  ╲╱  ╲╱  ╲   │
│                    ─ ─ ─ ─  │     │                              │
│                              │     │                              │
│  ±1°C variance              │     │  ±5-10°C variance            │
│  Quick recovery             │     │  Slow recovery                │
│  No overshoot              │     │  Significant overshoot       │
└──────────────────────────────┘     └──────────────────────────────┘
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    PID TUNING QUICK GUIDE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MARLIN:                                                   │
│  Hotend:  M303 E0 C8 S200                                  │
│  Bed:     M303 E-1 C8 S60                                  │
│  Apply:   M301 P.. I.. D.. (hotend)                        │
│           M304 P.. I.. D.. (bed)                          │
│  Save:    M500                                             │
│                                                             │
│  KLIPPER:                                                 │
│  Hotend:  PID_TUNE_HOTEND TARGET=200                      │
│  Bed:     PID_TUNE_BED TARGET=60                          │
│  Edit:    printer.cfg                                     │
│  Save:    SAVE_CONFIG                                      │
│                                                             │
│  TUNING TEMPS:                                            │
│  PLA:      Hotend 200°C, Bed 60°C                         │
│  PETG:     Hotend 240°C, Bed 80°C                         │
│  ABS:      Hotend 260°C, Bed 100°C                        │
│                                                             │
│  TROUBLESHOOTING:                                         │
│  Overshoot → Lower Kp                                      │
│  Oscillate → Lower Ki                                      │
│  Never reach target → Increase Ki                         │
│  Jittery → Lower Kd                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Related Files

- `nozzle_temperature_guide.md` - Temperature optimization
- `print_quality_troubleshooting.md` - Temperature-related issues

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
