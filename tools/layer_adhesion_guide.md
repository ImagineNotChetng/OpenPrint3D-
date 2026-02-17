# Layer Adhesion Guide

Optimal settings for improving inter-layer adhesion, temperature tower calibration, ironing, and layer bonding techniques.

## Quick Settings Reference

| Parameter | PLA | PETG | ABS/ASA | TPU |
|-----------|-----|------|---------|-----|
| **Nozzle Temp** | 200-230°C | 230-260°C | 240-270°C | 210-240°C |
| **Layer Height** | 0.2-0.28mm | 0.2-0.24mm | 0.2-0.28mm | 0.2mm |
| **Print Speed** | 40-60 mm/s | 30-50 mm/s | 40-60 mm/s | 15-30 mm/s |
| **Fan Speed** | 30-50% | 20-40% | 0-20% | 0-20% |
| **Ironing** | Optional | Recommended | Not recommended | Not recommended |

## Temperature Towers

### Purpose
Temperature towers test extrusion quality across a range of temperatures to find the optimal setting for your specific filament and printer combination.

### Print Configuration
- **Tower Design**: Steps down 5-10°C every 10-20mm
- **Temperature Range**: Test from 180°C to 240°C (or filament-specific range)
- **Layer Height**: 0.2mm standard
- **Perimeters**: 2-3 for structural integrity
- **Infill**: 20% to allow visual inspection
- **Fan**: Enable part cooling at normal settings

### Recommended Test Ranges

| Filament | Start Temp | End Temp | Step |
|----------|-------------|----------|------|
| PLA | 190°C | 230°C | 5°C |
| PETG | 220°C | 260°C | 5°C |
| ABS | 230°C | 270°C | 5°C |
| ASA | 230°C | 270°C | 5°C |
| TPU | 200°C | 240°C | 5°C |
| Nylon | 240°C | 280°C | 5°C |
| PC | 260°C | 300°C | 5°C |

### Evaluation Criteria
- **Top sections**: Should show clean layers with minimal stringing
- **Optimal zone**: Smooth surfaces, good layer bonding, no gaps
- **Too hot**: Stringing, blobbing, elephant foot
- **Too cold**: Layer delamination, poor surface finish, under-extrusion

### Advanced Temperature Tower Tips
- Print multiple towers with different fan speeds
- Test both smooth and textured sheet surfaces
- Note humidity effects on hygroscopic filaments
- Document results for future reference

## Ironing Settings

### When to Use Ironing
Ironing creates a top surface finish by passing the nozzle over the top layer in a zigzag pattern. Best for:
- Functional parts requiring smooth surfaces
- Parts that will be painted
- Visual models with flat top surfaces
- Parts that will be handled frequently

### Recommended Settings

| Setting | PLA | PETG | ABS | Notes |
|---------|-----|------|-----|-------|
| Ironing | On | On | Off | Not recommended for ABS |
| Ironing Infill | 0% | 0% | N/A | Must use full infill first |
| Ironing Speed | 20-30 mm/s | 15-25 mm/s | N/A | Slower = smoother |
| Ironing Flow | 10-15% | 10-20% | N/A | Low flow prevents squish |
| Ironing Step | 0.05mm | 0.04mm | N/A | Vertical spacing |
| Ironing Start Height | 0mm | 0mm | N/A | Start from first layer |

### Ironing Patterns
- **Zigzag**: Most common, good coverage
- **Grid**: Better for larger flat areas
- **Lines**: Fastest, may show directional lines
- **Concentric**: Good for circular surfaces

### Troubleshooting Ironing
| Problem | Solution |
|---------|----------|
| Uneven surface | Reduce ironing speed |
| Visible lines | Increase overlap |
| Material buildup | Reduce ironing flow |
| Layer separation | Increase nozzle temp |
| No improvement | Check top layer infill is 100% |

## Inter-Layer Adhesion Improvements

### Temperature Optimization

#### Nozzle Temperature
- **Increase by 5-10°C** for better layer bonding
- First layer: 5-10°C hotter than subsequent layers
- Maintain consistent temp throughout print
- Avoid temperature fluctuations

#### Bed Temperature
- **Keep bed warm** throughout print for ABS/ASA
- Slightly higher first layer temp (5-10°C)
- Gradual cooling after last layer for annealed parts
- Enclosure helps maintain consistent temps

### Print Speed Adjustments

