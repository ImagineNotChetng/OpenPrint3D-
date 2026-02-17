# Print Quality Troubleshooting Guide

## Decision Tree

### START: Identify the Problem

```
┌─────────────────────────────────────────────┐
│           What is the issue?                │
└─────────────────────────────────────────────┘
         │         │        │      │     │
    [Stringing] [Layer   [Elephant [Blobs] [Warping] [Supports
                 Sep]     Foot]              Failing]
```

---

## 1. STRINGING

**Symptoms:** Thin strands of filament between printed parts

```
Stringing Issue?
│
├─ NO → Return to START
└─ YES → Check retraction settings
         │
         ├─ Retraction distance too short?
         │   └─ Increase retraction distance (1-4mm depending on material)
         │
         ├─ Retraction speed too slow?
         │   └─ Increase retraction speed (20-60 mm/s)
         │
         ├─ Print temperature too high?
         │   └─ Lower nozzle temperature (5-10°C increments)
         │
         ├─ Travel speed too fast?
         │   └─ Reduce travel speed (below 150 mm/s for stringy materials)
         │
         └─ Using retraction?
             │
             ├─ NO → Enable retraction
             └─ YES → Fine-tune other settings
```

**Quick Fixes:**
- Enable "Combing" or "Avoid Crossing Perimeters"
- Increase "Minimum Travel After Retraction"
- Use "Z Hop" for tall prints

---

## 2. LAYER SEPARATION

**Symptoms:** Layers splitting apart, poor interlayer adhesion

```
Layer Separation Issue?
│
├─ NO → Return to START
└─ YES → Check nozzle temperature
         │
         ├─ Temperature too low?
         │   └─ Increase nozzle temperature (5-10°C)
         │
         ├─ Temperature too high?
         │   └─ Layer may be becoming too soft; reduce if ooze is present
         │
         └─ Temperature OK → Check material
             │
             ├─ Filament moisture?
             │   └─ Dry filament (40-50°C for 4-6 hours for PLA, 60-70°C for PETG/Nylon)
             │
             ├─ Material incompatible?
             │   └─ Ensure material is rated for your printer (check manufacturer specs)
             │
             └─ Material OK → Check print settings
                 │
                 ├─ Layer height too thin?
                 │   └─ Use layer height ≥ 25% of nozzle diameter
                 │
                 ├─ Print speed too fast?
                 │   └─ Reduce print speed for better bonding
                 │
                 └─ Infill too low?
                     └─ Increase infill (15-25% minimum recommended)
```

**Quick Fixes:**
- Increase "First Layer Height" slightly
- Enable "Ironing" for better top surface
- Use "Cohesion" or "Wall Ordering" settings in slicer

---

## 3. ELEPHANT FOOT

**Symptoms:** Bottom of print is wider than top, looking like an elephant's foot

```
Elephant Foot Issue?
│
├─ NO → Return to START
└─ YES → Check first layer settings
         │
         ├─ First layer too squished?
         │   └─ Increase first layer height or decrease first layer extrusion
         │
         ├─ First layer temperature too hot?
         │   └─ Lower first layer temperature by 5-10°C
         │
         ├─ Bed too close?
         │   └─ Increase nozzle-to-bed gap slightly
         │
         ├─ Using brim?
         │   └─ Brim can accentuate elephant foot; try without or reduce brim width
         │
         └─ All first layer settings OK → Check adhesion
             │
             ├─ Excessive bed adhesion?
             │   └─ Reduce bed temperature or use less bed adhesive
             │
             └─ Bed adhesion OK
                 │
                 └─ Enable "Elephant Foot Compensation" in slicer
```

**Quick Fixes:**
- Use "Elephant Foot Compensation" (auto-trim first layer)
- Increase "First Layer Speed" to reduce squish
- Level bed further from nozzle

---

## 4. BLOBS & ZIGZAGS

**Symptoms:** Random blobs, lumps, or zits on print surface

