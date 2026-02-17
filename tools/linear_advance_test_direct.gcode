; Linear Advance Calibration Test - Direct Drive
; K-Factor Range: 0.00 - 0.20
; Increments: 0.02
; Printer: Direct Drive Extruder
; Layer Height: 0.20mm
; Nozzle: 0.4mm
; Material: PLA recommended (works for PETG/ABS with temp adjustment)
;
; Usage:
;   1. Preheat printer to material temperature
;   2. Load filament
;   3. Print this file
;   4. Examine each section - find the one with most consistent lines
;   5. Fine-tune around that K value
;
; Each section labeled with K value. Look for:
;   - Consistent line width (no gaps or bulges at line starts/ends)
;   - Sharp corners without over/under extrusion
;   - Smooth surface without artifacts

; ============================================
; PREAMBLE - Printer Setup
; ============================================

G28 ; Home all axes
G1 Z5 F3000 ; Lift nozzle
M104 S200 ; Set extruder temp (PLA default - adjust for your material)
M140 S60 ; Set bed temp (PLA default - adjust for your material)
M190 S60 ; Wait for bed temp
M109 S200 ; Wait for extruder temp
G92 E0 ; Reset extruder position
M82 ; Absolute extrusion mode
M106 S0 ; Fan off

; ============================================
; TEST SECTION 1 - K = 0.00 (LA Disabled)
; ============================================

; Label: K=0.00
M900 K0.00
G0 X20 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern: Speed changes to show LA effects
; Box 20x20mm with variable speed perimeters

G1 X40 Y20 E4 F1500 ; Bottom edge
G1 X40 Y40 E8 F1500 ; Right edge
G1 X20 Y40 E12 F1500 ; Top edge
G1 X20 Y20 E16 F1500 ; Left edge

; Second layer of box - varying speeds
G0 Z0.40
G1 X40 Y20 E20 F1500
G1 X40 Y40 E24 F3000 ; Faster
G1 X20 Y40 E28 F1500
G1 X20 Y20 E32 F3000 ; Faster

; Third layer - acceleration test
G0 Z0.60
G1 X40 Y20 E36 F2000
G1 X40 Y40 E40 F2000
G1 X20 Y40 E44 F2000
G1 X20 Y20 E48 F2000

; ============================================
; TEST SECTION 2 - K = 0.02
; ============================================

M900 K0.02
G0 X50 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X70 Y20 E4 F1500
G1 X70 Y40 E8 F1500
G1 X50 Y40 E12 F1500
G1 X50 Y20 E16 F1500

G0 Z0.40
G1 X70 Y20 E20 F1500
G1 X70 Y40 E24 F3000
G1 X50 Y40 E28 F1500
G1 X50 Y20 E32 F3000

G0 Z0.60
G1 X70 Y20 E36 F2000
G1 X70 Y40 E40 F2000
G1 X50 Y40 E44 F2000
G1 X50 Y20 E48 F2000

; ============================================
; TEST SECTION 3 - K = 0.04
; ============================================

M900 K0.04
G0 X80 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X100 Y20 E4 F1500
G1 X100 Y40 E8 F1500
G1 X80 Y40 E12 F1500
G1 X80 Y20 E16 F1500

G0 Z0.40
G1 X100 Y20 E20 F1500
G1 X100 Y40 E24 F3000
G1 X80 Y40 E28 F1500
G1 X80 Y20 E32 F3000

G0 Z0.60
G1 X100 Y20 E36 F2000
G1 X100 Y40 E40 F2000
G1 X80 Y40 E44 F2000
G1 X80 Y20 E48 F2000

; ============================================
; TEST SECTION 4 - K = 0.06
; ============================================

M900 K0.06
G0 X110 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X130 Y20 E4 F1500
G1 X130 Y40 E8 F1500
G1 X110 Y40 E12 F1500
G1 X110 Y20 E16 F1500

G0 Z0.40
G1 X130 Y20 E20 F1500
G1 X130 Y40 E24 F3000
G1 X110 Y40 E28 F1500
G1 X110 Y20 E32 F3000

G0 Z0.60
G1 X130 Y20 E36 F2000
G1 X130 Y40 E40 F2000
G1 X110 Y40 E44 F2000
G1 X110 Y20 E48 F2000

