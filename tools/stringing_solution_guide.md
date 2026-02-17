# Stringing Solution Guide

Comprehensive guide to eliminating stringing, oozing, and blobbing in 3D prints. Stringing occurs when molten filament stretches between printed areas during travel moves.

## Quick Settings Reference

| Material | Retraction Distance | Retraction Speed | Nozzle Temp | Fan Speed | Z-Hop |
|----------|---------------------|------------------|-------------|-----------|-------|
| **PLA** | 0.5-1.0mm | 25-45mm/s | 190-210°C | 0-30% | 0.2-0.4mm |
| **PETG** | 1.0-2.0mm | 20-35mm/s | 230-250°C | 0-20% | 0.2-0.4mm |
| **ABS** | 1.0-2.0mm | 25-40mm/s | 240-260°C | 0-15% | 0.2-0.4mm |
| **ASA** | 1.0-2.0mm | 25-40mm/s | 240-260°C | 0-15% | 0.2-0.4mm |
| **TPU** | 0.3-0.8mm | 10-25mm/s | 205-225°C | 0-10% | 0-0.2mm |
| **Nylon** | 1.5-3.0mm | 20-35mm/s | 245-270°C | 0-20% | 0.3-0.5mm |
| **PC** | 1.5-3.0mm | 20-35mm/s | 270-295°C | 0-15% | 0.3-0.5mm |
| **PEEK** | 2.0-4.0mm | 15-30mm/s | 310-340°C | 0-15% | 0.4-0.6mm |
| **PP** | 1.5-2.5mm | 20-35mm/s | 235-255°C | 0-15% | 0.2-0.4mm |
| **PVB** | 1.0-2.0mm | 20-35mm/s | 215-235°C | 30-50% | 0.2-0.4mm |
| **POM** | 1.0-2.0mm | 25-40mm/s | 215-235°C | 0-15% | 0.2-0.4mm |

## Retraction Optimization

### What is Retraction?
Retraction pulls filament back from the nozzle during travel moves to prevent oozing. Proper retraction is the primary defense against stringing.

### Key Parameters

#### Retraction Distance
- **Direct drive**: 1-3mm typically sufficient
- **Bowden tube**: 4-8mm required due to tube length
- **Longer travel moves**: Increase distance slightly
- **Too short**: Stringing between perimeters
- **Too long**: Extruder skipping, grinding, moisture issues

#### Retraction Speed
- **Faster (40-60mm/s)**: Cleaner retractions, less stringing
- **Slower (20-30mm/s)**: More reliable, better for flexibles
- **Balance**: Too fast can cause grinding, too slow causes stringing
- **Formula**: `retraction_speed = min(50, bowden_length × 3)`

#### Extra Restart Distance
- **Negative value**: Compensates forooze during travel (e.g., -0.05mm)
- **Positive value**: Adds filament after restart for better joints
- **Tune**: Start at 0, adjust ±0.02mm based on results

#### Retraction Minimum Travel
- **Default**: 0.5-1.0mm
- **Disable for short moves**: Prevents excessive retractions
- **Higher values**: Fewer retractions, more stringing on short moves

### Retraction Settings by Extruder Type

#### Direct Drive
| Material | Distance | Speed | Notes |
|----------|----------|-------|-------|
| PLA | 0.5-1.0mm | 30-45mm/s | Minimal retraction needed |
| PETG | 1.0-1.5mm | 25-35mm/s | More retraction than PLA |
| ABS | 1.0-1.5mm | 30-40mm/s | Standard retraction |
| TPU | 0.3-0.6mm | 15-25mm/s | Low speed, short distance |
| Nylon | 1.5-2.5mm | 25-35mm/s | Higher for moisture |

#### Bowden Tube ( >500mm)
| Material | Distance | Speed | Notes |
|----------|----------|-------|-------|
| PLA | 3-5mm | 40-60mm/s | Compensate for tube length |
| PETG | 5-7mm | 35-50mm/s | More critical with Bowden |
| ABS | 5-7mm | 40-55mm/s | High speed helps |
| TPU | 1-3mm | 20-30mm/s | Avoid Bowden for TPU |
| Nylon | 6-8mm | 30-45mm/s | Extra length for moisture |

### Coast and Wipe Settings

#### Coast
- **What it does**: Stops extrusion slightly before travel move
- **When to use**: Strings persist with good retraction
- **Typical value**: 0.1-0.3mm
- **Risk**: Under-extrusion at travel destinations

#### Wipe
- **What it does**: Moves nozzle slightly along previous path while retracting
- **Effectiveness**: Reduces stringing by 30-50%
- **Enable**: For persistent stringing issues
- **Risk**: May affect surface finish

## Temperature Tuning

### Temperature vs Stringing Relationship

