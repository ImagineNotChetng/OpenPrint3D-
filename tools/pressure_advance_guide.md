# Pressure Advance Tuning Guide

Pressure Advance (PA) compensates for the delay between extruder movement and actual filament flow. Proper PA calibration eliminates blobs, improves corner quality, and ensures consistent extrusion.

## Quick Start

```bash
# Direct Drive (typical PA: 0.02-0.06)
python tools/pressure_advance_tuner.py --hotend direct --bed-temp 60 --nozzle-temp 210

# Bowden (typical PA: 0.3-0.7)
python tools/pressure_advance_tuner.py --hotend bowden --bed-temp 60 --nozzle-temp 210

# Custom range
python tools/pressure_advance_tuner.py --hotend direct --min-pa 0.0 --max-pa 0.08 --step 0.005 -o pa_test.gcode
```

## What is Pressure Advance?

Pressure advance compensates for the pressure that builds up in the nozzle during printing:
- **Without PA**: Filament pressure causes over-extrusion at end of moves, under-extrusion at start
- **With PA**: Extruder anticipates pressure changes, resulting in consistent extrusion

### Symptoms of Incorrect PA

| Symptom | Cause |
|---------|-------|
| Bulging corners | PA too low |
| Gaps at line starts | PA too low |
| Under-extrusion after corners | PA too low |
| Thin lines after direction change | PA too high |
| Grinding extruder sounds | PA too high |

---

## Direct Drive Setup

### Characteristics
- Short filament path (30-80mm from gears to nozzle)
- Fast pressure response
- Low PA values typical
- Common extruders: Bondtech, Orbiter, Hemera, Titan

### Recommended Settings

| Parameter | Value |
|-----------|-------|
| PA Range | 0.0 - 0.10 |
| PA Step | 0.005 - 0.010 |
| Typical PA | 0.02 - 0.06 |
| Smooth Time | 0.040s |

### Generating Test G-code

```bash
# Standard direct drive test
python tools/pressure_advance_tuner.py \
    --hotend direct \
    --min-pa 0.0 \
    --max-pa 0.10 \
    --step 0.005 \
    --nozzle-temp 210 \
    --bed-temp 60 \
    -o pa_direct.gcode
```

### Expected Results

**PA = 0.00 (No compensation)**
- Bulging at corners
- Inconsistent line width
- Blobs at segment ends

**PA = 0.02-0.04 (Low)**
- Slight improvement
- May still see corner issues

**PA = 0.04-0.06 (Optimal range)**
- Sharp corners
- Consistent line width
- Clean starts and stops

**PA = 0.08+ (Too high)**
- Thinned corners
- Possible extruder skipping

### Direct Drive Specific Tips

1. **Start with PA = 0.04** as baseline
2. Fine-tune in 0.005 increments
3. Lighter extruders (Orbiter) may need lower values
4. Heavier setups (Hemera) may need slightly higher values

---

## Bowden Setup

### Characteristics
- Long filament path (400-800mm total)
- Significant pressure delay
- Higher PA values required
- More sensitive to PA changes

### Recommended Settings

| Parameter | Value |
|-----------|-------|
| PA Range | 0.0 - 1.0 |
| PA Step | 0.02 - 0.05 |
| Typical PA | 0.3 - 0.7 |
| Smooth Time | 0.040s |

### Generating Test G-code

```bash
# Standard bowden test
python tools/pressure_advance_tuner.py \
    --hotend bowden \
    --min-pa 0.0 \
    --max-pa 1.0 \
    --step 0.02 \
    --nozzle-temp 210 \
    --bed-temp 60 \
    -o pa_bowden.gcode
```

### Expected Results

**PA = 0.0 (No compensation)**
- Severe corner bulging
- Very inconsistent extrusion
- Stringing at segment ends

**PA = 0.2-0.3 (Low)**
- Improvement but issues remain
- Corners still slightly bulged

**PA = 0.4-0.6 (Optimal range)**
- Clean corners
- Consistent extrusion
- Best overall quality

**PA = 0.8+ (Too high)**
- Under-extrusion at corners
- Possible extruder issues

### Bowden Specific Tips

1. **Start with PA = 0.5** as baseline
2. Fine-tune in 0.02-0.05 increments
3. Shorter bowden tubes need lower PA
4. PTFE tube condition affects PA - replace if worn
5. Tube inner diameter affects results