; ============================================
; TEST SECTION 5 - K = 0.08
; ============================================

M900 K0.08
G0 X140 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X160 Y20 E4 F1500
G1 X160 Y40 E8 F1500
G1 X140 Y40 E12 F1500
G1 X140 Y20 E16 F1500

G0 Z0.40
G1 X160 Y20 E20 F1500
G1 X160 Y40 E24 F3000
G1 X140 Y40 E28 F1500
G1 X140 Y20 E32 F3000

G0 Z0.60
G1 X160 Y20 E36 F2000
G1 X160 Y40 E40 F2000
G1 X140 Y40 E44 F2000
G1 X140 Y20 E48 F2000

; ============================================
; TEST SECTION 6 - K = 0.10
; ============================================

M900 K0.10
G0 X170 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X190 Y20 E4 F1500
G1 X190 Y40 E8 F1500
G1 X170 Y40 E12 F1500
G1 X170 Y20 E16 F1500

G0 Z0.40
G1 X190 Y20 E20 F1500
G1 X190 Y40 E24 F3000
G1 X170 Y40 E28 F1500
G1 X170 Y20 E32 F3000

G0 Z0.60
G1 X190 Y20 E36 F2000
G1 X190 Y40 E40 F2000
G1 X170 Y40 E44 F2000
G1 X170 Y20 E48 F2000

; ============================================
; TEST SECTION 7 - K = 0.12
; ============================================

M900 K0.12
G0 X200 Y20 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X220 Y20 E4 F1500
G1 X220 Y40 E8 F1500
G1 X200 Y40 E12 F1500
G1 X200 Y20 E16 F1500

G0 Z0.40
G1 X220 Y20 E20 F1500
G1 X220 Y40 E24 F3000
G1 X200 Y40 E28 F1500
G1 X200 Y20 E32 F3000

G0 Z0.60
G1 X220 Y20 E36 F2000
G1 X220 Y40 E40 F2000
G1 X200 Y40 E44 F2000
G1 X200 Y20 E48 F2000

; ============================================
; TEST SECTION 8 - K = 0.14
; ============================================

M900 K0.14
G0 X20 Y60 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X40 Y60 E4 F1500
G1 X40 Y80 E8 F1500
G1 X20 Y80 E12 F1500
G1 X20 Y60 E16 F1500

G0 Z0.40
G1 X40 Y60 E20 F1500
G1 X40 Y80 E24 F3000
G1 X20 Y80 E28 F1500
G1 X20 Y60 E32 F3000

G0 Z0.60
G1 X40 Y60 E36 F2000
G1 X40 Y80 E40 F2000
G1 X20 Y80 E44 F2000
G1 X20 Y60 E48 F2000

; ============================================
; TEST SECTION 9 - K = 0.16
; ============================================

M900 K0.16
G0 X50 Y60 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X70 Y60 E4 F1500
G1 X70 Y80 E8 F1500
G1 X50 Y80 E12 F1500
G1 X50 Y60 E16 F1500

G0 Z0.40
G1 X70 Y60 E20 F1500
G1 X70 Y80 E24 F3000
G1 X50 Y80 E28 F1500
G1 X50 Y60 E32 F3000

G0 Z0.60
G1 X70 Y60 E36 F2000
G1 X70 Y80 E40 F2000
G1 X50 Y80 E44 F2000
G1 X50 Y60 E48 F2000

; ============================================
; TEST SECTION 10 - K = 0.18
; ============================================

M900 K0.18
G0 X80 Y60 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X100 Y60 E4 F1500
G1 X100 Y80 E8 F1500
G1 X80 Y80 E12 F1500
G1 X80 Y60 E16 F1500

G0 Z0.40
G1 X100 Y60 E20 F1500
G1 X100 Y80 E24 F3000
G1 X80 Y80 E28 F1500
G1 X80 Y60 E32 F3000

G0 Z0.60
G1 X100 Y60 E36 F2000
G1 X100 Y80 E40 F2000
G1 X80 Y80 E44 F2000
G1 X80 Y60 E48 F2000

; ============================================
; TEST SECTION 11 - K = 0.20
; ============================================

M900 K0.20
G0 X110 Y60 F6000
G0 Z0.20 F3000
G92 E0