Higher temperatures reduce viscosity, making filament more likely to ooze. Lower temperatures increase viscosity but can cause other issues.

### Optimal Temperature Ranges for Stringing

| Material | Optimal Stringing Temp | Signs Too Hot | Signs Too Cold |
|----------|------------------------|---------------|----------------|
| **PLA** | 190-200°C | Heavy stringing, blobs | Poor layer adhesion |
| **PETG** | 235-245°C | Stringing, poor bridging | Under-extrusion |
| **ABS** | 245-255°C | Stringing, elephant foot | Layer separation |
| **ASA** | 245-255°C | Stringing, bubbling | Poor adhesion |
| **TPU** | 210-220°C | Heavy stringing | Rough surfaces |
| **Nylon** | 255-265°C | Stringing, smoking | Clicking, voids |

### Temperature Reduction Strategy

When stringing persists:
1. **Reduce temp by 5°C** increments
2. **Check layer adhesion** after each change
3. **Minimum temp**: 10°C above filament's softening point
4. **Balance**: Find lowest temp with acceptable adhesion

### Temperature Tower Calibration

Print a temperature tower:
- Start at 240°C (top), descend by 5°C per step
- Evaluate stringing at each temperature
- Select lowest temp with minimal stringing and good layers
- Document for future reference

### Advanced Temperature Tips

#### PID Tuning
- Run PID tuning for accurate temperature control
- Command: `M303 E0 S200 C5` (200°C for PLA)
- Reduces temperature overshoot/undershoot
- Prevents oozing from temperature fluctuations

#### Temperature Regression
- Start hotter for first layer (better bed adhesion)
- Reduce temperature by 5-10°C after first layer
- Use `M104 Sxxx` in layer change scripts

## Fan Settings

### Fan Speed Impact on Stringing

| Fan Speed | Effect on Stringing | Trade-off |
|-----------|---------------------|-----------|
| **0%** | Maximum stringing | Best layer adhesion |
| **10-30%** | Moderate stringing | Good balance for PLA |
| **30-50%** | Reduced stringing | May affect bridging |
| **50-100%** | Minimal stringing | Risk of poor layer adhesion |

### Material-Specific Fan Recommendations

#### PLA
- **First layer**: 0%
- **Layers 2-3**: 30-50%
- **Layers 4+**: 50-100%
- **Note**: Higher fan reduces stringing significantly
- **Caution**: 100% fan on thinwalled prints may cause cracking

#### PETG
- **First layer**: 0%
- **Layers 2+**: 0-20%
- **Note**: Low fan needed for layer bonding
- **Trade-off**: Some stringing acceptable for adhesion
- **Tip**: Part cooling fan on infill only helps

#### ABS/ASA
- **First layer**: 0%
- **Layers 2+**: 0-15%
- **Note**: Minimal fan prevents warping
- **Strategy**: Accept some stringing, control warping
- **Enclosure**: Reduces need for any fan

#### TPU
- **First layer**: 0%
- **Layers 2+**: 0-10%
- **Note**: Almost no fan needed
- **Trade-off**: Stringing is common with TPU
- **Tip**: Use enclosure to reduce cooling rate

#### Nylon
- **First layer**: 0%
- **Layers 2+**: 0-15%
- **Note**: Minimal fan prevents warping
- **Enclosure**: Essential for best results

#### High-Temp Materials (PC, PEEK)
- **First layer**: 0%
- **Layers 2+**: 0-10%
- **Note**: Keep heated chamber instead of fan

### Fan Control Strategies

#### Layer-Based Fan
```gcode
; Set fan based on layer
{if layer_num == 1}
M107 ; Fan off for first layer
{elsif layer_num < 4}
M106 S128 ; 50% fan for layers 2-3
{else}
M106 S255 ; 100% fan from layer 4
{endif}
```

#### Sparse Infill Cooling
- Enable fan only during infill
- Reduces stringing without affecting perimeters
- Better for PETG and ABS

## Z-Hop

### What is Z-Hop?
Temporarily lifts the nozzle during travel moves to prevent scraping and reduce stringing.

### Z-Hop Settings

| Material | Z-Hop Height | Z-Hop Speed |
|----------|--------------|-------------|
| PLA | 0.2-0.4mm | 5-10mm/s |
| PETG | 0.2-0.4mm | 5-10mm/s |
| ABS | 0.2-0.4mm | 5-10mm/s |
| TPU | 0-0.2mm | 3-5mm/s |
| Nylon | 0.3-0.5mm | 5-8mm/s |

### Z-Hop Considerations
- **Enable**: Default for most materials
- **Disable**: When print has very smooth top surfaces
- **Height**: Match layer height × 1-2
- **Speed**: Slower is more reliable, may add print time

## Comprehensive Material Settings