#### Speed Settings for Adhesion
- **Reduce speed** by 10-30% for better bonding
- First layer: 30-50% of normal speed
- Critical sections: Slow down 20%
- Formula: `optimal_speed = normal_speed × 0.7-0.9`

#### Acceleration Settings
- Lower acceleration = better layer contact time
- Recommended: 500-1000 mm/s² for structural parts
- Jerk: Keep moderate (10-20 mm/s)
- Use linear advance if available

### Layer Height Considerations

#### Optimal Layer Heights
- **0.2mm**: Standard, good balance
- **0.28mm**: Thicker layers = stronger bonds
- **0.12-0.16mm**: More layers, potentially weaker
- Match layer height to nozzle diameter (0.4× to 0.8×)

#### First Layer Settings
- **Height**: 0.2-0.3mm for better bed contact
- **Speed**: 20-40 mm/s
- **Temperature**: 5-10°C hotter
- **Fan**: Delay or reduce for first 2-3 layers

### Cooling Fan Settings

#### Fan Speed by Material

| Material | Initial Layers | Subsequent |
|----------|----------------|------------|
| PLA | 0-20% | 30-60% |
| PETG | 0-20% | 20-40% |
| ABS/ASA | 0% | 0-20% |
| TPU | 0% | 0-20% |
| Nylon | 0% | 10-30% |
| PC | 0% | 0-20% |

#### Fan Delay
- Delay fan for first 2-5 layers
- Allows material to cool slowly and bond
- Critical for bridging and overhangs
- Adjust based on environmental conditions

### Extrusion Multiplier

#### Flow Rate Adjustments
- **Increase to 100-105%** for better inter-layer bonding
- Over-extrusion slightly improves layer adhesion
- Too much causes other issues (stringing, blobs)
- Test with calibration prints

#### Calibration Process
1. Print temperature tower first
2. Adjust extrusion multiplier
3. Verify dimensional accuracy
4. Test layer adhesion with flex/break test

### Advanced Adhesion Techniques

#### Vertical Inter-Lock Prints
- Orient model to maximize layer contact area
- Rotate parts to align critical features vertically
- Consider printing in place with assembly in mind

#### Slow Layer Cooling
- Enclosure maintains ambient temperature
- Turn off part cooling fan for critical prints
- Use "cooldown" rather than "immediate cooling"
- Results in better crystalline structure for PETG/Nylon

#### Annealing
- Post-print heat treatment improves strength
- PLA: 60-80°C for 20-60 minutes
- PETG: 80-100°C for 30-60 minutes
- Nylon: 80-120°C for 1-2 hours
- Allow slow cooling in oven

## Material-Specific Adhesion Tips

### PLA
- Moderate temperature (200-220°C)
- Low fan for first layers
- Increase temp slightly for better bonding
- Annealing improves strength significantly

### PETG
- Higher temps (240-260°C) needed
- Low fan speed throughout
- Slower print speed helps bonding
- Not recommended for enclosed spaces due to moisture

### ABS/ASA
- High temperature (250-270°C)
- Enclosure essential for consistent temps
- No cooling fan for best adhesion
- Slower speeds (30-50 mm/s)

### TPU
- Lower temp (210-230°C)
- Very slow print speeds
- No cooling fan
- High extrusion multiplier (105-110%)

### Nylon
- High temp (250-280°C)
- Dry filament required (< 40% humidity)
- Enclosure recommended
- Low to no cooling

## Troubleshooting Layer Adhesion

| Problem | Solution |
|---------|----------|
| Delamination | Increase temp, reduce speed, reduce fan |
| Weak layers | Increase extrusion, slow down, increase temp |
| Layer splitting | Check filament for moisture, increase temp |
| Gaps between layers | Increase flow, check for clogging |
| Elephant foot | Reduce first layer temp, increase first layer height |
| Poor top surface | Use ironing, reduce fan, adjust temp |

## Testing Layer Adhesion

### Simple Flex Test
- Print small cube (20×20×20mm)
- Bend slowly to test layer bond
- Good adhesion: bends without cracking
- Poor adhesion: layers separate

### Break Test
- Print thin wall (0.4mm thick)
- Try to break by bending
- Evaluate break pattern
- Clean break = poor adhesion
- Frayed/burred break = good adhesion

### Torque Test
- Print cylindrical part
- Apply rotational force
- Check for layer separation
- Document torque at failure