; Pattern
G1 X130 Y60 E4 F1500
G1 X130 Y80 E8 F1500
G1 X110 Y80 E12 F1500
G1 X110 Y60 E16 F1500

G0 Z0.40
G1 X130 Y60 E20 F1500
G1 X130 Y80 E24 F3000
G1 X110 Y80 E28 F1500
G1 X110 Y60 E32 F3000

G0 Z0.60
G1 X130 Y60 E36 F2000
G1 X130 Y80 E40 F2000
G1 X110 Y80 E44 F2000
G1 X110 Y60 E48 F2000

; ============================================
; ACCELERATION TEST PATTERN
; Tests LA behavior during acceleration/deceleration
; ============================================

; Row 1: Low K values
M900 K0.00
G0 X20 Y110 F6000
G0 Z0.20 F3000
G92 E0
; Rapid back-and-forth pattern
G1 X60 Y110 E5 F3000
G1 X20 Y110 E10 F3000
G1 X60 Y110 E15 F3000
G1 X20 Y110 E20 F3000
G1 X60 Y110 E25 F3000
G1 X20 Y110 E30 F3000

M900 K0.04
G0 X70 Y110 F6000
G92 E0
G1 X110 Y110 E5 F3000
G1 X70 Y110 E10 F3000
G1 X110 Y110 E15 F3000
G1 X70 Y110 E20 F3000
G1 X110 Y110 E25 F3000
G1 X70 Y110 E30 F3000

M900 K0.08
G0 X120 Y110 F6000
G92 E0
G1 X160 Y110 E5 F3000
G1 X120 Y110 E10 F3000
G1 X160 Y110 E15 F3000
G1 X120 Y110 E20 F3000
G1 X160 Y110 E25 F3000
G1 X120 Y110 E30 F3000

M900 K0.12
G0 X170 Y110 F6000
G92 E0
G1 X210 Y110 E5 F3000
G1 X170 Y110 E10 F3000
G1 X210 Y110 E15 F3000
G1 X170 Y110 E20 F3000
G1 X210 Y110 E25 F3000
G1 X170 Y110 E30 F3000

; Row 2: Higher K values
M900 K0.16
G0 X20 Y130 F6000
G92 E0
G1 X60 Y130 E5 F3000
G1 X20 Y130 E10 F3000
G1 X60 Y130 E15 F3000
G1 X20 Y130 E20 F3000
G1 X60 Y130 E25 F3000
G1 X20 Y130 E30 F3000

M900 K0.18
G0 X70 Y130 F6000
G92 E0
G1 X110 Y130 E5 F3000
G1 X70 Y130 E10 F3000
G1 X110 Y130 E15 F3000
G1 X70 Y130 E20 F3000
G1 X110 Y130 E25 F3000
G1 X70 Y130 E30 F3000

M900 K0.20
G0 X120 Y130 F6000
G92 E0
G1 X160 Y130 E5 F3000
G1 X120 Y130 E10 F3000
G1 X160 Y130 E15 F3000
G1 X120 Y130 E20 F3000
G1 X160 Y130 E25 F3000
G1 X120 Y130 E30 F3000

; ============================================
; FINISH
; ============================================

G0 Z10 F3000 ; Lift nozzle
G0 X0 Y200 F6000 ; Move to front
M104 S0 ; Turn off extruder
M140 S0 ; Turn off bed
M84 ; Disable motors
M106 S0 ; Fan off

; ============================================
; RESULTS GUIDE
; ============================================
; Sections are arranged left-to-right, top-to-bottom
; Row 1 (Y20-40): K=0.00, 0.02, 0.04, 0.06, 0.08, 0.10, 0.12
; Row 2 (Y60-80): K=0.14, 0.16, 0.18, 0.20
; Acceleration Row (Y110): K=0.00, 0.04, 0.08, 0.12
; Acceleration Row (Y130): K=0.16, 0.18, 0.20
;
; Look for:
; - Most consistent line width
; - No gaps at line starts
; - No bulges at line ends
; - Clean corners
;
; After finding best K, fine-tune with smaller increments
; around that value (e.g., if K=0.08 looks best, test
; K=0.07, 0.075, 0.08, 0.085, 0.09)