### PLA Settings
```
Retraction Distance: 0.6-1.0mm
Retraction Speed: 35-45mm/s
Extra Restart Distance: -0.02 to 0mm
Nozzle Temperature: 190-205°C
Fan Speed: 50-100% (layer 3+)
Z-Hop: 0.2-0.3mm
Coasting: 0.1-0.2mm
```

### PETG Settings
```
Retraction Distance: 1.0-2.0mm
Retraction Speed: 25-35mm/s
Extra Restart Distance: -0.02 to +0.02mm
Nozzle Temperature: 235-250°C
Fan Speed: 10-20% (layer 3+)
Z-Hop: 0.2-0.3mm
Coasting: 0.05-0.1mm
```

### ABS Settings
```
Retraction Distance: 1.0-2.0mm
Retraction Speed: 30-40mm/s
Extra Restart Distance: -0.02 to 0mm
Nozzle Temperature: 245-260°C
Fan Speed: 0-10%
Z-Hop: 0.2-0.3mm
Coasting: 0.1-0.2mm
Enclosure: Recommended
```

### TPU Settings
```
Retraction Distance: 0.3-0.8mm
Retraction Speed: 15-25mm/s
Extra Restart Distance: 0 to +0.02mm
Nozzle Temperature: 210-225°C
Fan Speed: 0-10%
Z-Hop: 0.1-0.2mm
Coasting: 0mm
Note: Direct drive strongly recommended
```

### Nylon Settings
```
Retraction Distance: 1.5-3.0mm
Retraction Speed: 25-35mm/s
Extra Restart Distance: -0.02 to +0.02mm
Nozzle Temperature: 255-275°C
Fan Speed: 0-15%
Z-Hop: 0.3-0.4mm
Coasting: 0.1-0.2mm
Enclosure: Required
Drying: 80°C for 4-6 hours before printing
```

## Step-by-Step Optimization Process

### Step 1: Temperature Baseline
1. Print temperature tower or stringing test
2. Start 10°C above recommended
3. Reduce by 5°C until stringing resolves
4. Ensure layer adhesion remains acceptable

### Step 2: Retraction Tuning
1. Start with recommended values for your extruder
2. If stringing persists: Increase retraction distance by 0.2mm
3. If grinding/clicking: Reduce distance or increase speed
4. Fine-tune with extra restart distance

### Step 3: Fan Adjustment
1. Start with recommended fan settings
2. Increase fan for PLA if stringing persists
3. Keep fan low for PETG/ABS unless bridging
4. Adjust layer timing for transitions

### Step 4: Z-Hop and Coasting
1. Enable Z-hop if nozzle scrapes
2. Add coasting if strings persist with good retraction
3. Keep values conservative to avoid other issues

### Step 5: Final Tuning
1. Print test with all settings
2. Check for stringing in travel paths
3. Check for under-extrusion at travel destinations
4. Fine-tune extra restart distance

## Troubleshooting Stringing

| Symptom | Cause | Solution |
|---------|-------|----------|
| Fine strings between all points | Temperature too high | Reduce temp by 5-10°C |
| Thick strings on travel moves | Retraction insufficient | Increase distance/speed |
| Strings only on long travels | Retraction distance | Increase distance |
| Strings only on short travels | Retraction min travel | Lower minimum travel |
| Strings with oozing blobs | Temperature + retraction | Lower temp, increase retraction |
| Stringing worse on first layer | Bed temp too high | Lower bed temp slightly |
| Strings return after temperature fix | Nozzle too close | Increase nozzle offset |

## Test Prints

### Stringing Test Cube
- Print cube with gap in corners
- Travel moves between corners expose stringing
- Evaluate after cooling (strings more visible)

### Temp Tower with Travel Moves
- Combined temperature and stringing test
- Shows optimal temp for your specific filament
- Include travel moves between towers

### Retraction Calibration
- Print with varying retraction distances
- Test range from 0.5mm to 8mm (Bowden)
- Evaluate stringing at each section

## Advanced Tips

### Travel Speed
- Faster travel = less time for oozing
- Recommended: 150-200mm/s for travel
- Formula: `travel_speed = min(200, nozzle_diameter × 40)`

### Combing
- **Combing mode**: Avoid travel within infill
- **Combing within perimeter**: Prevents external travel marks
- **Combing off**: May reduce stringing (more travel through air)

### Wipe Before Retraction
- Wipes nozzle on recent extrusion
- Reduces stringing 30-50%
- Enable in slicer advanced settings

### Pressure Advance
- Linear advance/pressure advance affects oozing
- Proper tuning reduces stringing
- See Linear Advance Calibration Guide

### Filament Storage
- Moisture causes bubbling and stringing
- Dry nylon, PETG, PEEK at 70-80°C for 4-12 hours
- Store in airtight containers with desiccant