---

## Test Procedure

### Step 1: Prepare Printer

1. Ensure printer is properly calibrated
2. Clean nozzle thoroughly
3. Verify extruder steps/mm calibration
4. Disable any existing PA in config

### Step 2: Generate and Print

```bash
# Generate test file
python tools/pressure_advance_tuner.py --hotend direct -o pa_test.gcode

# Transfer to printer and print
```

### Step 3: Evaluate Results

1. **Line Consistency Test**: Look for uniform line width
2. **Corner Test**: Check for bulging or thinning at corners
3. **Speed Test**: Verify consistent quality across speeds

### Step 4: Apply Settings

Edit your `printer.cfg`:

```ini
[extruder]
step_pin: ...
dir_pin: ...
...
pressure_advance: 0.045    # Your calibrated value
pressure_advance_smooth_time: 0.040
```

Then restart firmware: `FIRMWARE_RESTART`

---

## Fine-Tuning

### If corners are still bulging
- Increase PA by 0.005 (direct) or 0.02 (bowden)

### If corners are thin/under-extruded
- Decrease PA by 0.005 (direct) or 0.02 (bowden)

### If extruder is skipping
- PA may be too high - reduce value
- Check extruder motor current

### Speed Considerations

Test at multiple speeds:
```bash
python tools/pressure_advance_tuner.py \
    --hotend direct \
    --speed 100 \
    --nozzle-temp 210
```

PA may need slight adjustment for very high or low speeds.

---

## Material-Specific Notes

| Material | PA Behavior |
|----------|-------------|
| PLA | Standard PA values work well |
| PETG | May need slightly lower PA |
| ABS | Standard to slightly higher PA |
| TPU | Lower PA, more stringing tolerance |
| Nylon | Higher PA often needed |
| PC | Similar to ABS |

### Temperature Effects

Higher temperatures may require:
- Slightly higher PA values
- More fine-tuning

---

## Troubleshooting

### No SET_PRESSURE_ADVANCE command
- Ensure Klipper firmware is installed
- Check `[extruder]` section exists in config

### Test shows no difference between sections
- Verify PA is actually changing (check console during print)
- Ensure `[extruder]` is properly configured
- Check for conflicting settings

### Results vary between prints
- Check for loose belts or pulleys
- Verify extruder gear condition
- Ensure consistent filament diameter

### PA causes extruder grinding
- Reduce PA value
- Increase extruder motor current
- Check for extruder mechanical issues

---

## Reference Values by Setup

### Direct Drive Extruders

| Extruder | Typical PA | Notes |
|----------|------------|-------|
| Orbiter 2.0 | 0.03 - 0.05 | Very short path |
| Bondtech LGX | 0.03 - 0.05 | Compact design |
| Hemera | 0.04 - 0.07 | Integrated design |
| Titan | 0.04 - 0.06 | Standard direct |
| BMG | 0.03 - 0.06 | Common upgrade |

### Bowden Setups

| Tube Length | Typical PA | Notes |
|-------------|------------|-------|
| 400mm | 0.35 - 0.50 | Short bowden |
| 600mm | 0.45 - 0.60 | Standard length |
| 800mm+ | 0.55 - 0.80 | Long bowden |

---

## Advanced: Smooth Time

The `smooth_time` parameter controls how quickly PA changes are applied:

```bash
python tools/pressure_advance_tuner.py \
    --hotend direct \
    --smooth-time 0.040
```

| Value | Effect |
|-------|--------|
| 0.020 | More aggressive, sharper corners |
| 0.040 | Default, balanced |
| 0.080 | Smoother, may blur corners |

Generally, leave at default (0.040s) unless troubleshooting specific issues.

---

## Calibration Checklist

- [ ] Extruder steps/mm calibrated
- [ ] E-steps verified with 100mm test
- [ ] Nozzle clean and not worn
- [ ] Filament diameter consistent
- [ ] Belts properly tensioned
- [ ] PTFE tubes in good condition (bowden)
- [ ] Nozzle temperature optimized
- [ ] Test g-code generated and printed
- [ ] Best section identified
- [ ] PA value applied to config
- [ ] Firmware restarted
- [ ] Test print verified
