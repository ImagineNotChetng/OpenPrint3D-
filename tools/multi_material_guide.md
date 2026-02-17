# Multi-Material Printing Guide

Comprehensive guide for AMS, Prusa MMU, and other multi-material systems including purge tower settings and color change protocols.

---

## Overview

Multi-material 3D printing enables printing with multiple filament colors or types in a single print. This guide covers setup, optimization, and troubleshooting for popular multi-material systems.

| System | Materials | Max Slots | Key Feature |
|--------|-----------|-----------|-------------|
| Bambu Lab AMS | 4 | 16 (with 4 AMS units) | Automatic material detection |
| Prusa MMU2S/3 | 5 | 5 | Selector-based loading |
| Palette Series | 2-4 | External | Splicing multiple filaments |
| ERCF | 9+ | 9+ | Bowden-based, open source |

---

## Bambu Lab AMS

### Setup Requirements

| Setting | Value | Notes |
|---------|-------|-------|
| AMS Humidity | <15% RH | Use included silica gel |
| Filament Diameter | 1.75mm | ±0.02mm tolerance |
| Spool Weight | 250g-1kg | Calibrate for remaining |
| PTFE Tubes | Bambu or equivalent | Low friction required |

### Purge Tower Settings

| Parameter | PLA | PETG | ABS/ASA | TPU |
|-----------|-----|------|---------|-----|
| Purge Volume | 80-120mm³ | 100-150mm³ | 120-180mm³ | 150-200mm³ |
| Purge Height | 1-2mm | 2-3mm | 2-4mm | 3-5mm |
| Extra Loading Distance | 0-2mm | 2-4mm | 4-6mm | 8-12mm |

### Recommended Tower Patterns

```
Standard Mode (Bambu Slicer):
- Wipe into tower: Enabled
- Tower Position: Automatic (per slice)
- Tower Wall Line Count: 3
- Sparse Infill Density: Match print

Adaptive Purge (Orca Slicer):
- Enable Adaptive Purge: Yes
- Min Purge Weight: 0-30g
- Max Purge Weight: 80-120g
```

### Color Change Protocol

1. **Pre-Print Checklist**
   - Verify filament in correct AMS slots matches slicer
   - Ensure PTFE tubes fully seated
   - Check for filament tangles
   - Dry filament if AMS humidity indicator shows >15%

2. **During Print**
   - AMS automatically manages loading/unloading
   - Monitor for failed loads (look for "Filament Runout" errors)
   - Keep spare filament ready for manual reloads

3. **Post-Print**
   - Remove remaining filament if not printing again soon
   - Check silica gel status
   - Clean any accumulated filament dust in AMS

### Troubleshooting AMS

| Issue | Cause | Solution |
|-------|-------|----------|
| Load failures | Filament tangled | Reset and reload |
| Snapping | Brittle filament | Dry at 50-55°C for 4-6h |
| Inconsistent extrusion | Wet filament | Dry before printing |
| Wrong slot loaded | Slicer mismatch | Verify slot assignment |

---

## Prusa MMU2S / MMU3

### Setup Requirements

| Setting | MMU2S | MMU3 |
|---------|-------|------|
| Nozzle Temperature | 215-250°C | 215-260°C |
| Filament Buffer | Idler gears clean | Idler gears clean |
| Selector Maintenance | Monthly | Monthly |
| PTFE Tubes | Replace every 6 months | Replace every 6 months |

### Purge Tower Settings

| Parameter | MMU2S | MMU3 |
|-----------|-------|------|
| Purge Volume | 70-100mm³ | 60-90mm³ |
| Extra Loading Distance | 0mm | 0-2mm |
| Ramming Settings | Default | Default |
| MMU Tower Size | 14x14mm | 12x12mm |

### Configuration (PrusaSlicer)

```
Print Settings:
- Wipe Tower: Yes
- Wipe Tower Volume: 50-80mm³
- Extra Loading Distance: 0mm

Printer Settings:
- MMU Mode: Enabled
- Number of Slots: 4-5
-filament Manager: Enabled
- Enable MMU Controls: Yes
```

### Color Change Protocol

1. **Loading Sequence**
   - Selector moves to correct slot
   - Filament pushed through PTFE to extruder
   - Pre-load purge before tower

2. **Unloading Sequence**
   - Retract filament from hotend
   - Park in selector
   - Wait for next material

3. **Tips for Success**
   - Use "Filament Park Position" to reduce ooze
   - Enable "Wipe Before Ramming" for stringy materials
   - Keep MMU at 30-35°C for consistent feeding

### Troubleshooting MMU

| Issue | Cause | Solution |
|-------|-------|----------|
| Selector jam | Debris in gear | Clean with brush |
| Filament shredding | Worn gears | Replace idler |
| Missed loads | PTFE blockage | Replace tube |
| Cross-contamination | Hotend temp too low | Increase 5-10°C |

---

## Palette Series (Palette 2/3/Pro)

### How It Works

The Palette splices multiple filaments externally, creating a single input for printers without native multi-material support.

### Setup

