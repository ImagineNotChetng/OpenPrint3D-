# Bridging Overhang Guide

Optimal settings for successful 3D printing bridges and overhangs. Bridging prints filament across gaps without support.

## Quick Settings Reference

| Parameter | PLA | PETG | ABS/ASA | TPU |
|-----------|-----|------|---------|-----|
| **Fan Speed** | 80-100% | 50-70% | 30-50% | 0-20% |
| **Bridges Speed** | 30-60 mm/s | 20-40 mm/s | 30-50 mm/s | 10-20 mm/s |
| **Nozzle Temp** | 190-210°C | 230-250°C | 240-260°C | 200-220°C |
| **Layer Height** | 0.2-0.28mm | 0.2-0.24mm | 0.2-0.28mm | 0.2mm |

## Parameter Details

### Fan Speed (Cooling)
- **Maximum cooling** is critical for bridging
- PLA: 80-100% for best results
- PETG: 50-70% (too high causes poor layer adhesion)
- ABS/ASA: 30-50% (prevents warping)
- TPU: 0-20% (needs heat to bond)
- Enable **fan always-on** for bridge perimeters

### Print Speed
- **Bridges**: Reduce to 50-70% of normal speed
- First layer of bridge: Even slower (50% of bridge speed)
- Formula: `bridge_speed = normal_speed × 0.5-0.7`
- Consistent speed improves bridge quality

### Temperature
- **Lower than normal** printing temp helps cooling
- PLA: 190-210°C (vs 200-220°C normal)
- PETG: 230-250°C (vs 240-260°C normal)
- ABS: 240-260°C (vs 250-270°C normal)
- Slightly cooler promotes faster solidification

### Layer Height
- **0.2mm standard** works well for most bridges
- Thicker layers (0.28mm) can improve bridge strength
- Thinner layers (0.12-0.16mm) cool faster but have less mass
- Keep bridge layer height consistent with perimeters

### Bridge Settings
- **Bridge flow**: 90-100% (slightly reduced helps prevent sagging)
- **Bridge overlap**: 15-25%
- **Only one wall** on bridges when possible
- **Fill gaps** between perimeters for better cooling

## Support Suggestions

### When to Use Supports
- Overhangs > 60° from vertical
- Bridges > 10mm without support
- Complex geometry with internal cavities
- Low bed adhesion scenarios

### Support Settings
- **Support type**: Tree (organic) for overhangs
- **Support density**: 10-15% for standard
- **Support interface**: 0mm gap for easy removal
- **Support roof**: 0 layers (for overhangs)
- **Support floor**: 0-1 layers

### Advanced Support Techniques
- **Variable layer height** approaching supports
- **Support enforcers** for critical areas
- **Pillar size**: 1-2mm for easy removal
- **Support angle**: 45-60° (lower = more supports)

## Material-Specific Tips

### PLA (Best Bridging)
- Excellent bridging material
- Use 100% fan for gaps < 20mm
- Can bridge 50mm+ with optimal cooling
- Lower temp (190°C) for better cooling

### PETG
- Moderate bridging capability
- Balance fan (50-70%) with layer adhesion
- Bridge gaps < 30mm
- May need slight overextrusion

### ABS/ASA
- Requires enclosure for best results
- Lower fan (30-50%) to prevent warping
- Bridge gaps < 20mm
- Higher temps needed for bonding

### TPU
- Poor bridging material
- Use supports for any gap > 5mm
- Very slow speeds required
- Consider print orientation

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Sagging middle | Increase fan, lower temp, slow down |
| Poor layer adhesion (PETG) | Reduce fan, increase temp |
| Stringing on bridges | Reduce temp, increase retraction |
| Curling ends | Increase fan, use brim |
| Weak bridges | Increase extrusion, use thicker layers |

## Print Orientation Tips

- **Rotate model** so bridges align with axis with less wobble
- **Align bridges** with Y-axis if Y is more stable
- **Minimize bridge length** in print orientation
- **Use model cut** to split long bridges into shorter sections

## Calibration Test

Print a bridging test tower:
- Test bridges from 5mm to 50mm in 5mm increments
- Adjust fan and speed for your specific filament
- Document optimal settings for future reference
