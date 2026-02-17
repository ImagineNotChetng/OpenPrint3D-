# Vibration Compensation Guide: Input Shaping and Resonance Tuning

This guide covers vibration compensation techniques for Klipper-based 3D printers, focusing on input shaping and resonance tuning to improve print quality and reduce ringing.

---

## Overview

Vibration compensation addresses resonant vibrations that cause:
- Ringing/ghosting on print surfaces
- Reduced print speeds
- Mechanical stress on components
- Audible printer noise

Input shaping is the primary method in Klipper for mitigating these vibrations.

---

## Prerequisites

### Required Hardware
- ADXL345 accelerometer (or compatible)
- Mounting hardware for accelerometer
- SPI cable for accelerometer connection

### Recommended ADXL345 Mount Positions
| Axis | Position | Notes |
|------|----------|-------|
| X | On X carriage near nozzle | Most common |
| Y | On Y carriage or bed | Alternative |
| Z | Above X motor | For Z resonance |

---

## Klipper Configuration

### 1. Enable Input Shaping

Add to `printer.cfg`:

```ini
[input_shaper]
shaper_type: zv

[resonance_tester]
accel_chip: adxl345
probe_points:
    100, 100, 20  # Adjust to your bed center
    100, 200, 20
    200, 100, 20
```

### 2. Accelerometer Configuration

```ini
[adxl345]
cs_pin: arduino:cs
spi_speed: 5000000
spi_bus: spidev0.0

[mpu6000]
cs_pin: rpi:cs1
spi_speed: 5000000
spi_bus: spidev1.0
```

Common CS pin configurations:
- `arctic:cs` - BigTreeTech SKR
- `octopus:cs` - BTT Octopus
- `rpi:cs` - Raspberry Pi GPIO
- `arduino:cs` - Arduino header

---

## Running Resonance Tests

### Step 1: Verify Accelerometer

SSH to printer and run:

```bash
cd ~/klipper
sudo service klipper stop
python scripts/adxl345.py
```

Expected output: Continuous data stream showing x, y, z values changing with movement.

### Step 2: Test X-Axis Resonance

```bash
python scripts/resonance_tester.py -x
```

This excites the X-axis across a frequency range and measures response.

### Step 3: Test Y-Axis Resonance

```bash
python scripts/resonance_tester.py -y
```

### Step 4: Process Results

The script generates:
- `calibration_data.resonances` - Raw data
- Graphs showing frequency response

---

## Analyzing Results

### Reading Resonance Graphs

Look for:
- **Peak frequencies** - Where amplitude is highest
- **Resonance valleys** - Frequencies to avoid
- **Bandwidth** - Range of concerning frequencies

### Example Resonance Profile

| Axis | Primary Resonance | Secondary | Recommended Shaper |
|------|-------------------|-----------|-------------------|
| X | 40-50 Hz | 80-100 Hz | zv |
| Y | 35-45 Hz | 70-90 Hz | zv |
| Z | 100-150 Hz | N/A | ei |

---

## Input Shaper Types

| Shaper | Pros | Cons | Best For |
|--------|------|------|----------|
| ZV | Simple, low latency | Limited smoothing | Low mass X/Y |
| ZVD | Better smoothing | Higher latency | Moderate mass |
| EI | Best smoothing | Highest latency | Heavy beds |
| 2HUMP_EI | Excellent smoothing | Higher computational | Very heavy beds |
| MZV | Balanced | Medium complexity | General use |

### Recommended Starting Points

```ini
[input_shaper]
shaper_type: zv  # Start here
shaper_freq: 45  # Adjust based on test results
```

---

## Tuning Process

### Method 1: Frequency Sweep

```bash
python scripts/resonance_tester.py -x -a 2000
```

Lower acceleration gives more resolution in lower frequencies.

### Method 2: Manual Frequency Selection

1. Run resonance test
2. Identify dominant frequency peaks
3. Set shaper frequency to 80-90% of lowest peak
4. Test print and evaluate

### Method 3: Auto-Tuning

```bash
python scripts/calibrate_shaper.py
```

Automatically determines optimal shaper type and frequency.

---

## Recommended Values by Printer Type

### CoreXY (Common)

| Setting | Value | Notes |
|---------|-------|-------|
| shaper_type | zv or ei | Depends on mass |
| shaper_freq_x | 40-60 Hz | After testing |
| shaper_freq_y | 35-55 Hz | After testing |
| max_accel | 2000-3000 | With input shaping |
| max_accel_to_decel | 2000-3000 | Match max_accel |

### Cartesian

| Setting | Value | Notes |
|---------|-------|-------|
| shaper_type | zv | Lower mass |
| shaper_freq_x | 50-70 Hz | Higher than CoreXY |
| shaper_freq_y | 45-65 Hz | Higher than CoreXY |
| max_accel | 3000-4000 | Lighter mass |

### Heavy Bed (BLTouch, PEI Sheet)

