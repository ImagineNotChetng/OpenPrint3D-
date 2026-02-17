# Elephant Foot Compensation Guide

Elephant foot is a bulge or expansion at the base of a 3D printed object, caused by the first layer being over-squished or the nozzle being too close to the bed. This guide covers tuning strategies, z-offset adjustments, and slicer settings to minimize or eliminate this issue.

## Quick Reference Table

| Cause | Primary Solution | Adjustment |
|-------|------------------|-------------|
| Nozzle too close | Increase Z-offset | +0.02 to +0.05mm |
| First layer too squished | Reduce first layer height | 0.25-0.30mm |
| Excessive first layer temp | Lower bed temp | -5 to -10°C |
| Over-extrusion | Reduce flow rate | -2% to -5% |
| No first layer cooling | Enable initial cooling | 20-30% fan |

---

## First Layer Tuning

### Understanding Elephant Foot Mechanics

Elephant foot occurs when:
1. The first layer is pressed too firmly into the build surface
2. Material expands outward under pressure before cooling
3. Subsequent layers build on this uneven foundation

### First Layer Height

The first layer absorbs most of the compensation. Standard approach:

| Standard Layer Height | Recommended First Layer | Benefit |
|---------------------|------------------------|---------|
| 0.20mm | 0.30mm (150%) | Extra squish tolerance |
| 0.28mm | 0.40mm (143%) | Better for rough surfaces |
| 0.12mm | 0.20mm (167%) | Fine detail, less margin |

**For severe elephant foot**: Try 200% first layer height (e.g., 0.40mm first layer for 0.20mm standard).

### First Layer Line Width

Increase first layer line width to give material more room to spread:

- **Recommended**: 120-150% of nominal width
- **Example**: 0.48mm for 0.40mm nozzle (120%)

This allows material to spread horizontally rather than bulging vertically.

### First Layer Speed

Slower first layers improve adhesion but can increase squish:

- **Optimal**: 25-40mm/s
- **Too slow** (<20mm/s): Excessive squish time
- **Too fast** (>50mm/s): Poor adhesion, inconsistent extrusion

---

## Z-Offset Adjustments

### Finding Your Baseline

1. Print a single-layer test square (20x20mm)
2. Measure the height with calipers
3. Target: 0.8x to 0.9x of nominal first layer height

| Measured Height | Adjustment Needed |
|-----------------|-------------------|
| >100% of target | Increase z-offset (move nozzle up) |
| 80-90% of target | Optimal |
| <80% of target | Decrease z-offset (move nozzle down) |

### Incremental Tuning Method

Start conservative, adjust in small increments:

| Issue | Z-Offset Change | Notes |
|-------|-----------------|-------|
| Severe elephant foot | +0.05mm | Major adjustment |
| Moderate elephant foot | +0.03mm | Standard adjustment |
| Slight bulge | +0.02mm | Fine-tuning |
| First layer not sticking | -0.02mm | Too far from bed |

### Per-Slicer Z-Offset Locations

- **PrusaSlicer**: Printer Settings → General → Z offset
- **Cura**: Settings → Printer → Machine Settings → Z offset
- **SuperSlicer**: Printer Settings → General → Z offset
- **Simplify3D**: Processes → G-Code → Z-axis settings

---

## Slicer Settings

### PrusaSlicer / SuperSlicer

```yaml
# First Layer Settings
first_layer_height: 0.30        # 150% of 0.20mm
first_layer_width: 120          # % of nominal
first_layer_speed: 30           # mm/s

# Print Settings
layer_height: 0.20

# Skirt/Brim
skirt_loops: 3                  # Helps anchor first layer
brim_width: 5                   # mm, for large parts

# Cooling
fan_minimum_speed: 20           # % fan from first layer
```

### Cura

```yaml
# Layer Settings
Initial Layer Height: 0.30
Initial Layer Line Width: 120

# Speed
Initial Speed: 30

# Build Plate Adhesion
Brim Width: 5
Brim Outermost Only: Checked
```

### Simplify3D

```yaml
# Layer Settings
First Layer Height: 150%
First Layer Width: 120%

# Speeds
First Layer Speed: 30mm/s
```

### Advanced Slicer Features

