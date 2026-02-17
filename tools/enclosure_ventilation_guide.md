# Enclosure Ventilation Guide for Engineering Materials

This guide covers temperature recommendations, fan settings, and air filtration for printing ABS, ASA, and PC in enclosed spaces.

---

## Overview

ABS, ASA, and polycarbonate (PC) are engineering thermoplastics that require higher print temperatures and produce harmful fumes during printing. Proper enclosure ventilation is essential for:

- **Health Safety** - Reducing exposure to styrene (ABS/ASA) and isocyanates (PC)
- **Print Quality** - Maintaining stable temperatures to prevent warping
- **Fire Prevention** - Managing heat from the hotend and printed parts

| Material | Nozzle Temp | Bed Temp | Enclosure Temp | Enclosure Required |
|----------|-------------|----------|----------------|-------------------|
| ABS | 230-260°C | 90-110°C | 35-45°C | Yes |
| ASA | 240-260°C | 90-110°C | 35-45°C | Yes |
| PC | 260-300°C | 90-115°C | 40-55°C | Strongly Recommended |

---

## ABS (Acrylonitrile Butadiene Styrene)

### Temperature Recommendations

| Setting | Range | Notes |
|---------|-------|-------|
| Nozzle | 230-250°C | Start at 240°C, adjust based on layer adhesion |
| Bed | 90-110°C | Higher temps reduce warping |
| Enclosure | 35-45°C | Maintain with heated chamber or part cooling fans |

### Fan Settings

- **Part Cooling Fan**: 20-40% during first 3-5 layers, then increase to 50-70%
- **Layer Cooling**: Too much cooling causes warping; keep airflow minimal until layer adhesion is set
- **Direction**: Position fans to create gentle circular airflow, not direct gusts

### Ventilation Requirements

- **Minimum**: Window with fan pulling air out
- **Recommended**: Active charcoal filter with exhaust fan
- **Air Exchange**: 5-10 air changes per hour in the enclosure area

### Filament Notes

- Dry at 60-70°C for 4-6 hours before printing
- Store in airtight container with desiccant
- High impact resistance, prone to warping without enclosure

---

## ASA (Acrylonitrile Styrene Acrylate)

### Temperature Recommendations

| Setting | Range | Notes |
|---------|-------|-------|
| Nozzle | 240-260°C | Start at 250°C |
| Bed | 90-110°C | Similar to ABS but slightly higher |
| Enclosure | 35-45°C | UV resistant but still needs heat stability |

### Fan Settings

- **Part Cooling Fan**: 30-50% throughout print
- **First Layer**: 20% to ensure adhesion
- **Note**: ASA tolerates more fan than ABS due to better layer adhesion

### Ventilation Requirements

- **Minimum**: Basic exhaust near printer
- **Recommended**: HEPA + activated carbon filter combination
- **Air Exchange**: 5-10 air changes per hour
- **Special**: Better UV and weather resistance than ABS but similar fumes

### Filament Notes

- Dry at 60-80°C for 4-6 hours
- Less prone to warping than ABS
- Excellent outdoor durability

---

## PC (Polycarbonate)

### Temperature Recommendations

| Setting | Range | Notes |
|---------|-------|-------|
| Nozzle | 270-290°C | Start at 280°C; requires hotend rated for 300°C+ |
| Bed | 100-115°C | Higher bed temp critical for adhesion |
| Enclosure | 40-55°C | PC requires warmest enclosure temperature |

### Fan Settings

- **Part Cooling Fan**: 20-40% maximum
- **First Layers**: 10-15% only
- **Warning**: Excessive cooling causes delamination and cracking

### Ventilation Requirements

- **Critical**: PC produces isocyanates when overheated - proper ventilation is essential
- **Minimum**: Dedicated exhaust vent with fan
- **Recommended**: Full enclosure with active filtration system
- **Air Exchange**: 10-15 air changes per hour (higher than ABS/ASA)

### Filament Notes

- Dry at 80-100°C for 6-12 hours (PC absorbs moisture readily)
- Store with desiccant; dried filament essential
- Highest strength but requires most heat
- Can cause nozzle clogs if moisture present

---

## Air Filtration Solutions

### Basic Setup (Budget)

- **Window Exhaust Fan**: 80-120 CFM fans pulling air out
- **Setup**: Position fan to draw air away from the print area
- **Cost**: $20-50

### Mid-Range Setup (Recommended)

- **Components**:
  - 120mm PC case fan as exhaust (push or pull)
  - HVAC-grade activated carbon filter
  - Flexible ducting (4-inch diameter)
- **Setup**: Fan draws enclosure air through filter before exhausting
- **Cost**: $50-100

### High-Performance Setup (Enclosed Printer)

- **Components**:
  - HEPA filter (H13 grade minimum)
  - Activated carbon layer
  - 150-200 CFM exhaust fan
  - Temperature-controlled enclosure
  - Particle sensor for monitoring
- **Setup**: Closed-loop filtration maintaining positive pressure
- **Cost**: $150-300

### Filter Replacement Schedule

| Filter Type | Replacement Interval | Notes |
|-------------|---------------------|-------|
| Activated Carbon | Every 3-6 months | More frequent with heavy use |
| HEPA | Every 6-12 months | Check for discoloration |
| Combined HEPA/Carbon | Every 4-6 months | Depends on print volume |

---

## Enclosure Build Tips

### DIY Enclosure Options

1. **IKEA Lack Enclosure**: Inexpensive, holds temperature well with modifications
2. **Acrylic Panels**: Clear panels allow visibility, mount with extrusion profiles
3. **PETG Film**: Alternative to acrylic, less brittle

### Temperature Maintenance

- Use 120mm or 140mm fans on enclosure walls for gentle air circulation
- Consider ceramic heat lamp or 50W resistor for active heating in cold environments
- Seal gaps with weather stripping to maintain stable temperature

### Monitoring

- Install temperature sensor inside enclosure
- Use thermal camera to identify cold spots
- Add smoke detector near printer (never inside enclosure)

---

## Safety Checklist

- [ ] Enclosure maintains 35-45°C minimum for ABS/ASA, 40-55°C for PC
- [ ] Exhaust fan running before, during, and after print
- [ ] Carbon filter in place and within service life
- [ ] Room well-ventilated (open window recommended)
- [ ] Smoke detector installed near printer area
- [ ] Filament dried before printing
- [ ] No flammable materials inside enclosure
- [ ] Printer on non-flammable surface

---

## Troubleshooting

### Warping Despite Enclosure

- Increase enclosure temperature
- Check for drafts entering enclosure
- Ensure bed temperature is stable
- Use brim or raft

### Fumes Present

- Verify exhaust fan is working
- Check/replace carbon filter
- Ensure room window is open
- Reduce print temperature by 5°C

### Part Cooling Issues

- Too much fan: Warping, poor layer adhesion
- Too little fan: Stringing, elephant foot
- For ABS/ASA: Keep fan low for first 3-5 layers

### Nozzle Clogs (PC)

- Filament likely wet: Dry at 80-100°C for 6+ hours
- Temperature too low: Increase by 5-10°C
- Check thermal runaway protection

---

*Last Updated: 2025*
*Contribute: Open an issue or PR to improve this guide*
