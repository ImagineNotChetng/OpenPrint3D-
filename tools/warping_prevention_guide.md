# Warping Prevention Guide

Warping is one of the most common issues when printing engineering thermoplastics. This guide covers prevention strategies for ABS, ASA, PC (Polycarbonate), and Nylon—materials known for their high thermal shrinkage rates.

## Quick Reference Table

| Material | Bed Temp | Enclosure | Adhesion Method | Cooling | Difficulty |
|----------|----------|-----------|-----------------|---------|------------|
| **ABS** | 90-110°C | Required | PEI/Glue/Hairspray | Minimal | Moderate |
| **ASA** | 90-110°C | Recommended | PEI/Glue/Hairspray | Minimal | Moderate |
| **PC** | 100-120°C | Required | PEI + Glue/CA | Minimal | Hard |
| **Nylon** | 70-100°C | Required | Glue/PVA | Moderate | Hard |

---

## ABS

### Why It Warps
ABS has a high coefficient of thermal expansion. As layers cool, the differential shrinkage creates internal stresses that lift corners and edges.

### Bed Temperature
- **First layer**: 100-110°C
- **Subsequent layers**: 90-100°C
- **Ambient inside enclosure**: 35-45°C

### Adhesion Methods
1. **PEI sheet** (best): Clean with isopropyl alcohol, warm bed to 100°C before print
2. **Glue stick**: Apply thin layer, let dry slightly before printing
3. **Hairspray**: Light coat on glass/PEI, reapply between prints
4. **ABS slurry**: Mix acetone + ABS scraps, apply to bed

### Cooling Strategy
- **Layer 1-3**: 0% cooling fan
- **Remaining layers**: 10-20% cooling
- Keep enclosure temperature stable—no drafts

### Enclosure Tips
- Maintain 35-45°C internal temp
- Print in a closed chamber, not near HVAC vents
- Allow part to cool inside enclosure before opening (30+ min)

---

## ASA

### Why It Warps
Similar to ABS but slightly less prone to warping. Still requires careful temperature management.

### Bed Temperature
- **First layer**: 95-110°C
- **Subsequent layers**: 90-100°C
- **Ambient inside enclosure**: 30-40°C

### Adhesion Methods
1. **PEI sheet**: Clean surface, best results
2. **Glue stick**: Reliable, easy cleanup
3. **Hairspray**: Works on glass surfaces
4. **Magigoo PC**: Specifically formulated for engineering materials

### Cooling Strategy
- **Layer 1-3**: 0% cooling fan
- **Remaining layers**: 10-30% cooling (higher than ABS)
- ASA tolerates slightly more cooling than ABS

### Enclosure Tips
- Less critical than ABS but recommended
- Provides UV resistance, so enclosure helps with consistency
- Keep away from direct sunlight during printing

---

## PC (Polycarbonate)

### Why It Warps
Highest thermal shrinkage of common filaments. Requires very high bed temps and stable thermal environment.

### Bed Temperature
- **First layer**: 110-120°C
- **Subsequent layers**: 100-115°C
- **Ambient inside enclosure**: 40-55°C

### Adhesion Methods
1. **PEI + glue/CA**: Apply thin CA glue or Magigoo PC to PEI surface
2. **Kapton tape**: Build surface with multiple layers
3. **PC sheet**: PC-ISO bed material provides excellent adhesion
4. **Glue stick**: Works but may cause adhesion issues on first layer

### Cooling Strategy
- **Layer 1-5**: 0% cooling fan
- **Remaining layers**: 10-20% cooling maximum
- Excessive cooling causes delamination and warping

### Enclosure Tips
- **Essential** for successful PC prints
- Maintain 40-55°C inside enclosure
- Use enclosure heater if ambient temp is low
- Pre-heat enclosure for 15-20 minutes before printing
- Keep door closed throughout entire print

---

## Nylon

### Why It Warps
Nylon shrinks significantly and absorbs moisture rapidly—both cause warping. Dry filament is critical.

### Bed Temperature
- **First layer**: 80-100°C
- **Subsequent layers**: 70-90°C
- **Ambient inside enclosure**: 35-45°C

### Adhesion Methods
1. **PVA glue stick**: Best for nylon adhesion
2. **Nylon build plate**: Dedicated nylon PEI sheet
3. **PEI + hairspray**: Works but less reliable
4. **Glue stick + kapton**: Enhanced adhesion

### Cooling Strategy
- **Layer 1-3**: 0% cooling
- **Remaining layers**: 30-50% cooling (can use higher than ABS/PC)
- Nylon benefits from more active cooling to reduce warping

### Enclosure Tips
- **Essential** for large prints
- Maintain stable temperature, avoid fluctuations
- Consider active ventilation for smoke/fumes
- Pre-dry filament for 8-12 hours minimum

---

## Universal Warping Prevention Tips

### Before Printing
1. **Dry your filament**: Wet filament causes bubbling and poor adhesion
2. **Level and clean bed**: Debris and oils cause first-layer adhesion failures
3. **Warm up system**: Heat bed and enclosure 15-20 min before starting
4. **Use brim/raft**: Add 10-20mm brim for large parts

### During Printing
1. **Avoid drafts**: No open windows, fans, or AC blowing on printer
2. **Maintain enclosure temp**: Monitor with thermometer inside chamber
3. **Don't open enclosure**: Every opening causes temperature drop
4. **Slow down first layers**: Give extra time for initial adhesion

### Printer Settings
- **Bed adhesion**: Enable ` Brim` or `Raft` for parts >50mm
- **Z-hop**: Disable or minimize to improve first-layer squish
- **Nozzle temp**: Use lower end of recommended range to reduce thermal stress

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Corners lifting | Low bed temp | Increase 5-10°C |
| Corners lifting | Wet filament | Dry filament 8-12h |
| Edge lifting | Drafts/enclosure issues | Check seal, move printer |
| Complete separation | Bed not clean | Clean with IPA, reapply adhesive |
| Uneven warping | Unstable enclosure temp | Add enclosure heater |
| Center lifting | Nozzle too far | Re-level, adjust Z-offset |

---

## Recommended Profiles

For PrusaSlicer/SuperSlicer, enable "Force volumetric extrusion" and adjust:
- **First layer speed**: 25-30% of normal
- **First layer bed temp**: +5-10°C above rest
- **Perimeter overlaps**: 25-35% for better layer bonding