```
Blob Issue?
│
├─ NO → Return to START
└─ YES → Identify blob type
         │
         ├─ Regular spaced blobs?
         │   └─ Check for missing steps / layer shift
         │       │
         │       ├─ Belt tension too loose?
         │       │   └─ Tighten belts
         │       │
         │       ├─ Stepper motor overheating?
         │       │   └─ Check stepper drivers and cooling
         │       │
         │       └─ Mechanical binding?
         │           └─ Lubricate rails and check for obstructions
         │
         ├─ Random blobs at random positions?
         │   │
         │   ├─ Nozzle too close to previous layer?
         │   │   └─ Increase layer height or check for inconsistent extrusion
         │   │
         │   ├─ Inconsistent extrusion?
         │   │   │
         │   │   ├─ Filament diameter variance?
         │   │   │   └─ Calibrate extrusion multiplier
         │   │   │
         │   │   ├─ Filament jam?
         │   │   │   └─ Clean nozzle / check extruder gear
         │   │   │
         │   │   └─ Extruder skipping?
         │   │       └─ Increase extruder temperature or check extruder torque
         │   │
         │   └─ Pressure advance / linear advance?
         │       └─ Tune PA settings for your filament
         │
         └─ Blobs at layer changes?
             │
             ├─ Retraction settings?
             │   │
             │   ├─ Retraction too short?
             │   │   └─ Increase retraction distance
             │   │
             │   ├─ Retraction speed too slow?
             │   │   └─ Increase retraction speed
             │   │
             │   └─ Use "Wipe" or "Retract" before layer change
             │
             └─ Use "Layer Start" / "Layer End" G-code scripts
```

**Quick Fixes:**
- Clean nozzle with cold pull
- Check filament for knots or debris
- Enable "Wipe Before Retract"
- Tune "Linear Advance" (K-value test)

---

## 5. WARPING

**Symptoms:** Corners lifting, uneven base, part detaching during print

```
Warping Issue?
│
├─ NO → Return to START
└─ YES → Check bed temperature
         │
         ├─ Bed temperature too low?
         │   └─ Increase bed temperature (60-70°C for PLA, 70-85°C for PETG, 90-110°C for ABS/ASA)
         │
         ├─ Bed temperature dropping during print?
         │   └─ Ensure bed stays at constant temp; check heater
         │
         └─ Bed temperature OK → Check environment
             │
             ├─ Draft/cold air on print?
             │   └─ Enclose printer or create draft shield
             │
             ├─ Temperature fluctuations?
             │   └─ Keep room temperature stable
             │
             └─ Environment OK → Check bed surface
                 │
                 ├─ Bed surface not sticky enough?
                 │   │
                 │   ├─ Clean bed with IPA (70%+)
                 │   │
                 │   ├─ Apply PEI powder / bed adhesive
                 │   │
                 │   └─ Consider different bed surface
                 │       (PEI, glass + glue stick, textured PEI)
                 │
                 └─ Bed surface OK → Check first layer
                     │
                     ├─ First layer not sticking?
                     │   │
                     │   ├─ Nozzle too far?
                     │   │   └─ Level closer (for adhesion)
                     │   │
                     │   └─ First layer too thin?
                     │       └─ Increase first layer height
                     │
                     └─ First layer OK → Check material
                         │
                         ├─ ABS/ASA warping?
                         │   │
                         │   ├─ Use enclosure
                         │   │
                         │   ├─ Enable "Sequential Printing" if multiple parts
                         │   │
                         │   └─ Use "Raft" for difficult prints
                         │
                         └─ PLA/PETG warping?
                             └─ Usually bed adhesion; revisit bed surface
```

**Quick Fixes:**
- Use " brim" (5-10 lines) for large parts
- Enable "Avoid Flying Parts" in slicer
- Use "Cooling Fan" carefully for first layers (lower speed)
- Add " skirt" to warm up extruder before print