| Setting | Palette 2 | Palette 3/Pro |
|---------|-----------|---------------|
| Min Spool Length | 1m per color | 1m per color |
| Splicing Method | Auto | Auto/manual |
| Cooling | Fan required | Integrated fan |
| Hub Connection | UART | UART/WiFi |

### Configuration

```
Slicer Settings:
- Single Extruder
- No Wipe Tower (handled by Palette)
- Color Change Gcode: Disabled

Palette Settings:
- Splice Mode: Linear
- Cooling Moves: 3-4
- Auto-drop: Enabled
```

### Purge Volume

| Material Type | Purge Volume |
|---------------|---------------|
| PLA | 40-60mm³ |
| PETG | 60-80mm³ |
| ABS | 80-100mm³ |
| Flexible | 100-150mm³ |

### Color Change Protocol

1. **Calibration**
   - Run calibration wizard before first use
   - Adjust tension if slipping occurs
   - Verify splice quality visually

2. **During Print**
   - Watch for splice failures (sudden gaps)
   - Keep Palette fan running
   - Monitor for tangles at spools

3. **Post-Print**
   - Remove spliced filament from output
   - Clean splice rollers if needed
   - Store filament in dry boxes

---

## ERCF (Enraged Rabbit Carrot Feeder)

### Overview

Open-source multi-material system for Bowden setups, supporting 9+ materials.

### Setup Requirements

| Component | Specification |
|-----------|---------------|
| Servo | MG996R or equivalent |
| Encoder | Optical sensor |
| PTFE | 4mm ID, 6mm OD |
| Buffer | Optional but recommended |

### Purge Settings

```
Slicer Configuration:
- Wipe Tower: Yes
- Tower X Position: Right side
- Tower Wall Line Count: 3
- Wipe Volume: 60-100mm³

ERCF Config:
- Tip Shape: Docked
- Unloading Speed: 200-400mm/s
- Loading Speed: 200-400mm/s
```

### Color Change Protocol

1. **Buffer Management**
   - Use gate buffers to prevent backflow
   - Adjust tension for reliable feeding
   - Keep PTFE tubes short (<50cm)

2. **Tips**
   - Home ERCF after filament changes
   - Use "Formbot" style tips for best seal
   - Monitor encoder for jams

---

## Universal Settings by Material

### Purge Volume Reference

| From → To | PLA | PETG | ABS | TPU | PA | PC |
|-----------|-----|------|-----|-----|----|----|
| PLA | 20 | 80 | 100 | 200 | 120 | 150 |
| PETG | 80 | 20 | 100 | 220 | 130 | 160 |
| ABS | 80 | 80 | 20 | 250 | 140 | 150 |
| TPU | 150 | 180 | 200 | 30 | 200 | 220 |
| PA | 100 | 100 | 120 | 200 | 20 | 80 |
| PC | 120 | 120 | 100 | 220 | 80 | 20 |

*Values in mm³ purge volume*

### Temperature-Based Adjustments

| Scenario | Adjustment |
|----------|------------|
| Large temp difference (>30°C) | Increase purge 50% |
| Similar materials (PLA→PETG) | Use minimum purge |
| Flexible filaments | Increase purge + slow extrusion |
| High-temp materials (PC/PA) | Increase purge + wait 0.5s |

---

## Color Change G-Code Scripts

### Bambu Lab Custom G-Code

```gcode
; Before Tool Change
M400
G1 E-2 F1800

; After Tool Change  
M400
G1 E5 F300
```

### Prusa MMU Custom G-Code

```gcode
; MMU2S/3 Tool Change
M702 C ; Unload current
G4 P200 ; Wait for selector
M701 ; Load new filament
G4 P500 ; Wait for load
```

### Generic Tool Change

```gcode
; Tool Change Start
G91
G1 Z5 ; Lift Z
G90

; Cool down for material switch
M104 S0 ; Turn off hotend (optional)
G4 S2 ; Wait 2 seconds

; Resume
M104 S[first_layer_temperature]
G1 Z-5
```

---

## Best Practices

### Filament Preparation

- **Dry All Materials**: Even PLA benefits from drying before MM prints
- **Match Diameters**: Use consistent 1.75mm ±0.02mm filament
- **Check Ends**: Trim frayed ends before loading

### Print Optimization

1. **Orientation**: Place color changes at layer transitions when possible
2. **Tower Position**: Position wipe tower for minimum travel time
3. **Layer Height**: 0.2mm standard; 0.28mm for faster multi-material prints
4. **Infill**: Same material for infill and top layers reduces purging

### Maintenance Schedule

| Component | Frequency |
|-----------|-----------|
| PTFE tubes | Every 3-6 months |
| Selector gears | Monthly inspection |
| Idler bearings | Every 6 months |
| Buffer gates | Monthly cleaning |
| AMS silica gel | As needed (visual check) |

---

## Common Issues Reference

| Problem | System | Solution |
|---------|--------|----------|
| Stringing between colors | All | Increase purge, enable cooling |
| Color bleeding | All | Lower nozzle temp slightly |
| Tower knocking over | AMS/MMU | Check layer adhesion |
| Filament runout mid-print | All | Keep spare loaded |
| Inconsistent first layer | All | Re-level after loading |

---

*Last Updated: 2026*
*Contribute: Open an issue or PR to improve this guide*