Some slicers offer direct elephant foot compensation:

- **PrusaSlicer**: Not built-in, use z-offset or first layer tuning
- **Cura**: "Outer Before Inner Walls" can help
- **SuperSlicer**: Has "Elephant foot compensation" setting (0.1-0.3mm)

---

## Temperature Tuning

### Bed Temperature Impact

High first layer temps cause material to stay soft longer, increasing squish:

| Material | First Layer Bed | Subsequent Layers |
|----------|-----------------|-------------------|
| PLA | 55-60°C | 50-55°C |
| PETG | 70-75°C | 60-70°C |
| ABS | 100-105°C | 90-95°C |
| ASA | 95-100°C | 85-90°C |
| TPU | 50-55°C | 45-50°C |

**Elephant foot fix**: Reduce first layer bed temp by 5-10°C while maintaining adhesion.

### Nozzle Temperature

Lower nozzle temp reduces flow pressure:

- **Reduce by**: 5-10°C from default
- **Watch for**: Under-extrusion, poor layer bonding
- **Trade-off**: May need to reduce speed slightly

---

## Flow Rate Adjustment

Over-extrusion compounds elephant foot. Calibrate your flow:

1. Print a 100% cube with no infill
2. Measure wall thickness with calipers
3. Calculate correction: `corrected_flow = nominal_width / measured_width × 100`

| Measured vs Nominal | Flow Adjustment |
|---------------------|------------------|
| +10% thicker | -10% flow |
| +5% thicker | -5% flow |
| On target | No change |
| -5% thinner | +5% flow |

**Typical correction**: -2% to -5% for elephant foot reduction

---

## Build Surface Considerations

### Surface Type Impact

| Surface | Elephant Foot Tendency | Notes |
|---------|------------------------|-------|
| PEI (smooth) | Low | Best for control |
| PEI (textured) | Medium | More grip, more squish |
| Glass | Low | Very consistent |
| Garolite | High | Requires careful leveling |
| BuildTak | Low | Good but wears |

### Surface Temperature

Use a thermometer to verify actual bed temp (surface vs controller):

- **IR thermometer**: Measure surface directly
- **Offset controller**: Set 5-10°C higher than target if surface is cooler

---

## Printing Strategy

### Brim Usage

A brim provides a sacrificial first layer that absorbs the elephant foot effect:

- **Width**: 5-10mm for small parts, 10-20mm for large
- **Loops**: 3-5 for good anchoring
- **Remove**: Carefully separate after cooling

### Sequential Printing

When printing multiple objects:

- Space objects at least 2x nozzle diameter apart
- Ensure even cooling across the bed
- Avoid printing in corners if bed temp is uneven

### Model Orientation

Reduce first layer surface area:

- Rotate models to minimize base footprint
- Consider tilting 45° for complex bases
- Hollow models before printing if possible

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Bulge at base | Nozzle too close | Increase z-offset +0.03mm |
| Bulge at base | First layer too thick | Reduce first layer height |
| Bulge at base | Over-extrusion | Reduce flow 2-5% |
| Bulge at base | First layer too hot | Reduce bed temp -5°C |
| Bulge at base | No cooling | Enable 20-30% fan layer 1 |
| Inconsistent bulge | Bed not level | Re-level, check tramming |
| One side worse | Bed not level | Level that corner |
| Getting worse over time | Nozzle accumulating debris | Clean nozzle |

---

## Calibration Checklist

1. [ ] Level bed with paper or feeler gauge
2. [ ] Set first layer height to 150% nominal
3. [ ] Set first layer line width to 120%
4. [ ] Enable 20-30% fan on first layer
5. [ ] Print test cube (20x20x20mm)
6. [ ] Measure base dimensions
7. [ ] Adjust z-offset +0.02mm if needed
8. [ ] Adjust flow -2% if walls too thick
9. [ ] Repeat until base matches nominal dimensions

---

## Recommended Test Prints

### Single Wall Tower
Print a single perimeter tower to isolate elephant foot without infill variables.

### Cube with Brim
Print 20mm cube with 5mm brim, measure base width after removing brim.

### Temperature Tower
Print with varying bed temps to find optimal adhesion vs squish balance.