---

## 6. SUPPORTS FAILING

**Symptoms:** Supports break, fall over, or don't print correctly

```
Supports Failing Issue?
│
├─ NO → Return to START
└─ YES → Check support settings
         │
         ├─ Support density too low?
         │   └─ Increase support density (15-25% for normal, 30%+ for complex overhangs)
         │
         ├─ Support tip too small?
         │   │
         │   ├─ Increase "Support Interface" thickness
         │   │
         │   └─ Enable "Support Roof" / "Support Floor"
         │
         ├─ Support not adhering to model?
         │   │
         │   ├─ Increase "Support Z Distance"
         │   │
         │   ├─ Enable "Support on Build Plate Only" for more stable base
         │   │
         │   └─ Use "Support Pillar Resolution" - increase for better connection
         │
         ├─ Support material oozing?
         │   │
         │   ├─ Increase "Support Change Interval" (slower)
         │   │
         │   └─ Enable "Support Cooling" - slow down support printing
         │
         └─ Supports attached to model too strongly?
             │
             ├─ Increase "Support Z Distance" from model
             │
             └─ Enable "Support XY Distance" (gap from model walls)
                 │
                 └─ Increase for easier removal
```

**Support Placement Issues:**

```
│
├─ Supports not reaching overhang?
│   └─ Enable "Auto-generated supports" or adjust "Max Overhang Angle"
│       │
│       └─ Lower angle threshold = more supports (30-45° typical)
│
├─ Too many supports?
│   └─ Increase "Max Overhang Angle" threshold
│
├─ Supports in wrong places?
│   │
│   ├─ Enable "Tree Support" (better for organic shapes)
│   │
│   └─ Enable "Support Blockers" in slicer for manual placement
│
└─ Supports hard to remove?
    │
    ├─ Enable "Support Interface" (smooth contact point)
    │
    ├─ Use soluble support material (PVA for PLA, breakaway for PETG)
    │
    └─ Reduce support density (may need increase elsewhere)
```

**Quick Fixes:**
- Use "Tree Support" for organic/minimal supports
- Enable "Support Spiral Vase" for simple vase-mode prints
- Add manual "Support Blockers" or "Support Enforcers" in slicer preview

---

## Quick Reference Chart

| Issue | Primary Causes | Primary Fixes |
|-------|---------------|---------------|
| Stringing | High temp, no retraction | Enable retraction, lower temp |
| Layer Separation | Low temp, dry filament | Increase temp, dry filament |
| Elephant Foot | Squished first layer | Level bed higher, first layer compensation |
| Blobs | Inconsistent extrusion, nozzle issues | Clean nozzle, tune extrusion |
| Warping | Draft, low bed temp, bad surface | Enclose, increase bed temp, clean bed |
| Supports Failing | Low density, bad placement | Increase density, use tree supports |

---

## General Debugging Tips

1. **Print a calibration cube** between major changes to verify improvements
2. **Change one variable at a time** - this makes it easier to identify what works
3. **Document your settings** - keep notes on what you changed and the results
4. **Check the obvious first**:
   - Is filament loaded correctly?
   - Is the nozzle clear?
   - Is the bed clean?
   - Are belts properly tensioned?
5. **Use test prints**: Temperature towers, retraction tests, and flow calibration cubes can pinpoint specific issues

---

## Common Material Settings Reference

| Material | Nozzle Temp | Bed Temp | Notes |
|----------|-------------|----------|-------|
| PLA | 190-220°C | 40-60°C | Easy to print, low warping |
| PETG | 220-250°C | 60-80°C | Good strength, some warping |
| ABS | 230-260°C | 90-110°C | High warping, needs enclosure |
| ASA | 240-260°C | 90-110°C | Like ABS, UV resistant |
| TPU | 210-230°C | 30-50°C | Flexible, slow print speed |
| Nylon | 240-280°C | 70-100°C | Strong, absorbs moisture |

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