| Setting | Value | Notes |
|---------|-------|-------|
| shaper_type | ei or 2hump_ei | More smoothing needed |
| shaper_freq_x | 30-45 Hz | Lower due to mass |
| shaper_freq_y | 30-45 Hz | Lower due to mass |
| max_accel | 1500-2000 | Reduce for stability |

---

## Advanced Settings

### Per-Axis Configuration

```ini
[input_shaper]
shaper_type_x: ei
shaper_freq_x: 45
shaper_type_y: zv
shaper_freq_y: 40
shaper_type_z: zv
shaper_freq_z: 120
```

### Damping Ratio

```ini
[input_shaper]
shaper_type: ei2
shaper_freq: 45
damping_ratio: 0.1  # Lower = less damping, Higher = more smoothing
```

### Input Shaping with Pressure Advance

Input shaping is compatible with pressure advance. Recommended order:
1. Tune pressure advance first
2. Run resonance tests
3. Configure input shaping
4. Fine-tune if needed

---

## Troubleshooting

### Ringing Persists

1. **Increase shaper smoothing** - Try EI or 2HUMP_EI
2. **Lower shaper frequency** - Move 10-20% below resonance
3. **Reduce print speed** - Especially on perimeters
4. **Check accelerometer mounting** - Must be secure
5. **Increase max_accel_to_decel** - Allows faster deceleration

### Ringing Worsened

1. **Shaper frequency too high** - Set below resonance peak
2. **Wrong shaper type** - Try simpler shaper (ZV instead of EI)
3. **Accelerometer noise** - Check wiring, reduce cable length

### Ghosting on One Axis Only

- Check if input shaping is enabled for that axis
- Verify accelerometer data for that axis
- Resonance may be at different frequency

### Calibration Errors

```
Error: Cannot measure resonance
```

Solutions:
- Verify accelerometer chip ID (should be 0xE5 for ADXL345)
- Check SPI wiring (MOSI, MISO, SCK, CS)
- Verify SPI speed is within accelerometer limits
- Ensure no other SPI devices conflict

---

## Validation Testing

### Test Print: Ringing Tower

```gcode
G28
G1 Z5
; Print a tower with alternating walls to expose ringing
; Use 0.4mm nozzle, 0.2mm layer height
; Test speeds: 60, 100, 150, 200 mm/s
```

### Visual Inspection

Check for:
- Vertical lines repeating at regular intervals
- Distance between rings correlates to acceleration changes
- Pattern most visible on flat surfaces perpendicular to axis

---

## Performance Optimization

### Speed vs Quality Tradeoff

| Max Speed | Input Shaper | Ringing Risk |
|-----------|--------------|--------------|
| 100 mm/s | Any | Very Low |
| 200 mm/s | ZV | Low |
| 300 mm/s | EI | Moderate |
| 400+ mm/s | 2HUMP_EI | Low-Moderate |

### Belt Tension Effects

Proper belt tension affects resonance:
- Too loose: Lower resonance frequencies, more ringing
- Too tight: Higher frequencies, potential for new resonances

Recommended deflection: 1-2mm when pressed firmly at belt midpoint.

---

## Maintenance

### When to Re-tune

- After mechanical changes (new bed, different hotend)
- After belt tensioning
- If ringing suddenly appears
- Every 6-12 months for verification

### Monitoring

Add to macros for quick checks:

```ini
[macro CHECK_RESONANCE]
gcode:
    RUN_RESONANCE_TESTS AXIS=X
    RUN_RESONANCE_TESTS AXIS=Y
```

---

## Common Configurations

### Voron Trident

```ini
[input_shaper]
shaper_type_x: ei2
shaper_freq_x: 45
shaper_type_y: ei2
shaper_freq_y: 40

[resonance_tester]
accel_chip: adxl345
probe_points:
    150, 150, 20
    150, 250, 20
    250, 150, 20
```

### Ender 5 Plus

```ini
[input_shaper]
shaper_type_x: zv
shaper_freq_x: 55
shaper_type_y: zv
shaper_freq_y: 50

[resonance_tester]
accel_chip: adxl345
probe_points:
    110, 110, 20
    110, 210, 20
    210, 110, 20
```

### RatRig V-Core

```ini
[input_shaper]
shaper_type_x: ei
shaper_freq_x: 42
shaper_type_y: ei
shaper_freq_y: 38

[resonance_tester]
accel_chip: adxl345
probe_points:
    150, 150, 30
    150, 300, 30
    300, 150, 30
```

---

## Summary Checklist

- [ ] Install and wire ADXL345 accelerometer
- [ ] Configure accelerometer in printer.cfg
- [ ] Verify accelerometer with test script
- [ ] Run X-axis resonance test
- [ ] Run Y-axis resonance test
- [ ] Analyze resonance peaks
- [ ] Select appropriate shaper type
- [ ] Configure input shaping in printer.cfg
- [ ] Test print to verify improvement
- [ ] Document optimal settings

---

*Last Updated: 2026*
*For Klipper firmware only*
